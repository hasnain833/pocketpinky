"use client";

import Link from "next/link";
import { FileText } from "lucide-react";

export default function TermsPage() {
  return (
    <div className="min-h-screen bg-secondary flex flex-col overflow-x-hidden w-full pt-20 md:pt-24">
      <main className="flex-1 container mx-auto px-6 py-12 md:py-16 max-w-3xl">
        <h1 className="font-serif text-3xl md:text-4xl text-cream mb-2 flex items-center gap-3">
          <FileText className="w-8 h-8 text-gold" />
          Terms of Service
        </h1>
        <p className="text-cream/60 text-sm mb-10">
          Last updated: {new Date().toLocaleDateString("en-US")}
        </p>

        <article className="prose prose-invert prose-cream max-w-none space-y-8 text-cream/90">
          <section>
            <h2 className="font-serif text-xl text-cream mb-3">1. Acceptance of Terms</h2>
            <p className="text-cream/80 text-sm leading-relaxed">
              By accessing or using Pocket Pinky (&quot;Pinky&quot;, &quot;we&quot;, &quot;us&quot;, or &quot;our&quot;) website, app, or services, you agree to be bound by these Terms of Service. If you do not agree, please do not use our services.
            </p>
          </section>

          <section>
            <h2 className="font-serif text-xl text-cream mb-3">2. Description of Service</h2>
            <p className="text-cream/80 text-sm leading-relaxed">
              Pinky provides an AI-powered platform for dating clarity, including chat, guides, and related content. We reserve the right to modify, suspend, or discontinue any part of the service at any time.
            </p>
          </section>

          <section>
            <h2 className="font-serif text-xl text-cream mb-3">3. User Accounts and Subscription</h2>
            <p className="text-cream/80 text-sm leading-relaxed">
              You may need an account to access certain features. Subscription plans, billing, and renewals are governed by these terms and our payment processor&apos;s terms. You are responsible for keeping your account credentials secure.
            </p>
          </section>

          <section>
            <h2 className="font-serif text-xl text-cream mb-3">4. Acceptable Use</h2>
            <p className="text-cream/80 text-sm leading-relaxed">
              You agree not to use the service for any unlawful purpose, to harass others, or to violate any applicable laws. We may suspend or terminate accounts that violate these terms.
            </p>
          </section>

          <section>
            <h2 className="font-serif text-xl text-cream mb-3">5. Intellectual Property</h2>
            <p className="text-cream/80 text-sm leading-relaxed">
              All content, branding, and materials on Pinky are owned by us or our licensors. You may not copy, distribute, or create derivative works without our written permission.
            </p>
          </section>

          <section>
            <h2 className="font-serif text-xl text-cream mb-3">6. Disclaimer</h2>
            <p className="text-cream/80 text-sm leading-relaxed">
              Our service is for informational and entertainment purposes. It does not replace professional advice. We are not liable for decisions you make based on content or chat interactions.
            </p>
          </section>

          <section>
            <h2 className="font-serif text-xl text-cream mb-3">7. Contact</h2>
            <p className="text-cream/80 text-sm leading-relaxed">
              For questions about these terms, please see our <Link href="/contact" className="text-gold hover:underline">Contact</Link> page.
            </p>
          </section>
        </article>

        <div className="mt-12">
          <Link href="/" className="text-gold hover:underline text-sm font-medium">
            ← Back to Home
          </Link>
        </div>
      </main>
    </div>
  );
}
