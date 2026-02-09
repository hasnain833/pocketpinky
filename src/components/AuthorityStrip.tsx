"use client";
import { motion } from "framer-motion";

export const AuthorityStrip = () => {
    const items = [
        { icon: "📖", text: "From the co-author of Swirling" },
        { icon: "⏱", text: "10+ years of coaching expertise" },
        { icon: "👥", text: "100K+ community" },
        { icon: "🎯", text: "49 documented patterns" }
    ];

    const containerVariants = {
        hidden: { opacity: 0 },
        visible: {
            opacity: 1,
            transition: {
                staggerChildren: 0.15
            }
        }
    };

    const itemVariants = {
        hidden: { opacity: 0, y: 10 },
        visible: {
            opacity: 1,
            y: 0,
            transition: {
                duration: 0.6,
                ease: "easeOut" as any
            }
        }
    };

    return (
        <section className="bg-[hsl(var(--charcoal))] py-5 px-[5%] overflow-hidden">
            <motion.div
                variants={containerVariants}
                initial="hidden"
                whileInView="visible"
                viewport={{ once: true }}
                className="max-w-[1200px] mx-auto flex justify-center items-center gap-12 flex-wrap"
            >
                {items.map((item, index) => (
                    <motion.div
                        key={index}
                        variants={itemVariants}
                        className="flex items-center gap-2 text-[hsl(var(--cream))] text-sm font-medium tracking-wide"
                    >
                        <span className="text-[hsl(var(--gold))]">{item.icon}</span>
                        {item.text}
                    </motion.div>
                ))}
            </motion.div>
        </section>
    );
};
