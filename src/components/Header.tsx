"use client";
import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Menu, X } from "lucide-react";
import { Button } from "./ui/button";

const navLinks = [
  { name: "Home", href: "#hero" },
  { name: "Features", href: "#features" },
  { name: "How It Works", href: "#how-it-works" },
  { name: "Pricing", href: "#pricing" },
  { name: "Testimonials", href: "#testimonials" },
];

export const Header = () => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isScrolled, setIsScrolled] = useState(false);
  const [heroHeight, setHeroHeight] = useState(0);

  useEffect(() => {
    const updateHeroHeight = () => {
      const hero = document.getElementById("hero");
      if (hero) setHeroHeight(hero.offsetHeight);
    };
    updateHeroHeight();
    window.addEventListener("resize", updateHeroHeight);
    return () => window.removeEventListener("resize", updateHeroHeight);
  }, []);

  useEffect(() => {
    const handleScroll = () => {
      const threshold = heroHeight > 0 ? heroHeight : window.innerHeight - 80;
      setIsScrolled(window.scrollY >= threshold);
    };
    window.addEventListener("scroll", handleScroll, { passive: true });
    handleScroll();
    return () => window.removeEventListener("scroll", handleScroll);
  }, [heroHeight]);

  return (
    <>
      {/* Initial Absolute Header (Scrolls away) */}
      <header className="absolute top-0 left-0 right-0 z-50 w-full transition-all duration-300 bg-transparent border-b border-transparent">
        <div className="container mx-auto px-6 py-4">
          <div className="flex items-center justify-between">
            <a href="#hero" className="flex items-center gap-2 shrink-0 group">
              <span className="font-script text-5xl text-gold transition-transform duration-300 group-hover:scale-105">Pinky</span>
            </a>

            <div className="hidden md:flex items-center gap-8">
              <nav className="flex items-center gap-8 mr-4">
                {navLinks.map((link) => (
                  <a
                    key={link.name}
                    href={link.href}
                    className="text-cream/70 hover:text-gold transition-colors font-medium text-sm uppercase tracking-widest"
                  >
                    {link.name}
                  </a>
                ))}
              </nav>
              <Button variant="hero" size="lg" asChild className="rounded-xl shadow-gold/20 shadow-lg">
                <a href="#pricing">Get Started</a>
              </Button>
            </div>

            <button
              type="button"
              onClick={() => setIsMenuOpen(!isMenuOpen)}
              className="md:hidden text-cream p-2 rounded-lg hover:bg-cream/10 transition-colors"
              aria-label={isMenuOpen ? "Close menu" : "Open menu"}
            >
              {isMenuOpen ? <X size={24} /> : <Menu size={24} />}
            </button>
          </div>
        </div>
      </header>

      {/* Sticky Header (Slides in after scroll) */}
      <AnimatePresence>
        {isScrolled && (
          <motion.header
            initial={{ y: -100, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            exit={{ y: -100, opacity: 0 }}
            transition={{ duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
            className="fixed top-0 left-0 right-0 z-[60] w-full bg-secondary/95 backdrop-blur-md border-b border-cream/10 shadow-xl"
          >
            <div className="container mx-auto px-6 py-3">
              <div className="flex items-center justify-between">
                <a href="#hero" className="flex items-center gap-2 shrink-0 group">
                  <span className="font-script text-4xl text-gold transition-transform duration-300 group-hover:scale-105">Pinky</span>
                </a>

                <div className="hidden md:flex items-center gap-8">
                  <nav className="flex items-center gap-6 mr-2">
                    {navLinks.map((link) => (
                      <a
                        key={link.name}
                        href={link.href}
                        className="text-cream/80 hover:text-gold transition-colors font-medium text-xs uppercase tracking-widest"
                      >
                        {link.name}
                      </a>
                    ))}
                  </nav>
                  <Button variant="hero" size="sm" asChild className="rounded-lg shadow-gold/20">
                    <a href="#pricing">Get Started</a>
                  </Button>
                </div>

                <button
                  type="button"
                  onClick={() => setIsMenuOpen(!isMenuOpen)}
                  className="md:hidden text-cream p-1 rounded-md hover:bg-cream/10"
                >
                  {isMenuOpen ? <X size={20} /> : <Menu size={20} />}
                </button>
              </div>
            </div>
          </motion.header>
        )}
      </AnimatePresence>

      {/* Mobile Menu (Shared or separate depending on implementation needs) */}
      <AnimatePresence>
        {isMenuOpen && (
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.95 }}
            className="fixed inset-0 z-[100] md:hidden bg-secondary/98 backdrop-blur-xl p-6 flex flex-col justify-center items-center"
          >
            <button
              onClick={() => setIsMenuOpen(false)}
              className="absolute top-6 right-6 text-cream"
            >
              <X size={32} />
            </button>
            <nav className="flex flex-col items-center gap-8">
              {navLinks.map((link) => (
                <a
                  key={link.name}
                  href={link.href}
                  onClick={() => setIsMenuOpen(false)}
                  className="text-cream text-3xl font-serif hover:text-gold transition-colors"
                >
                  {link.name}
                </a>
              ))}
              <Button variant="hero" size="xl" className="mt-4" asChild>
                <a href="#pricing" onClick={() => setIsMenuOpen(false)}>Get Started</a>
              </Button>
            </nav>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
};
