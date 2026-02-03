"use client";
import { motion } from "framer-motion";
import { X, Check } from "lucide-react";
import { Button } from "./ui/button";

const beforeItems = [
  "Confused by mixed signals",
  "Settling for less",
  "Ignoring red flags",
  "Anxious about what to say",
  "Second-guessing yourself",
  "Giving too many chances",
];

const afterItems = [
  "Crystal clear on his intentions",
  "High standards, no compromises",
  "Spotting red flags instantly",
  "Confident in every response",
  "Trusting your intuition",
  "Knowing when to walk away",
];

export const BeforeAfterSection = () => {
  return (
    <section className="py-20 md:py-28 bg-cream overflow-hidden">
      <div className="container mx-auto px-6">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="text-center mb-16"
        >
          <h2 className="font-serif text-3xl md:text-4xl lg:text-5xl text-secondary mb-6">
            Before and After: The Pinky Effect
          </h2>
          <p className="text-secondary/70 text-lg max-w-2xl mx-auto">
            See how quickly Pinky can transform your dating life
          </p>
        </motion.div>

        <div className="grid md:grid-cols-2 gap-8 max-w-5xl mx-auto">
          {/* Before */}
          <motion.div
            initial={{ opacity: 0, x: -30 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
            className="relative"
          >
            <div className="bg-secondary/5 rounded-3xl p-8 md:p-10 border border-secondary/10">
              <div className="text-center mb-8">
                <span className="inline-block px-4 py-2 rounded-full bg-secondary/10 text-secondary/60 text-sm font-semibold uppercase tracking-wider">
                  Before Pinky
                </span>
              </div>
              
              <ul className="space-y-4">
                {beforeItems.map((item, index) => (
                  <motion.li
                    key={item}
                    initial={{ opacity: 0, x: -20 }}
                    whileInView={{ opacity: 1, x: 0 }}
                    viewport={{ once: true }}
                    transition={{ delay: index * 0.1 }}
                    className="flex items-center gap-4 text-secondary/60"
                  >
                    <span className="flex-shrink-0 w-8 h-8 rounded-full bg-secondary/10 flex items-center justify-center">
                      <X size={16} />
                    </span>
                    <span className="text-lg">{item}</span>
                  </motion.li>
                ))}
              </ul>
            </div>
          </motion.div>

          {/* After */}
          <motion.div
            initial={{ opacity: 0, x: 30 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
            className="relative"
          >
            <div className="bg-secondary rounded-3xl p-8 md:p-10 shadow-2xl">
              <div className="text-center mb-8">
                <span className="inline-block px-4 py-2 rounded-full bg-cta-gradient text-primary-foreground text-sm font-semibold uppercase tracking-wider">
                  After Pinky
                </span>
              </div>
              
              <ul className="space-y-4">
                {afterItems.map((item, index) => (
                  <motion.li
                    key={item}
                    initial={{ opacity: 0, x: 20 }}
                    whileInView={{ opacity: 1, x: 0 }}
                    viewport={{ once: true }}
                    transition={{ delay: index * 0.1 }}
                    className="flex items-center gap-4 text-cream"
                  >
                    <span className="flex-shrink-0 w-8 h-8 rounded-full bg-cta-gradient flex items-center justify-center">
                      <Check size={16} className="text-primary-foreground" />
                    </span>
                    <span className="text-lg">{item}</span>
                  </motion.li>
                ))}
              </ul>
            </div>
            
            {/* Decorative glow */}
            <div className="absolute inset-0 -z-10 blur-3xl opacity-20 bg-cta-gradient rounded-3xl scale-105" />
          </motion.div>
        </div>

        {/* CTA */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="text-center mt-14"
        >
          <p className="text-secondary/70 text-lg mb-6">
            Ready to make this your reality? Let Pinky transform your dating life.
          </p>
          <Button variant="hero" size="xl" asChild>
            <a href="#chatbot">Start Free Trial</a>
          </Button>
        </motion.div>
      </div>
    </section>
  );
};
