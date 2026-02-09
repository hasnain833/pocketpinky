"use client";
import { motion } from "framer-motion";

export const HeroSection = () => {
  const chatbotUrl = "https://cdn.botpress.cloud/webchat/v3.5/shareable.html?configUrl=https://files.bpcontent.cloud/2025/12/22/20/20251222201454-LHAZEGXE.json";

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1,
        delayChildren: 0.3,
      },
    },
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 30 },
    visible: {
      opacity: 1,
      y: 0,
      transition: {
        duration: 0.8,
        ease: [0.21, 0.47, 0.32, 0.98] as any,
      },
    },
  };

  return (
    <section className="min-h-screen flex items-center py-40 px-[5%] bg-[hsl(var(--cream))] relative overflow-hidden">
      {/* Background Decor */}
      <motion.div
        initial={{ opacity: 0, scale: 0.8 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 1.5, ease: "easeOut" }}
        className="absolute top-1/4 -right-20 w-[600px] h-[600px] bg-[hsl(var(--pink-soft))] rounded-full blur-[120px] -z-10 opacity-30"
      />

      <motion.div
        variants={containerVariants}
        initial="hidden"
        animate="visible"
        className="grid grid-cols-1 lg:grid-cols-2 gap-20 max-w-[1300px] mx-auto items-center relative z-10"
      >
        {/* Left Column - Content */}
        <div className="max-w-[560px]">
          {/* Eyebrow */}
          <motion.div variants={itemVariants} className="inline-flex items-center gap-3 text-xs font-semibold tracking-[1.5px] uppercase text-[hsl(var(--gold))] mb-8">
            <span className="w-10 h-px bg-[hsl(var(--gold))]" />
            Your AI Vetting Partner
          </motion.div>

          {/* Headline */}
          <motion.h1 variants={itemVariants} className="font-serif text-[3.5rem] leading-[1.2] text-[hsl(var(--charcoal))] mb-6 font-medium">
            Stop Wasting Months on Men Who <em className="text-[hsl(var(--pink-accent))] italic">Aren't Serious</em>
          </motion.h1>

          {/* Tagline */}
          <motion.p variants={itemVariants} className="text-[1.15rem] text-[hsl(var(--text-primary))] mb-10 leading-[1.8]">
            Pinky spots manipulation patterns, decodes his texts, and gives you a verdict — instantly.
          </motion.p>

          {/* CTA Buttons */}
          <motion.div variants={itemVariants} className="flex gap-5 mb-10">
            <a
              href={chatbotUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="btn-primary"
            >
              Try Pinky Free
            </a>
            <a href="#modes" className="btn-secondary">
              See What She Does
            </a>
          </motion.div>

          {/* Note */}
          <motion.p variants={itemVariants} className="text-sm text-[hsl(var(--text-muted))]">
            No signup required. Start vetting instantly.
          </motion.p>
        </div>

        {/* Right Column - Phone Mockup */}
        <motion.div
          initial={{ opacity: 0, x: 50, rotate: 2 }}
          animate={{ opacity: 1, x: 0, rotate: 0 }}
          transition={{ duration: 1.2, delay: 0.6, ease: [0.21, 0.47, 0.32, 0.98] }}
          className="flex justify-center"
        >
          <div className="w-[320px] bg-[hsl(var(--charcoal))] rounded-[40px] p-3 shadow-[0_50px_100px_-20px_rgba(0,0,0,0.25)] relative group">
            {/* Animated Glow behind phone */}
            <div className="absolute -inset-1 bg-gradient-to-r from-[hsl(var(--pink-accent))] to-[hsl(var(--gold))] rounded-[45px] blur opacity-25 group-hover:opacity-40 transition duration-1000 group-hover:duration-200"></div>

            <div className="bg-white rounded-[32px] overflow-hidden min-h-[580px] transition-transform duration-500 group-hover:scale-[1.02]">
              {/* Phone Header */}
              <div className="bg-gradient-to-br from-[hsl(var(--pink-accent))] to-[hsl(var(--wine))] p-5 text-center">
                <h4 className="text-white text-base font-semibold font-sans">💕 Pinky</h4>
                <p className="text-white/80 text-xs mt-1">Your Vetting Partner</p>
              </div>

              {/* Chat Messages */}
              <div className="p-4 flex flex-col gap-3">
                <motion.div
                  initial={{ opacity: 0, scale: 0.8, x: 20 }}
                  animate={{ opacity: 1, scale: 1, x: 0 }}
                  transition={{ delay: 1.2, duration: 0.5 }}
                  className="max-w-[85%] self-end bg-[hsl(var(--blush))] text-[hsl(var(--text-primary))] p-3 rounded-2xl rounded-br-sm text-sm leading-[1.5]"
                >
                  He says he's not ready for a relationship but keeps texting me every day...
                </motion.div>

                <motion.div
                  initial={{ opacity: 0, scale: 0.8, x: -20 }}
                  animate={{ opacity: 1, scale: 1, x: 0 }}
                  transition={{ delay: 1.8, duration: 0.5 }}
                  className="max-w-[85%] self-start bg-[hsl(var(--gold-pale))] text-[hsl(var(--text-primary))] p-3 rounded-2xl rounded-bl-sm text-sm leading-[1.5]"
                >
                  Sis, let's look at this clearly. <strong className="text-[hsl(var(--wine))]">His words say "not ready" but his actions say "keep you on the hook."</strong>
                </motion.div>

                <motion.div
                  initial={{ opacity: 0, scale: 0.8, x: -20 }}
                  animate={{ opacity: 1, scale: 1, x: 0 }}
                  transition={{ delay: 2.4, duration: 0.5 }}
                  className="max-w-[85%] self-start bg-[hsl(var(--gold-pale))] text-[hsl(var(--text-primary))] p-3 rounded-2xl rounded-bl-sm text-sm leading-[1.5]"
                >
                  This is <strong className="text-[hsl(var(--wine))]">Pattern #8: The Bencher</strong> — he wants your attention without commitment. What are YOU getting from this?
                </motion.div>
              </div>
            </div>
          </div>
        </motion.div>
      </motion.div>
    </section>
  );
};
