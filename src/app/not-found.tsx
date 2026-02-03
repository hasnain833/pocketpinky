import Link from "next/link";
import { Home, MessageCircle } from "lucide-react";

export default function NotFound() {
  return (
    <div className="min-h-screen bg-secondary flex flex-col items-center justify-center relative overflow-hidden px-6">
      {/* Subtle background accent */}
      <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-primary/5 rounded-full blur-3xl -z-10" />
      <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-gold/5 rounded-full blur-3xl -z-10" />

      <div className="text-center max-w-md mx-auto">
        {/* Large 404 */}
        <p className="font-serif text-8xl md:text-9xl font-bold text-cream/10 select-none leading-none">
          404
        </p>

        <h1 className="font-serif text-2xl md:text-3xl text-cream mt-4 mb-2">
          This page went ghost
        </h1>
        <p className="text-cream/60 text-base md:text-lg mb-10">
          We couldn’t find what you’re looking for. No worries — head back home or start chatting with Pinky.
        </p>

        <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
          <Link
            href="/"
            className="inline-flex items-center justify-center gap-2 rounded-xl bg-cta-gradient px-8 py-4 text-white font-semibold shadow-lg hover:shadow-glow hover:scale-105 transition-all duration-300"
          >
            <Home className="w-5 h-5" />
            Back to Home
          </Link>
          <Link
            href="/auth"
            className="inline-flex items-center justify-center gap-2 rounded-xl border-2 border-gold/40 text-gold px-8 py-4 font-semibold hover:bg-gold/10 hover:border-gold/60 transition-all duration-300"
          >
            <MessageCircle className="w-5 h-5" />
            Log in / Sign up
          </Link>
        </div>

        <p className="mt-10 text-cream/40 text-sm">
          <Link href="/" className="hover:text-gold transition-colors">
            Pocket Pinky
          </Link>
          {" "}— Your AI big sister for dating clarity
        </p>
      </div>
    </div>
  );
}
