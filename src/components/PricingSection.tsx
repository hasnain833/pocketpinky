"use client"

import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { createClient } from "@/lib/supabase/client";
import { AuthModal } from "./AuthModal";
import { ScrollReveal } from "./ScrollReveal";

export const PricingSection = () => {
  const [user, setUser] = useState<any>(null);
  const [authModal, setAuthModal] = useState<{ isOpen: boolean; mode: "login" | "signup" }>({
    isOpen: false,
    mode: "signup"
  });

  const chatbotUrl = "https://cdn.botpress.cloud/webchat/v3.5/shareable.html?configUrl=https://files.bpcontent.cloud/2025/12/22/20/20251222201454-LHAZEGXE.json";

  useEffect(() => {
    const supabase = createClient();
    supabase?.auth.getSession().then(({ data: { session } }) => {
      setUser(session?.user ?? null);
    });
    const { data: { subscription } } = supabase?.auth.onAuthStateChange((_event, session) => {
      setUser(session?.user ?? null);
    }) || { data: { subscription: { unsubscribe: () => { } } } };
    return () => subscription.unsubscribe();
  }, []);

  const handleCtaClick = (e: React.MouseEvent, featured: boolean) => {
    if (featured && !user) {
      e.preventDefault();
      setAuthModal({ isOpen: true, mode: "signup" });
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

                <a
                  href={chatbotUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  onClick={(e) => handleCtaClick(e, plan.featured)}
                  className={plan.featured ? 'btn-primary w-full text-center' : 'btn-secondary w-full text-center'}
                >
                  {plan.cta}
                </a>
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
    </>
  );
};
