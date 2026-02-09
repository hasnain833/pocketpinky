"use client";
import { motion } from "framer-motion";

export const UnlockSection = () => {
    const tiers = [
        {
            number: "1",
            title: "See Clearly",
            points: ["Identify red flags early", "Decode mixed signals"],
            borderColor: "bg-[hsl(var(--divider))]",
            numberColor: "text-[hsl(var(--divider))]"
        },
        {
            number: "2",
            title: "Act Strategically",
            points: ["Know what to say (and not say)", "Protect your leverage"],
            borderColor: "bg-[hsl(var(--pink-accent))]",
            numberColor: "text-[hsl(var(--pink-soft))]"
        },
        {
            number: "3",
            title: "Choose Wisely",
            points: ["Attract high-value men", "Build the relationship you deserve"],
            borderColor: "bg-[hsl(var(--gold))]",
            numberColor: "text-[hsl(var(--gold-light))]"
        }
    ];

    const containerVariants = {
        hidden: { opacity: 0 },
        visible: {
            opacity: 1,
            transition: {
                staggerChildren: 0.2
            }
        }
    };

    const itemVariants = {
        hidden: { opacity: 0, y: 30 },
        visible: {
            opacity: 1,
            y: 0,
            transition: {
                duration: 0.8,
                ease: [0.21, 0.47, 0.32, 0.98] as any
            }
        }
    };

    return (
        <section className="py-24 px-[5%] bg-white overflow-hidden">
            <div className="max-w-[1300px] mx-auto">
                <div className="max-w-[600px] mx-auto text-center mb-16">
                    <div className="text-xs font-semibold tracking-[1.5px] uppercase text-[hsl(var(--gold))] mb-4">
                        The Progression
                    </div>
                    <h2 className="font-serif text-[2.75rem] text-[hsl(var(--charcoal))]">
                        What You Unlock
                    </h2>
                </div>

                <motion.div
                    variants={containerVariants}
                    initial="hidden"
                    whileInView="visible"
                    viewport={{ once: true, margin: "-10%" }}
                    className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-[1000px] mx-auto"
                >
                    {tiers.map((tier, index) => (
                        <motion.div
                            key={index}
                            variants={itemVariants}
                            whileHover={{ y: -5 }}
                            className="text-center p-10 bg-[hsl(var(--cream))] rounded relative transition-shadow duration-300 hover:shadow-card"
                        >
                            <div className={`absolute top-0 left-1/2 -translate-x-1/2 w-[60px] h-1 ${tier.borderColor} rounded-b`} />
                            <div className={`font-serif text-5xl ${tier.numberColor} font-semibold leading-none mb-4`}>
                                {tier.number}
                            </div>
                            <h3 className="font-serif text-2xl text-[hsl(var(--charcoal))] mb-5">{tier.title}</h3>
                            <ul className="text-left space-y-2">
                                {tier.points.map((point, i) => (
                                    <li key={i} className="text-sm text-[hsl(var(--text-secondary))] pl-6 relative">
                                        <span className="absolute left-0 text-[hsl(var(--gold))]">✓</span>
                                        {point}
                                    </li>
                                ))}
                            </ul>
                        </motion.div>
                    ))}
                </motion.div>
            </div>
        </section>
    );
};
