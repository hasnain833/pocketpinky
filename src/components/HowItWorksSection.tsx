"use client";
import { motion } from "framer-motion";
import phoneMockup from "@/assets/phone-mockup.png";
import { Check } from "lucide-react";
import { Button } from "./ui/button";

const steps = [
  {
    number: "1",
    title: "Ask Pinky Anything",
    screenshotLabel: "Screenshot of chat interface",
    description:
      "Screenshot a text, describe a situation, or ask any dating question. Pinky's here to help with whatever you're dealing with.",
    highlights: ["Screenshot analysis", "Voice messages", "Unlimited questions"],
  },
  {
    number: "2",
    title: "Get Real Talk",
    screenshotLabel: "Screenshot of advice response",
    description:
      "Pinky gives you honest, no-filter advice. No sugarcoating—just the clarity you need to make smart decisions.",
    highlights: ["Honest assessment", "Red flag alerts", "Pattern recognition"],
  },
  {
    number: "3",
    title: "Make Smarter Decisions",
    screenshotLabel: "Screenshot of actionable guidance",
    description:
      "Armed with clarity, you'll know exactly what to do. Set boundaries, craft responses, or know when to walk away.",
    highlights: ["Actionable scripts", "Boundary templates", "Exit strategies"],
  },
];

export const HowItWorksSection = () => {
  return (
    <section
      id="how-it-works"
      className="py-20 md:py-28 bg-secondary overflow-x-hidden"
      aria-labelledby="how-it-works-heading"
    >
      <div className="container mx-auto px-6">
        {/* Section header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="text-center mb-16 md:mb-20"
        >
          <span className="inline-block text-gold text-sm uppercase tracking-wider font-semibold mb-4">
            What to expect
          </span>
          <h2
            id="how-it-works-heading"
            className="font-serif text-3xl md:text-4xl lg:text-5xl text-cream mb-6"
          >
            Dating Clarity in 3 Simple Steps
          </h2>
          <p className="text-cream/70 text-lg max-w-2xl mx-auto">
            Get from confused to confident in minutes, not months
          </p>
        </motion.div>

        {/* Steps: alternating left/right (Keeper-style) */}
        <ol className="space-y-20 md:space-y-28" aria-label="How it works steps">
          {steps.map((step, index) => (
            <motion.li
              key={step.number}
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: "-50px" }}
              transition={{ duration: 0.5, delay: index * 0.1 }}
              className="relative"
            >
              {/* Optional step connector (desktop): vertical line between steps */}
              {index > 0 && (
                <div
                  className="hidden lg:block absolute left-1/2 top-0 w-px h-12 -translate-x-1/2 -translate-y-full bg-gradient-to-b from-transparent via-gold/40 to-transparent"
                  aria-hidden
                />
              )}

              <div
                className={`grid lg:grid-cols-2 gap-10 lg:gap-16 xl:gap-20 items-center ${
                  index % 2 === 1 ? "" : ""
                }`}
              >
                {/* Content column — order swaps for alternating (desktop), stacked (mobile) */}
                <div className={index % 2 === 1 ? "lg:order-2 lg:pl-4" : "lg:order-1 lg:pr-4"}>
                  <div className="flex items-start gap-4 md:gap-6">
                    {/* Large numbers (1, 2, 3) per brief */}
                    <span
                      className="font-serif text-7xl md:text-8xl font-bold bg-cta-gradient bg-clip-text text-transparent leading-tight shrink-0 flex items-center pb-1"
                      style={{ minHeight: "1em" }}
                      aria-hidden
                    >
                      {step.number}
                    </span>
                    <div>
                      <h3 className="font-serif text-2xl md:text-3xl text-cream mb-3">
                        {step.title}
                      </h3>
                      <p className="text-cream/70 mb-6 leading-relaxed">
                        {step.description}
                      </p>
                      <ul className="space-y-3" role="list">
                        {step.highlights.map((highlight) => (
                          <li
                            key={highlight}
                            className="flex items-center gap-3 text-cream/90"
                          >
                            <span className="flex-shrink-0 w-6 h-6 rounded-full bg-primary/20 flex items-center justify-center">
                              <Check size={14} className="text-primary" />
                            </span>
                            <span>{highlight}</span>
                          </li>
                        ))}
                      </ul>
                    </div>
                  </div>
                </div>

                {/* Phone mockup + screenshot label per step (brief: chat interface / advice response / actionable guidance) */}
                <div className={index % 2 === 1 ? "lg:order-1" : "lg:order-2"}>
                  <figure className="relative flex flex-col items-center group">
                    <div className="relative w-full max-w-sm">
                      <img
                        src={typeof phoneMockup === "string" ? phoneMockup : phoneMockup.src}
                        alt={`Step ${step.number}: ${step.title} — ${step.screenshotLabel}`}
                        className="w-full h-auto rounded-[3rem] shadow-2xl relative z-10 transition-transform duration-500 group-hover:scale-[1.02]"
                      />
                      <div
                        className="absolute inset-0 z-0 blur-3xl opacity-25 bg-primary/40 rounded-full scale-90 transition-transform duration-500 group-hover:scale-105"
                        aria-hidden
                      />
                    </div>
                    <figcaption className="mt-4 text-center">
                      <span className="text-cream/60 text-sm font-medium">
                        {step.screenshotLabel}
                      </span>
                    </figcaption>
                  </figure>
                </div>
              </div>
            </motion.li>
          ))}
        </ol>

        {/* Closing line + CTA (Keeper-style) */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="text-center mt-16 md:mt-20 pt-12 border-t border-cream/10"
        >
          <p className="text-cream/70 text-lg max-w-2xl mx-auto mb-8">
            Sometimes clarity comes in one chat; sometimes it takes a few. Our
            goal is to give you real talk, not keep you guessing.
          </p>
          <Button variant="hero" size="xl" asChild>
            <a href="#chatbot">Start Chatting with Pinky</a>
          </Button>
        </motion.div>
      </div>
    </section>
  );
};
