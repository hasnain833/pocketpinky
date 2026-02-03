"use client";

import Link from "next/link";
import { Shield } from "lucide-react";

export default function PrivacyPage() {
  return (
    <div className="min-h-screen bg-secondary flex flex-col overflow-x-hidden w-full pt-20 md:pt-24">
      <main className="flex-1 container mx-auto px-6 py-12 md:py-16 max-w-3xl">
        <h1 className="font-serif text-3xl md:text-4xl text-cream mb-2 flex items-center gap-3">
          <Shield className="w-8 h-8 text-gold" />
          Privacy Policy
        </h1>
        <p className="text-cream/60 text-sm mb-10">
          Last updated: {new Date().toLocaleDateString("en-US")}
        </p>

        <article className="prose prose-invert prose-cream max-w-none space-y-8 text-cream/90">
          <section>
            <h2 className="font-serif text-xl text-cream mb-3">1. Information We Collect</h2>
            <p className="text-cream/80 text-sm leading-relaxed">
              We may collect information you provide (e.g. name, email, account and payment details) and usage data (e.g. how you use the site and chat). We use this to provide the service, improve our product, and communicate with you in line with your preferences.
            </p>
          </section>

          <section>
            <h2 className="font-serif text-xl text-cream mb-3">2. How We Use Your Information</h2>
            <p className="text-cream/80 text-sm leading-relaxed">
              We use your information to operate Pinky, process subscriptions, send transactional and (with your consent) marketing emails, improve our services, and comply with legal obligations.
            </p>
          </section>

          <section>
            <h2 className="font-serif text-xl text-cream mb-3">3. Sharing and Disclosure</h2>
            <p className="text-cream/80 text-sm leading-relaxed">
              We do not sell your personal information. We may share data with service providers (e.g. hosting, payment, email) who act on our behalf. We may disclose information when required by law or to protect our rights and safety.
            </p>
          </section>

          <section>
            <h2 className="font-serif text-xl text-cream mb-3">4. Cookies and Similar Technologies</h2>
            <p className="text-cream/80 text-sm leading-relaxed">
              We use cookies and similar technologies for authentication, preferences, and analytics. You can manage cookie settings in your browser.
            </p>
          </section>

          <section>
            <h2 className="font-serif text-xl text-cream mb-3">5. Data Retention and Security</h2>
            <p className="text-cream/80 text-sm leading-relaxed">
              We retain your data as long as needed to provide the service and as required by law. We take reasonable steps to protect your data; no method of transmission or storage is 100% secure.
            </p>
          </section>

          <section>
            <h2 className="font-serif text-xl text-cream mb-3">6. Your Rights</h2>
            <p className="text-cream/80 text-sm leading-relaxed">
              Depending on where you live, you may have rights to access, correct, delete, or port your data, and to opt out of marketing. You can manage newsletter preferences in your account and contact us for other requests.
            </p>
          </section>

          <section>
            <h2 className="font-serif text-xl text-cream mb-3">7. Contact</h2>
            <p className="text-cream/80 text-sm leading-relaxed">
              For privacy-related questions or to exercise your rights, please see our <Link href="/contact" className="text-gold hover:underline">Contact</Link> page.
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
