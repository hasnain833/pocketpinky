"use client";
import { motion } from "framer-motion";

export const HeroSection = () => {
  const chatbotUrl = "https://cdn.botpress.cloud/webchat/v3.5/shareable.html?configUrl=https://files.bpcontent.cloud/2025/12/22/20/20251222201454-LHAZEGXE.json";

  const contentVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        duration: 1,
        ease: [0.21, 0.47, 0.32, 0.98] as any,
        staggerChildren: 0.15,
        delayChildren: 0.3
      },
    },
  } as any;

  const itemVariants = {
    hidden: { opacity: 0, scale: 0.98 },
    visible: {
      opacity: 1,
      scale: 1,
      transition: { duration: 1.2, ease: [0.21, 0.47, 0.32, 0.98] as any }
    },
  } as any;

  return (
    <section className="relative w-full bg-[hsl(var(--cream))] pt-40 pb-24 px-[5%] overflow-hidden">
      {/* Background Decor */}
      <motion.div
        initial={{ opacity: 0, scale: 0.8 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 1.5, ease: "easeOut" }}
        className="absolute top-0 -right-20 w-[600px] h-[600px] bg-[hsl(var(--pink-soft))] rounded-full blur-[120px] -z-10 opacity-30"
      />

      <div className="max-w-[1300px] mx-auto">
        <div className="grid grid-cols-1 lg:grid-cols-[1.1fr_0.9fr] gap-12 lg:gap-24 items-center">

          {/* Left Column - Content */}
          <motion.div
            variants={contentVariants}
            initial="hidden"
            animate="visible"
            className="flex flex-col"
          >
            {/* Eyebrow */}
            <motion.div variants={itemVariants} className="inline-flex items-center gap-3 text-xs font-semibold tracking-[2px] uppercase text-[hsl(var(--gold))] mb-6">
              <span className="w-8 h-px bg-[hsl(var(--gold))]" />
              Your AI Vetting Partner
            </motion.div>

            {/* Headline */}
            <motion.h1 variants={itemVariants} className="font-serif text-[clamp(2.5rem,6vw,4rem)] leading-[1.1] text-[hsl(var(--charcoal))] mb-8 font-medium">
              Stop Wasting Months on Men Who <span className="text-[hsl(var(--pink-accent))] italic font-normal">Aren't Serious</span>
            </motion.h1>

            {/* Tagline */}
            <motion.p variants={itemVariants} className="text-[clamp(1rem,2vw,1.2rem)] text-[hsl(var(--text-secondary))] mb-12 leading-[1.7] max-w-[500px]">
              Pinky spots manipulation patterns, decodes his texts, and gives you a verdict — instantly.
            </motion.p>

            {/* CTA Buttons */}
            <motion.div variants={itemVariants} className="flex flex-wrap gap-4 mb-8">
              <a
                href={chatbotUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="bg-[hsl(var(--charcoal))] text-[hsl(var(--cream))] px-8 py-4 text-sm font-semibold tracking-[0.5px] uppercase rounded-sm hover:bg-[hsl(var(--wine))] transition-all duration-300 hover:-translate-y-1"
              >
                Try Pinky Free
              </a>
              <a
                href="#modes"
                className="bg-transparent text-[hsl(var(--charcoal))] px-8 py-4 text-sm font-semibold tracking-[0.5px] uppercase border border-[hsl(var(--charcoal))] rounded-sm hover:bg-[hsl(var(--charcoal))] hover:text-[hsl(var(--cream))] transition-all duration-300"
              >
                See What She Does
              </a>
            </motion.div>

            {/* Note */}
            <motion.p variants={itemVariants} className="text-xs text-[hsl(var(--text-muted))] uppercase tracking-widest">
              No signup required. Start instantly.
            </motion.p>
          </motion.div>

          {/* Right Column - Phone Mockup */}
          <motion.div
            initial={{ opacity: 0, scale: 0.9, x: 30 }}
            animate={{ opacity: 1, scale: 1, x: 0 }}
            transition={{ duration: 1.2, delay: 0.4, ease: [0.21, 0.47, 0.32, 0.98] }}
            className="relative"
          >
            {/* Phone Container */}
            <div className="relative mx-auto w-full max-w-[340px] bg-[hsl(var(--charcoal))] rounded-[44px] p-2.5 shadow-[0_40px_100px_-20px_rgba(0,0,0,0.3)] group">
              {/* Glow */}
              <div className="absolute -inset-1 bg-gradient-to-r from-[hsl(var(--pink-accent))] to-[hsl(var(--gold))] rounded-[48px] blur-xl opacity-20 group-hover:opacity-40 transition-opacity duration-1000" />

              <div className="relative bg-white rounded-[36px] overflow-hidden min-h-[580px] flex flex-col">
                {/* Header */}
                <div className="bg-gradient-to-br from-[hsl(var(--pink-accent))] to-[hsl(var(--wine))] p-6 text-center">
                  <span className="text-white text-base font-semibold">💕 Pinky</span>
                  <p className="text-white/70 text-[10px] uppercase tracking-[1px] mt-1">Vetting Partner</p>
                </div>

                {/* Chat content simulation */}
                <div className="p-5 flex flex-col gap-4">
                  <div className="self-end max-w-[85%] bg-[hsl(var(--pink-soft))]/30 text-[hsl(var(--charcoal))] p-3.5 rounded-[18px] rounded-br-sm text-[13px] leading-relaxed">
                    "He said he's not looking for anything serious right now..."
                  </div>
                  <div className="self-start max-w-[85%] bg-[hsl(var(--gold-pale))] text-[hsl(var(--charcoal))] p-3.5 rounded-[18px] rounded-bl-sm text-[13px] leading-relaxed border border-[hsl(var(--gold))]/10">
                    <span className="font-bold text-[hsl(var(--wine))] uppercase text-[10px] tracking-wider block mb-1">Pinky's Verdict:</span>
                    That's a classic <strong>Pattern #3: Breadcrumbing</strong>. He's keeping you warm for later, sis. Don't fall for it!
                  </div>
                </div>
              </div>
            </div>
          </motion.div>

        </div>
      </div>
    </section>
  );
};
