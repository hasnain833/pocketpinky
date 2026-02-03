"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import heroWoman from "@/assets/hero-woman.jpg";
import signupImage from "@/assets/swriling_couple_1770109529730.png";
import Image from "next/image";

export default function AuthPage() {
  const searchParams = useSearchParams();
  const [mode, setMode] = useState<"login" | "signup">("login");
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
    const m = searchParams.get("mode");
    if (m === "signup") setMode("signup");
    else setMode("login");
  }, [searchParams]);

  if (!mounted) {
    return (
      <div className="min-h-screen bg-secondary flex items-center justify-center" aria-busy="true" aria-label="Loading">
        <div className="relative w-14 h-14">
          <div className="absolute inset-0 rounded-full border-2 border-primary/30" />
          <motion.div
            className="absolute inset-0 rounded-full border-2 border-transparent border-t-primary border-r-primary"
            animate={{ rotate: 360 }}
            transition={{ duration: 0.8, repeat: Infinity, ease: "linear" }}
          />
          <motion.div
            className="absolute inset-1 rounded-full border-2 border-transparent border-b-primary border-l-gold"
            animate={{ rotate: -360 }}
            transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
          />
        </div>
      </div>
    );
  }

  const isSignup = mode === "signup";

  return (
    <div className="min-h-screen bg-secondary flex flex-col overflow-x-hidden w-full max-w-[100vw]">
      {/* Top bar: logo */}
      <header className="absolute top-0 left-0 right-0 z-10 px-6 py-4">
        <Link href="/" className="inline-block">
          <span className="font-script text-4xl text-gold hover:opacity-90 transition-opacity">Pinky</span>
        </Link>
      </header>

      {/* Main: centered container, two panels that swap order */}
      <main className="flex-1 flex min-h-screen items-center justify-center p-4 md:p-8 overflow-x-hidden w-full box-border">
        <div className="w-full max-w-4xl flex flex-col md:flex-row rounded-2xl overflow-hidden shadow-2xl border border-gold/10 bg-plum-light/10 box-border">
          {/* Form panel - height follows content */}
          <motion.div
            key="form"
            layout
            transition={{ type: "spring", stiffness: 300, damping: 30 }}
            className="flex-1 flex items-center justify-center p-6 md:p-10 shrink-0 md:min-w-0 min-w-0 bg-secondary/50 md:bg-secondary overflow-x-hidden"
            style={{ order: isSignup ? 2 : 1 }}
          >
            <div className="w-full max-w-md overflow-x-hidden">
            <AnimatePresence mode="wait">
              {isSignup ? (
                <motion.div
                  key="signup"
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -20 }}
                  transition={{ duration: 0.25 }}
                  className="space-y-6"
                >
                  <h1 className="font-serif text-3xl md:text-4xl text-cream">Create account</h1>
                  <p className="text-cream/60 text-sm">Your AI big sister for dating clarity.</p>
                  <form className="space-y-4" onSubmit={(e) => e.preventDefault()}>
                    <div className="space-y-2">
                      <Label htmlFor="signup-name" className="text-cream/90">Name</Label>
                      <Input
                        id="signup-name"
                        type="text"
                        placeholder="Your name"
                        className="bg-plum-light/20 border-gold/20 text-cream placeholder:text-cream/40"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="signup-email" className="text-cream/90">Email</Label>
                      <Input
                        id="signup-email"
                        type="email"
                        placeholder="you@example.com"
                        className="bg-plum-light/20 border-gold/20 text-cream placeholder:text-cream/40"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="signup-password" className="text-cream/90">Password</Label>
                      <Input
                        id="signup-password"
                        type="password"
                        placeholder="••••••••"
                        className="bg-plum-light/20 border-gold/20 text-cream placeholder:text-cream/40"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="signup-confirm" className="text-cream/90">Confirm password</Label>
                      <Input
                        id="signup-confirm"
                        type="password"
                        placeholder="••••••••"
                        className="bg-plum-light/20 border-gold/20 text-cream placeholder:text-cream/40"
                      />
                    </div>
                    <Button type="submit" variant="hero" size="xl" className="w-full rounded-xl">
                      Sign up
                    </Button>
                  </form>
                  <p className="text-center text-cream/60 text-sm">
                    Already have an account?{" "}
                    <button
                      type="button"
                      onClick={() => setMode("login")}
                      className="text-gold hover:underline font-medium"
                    >
                      Log in
                    </button>
                  </p>
                </motion.div>
              ) : (
                <motion.div
                  key="login"
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: 20 }}
                  transition={{ duration: 0.25 }}
                  className="space-y-6"
                >
                  <h1 className="font-serif text-3xl md:text-4xl text-cream">Welcome back</h1>
                  <p className="text-cream/60 text-sm">Log in to continue with Pinky.</p>
                  <form className="space-y-4" onSubmit={(e) => e.preventDefault()}>
                    <div className="space-y-2">
                      <Label htmlFor="login-email" className="text-cream/90">Email</Label>
                      <Input
                        id="login-email"
                        type="email"
                        placeholder="you@example.com"
                        className="bg-plum-light/20 border-gold/20 text-cream placeholder:text-cream/40"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="login-password" className="text-cream/90">Password</Label>
                      <Input
                        id="login-password"
                        type="password"
                        placeholder="••••••••"
                        className="bg-plum-light/20 border-gold/20 text-cream placeholder:text-cream/40"
                      />
                    </div>
                    <Button type="submit" variant="hero" size="xl" className="w-full rounded-xl">
                      Log in
                    </Button>
                  </form>
                  <p className="text-center text-cream/60 text-sm">
                    Don&apos;t have an account?{" "}
                    <button
                      type="button"
                      onClick={() => setMode("signup")}
                      className="text-gold hover:underline font-medium"
                    >
                      Sign up
                    </button>
                  </p>
                </motion.div>
              )}
            </AnimatePresence>
            </div>
          </motion.div>

          {/* Image panel - login: hero image; signup: different image */}
          <motion.div
            key="image"
            layout
            transition={{ type: "spring", stiffness: 300, damping: 30 }}
            className="relative w-full md:w-[45%] min-h-[32vh] md:min-h-0 md:self-stretch shrink-0"
            style={{ order: isSignup ? 1 : 2 }}
          >
            <div className="absolute inset-0 bg-secondary">
              <Image
                src={isSignup ? signupImage : heroWoman}
                alt=""
                fill
                className="object-cover opacity-90"
                style={{ filter: "sepia(0.2) contrast(1.05) saturate(0.9)" }}
                sizes="(max-width: 768px) 100vw, 450px"
                priority
              />
              <div
                className="absolute inset-0 z-[1]"
                style={{
                  background:
                    "linear-gradient(180deg, rgba(45, 27, 61, 0.5) 0%, rgba(45, 27, 61, 0.85) 100%)",
                }}
              />
            </div>
          </motion.div>
        </div>
      </main>
    </div>
  );
}
