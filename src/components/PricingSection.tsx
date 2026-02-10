"use client"

import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { createClient } from "@/lib/supabase/client";
import { AuthModal } from "./AuthModal";
import { ConfirmDialog } from "./ConfirmDialog";
import { ScrollReveal } from "./ScrollReveal";

export const PricingSection = () => {
  const [user, setUser] = useState<any>(null);
  const [authModal, setAuthModal] = useState<{ isOpen: boolean; mode: "login" | "signup" }>({
    isOpen: false,
    mode: "signup"
  });

  const [isCheckingOut, setIsCheckingOut] = useState(false);
  const [isPremium, setIsPremium] = useState(false);
  const [subscriptionStatus, setSubscriptionStatus] = useState<string | null>(null);
  const [confirmDialog, setConfirmDialog] = useState<{
    isOpen: boolean;
    title: string;
    description: string;
    onConfirm: () => void;
    isDestructive?: boolean;
  }>({ isOpen: false, title: "", description: "", onConfirm: () => { } });

  useEffect(() => {
    const supabase = createClient();
    // Force refresh session to get latest metadata from server
    supabase?.auth.refreshSession().then(({ data: { session } }) => {
      setUser(session?.user ?? null);

      // Check if user has Premium
      if (session?.user) {
        const plan = session.user.app_metadata?.plan || session.user.user_metadata?.plan;
        const status = session.user.app_metadata?.subscription_status;

        const isActive = plan === 'premium';
        setIsPremium(isActive);
        setSubscriptionStatus(status);
      }
    });
    const { data: { subscription } } = supabase?.auth.onAuthStateChange((_event, session) => {
      setUser(session?.user ?? null);

      // Update Premium status on auth change
      if (session?.user) {
        const plan = session.user.app_metadata?.plan || session.user.user_metadata?.plan;
        const status = session.user.app_metadata?.subscription_status;

        const isActive = plan === 'premium';
        setIsPremium(isActive);
        setSubscriptionStatus(status);
      } else {
        setIsPremium(false);
        setSubscriptionStatus(null);
      }
    }) || { data: { subscription: { unsubscribe: () => { } } } };
    return () => subscription.unsubscribe();
  }, []);

  const handleCtaClick = async (e: React.MouseEvent, planName: string) => {
    e.preventDefault();

    if (!user) {
      setAuthModal({ isOpen: true, mode: "signup" });
      return;
    }

    if (planName === "Free") {
      window.dispatchEvent(new CustomEvent('open-pinky-chat'));
    } else if (isPremium) {
      // Handle cancellation for Premium users
      setConfirmDialog({
        isOpen: true,
        title: "Cancel Subscription?",
        description: "Are you sure you want to cancel your Premium subscription? You will lose access to premium features immediately.",
        isDestructive: true,
        onConfirm: async () => {
          setIsCheckingOut(true);
          try {
            const response = await fetch("/api/cancel-subscription", {
              method: "POST",
              headers: {
                "Content-Type": "application/json",
              },
            });

            const data = await response.json();
            if (data.success) {
              // Update state immediately for instant feedback
              setIsPremium(false);
              setSubscriptionStatus("canceled");
              setIsCheckingOut(false);

              setConfirmDialog({
                isOpen: true,
                title: "Subscription Cancelled",
                description: data.message,
                onConfirm: () => {
                  setConfirmDialog({ ...confirmDialog, isOpen: false });
                },
              });
            } else {
              console.error("Cancellation error:", data.error);
              setConfirmDialog({
                isOpen: true,
                title: "Cancellation Failed",
                description: "Failed to cancel subscription. Please try again.",
                onConfirm: () => { },
              });
              setIsCheckingOut(false);
            }
          } catch (error) {
            console.error("Cancellation error:", error);
            setConfirmDialog({
              isOpen: true,
              title: "Cancellation Failed",
              description: "Failed to cancel subscription. Please try again.",
              onConfirm: () => { },
            });
            setIsCheckingOut(false);
          }
        },
      });
    } else {
      // Handle checkout for non-Premium users
      setIsCheckingOut(true);
      try {
        const response = await fetch("/api/checkout", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            productId: "premium",
            userId: user.id,
            userEmail: user.email
          }),
        });

        const data = await response.json();
        if (data.url) {
          window.location.href = data.url;
        } else {
          console.error("Checkout error:", data.error);
          setIsCheckingOut(false);
        }
      } catch (error) {
        console.error("Checkout error:", error);
        setIsCheckingOut(false);
      }
    }
  };

  const plans = [
    {
      name: "Free",
      price: "$0",
      period: "forever",
      description: "Try before you commit",
      features: [
        { text: "3 questions included", included: true },
        { text: "Basic vetting advice", included: true },
        { text: "Text decode feature", included: true },
        { text: "Pattern library access", included: false },
        { text: "Swirling Mode", included: false },
        { text: "Priority support", included: false }
      ],
      cta: "Start Free",
      featured: false
    },
    {
      name: "Premium",
      price: "$24.97",
      period: "/month",
      description: "Full access to Pinky",
      features: [
        { text: "Unlimited questions", included: true },
        { text: "All vetting modes", included: true },
        { text: "49 Pattern Library", included: true },
        { text: "Swirling Mode (IR expertise)", included: true },
        { text: "Script generator", included: true },
        { text: "Priority support", included: true }
      ],
      cta: "Get Premium",
      featured: true
    }
  ];

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.2
      }
    }
  };

  const cardVariants = {
    hidden: { opacity: 0, y: 50 },
    visible: {
      opacity: 1,
      y: 0,
      transition: {
        duration: 0.8,
        ease: [0.21, 0.47, 0.32, 0.98] as any
      }
    }
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
                Try free, upgrade when you're ready.
              </p>
            </div>
          </ScrollReveal>

          <motion.div
            variants={containerVariants}
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true }}
            className="grid grid-cols-1 md:grid-cols-2 gap-8 max-w-[800px] mx-auto"
          >
            {plans.map((plan, index) => (
              <motion.div
                key={index}
                variants={cardVariants}
                whileHover={{ y: -8, transition: { duration: 0.3 } }}
                className={`bg-white p-12 rounded text-center border relative transition-shadow duration-300 hover:shadow-2xl ${plan.featured
                  ? 'border-2 border-[hsl(var(--gold))] shadow-xl'
                  : 'border-[hsl(var(--divider))] shadow-sm'
                  }`}
              >
                {plan.featured && (
                  <motion.div
                    initial={{ opacity: 0, scale: 0.8 }}
                    whileInView={{ opacity: 1, scale: 1 }}
                    transition={{ delay: 0.5 }}
                    className="absolute -top-3 inset-x-0 mx-auto w-fit bg-[hsl(var(--gold))] text-[hsl(var(--charcoal))] text-[0.65rem] font-semibold tracking-wide uppercase px-4 py-1.5 rounded-sm z-20"
                  >
                    Most Popular
                  </motion.div>
                )}

                <div className="font-serif text-2xl text-[hsl(var(--charcoal))] mb-2">
                  {plan.name}
                </div>
                <div className="font-serif text-[3.5rem] text-[hsl(var(--charcoal))] font-semibold mb-2">
                  {plan.price}
                  <span className="text-base text-[hsl(var(--text-muted))] font-normal ml-1">
                    {plan.period}
                  </span>
                </div>
                <div className="text-sm text-[hsl(var(--text-secondary))] mb-8">
                  {plan.description}
                </div>

                <ul className="text-left mb-8 space-y-0 text-[13px]">
                  {plan.features.map((feature, i) => (
                    <li
                      key={i}
                      className={`py-2.5 text-sm border-b border-[hsl(var(--divider))] flex items-center gap-3 ${feature.included ? 'text-[hsl(var(--text-primary))]' : 'text-[hsl(var(--text-muted))]'
                        }`}
                    >
                      <span className={`font-semibold ${feature.included ? 'text-[hsl(var(--gold))]' : 'text-[hsl(var(--text-muted))]'}`}>
                        {feature.included ? '✓' : '—'}
                      </span>
                      {feature.text}
                    </li>
                  ))}
                </ul>

                <button
                  onClick={(e) => handleCtaClick(e, plan.name)}
                  disabled={plan.name === "Premium" && isCheckingOut}
                  className={`${plan.name === "Premium" && isPremium
                    ? 'bg-red-600 hover:bg-red-700 text-white border-red-600'
                    : plan.featured
                      ? 'btn-primary'
                      : 'btn-secondary'
                    } w-full text-center transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed px-6 py-3 rounded-md font-medium`}
                >
                  {plan.name === "Premium" && isCheckingOut
                    ? "Processing..."
                    : plan.name === "Premium" && isPremium
                      ? "Cancel Subscription"
                      : plan.cta}
                </button>
              </motion.div>
            ))}
          </motion.div>

          <ScrollReveal delay={0.4}>
            <div className="text-center mt-12 text-sm text-[hsl(var(--text-muted))]">
              Cancel anytime. No long-term commitment.
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
        isOpen={confirmDialog.isOpen}
        onClose={() => setConfirmDialog({ ...confirmDialog, isOpen: false })}
        onConfirm={confirmDialog.onConfirm}
        title={confirmDialog.title}
        description={confirmDialog.description}
        isDestructive={confirmDialog.isDestructive}
        confirmText="Confirm"
        cancelText="Cancel"
      />
    </>
  );
};
