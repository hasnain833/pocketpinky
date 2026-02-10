import Link from "next/link";

export const Footer = () => {
  return (
    <footer className="bg-[hsl(var(--charcoal))] py-12 text-center border-t border-[hsl(var(--cream))]">
      <div className="max-w-[1200px] mx-auto px-[5%]">
        {/* Logo */}
        <div className="font-serif text-2xl text-[hsl(var(--cream))] mb-6">
          The <span className="text-[hsl(var(--pink-accent))]">Pink Pill</span>
        </div>

        {/* Links */}
        <nav className="flex flex-wrap items-center justify-center gap-8 mb-4">
          <Link href="/terms" className="text-[hsl(var(--cream))]/70 hover:text-[hsl(var(--pink-accent))] text-xs transition-colors uppercase tracking-widest font-medium">
            Terms
          </Link>
          <Link href="/privacy" className="text-[hsl(var(--cream))]/70 hover:text-[hsl(var(--pink-accent))] text-xs transition-colors uppercase tracking-widest font-medium">
            Privacy
          </Link>
          <Link href="/contact" className="text-[hsl(var(--cream))]/70 hover:text-[hsl(var(--pink-accent))] text-xs transition-colors uppercase tracking-widest font-medium">
            Contact
          </Link>
        </nav>

        {/* Copyright */}
        <p className="text-[hsl(var(--cream))]/50 text-xs">
          © {new Date().getFullYear()} The Pink Pill. All rights reserved.
        </p>
      </div>
    </footer>
  );
};
