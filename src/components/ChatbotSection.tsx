"use client";
import { motion } from "framer-motion";
import { Button } from "./ui/button";
import { MessageCircle, Sparkles } from "lucide-react";

export const ChatbotSection = () => {
  return (
    <section id="chatbot" className="py-20 md:py-28 bg-cream">
      <div className="container mx-auto px-6">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="text-center mb-12"
        >
          <span className="inline-flex items-center gap-2 text-primary text-sm font-semibold uppercase tracking-wider mb-4">
            <Sparkles size={18} />
            Try Pinky Now
            <Sparkles size={18} />
          </span>
          <h2 className="font-serif text-3xl md:text-4xl lg:text-5xl text-secondary mb-6">
            Try Pinky Now — First 3 Questions Free
          </h2>
          <p className="text-secondary/70 text-lg max-w-2xl mx-auto">
            Experience Pinky's real talk for yourself. No credit card required.
          </p>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          whileInView={{ opacity: 1, scale: 1 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="max-w-3xl mx-auto"
        >
          {/* Botpress chat widget: embed code goes here when ready */}
          <div className="bg-secondary rounded-3xl p-8 md:p-12 shadow-2xl relative overflow-hidden">
            {/* Decorative elements */}
            <div className="absolute top-4 left-4 w-12 h-12 border-l-2 border-t-2 border-gold/30 rounded-tl-lg" />
            <div className="absolute top-4 right-4 w-12 h-12 border-r-2 border-t-2 border-gold/30 rounded-tr-lg" />
            <div className="absolute bottom-4 left-4 w-12 h-12 border-l-2 border-b-2 border-gold/30 rounded-bl-lg" />
            <div className="absolute bottom-4 right-4 w-12 h-12 border-r-2 border-b-2 border-gold/30 rounded-br-lg" />

            <div className="text-center relative z-10">
              <div className="inline-flex items-center justify-center w-20 h-20 rounded-full bg-cta-gradient mb-6">
                <MessageCircle size={36} className="text-primary-foreground" />
              </div>
              
              <h3 className="font-serif text-2xl md:text-3xl text-cream mb-4">
                Ready to Get Real Talk?
              </h3>
              
              <p className="text-cream/70 mb-8 max-w-md mx-auto">
                Click below to start chatting with Pinky. Ask about that guy, decode that text, or get advice on setting boundaries.
              </p>

              {/* Sample conversation bubbles */}
              <div className="space-y-4 mb-8 max-w-sm mx-auto">
                <div className="bg-plum-light rounded-2xl rounded-bl-md p-4 text-left">
                  <p className="text-cream/80 text-sm">
                    "He said he's not ready for a relationship but keeps texting me every day. What does this mean?"
                  </p>
                </div>
                <div className="bg-cta-gradient rounded-2xl rounded-br-md p-4 text-left ml-8">
                  <p className="text-primary-foreground text-sm">
                    "Girl, let me break this down for you... 🚩 He wants the benefits without the commitment. Classic situationship behavior. Let's talk about what YOU want and how to get clarity."
                  </p>
                </div>
              </div>

              <Button variant="hero" size="xl" className="animate-glow-pulse">
                <MessageCircle size={20} />
                Start Chatting with Pinky
              </Button>

              <p className="text-cream/50 text-sm mt-4">
                No signup required for your first 3 questions
              </p>
            </div>
          </div>
        </motion.div>
      </div>
    </section>
  );
};
