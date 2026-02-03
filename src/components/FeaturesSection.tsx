"use client";
import { motion } from "framer-motion";
import { Search, MessageCircle, Sparkles, Heart, Globe, ShieldCheck } from "lucide-react";

const features = [
  {
    icon: Search,
    title: "Vet Him Fast",
    description: "Get instant reads on red flags and green lights. Pinky analyzes behavior patterns so you don't have to guess.",
    gradient: "from-[#D4AF37] to-[#B8860B]", // Gold gradient
  },
  {
    icon: MessageCircle,
    title: "Decode His Texts",
    description: "Know what he's really saying between the lines. Pinky translates confusing messages into clarity.",
    gradient: "from-[#D4AF37] to-[#B8860B]",
  },
  {
    icon: Sparkles,
    title: "Script Your Response",
    description: "Get exact words that work. Whether you need to set a boundary or keep it flirty, Pinky's got you.",
    gradient: "from-[#D4AF37] to-[#B8860B]",
  },
  {
    icon: Heart,
    title: "The 'Him' Test",
    description: "Put any man through Pinky's comprehensive vetting process. Know if he's worth your time before you invest.",
    gradient: "from-[#D4AF37] to-[#B8860B]",
  },
  {
    icon: Globe,
    title: "Swirl Mode",
    description: "Expert guidance for interracial dating. Navigate cultural differences with confidence and grace.",
    gradient: "from-[#D4AF37] to-[#B8860B]",
  },
  {
    icon: ShieldCheck,
    title: "Standards Check",
    description: "Pinky helps you define and maintain your non-negotiables. No more settling for less than you deserve.",
    gradient: "from-[#D4AF37] to-[#B8860B]",
  },
];

export const FeaturesSection = () => {
  return (
    <section id="features" className="py-12 md:py-20 lg:py-32 bg-secondary overflow-hidden relative">
      {/* Subtle background glow */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[800px] bg-plum-light/10 blur-[120px] rounded-full -z-10" />

      <div className="container mx-auto px-4 sm:px-6">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="text-center mb-10 md:mb-16 lg:mb-20"
        >
          <span className="inline-block font-script text-2xl sm:text-3xl md:text-4xl text-gold mb-3 md:mb-4 drop-shadow-sm">
            Meet Your New Best Friend
          </span>
          <h2 className="font-serif text-3xl sm:text-4xl md:text-5xl lg:text-6xl text-cream mb-4 md:mb-6 tracking-tight">
            Everything You Need for <span className="italic text-gold">Dating Clarity</span>
          </h2>
          <p className="text-cream/60 text-base md:text-lg lg:text-xl max-w-2xl mx-auto leading-relaxed px-2">
            Pinky is like having your smartest, most protective big sister available 24/7.
          </p>
        </motion.div>

        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-5 md:gap-6 lg:gap-8">
          {features.map((feature, index) => (
            <motion.div
              key={feature.title}
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6, delay: index * 0.1 }}
              className="group h-full"
            >
              <div className="card-luxury p-5 sm:p-6 md:p-8 lg:p-10 h-full flex flex-col items-center text-center border-gold/10 hover:border-gold/40 transition-all duration-500 bg-plum-light/20 backdrop-blur-md rounded-2xl md:rounded-3xl lg:rounded-[2.5rem]">
                {/* Icon Container with Gold Accent */}
                <div
                  className={`relative flex items-center justify-center w-14 h-14 sm:w-16 sm:h-16 lg:w-20 lg:h-20 rounded-full bg-secondary border border-gold/30 mb-4 sm:mb-5 md:mb-6 lg:mb-8 shadow-glow transition-all duration-500 group-hover:scale-110 group-hover:border-gold group-hover:shadow-[0_0_20px_rgba(212,175,55,0.3)] overflow-hidden`}
                >
                  {/* Subtle inner gradient */}
                  <div className="absolute inset-0 bg-gradient-to-br from-gold/10 to-transparent opacity-50" />
                  <feature.icon className="text-gold relative z-10 transition-transform duration-500 group-hover:rotate-12 w-6 h-6 sm:w-7 sm:h-7 md:w-8 md:h-8 lg:w-8 lg:h-8" />
                </div>

                <h3 className="font-serif text-xl sm:text-2xl lg:text-3xl text-cream mb-3 md:mb-5 group-hover:text-gold transition-colors duration-300">
                  {feature.title}
                </h3>

                <p className="text-cream/60 leading-relaxed text-sm sm:text-base lg:text-lg font-light">
                  {feature.description}
                </p>

                {/* Subtle Decorative Element */}
                <div className="mt-4 sm:mt-5 md:mt-6 lg:mt-8 opacity-20 group-hover:opacity-100 transition-opacity duration-500">
                  <div className="h-0.5 w-12 bg-gold-gradient mx-auto rounded-full" />
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
};
