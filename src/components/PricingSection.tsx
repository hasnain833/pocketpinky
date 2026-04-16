"use client"

import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import type { User } from "@supabase/supabase-js";
import { createClient } from "@/lib/supabase/client";
import { AuthModal } from "./AuthModal";
import { ConfirmDialog } from "./ConfirmDialog";
import { ScrollReveal } from "./ScrollReveal";

// ─── Tier helpers ─────────────────────────────────────────────────────────────
type PlanKey = "free" | "premium" | "ultra_premium";

const PLAN_LABEL: Record<PlanKey, string> = {
  free: "Free",
  premium: "Premium",
  ultra_premium: "Ultra Premium",
};

interface CtaState {
  label: string;
  disabled: boolean;
  onClick: () => void;
  destructive?: boolean;
}

export const PricingSection = () => {
  const [user, setUser] = useState<User | null>(null);
  const [authModal, setAuthModal] = useState<{ isOpen: boolean; mode: "login" | "signup" }>({
    isOpen: false,
    mode: "signup"
  });

  const [isCheckingOut, setIsCheckingOut] = useState(false);
  const [currentPlan, setCurrentPlan] = useState<PlanKey>("free");
  const [messageCredits, setMessageCredits] = useState(0);
  const [confirmDialog, setConfirmDialog] = useState<{
    isOpen: boolean;
    title: string;
    description: string;
    onConfirm: () => void;
    confirmText?: string;
    showCancel?: boolean;
    isDestructive?: boolean;
  }>({ isOpen: false, title: "", description: "", onConfirm: () => { } });

  useEffect(() => {
    const supabase = createClient();
    supabase?.auth.refreshSession().then(async ({ data: { session } }) => {
      setUser(session?.user ?? null);
      if (session?.user) {
        const { data: profile } = await supabase
          .from("profiles")
          .select("plan, subscription_status, message_credits")
          .eq("id", session.user.id)
          .maybeSingle();
        setCurrentPlan((profile?.plan as PlanKey) || "free");
        setMessageCredits(profile?.message_credits || 0);
      } else {
        setCurrentPlan("free");
        setMessageCredits(0);
      }
    });

    const { data: { subscription } } = supabase?.auth.onAuthStateChange((_event, session) => {
      setUser(session?.user ?? null);
      if (session?.user) {
        supabase
          .from("profiles")
          .select("plan, subscription_status, message_credits")
          .eq("id", session.user.id)
          .maybeSingle()
          .then(({ data: profile }) => {
            setCurrentPlan((profile?.plan as PlanKey) || "free");
            setMessageCredits(profile?.message_credits || 0);
          });
      } else {
        setCurrentPlan("free");
        setMessageCredits(0);
      }
    }) || { data: { subscription: { unsubscribe: () => { } } } };
    return () => subscription.unsubscribe();
  }, []);

  const handleCheckout = async (productId: string) => {
    if (!user) {
      setAuthModal({ isOpen: true, mode: "signup" });
      return;
    }
    setIsCheckingOut(true);
    try {
      const res = await fetch("/api/checkout", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ productId, userId: user.id, userEmail: user.email }),
      });
      const data = await res.json();
      if (data.url) {
        window.location.href = data.url;
      } else {
        console.error("Checkout error:", data.error);
        setIsCheckingOut(false);
      }
    } catch (err) {
      console.error("Checkout error:", err);
      setIsCheckingOut(false);
    }
  };

  const handleCancel = () => {
    setConfirmDialog({
      isOpen: true,
      title: "Cancel Subscription?",
      description: "Are you sure you want to cancel your Premium subscription? You will lose access to premium features immediately.",
      isDestructive: true,
      onConfirm: async () => {
        setIsCheckingOut(true);
        try {
          const res = await fetch("/api/cancel-subscription", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
          });
          const data = await res.json();
          if (data.success) {
            setCurrentPlan("free");
            setIsCheckingOut(false);
            window.dispatchEvent(new CustomEvent("pinky-tier-changed", { detail: { tier: "free" } }));
            setConfirmDialog({
              isOpen: true,
              title: "Subscription Cancelled",
              description: data.message,
              confirmText: "OK",
              showCancel: false,
              onConfirm: () => window.location.reload(),
            });
          } else {
            setConfirmDialog({
              isOpen: true,
              title: "Cancellation Failed",
              description: "Failed to cancel. Please try again.",
              onConfirm: () => { },
            });
            setIsCheckingOut(false);
          }
        } catch {
          setConfirmDialog({
            isOpen: true,
            title: "Cancellation Failed",
            description: "Failed to cancel. Please try again.",
            onConfirm: () => { },
          });
          setIsCheckingOut(false);
        }
      },
    });
  };

  const isUltraPremium = currentPlan === "ultra_premium";
  const isPremium = currentPlan === "premium";

  // 500 / 1000 packs visible ONLY to premium subscribers
  const showPacks = isPremium || isUltraPremium;

  // ─── Plan cards config ───────────────────────────────────────────────────────
  const allPlans = [
    {
      id: "free",
      name: "Free Trial",
      price: "$0",
      period: "7 days",
      description: "Try before you commit",
      features: [
        { text: "7-day free trial", included: true },
        { text: "10 messages per day", included: true },
        { text: "Basic vetting advice", included: true },
        { text: "Pattern library access", included: false },
        { text: "Swirling Mode", included: false },
        { text: "Priority support", included: false },
      ],
      cta: "Start Free",
      featured: false,
    },
    {
      id: "user-500",
      name: "500 Messages",
      price: "$50",
      period: "one-time",
      description: "Perfect for a deep dive",
      features: [
        { text: "500 total messages", included: true },
        { text: "No daily limit", included: true },
        { text: "All vetting modes", included: true },
        { text: "Pattern library access", included: true },
        { text: "Swirling Mode (IR expertise)", included: true },
        { text: "Priority support", included: false },
      ],
      cta: "Get 500 Messages",
      featured: false,
    },
    {
      id: "user-1000",
      name: "1,000 Messages",
      price: "$80",
      period: "one-time",
      description: "Best value — save $20",
      features: [
        { text: "1,000 total messages", included: true },
        { text: "No daily limit", included: true },
        { text: "All vetting modes", included: true },
        { text: "Pattern library access", included: true },
        { text: "Swirling Mode (IR expertise)", included: true },
        { text: "Script generator", included: true },
      ],
      cta: "Get 1,000 Messages",
      featured: true,
    },
    {
      id: "premium",
      name: isUltraPremium ? "Ultra Premium" : "Premium",
      price: isUltraPremium ? "Lifetime" : "$24.97",
      period: isUltraPremium ? "" : "/month",
      description: isUltraPremium ? "Unlimited Lifetime Access" : "Unlimited monthly access",
      features: [
        { text: "10 messages per day", included: true },
        { text: "All vetting modes", included: true },
        { text: "49 Pattern Library", included: true },
        { text: "Swirling Mode (IR expertise)", included: true },
        { text: "Script generator", included: true },
        { text: "Priority support", included: true },
      ],
      cta: "Get Premium",
      featured: !isUltraPremium,
    },
  ];

  // Filter: only show packs to premium subscribers
  const plans = allPlans.filter(p =>
    p.id === "user-500" || p.id === "user-1000" ? showPacks : true
  );

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: { opacity: 1, transition: { staggerChildren: 0.15 } },
  };

  const cardVariants = {
    hidden: { opacity: 0, y: 50 },
    visible: { opacity: 1, y: 0, transition: { duration: 0.7, ease: [0.21, 0.47, 0.32, 0.98] } },
  };

  const getCtaState = (planId: string): CtaState => {
    // 1. If user is Ultra Premium, everything else is redundant
    if (isUltraPremium) {
      if (planId === "premium") {
        return { label: "Active (Lifetime)", disabled: true, onClick: () => { } };
      }
      return { label: "Unlimited Access", disabled: true, onClick: () => { } };
    }

    // 2. Free Trial logic
    if (planId === "free") {
      return {
        label: user ? "Access Granted" : "Start Free",
        disabled: !!user,
        onClick: () => window.dispatchEvent(new CustomEvent("open-pinky-chat"))
      };
    }

    const isOwned = planId === "premium" && (isPremium || isUltraPremium);

    if (isOwned) {
      if (planId === "premium" && isPremium && !isUltraPremium) {
        // Show cancel only for regular premium  
        return { label: isCheckingOut ? "Processing…" : "Cancel Subscription", disabled: isCheckingOut, onClick: handleCancel, destructive: true };
      }
      const label = planId === "premium" && isUltraPremium ? "Active (Lifetime)" : "Active ✓";
      return { label, disabled: true, onClick: () => { } };
    }

    if (planId === "user-500" || planId === "user-1000") {
      if (messageCredits > 0) {
        // Find if this specific pack amount is what they currently have (roughly)
        const isThisPack = (planId === "user-500" && messageCredits >= 450 && messageCredits < 950) || (planId === "user-1000" && messageCredits >= 950);
        return {
          label: isThisPack ? "Purchased ✓" : "Credits Active",
          disabled: true,
          onClick: () => { }
        };
      }
      return { label: isCheckingOut ? "Processing…" : plans.find(p => p.id === planId)?.cta ?? "Buy", disabled: isCheckingOut, onClick: () => handleCheckout(planId) };
    }

    return { label: isCheckingOut ? "Processing…" : plans.find(p => p.id === planId)?.cta ?? "Buy", disabled: isCheckingOut, onClick: () => handleCheckout(planId) };
  };

  return (
    <>
      <section id="pricing" className="py-24 px-[5%] bg-[hsl(var(--cream))] relative overflow-hidden">
        <div className="max-w-[1300px] mx-auto">
          <ScrollReveal>
            <div className="max-w-[600px] mx-auto text-center mb-16">
              <h2 className="font-serif text-[2.75rem] text-[hsl(var(--charcoal))] mb-4">
                Simple Pricing
              </h2>
              <p className="text-[hsl(var(--text-secondary))]">
                {showPacks
                  ? "As a Premium member, you can add extra message packs to go beyond your daily limit."
                  : "Start free, upgrade when you're ready."}
              </p>
            </div>
          </ScrollReveal>

          <motion.div
            variants={containerVariants}
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true }}
            className={`grid grid-cols-1 sm:grid-cols-2 gap-6 mx-auto ${plans.length === 4 ? "lg:grid-cols-4 max-w-[1100px]" : "lg:grid-cols-2 max-w-[700px]"
              }`}
          >
            {plans.map((plan) => {
              const cta = getCtaState(plan.id);
              return (
                <motion.div
                  key={plan.id}
                  initial={{ opacity: 0, y: 30 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ duration: 0.5, ease: "easeOut" }}
                  whileHover={{ y: -8, transition: { duration: 0.3 } }}
                  className={`bg-white p-8 rounded text-center border relative transition-shadow duration-300 hover:shadow-2xl ${plan.featured
                    ? "border-2 border-[hsl(var(--gold))] shadow-xl"
                    : "border-[hsl(var(--divider))] shadow-sm"
                    }`}
                >
                  {plan.featured && (
                    <motion.div
                      initial={{ opacity: 0, scale: 0.8 }}
                      whileInView={{ opacity: 1, scale: 1 }}
                      transition={{ delay: 0.4 }}
                      className="absolute -top-3 inset-x-0 mx-auto w-fit bg-[hsl(var(--gold))] text-[hsl(var(--charcoal))] text-[0.65rem] font-semibold tracking-wide uppercase px-4 py-1.5 rounded-sm z-20"
                    >
                      Best Value
                    </motion.div>
                  )}

                  <div className="font-serif text-2xl text-[hsl(var(--charcoal))] mb-2">
                    {plan.name}
                  </div>
                  <div className="font-serif text-[3rem] text-[hsl(var(--charcoal))] font-semibold mb-1">
                    {plan.price}
                    <span className="text-base text-[hsl(var(--text-muted))] font-normal ml-1">
                      {plan.period}
                    </span>
                  </div>
                  <div className="text-sm text-[hsl(var(--text-secondary))] mb-6">
                    {plan.description}
                  </div>

                  <ul className="text-left mb-6 space-y-0 text-[13px]">
                    {plan.features.map((feature, i) => (
                      <li
                        key={i}
                        className={`py-2.5 text-sm border-b border-[hsl(var(--divider))] flex items-center gap-3 ${feature.included ? "text-[hsl(var(--text-primary))]" : "text-[hsl(var(--text-muted))]"}`}
                      >
                        <span className={`font-semibold ${feature.included ? "text-[hsl(var(--gold))]" : "text-[hsl(var(--text-muted))]"}`}>
                          {feature.included ? "✓" : "—"}
                        </span>
                        {feature.text}
                      </li>
                    ))}
                  </ul>

                  <button
                    onClick={cta.onClick}
                    disabled={cta.disabled}
                    className={`${cta.destructive
                      ? "bg-red-600 hover:bg-red-700 text-white border-red-600"
                      : plan.featured
                        ? "btn-primary"
                        : "btn-secondary"
                      } w-full text-center transition-all duration-300 disabled:opacity-60 disabled:cursor-not-allowed px-6 py-3 rounded-md font-medium text-sm`}
                  >
                    {cta.label}
                  </button>
                </motion.div>
              );
            })}
          </motion.div>

          <ScrollReveal delay={0.4}>
            <div className="text-center mt-12 text-sm text-[hsl(var(--text-muted))]">
              Cancel at any time. No hidden charges.
            </div>
          </ScrollReveal>
        </div>
      </section>

      <AuthModal
        isOpen={authModal.isOpen}
        onClose={() => setAuthModal({ ...authModal, isOpen: false })}
        initialMode={authModal.mode}
      />

      <ConfirmDialog
        {...confirmDialog}
        onClose={() => setConfirmDialog({ ...confirmDialog, isOpen: false })}
      />
    </>
  );
};
