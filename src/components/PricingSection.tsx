"use client";
import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Button } from "./ui/button";
import { Check, Sparkles } from "lucide-react";

export const PricingSection = () => {
  const [isAnnual, setIsAnnual] = useState(false);

  const plans = [
    {
      name: "Free Trial",
      price: "Free",
      period: "",
      description: "First 3 questions free",
      features: [
        "3 questions included",
        "Basic vetting advice",
        "Text decode feature",
        "Standard response time",
      ],
      cta: "Start Free Trial",
      popular: false,
    },
    {
      name: "Basic Plan",
      price: isAnnual ? "$149" : "$14.97",
      period: isAnnual ? "/year" : "/month",
      description: "Unlimited questions",
      features: [
        "Unlimited questions",
        "Text decode feature",
        "Basic vetting advice",
        "Standard response time",
        "Script your responses",
      ],
      cta: "Get Started",
      popular: true,
    },
    {
      name: "Premium Plan",
      price: isAnnual ? "$247" : "$24.97",
      period: isAnnual ? "/year" : "/month",
      description: "Priority + profile reviews",
      features: [
        "Everything in Basic",
        "Priority response time",
        "Profile reviews",
        "The 'Him' Test",
        "Swirl Mode",
        "24/7 Priority access",
      ],
      cta: "Go Premium",
      popular: false,
    },
  ];

  return (
    <section id="pricing" className="py-24 md:py-32 bg-secondary relative overflow-hidden">
      {/* Background accents */}
      <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-primary/5 blur-[120px] rounded-full -z-10" />
      <div className="absolute bottom-0 left-0 w-[500px] h-[500px] bg-gold/5 blur-[120px] rounded-full -z-10" />

      <div className="container mx-auto px-6">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="text-center mb-12"
        >
          <span className="inline-block font-script text-3xl md:text-4xl text-gold mb-4 drop-shadow-sm">
            Simple, Transparent Pricing
          </span>
          <h2 className="font-serif text-4xl md:text-5xl lg:text-6xl text-cream mb-6 tracking-tight">
            Invest in Your <span className="italic text-gold">Peace of Mind</span>
          </h2>

          {/* Billing Toggle */}
          <div className="flex items-center justify-center gap-4 mt-10">
            <span className={`text-sm font-medium transition-colors ${!isAnnual ? "text-gold" : "text-cream/40"}`}>Monthly</span>
            <button
              onClick={() => setIsAnnual(!isAnnual)}
              className="relative w-16 h-8 rounded-full bg-plum-light/50 border border-gold/20 p-1 transition-colors hover:border-gold/40"
            >
              <motion.div
                animate={{ x: isAnnual ? 32 : 0 }}
                transition={{ type: "spring", stiffness: 500, damping: 30 }}
                className="w-6 h-6 rounded-full bg-gold shadow-lg"
              />
            </button>
            <div className="flex items-center gap-2">
              <span className={`text-sm font-medium transition-colors ${isAnnual ? "text-gold" : "text-cream/40"}`}>Yearly</span>
              <span className="text-[10px] font-bold uppercase tracking-wider bg-gold/10 text-gold px-2 py-0.5 rounded-full border border-gold/20">
                Save 17%
              </span>
            </div>
          </div>
        </motion.div>

        <div className="grid md:grid-cols-3 gap-8 max-w-6xl mx-auto items-stretch">
          {plans.map((plan, index) => (
            <motion.div
              key={plan.name}
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6, delay: index * 0.1 }}
              className={`relative rounded-[3rem] p-10 flex flex-col h-full transition-all duration-500 overflow-hidden group ${plan.popular
                ? "bg-plum-light/20 border-2 border-gold/50 shadow-[0_0_40px_rgba(212,175,55,0.15)] scale-105 z-10"
                : "bg-plum-light/10 border border-gold/10 hover:border-gold/30"
                }`}
            >
              {plan.popular && (
                <div className="absolute top-0 left-0 right-0 h-1 bg-gold-gradient" />
              )}

              <div className="mb-8 relative">

                <div className="flex flex-wrap items-start justify-between gap-2 mb-4">
                  <h3 className={`font-serif text-xl sm:text-2xl ${plan.popular ? "text-gold" : "text-cream"}`}>
                    {plan.name}
                  </h3>
                  {plan.popular && (
                    <span className="text-[10px] sm:text-xs font-bold uppercase tracking-wider sm:tracking-widest text-gold bg-gold/10 px-2 py-0.5 sm:px-3 sm:py-1 rounded-full border border-gold/20 whitespace-nowrap shrink-0">
                      Most Popular
                    </span>
                  )}
                </div>

                <div className="flex items-baseline gap-1 mb-2">
                  <motion.span
                    key={plan.price}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="font-serif text-5xl text-cream font-bold"
                  >
                    {plan.price}
                  </motion.span>
                  {plan.period && (
                    <span className="text-cream/40 text-sm">{plan.period}</span>
                  )}
                </div>
                <p className="text-cream/60 text-sm font-light">{plan.description}</p>
              </div>

              <ul className="space-y-4 mb-10 flex-grow">
                {plan.features.map((feature) => (
                  <li key={feature} className="flex items-start gap-4 text-cream/70 text-sm">
                    <span className={`flex-shrink-0 mt-0.5 w-5 h-5 rounded-full flex items-center justify-center bg-gold/10`}>
                      <Check size={12} className="text-gold" />
                    </span>
                    <span className="leading-tight">{feature}</span>
                  </li>
                ))}
              </ul>

              <Button
                variant={plan.popular ? "hero" : "heroOutline"}
                size="xl"
                asChild
                className={`w-full rounded-2xl group-hover:scale-[1.02] transition-transform duration-300 ${plan.popular ? "shadow-glow" : ""}`}
              >
                <a href="#chatbot">{plan.cta}</a>
              </Button>
            </motion.div>
          ))}
        </div>

        <motion.div
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true }}
          transition={{ delay: 0.5 }}
          className="text-center mt-12 space-y-4"
        >
          <p className="text-cream/40 text-sm font-light flex items-center justify-center gap-2">
            <Sparkles size={14} className="text-gold" />
            Cancel anytime. Private & Discreet billing.
          </p>
        </motion.div>
      </div>
    </section>
  );
};
