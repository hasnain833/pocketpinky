"use client";

import Link from "next/link";
import { Mail, MessageCircle, ArrowLeft } from "lucide-react";
import { Button } from "@/components/ui/button";

const contactEmail = process.env.NEXT_PUBLIC_CONTACT_EMAIL || "support@pocketpinky.com";

export default function ContactPage() {
  return (
    <div className="min-h-screen bg-secondary flex flex-col overflow-x-hidden w-full pt-20 md:pt-24">
      <main className="flex-1 container mx-auto px-6 py-12 md:py-16 max-w-2xl">
        <h1 className="font-serif text-3xl md:text-4xl text-cream mb-2 flex items-center gap-3">
          <Mail className="w-8 h-8 text-gold" />
          Contact Us
        </h1>
        <p className="text-cream/60 text-sm mb-10">
          We&apos;d love to hear from you. Reach out for support, feedback, or partnership.
        </p>

        <section className="space-y-8">
          <div className="bg-plum-light/20 border border-gold/20 rounded-2xl p-6 md:p-8">
            <h2 className="font-serif text-xl text-cream mb-3">Email</h2>
            <p className="text-cream/80 text-sm mb-4">
              For account, billing, or general questions, email us and we&apos;ll get back to you as soon as we can.
            </p>
            <Button variant="heroOutline" size="lg" className="rounded-xl" asChild>
              <a href={`mailto:${contactEmail}`} className="flex items-center gap-2">
                <Mail size={18} />
                {contactEmail}
              </a>
            </Button>
          </div>

          <div className="bg-plum-light/20 border border-gold/20 rounded-2xl p-6 md:p-8">
            <h2 className="font-serif text-xl text-cream mb-3">Chat with Pinky</h2>
            <p className="text-cream/80 text-sm mb-4">
              Have a quick question? Start a conversation with our AI assistant on the homepage.
            </p>
            <Button variant="hero" size="lg" className="rounded-xl" asChild>
              <Link href="/#chatbot" className="flex items-center gap-2">
                <MessageCircle size={18} />
                Open Chat
              </Link>
            </Button>
          </div>
        </section>

        <div className="mt-12 flex items-center gap-2">
          <ArrowLeft className="w-4 h-4 text-gold" />
          <Link href="/" className="text-gold hover:underline text-sm font-medium">
            Back to Home
          </Link>
        </div>
      </main>
    </div>
  );
}
