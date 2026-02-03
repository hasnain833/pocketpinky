"use client";
import { motion } from "framer-motion";
import { Star, Shield, Heart, Users } from "lucide-react";

const stats = [
  { icon: Users, value: "10,000+", label: "Women Helped" },
  { icon: Star, value: "4.9", label: "Average Rating" },
  { icon: Heart, value: "95%", label: "Success Rate" },
  { icon: Shield, value: "100%", label: "Private & Secure" },
];

type PressItem = { name: string; logo?: string };

const pressLogos: PressItem[] = [
  { name: "Essence"},
  { name: "The Root"},
  { name: "Blavity"},
  { name: "Black Enterprise"},
  { name: "BET"},
  { name: "Ebony"},
  { name: "HuffPost"},
  { name: "Refinery29"},
  { name: "Cosmopolitan"},
  { name: "Glamour"},
  { name: "Bustle"},
  { name: "Well+Good"},
];

export const TrustBar = () => {
  return (
    <section
      className="bg-cream py-12 md:py-16 overflow-hidden"
      aria-label="Trust and social proof"
    >
      <div className="container mx-auto px-6">
        {/* Social proof: "Trusted by [X] women" */}
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5 }}
          className="text-center mb-10 md:mb-12"
        >
          <p className="text-secondary/80 text-lg md:text-xl font-medium">
            Trusted by <span className="font-serif font-semibold text-secondary">10,000+</span> women
          </p>
        </motion.div>

        {/* Stats: grid (desktop) / horizontal scroll (mobile) */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-6 md:gap-8 mb-12">
          {stats.map((stat, index) => (
            <motion.div
              key={stat.label}
              initial={{ opacity: 0, y: 16 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, delay: index * 0.08 }}
              className="text-center group"
            >
              <div className="inline-flex items-center justify-center w-12 h-12 md:w-14 md:h-14 rounded-2xl bg-primary/10 text-primary mb-3 group-hover:bg-primary group-hover:text-primary-foreground transition-all duration-300">
                <stat.icon size={22} className="md:w-6 md:h-6" />
              </div>
              <p className="font-serif text-2xl md:text-3xl text-secondary font-semibold">
                {stat.value}
              </p>
              <p className="text-secondary/60 text-sm mt-1">{stat.label}</p>
            </motion.div>
          ))}
        </div>

        {/* Press logos: horizontal infinite scroll (marquee) */}
        <motion.div
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5, delay: 0.2 }}
          className="py-2 border-y border-secondary/10"
        >
          <div className="overflow-hidden w-full" aria-hidden>
            <div className="flex w-max animate-marquee items-center gap-8 md:gap-12 px-4">
              {[...pressLogos, ...pressLogos].map((item, i) => (
                <div
                  key={`${item.name}-${i}`}
                  className="flex items-center gap-3 shrink-0"
                >
                  <span className="font-serif text-secondary/40 text-lg md:text-xl font-semibold whitespace-nowrap">
                    {item.name}
                  </span>
                </div>
              ))}
            </div>
          </div>
        </motion.div>
      </div>
    </section>
  );
};
