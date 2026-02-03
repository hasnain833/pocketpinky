"use client";
import { motion } from "framer-motion";
import { Button } from "./ui/button";
import heroWoman from "@/assets/hero-woman.jpg";

export const HeroSection = () => {
  return (
    <section
      id="hero"
      className="relative min-h-[max(100vh,720px)] flex items-center justify-center overflow-hidden"
    >
      {/* Full-bleed vintage/classical background with multiple layers */}
      <div
        className="absolute inset-0 bg-secondary"
        style={{
          backgroundImage: `url(${typeof heroWoman === "string" ? heroWoman : heroWoman.src})`,
          backgroundSize: "cover",
          backgroundPosition: "center",
          filter: "sepia(0.2) contrast(1.1) saturate(0.8)",
        }}
      />

      {/*Dark overlays & Vignette */}
      <div
        className="absolute inset-0 z-[1]"
        style={{
          background:
            "radial-gradient(circle at center, transparent 0%, rgba(26, 15, 36, 0.4) 50%, rgba(26, 15, 36, 0.8) 100%), linear-gradient(180deg, rgba(45, 27, 61, 0.6) 0%, rgba(45, 27, 61, 0.8) 100%)",
        }}
      />

      {/* Subtle Noise Texture Overlay */}
      <div className="absolute inset-0 opacity-[0.03] pointer-events-none mix-blend-overlay z-[2] bg-[url('https://www.transparenttextures.com/patterns/asfalt-dark.png')]" />

      <div className="container mx-auto px-4 md:px-6 relative z-10 flex flex-col items-center justify-center pt-24 md:pt-32 pb-24 md:pb-32">
        {/* Corner flourishes positioned relative to the content block */}
        <div className="relative max-w-5xl w-full py-12 md:py-16 px-6 md:px-10 flex flex-col items-center">
          {/* Top-left flourish — static, no animation */}
          <div
            className="absolute top-0 left-0 w-16 h-16 md:w-24 md:h-24 border-l-[1px] border-t-[1px] border-gold/40 rounded-tl-3xl pointer-events-none"
            aria-hidden
          />
          {/* Bottom-right flourish — static, no animation */}
          <div
            className="absolute bottom-0 right-0 w-16 h-16 md:w-24 md:h-24 border-r-[1px] border-b-[1px] border-gold/40 rounded-br-3xl pointer-events-none"
            aria-hidden
          />

          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 1, ease: "easeOut" }}
            className="text-center"
          >
            <motion.span
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.3 }}
              className="inline-block font-script text-xl md:text-2xl text-gold mb-4 tracking-widest drop-shadow-sm"
            >
              The Secret Weapon for Modern Dating
            </motion.span>

            <h1 className="font-serif text-4xl md:text-6xl lg:text-7xl text-cream leading-[1.1] mb-6 tracking-tight max-w-4xl mx-auto uppercase">
              Your AI Big Sister for <br className="hidden md:block" />
              <span className="italic text-gold normal-case">Dating Clarity</span>
            </h1>

            <p className="text-cream/80 text-sm md:text-lg lg:text-xl mb-10 max-w-2xl mx-auto font-medium leading-relaxed tracking-wide opacity-90">
              Vet men, decode texts, and date with standards. <br className="hidden sm:block" />
              Real talk for Black women who are done settling.
            </p>

            <div className="flex flex-col sm:flex-row gap-6 justify-center items-center">
              <Button variant="hero" size="xl" asChild className="px-10 py-7 text-lg md:text-xl rounded-2xl shadow-glow transition-all duration-500 hover:scale-105">
                <a href="#pricing">Start Free Trial</a>
              </Button>
            </div>

            <motion.p
              initial={{ opacity: 0 }}
              animate={{ opacity: 0.6 }}
              transition={{ delay: 1.2 }}
              className="text-cream text-xs md:text-sm mt-6 tracking-widest uppercase font-semibold"
            >
              ✨ First 3 questions free • No credit card required ✨
            </motion.p>
          </motion.div>
        </div>
      </div>
    </section>
  );
};
