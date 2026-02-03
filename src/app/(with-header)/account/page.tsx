"use client";

import { useState } from "react";
import Link from "next/link";
import { User, CreditCard, FileText, Mail, MessageCircle, Download, Bell } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";

export default function AccountPage() {
  // Placeholder: in production these would come from auth/session or API
  const plan = "Free";
  const status = "Active";
  const renewalDate = "—";
  const hasPremiumGuides = false;
  const [newsletterSubscribed, setNewsletterSubscribed] = useState(true);

  return (
    <div className="min-h-screen bg-secondary flex flex-col overflow-x-hidden w-full pt-20 md:pt-24">
      <main className="flex-1 container mx-auto px-6 py-12 md:py-16 max-w-2xl">
        <h1 className="font-serif text-3xl md:text-4xl text-cream mb-2 flex items-center gap-3">
          <User className="w-8 h-8 text-gold" />
          My Account
        </h1>
        <p className="text-cream/60 text-sm mb-10">
          Manage your subscription and access your content.
        </p>

        {/* Subscription card */}
        <section className="bg-plum-light/20 border border-gold/20 rounded-2xl p-6 md:p-8 mb-8">
          <h2 className="font-serif text-xl text-cream mb-4 flex items-center gap-2">
            <CreditCard className="w-5 h-5 text-gold" />
            Your Subscription
          </h2>
          <dl className="space-y-3 text-cream/90">
            <div className="flex justify-between">
              <dt className="text-cream/60">Plan</dt>
              <dd className="font-medium">{plan}</dd>
            </div>
            <div className="flex justify-between">
              <dt className="text-cream/60">Status</dt>
              <dd className="font-medium">{status}</dd>
            </div>
            <div className="flex justify-between">
              <dt className="text-cream/60">Renewal date</dt>
              <dd className="font-medium">{renewalDate}</dd>
            </div>
          </dl>
          <Button variant="heroOutline" size="lg" className="mt-6 w-full sm:w-auto rounded-xl" asChild>
            <a
              href={process.env.NEXT_PUBLIC_STRIPE_CUSTOMER_PORTAL_URL || "#"}
              target="_blank"
              rel="noopener noreferrer"
              aria-label="Manage subscription (opens Stripe Customer Portal)"
            >
              Manage Subscription
            </a>
          </Button>
          <p className="text-cream/50 text-xs mt-3">
            Update payment, cancel, or change plan. Opens Stripe Customer Portal in a new window.
          </p>
        </section>

        {/* Your content (guides) - shown when user has Premium */}
        {hasPremiumGuides ? (
          <section className="bg-plum-light/20 border border-gold/20 rounded-2xl p-6 md:p-8 mb-8">
            <h2 className="font-serif text-xl text-cream mb-4 flex items-center gap-2">
              <FileText className="w-5 h-5 text-gold" />
              Your Content
            </h2>
            <ul className="space-y-3">
              <li className="flex items-center justify-between gap-4 py-2 border-b border-cream/10 last:border-0">
                <span className="text-cream/90">Swirling Success Guide</span>
                <a
                  href="#"
                  className="text-gold hover:underline text-sm flex items-center gap-1"
                  aria-label="Download Swirling Success Guide"
                >
                  <Download size={16} />
                  Download
                </a>
              </li>
              <li className="flex items-center justify-between gap-4 py-2 border-b border-cream/10 last:border-0">
                <span className="text-cream/90">49 Patterns Field Guide</span>
                <a
                  href="#"
                  className="text-gold hover:underline text-sm flex items-center gap-1"
                  aria-label="Download 49 Patterns Field Guide"
                >
                  <Download size={16} />
                  Download
                </a>
              </li>
            </ul>
          </section>
        ) : (
          <section className="bg-plum-light/10 border border-gold/10 rounded-2xl p-6 md:p-8 mb-8">
            <h2 className="font-serif text-xl text-cream mb-2 flex items-center gap-2">
              <FileText className="w-5 h-5 text-gold" />
              Your Content
            </h2>
            <p className="text-cream/60 text-sm">
              Upgrade to Premium to get access to guides and the newsletter.
            </p>
            <Button variant="hero" size="lg" className="mt-4 rounded-xl" asChild>
              <Link href="/#pricing">View plans</Link>
            </Button>
          </section>
        )}

        {/* Newsletter toggle */}
        <section className="bg-plum-light/20 border border-gold/20 rounded-2xl p-6 md:p-8 mb-8">
          <h2 className="font-serif text-xl text-cream mb-4 flex items-center gap-2">
            <Bell className="w-5 h-5 text-gold" />
            Newsletter
          </h2>
          <div className="flex items-center justify-between gap-4 flex-wrap">
            <div>
              <p className="text-cream/90 font-medium">Email newsletter</p>
              <p className="text-cream/50 text-sm mt-0.5">
                {newsletterSubscribed
                  ? "You're subscribed. We'll send tips and updates."
                  : "Turn on to get tips and updates by email."}
              </p>
            </div>
            <Switch
              checked={newsletterSubscribed}
              onCheckedChange={setNewsletterSubscribed}
              className="data-[state=checked]:bg-gold border-cream/20"
            />
          </div>
        </section>

        {/* Help */}
        <section className="flex flex-wrap gap-4">
          <Button variant="ghost" size="lg" className="text-cream/80 hover:text-gold rounded-xl" asChild>
            <a href="/#chatbot" className="flex items-center gap-2">
              <MessageCircle size={18} />
              Chat with Pinky
            </a>
          </Button>
          <Button variant="ghost" size="lg" className="text-cream/80 hover:text-gold rounded-xl" asChild>
            <a
              href={process.env.NEXT_PUBLIC_CONTACT_EMAIL ? `mailto:${process.env.NEXT_PUBLIC_CONTACT_EMAIL}` : "#"}
              className="flex items-center gap-2"
            >
              <Mail size={18} />
              Contact Support
            </a>
          </Button>
        </section>
      </main>
    </div>
  );
}
