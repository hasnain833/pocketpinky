"use client";
import { useState, useEffect } from "react";
import Link from "next/link";
import { useRouter, usePathname } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import { Menu, X, LogOut, User } from "lucide-react";
import { createClient } from "@/lib/supabase/client";
import type { User as AuthUser } from "@supabase/supabase-js";
import { AuthModal } from "./AuthModal";
import { AccountModal } from "./AccountModal";

export const Header = () => {
  const router = useRouter();
  const pathname = usePathname();
  const [user, setUser] = useState<AuthUser | null>(null);
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [authModal, setAuthModal] = useState<{ isOpen: boolean; mode: "login" | "signup" }>({
    isOpen: false,
    mode: "login"
  });
  const [isAccountModalOpen, setIsAccountModalOpen] = useState(false);

  useEffect(() => {
    const supabase = createClient();
    if (!supabase) {
      setUser(null);
      return;
    }
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setUser(session?.user ?? null);
    });
    supabase.auth.getSession().then(({ data: { session } }) => {
      setUser(session?.user ?? null);
    });
    return () => subscription.unsubscribe();
  }, []);

  async function handleSignOut() {
    setIsMenuOpen(false);
    setIsAccountModalOpen(false);
    setUser(null);
    const supabase = createClient();
    if (supabase) await supabase.auth.signOut();
    router.push("/");
    router.refresh();
  }

  return (
    <>
      <header className="fixed top-0 left-0 right-0 z-50 w-full bg-[hsl(var(--cream))]/95 backdrop-blur-[20px] border-b border-[hsl(var(--divider))] transition-all duration-300">
        <div className="max-w-[1300px] mx-auto px-[5%] py-3 md:py-4">
          <div className="flex items-center justify-between">
            {/* Logo */}
            <Link href="/" className="font-serif text-[1.6rem] font-semibold text-[hsl(var(--charcoal))] tracking-[0.5px]">
              The <span className="text-[hsl(var(--pink-accent))]">Pink Pill</span>
            </Link>

            {/* Desktop Nav */}
            <div className="hidden md:flex items-center gap-12">
              <nav className="flex items-center gap-10">
                <a href="#modes" className="text-[hsl(var(--text-secondary))] text-xs font-semibold tracking-[0.5px] uppercase hover:text-[hsl(var(--pink-accent))] transition-colors">
                  What She Does
                </a>
                <a href="#pricing" className="text-[hsl(var(--text-secondary))] text-xs font-semibold tracking-[0.5px] uppercase hover:text-[hsl(var(--pink-accent))] transition-colors">
                  Pricing
                </a>
              </nav>

              <div className="flex items-center gap-4">
                {user ? (
                  <button
                    onClick={() => setIsAccountModalOpen(true)}
                    className="bg-[hsl(var(--charcoal))] text-[hsl(var(--cream))] px-7 py-3 text-xs font-semibold tracking-[0.5px] uppercase rounded-sm hover:bg-[hsl(var(--wine))] transition-colors"
                  >
                    Account
                  </button>
                ) : (
                  <>
                    <button
                      onClick={() => setAuthModal({ isOpen: true, mode: "signup" })}
                      className="bg-[hsl(var(--charcoal))] text-[hsl(var(--cream))] px-7 py-3 text-xs font-semibold tracking-[0.5px] uppercase rounded-sm hover:bg-[hsl(var(--wine))] transition-colors"
                    >
                      Try Pinky Free
                    </button>
                  </>
                )}
              </div>
            </div>

            {/* Mobile Menu Button */}
            <button
              type="button"
              onClick={() => setIsMenuOpen(!isMenuOpen)}
              className="md:hidden text-[hsl(var(--charcoal))] p-2"
              aria-label={isMenuOpen ? "Close menu" : "Open menu"}
            >
              {isMenuOpen ? <X size={24} /> : <Menu size={24} />}
            </button>
          </div>
        </div>

        {/* Mobile Menu */}
        <AnimatePresence>
          {isMenuOpen && (
            <motion.div
              initial={{ opacity: 0, y: -20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              className="absolute top-full left-0 right-0 bg-white border-b border-[hsl(var(--divider))] p-6 flex flex-col gap-6 md:hidden shadow-xl"
            >
              <nav className="flex flex-col gap-5">
                <a
                  href="#modes"
                  onClick={() => setIsMenuOpen(false)}
                  className="text-[hsl(var(--text-secondary))] text-xs font-semibold tracking-[0.5px] uppercase"
                >
                  What She Does
                </a>
                <a
                  href="#pricing"
                  onClick={() => setIsMenuOpen(false)}
                  className="text-[hsl(var(--text-secondary))] text-xs font-semibold tracking-[0.5px] uppercase"
                >
                  Pricing
                </a>

                <div className="pt-2">
                  {user ? (
                    <button
                      onClick={() => {
                        setIsMenuOpen(false);
                        setIsAccountModalOpen(true);
                      }}
                      className="w-full bg-[hsl(var(--charcoal))] text-[hsl(var(--cream))] px-7 py-4 text-xs font-semibold tracking-[0.5px] uppercase rounded-sm text-center"
                    >
                      Account
                    </button>
                  ) : (
                    <button
                      onClick={() => {
                        setIsMenuOpen(false);
                        setAuthModal({ isOpen: true, mode: "signup" });
                      }}
                      className="w-full bg-[hsl(var(--charcoal))] text-[hsl(var(--cream))] px-7 py-4 text-xs font-semibold tracking-[0.5px] uppercase rounded-sm text-center"
                    >
                      Try Pinky Free
                    </button>
                  )}
                </div>
              </nav>
            </motion.div>
          )}
        </AnimatePresence>
      </header>

      <AuthModal
        isOpen={authModal.isOpen}
        onClose={() => setAuthModal({ ...authModal, isOpen: false })}
        initialMode={authModal.mode}
      />
      <AccountModal
        isOpen={isAccountModalOpen}
        onClose={() => setIsAccountModalOpen(false)}
        onSignOut={handleSignOut}
      />
    </>
  );
};
