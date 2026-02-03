"use client";
import Link from "next/link";
import { motion } from "framer-motion";
import { Instagram, Twitter, Facebook, Mail } from "lucide-react";

const appStoreUrl =
  process.env.NEXT_PUBLIC_APP_STORE_URL || "https://apps.apple.com/app/pocket-pinky/id000000000";
const playStoreUrl =
  process.env.NEXT_PUBLIC_PLAY_STORE_URL || "https://play.google.com/store/apps/details?id=com.pocketpinky.app";

const socialLinks = [
  { icon: Instagram, href: "#", label: "Instagram" },
  { icon: Twitter, href: "#", label: "Twitter" },
  { icon: Facebook, href: "#", label: "Facebook" },
  { icon: Mail, href: "#", label: "Email" },
];

const legalLinks = [
  { name: "My Account", href: "/account" },
  { name: "Terms", href: "/terms" },
  { name: "Privacy", href: "/privacy" },
  { name: "Contact", href: "/contact" },
];

export const Footer = () => {
  return (
    <footer className="bg-dark-gradient py-12 md:py-16">
      <div className="container mx-auto px-6">
        <motion.div
          initial={{ opacity: 0, y: 12 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="flex flex-col items-center justify-center text-center max-w-md mx-auto"
        >
          {/* Logo */}
          <a href="#hero" className="inline-block">
            <span className="font-script text-4xl text-gold">Pinky</span>
          </a>

          {/* Tagline */}
          <p className="text-cream/60 text-sm mt-3">
            Your AI big sister for dating clarity. Real talk for women who are done settling.
          </p>

          {/* Social links */}
          <div className="flex gap-4 mt-6">
            {socialLinks.map((social) => (
              <a
                key={social.label}
                href={social.href}
                aria-label={social.label}
                className="w-9 h-9 rounded-full bg-cream/10 flex items-center justify-center text-cream/60 hover:text-gold hover:bg-cream/20 transition-all duration-300"
              >
                <social.icon size={18} />
              </a>
            ))}
          </div>

          {/* Terms, Privacy, Contact */}
          <nav className="mt-8 flex flex-wrap items-center justify-center gap-x-6 gap-y-1 text-sm" aria-label="Footer">
            {legalLinks.map((link) => (
              <Link
                key={link.name}
                href={link.href}
                className="text-cream/50 hover:text-gold transition-colors duration-300"
              >
                {link.name}
              </Link>
            ))}
          </nav>

          {/* App Store & Play Store — minimal */}
          <div className="mt-6 flex flex-wrap items-center justify-center gap-4">
            <a
              href={appStoreUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="text-cream/50 hover:text-gold text-sm transition-colors"
              aria-label="Download on the App Store"
            >
              App Store
            </a>
            <span className="text-cream/30">·</span>
            <a
              href={playStoreUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="text-cream/50 hover:text-gold text-sm transition-colors"
              aria-label="Get it on Google Play"
            >
              Google Play
            </a>
          </div>

          {/* Copyright */}
          <p className="text-cream/40 text-xs mt-8">
            © {new Date().getFullYear()} Pocket Pinky. All rights reserved.
          </p>
        </motion.div>
      </div>
    </footer>
  );
};
