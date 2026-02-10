"use client";

import { motion } from "framer-motion";
import { ReactNode } from "react";

interface ScrollRevealProps {
    children: ReactNode;
    width?: "fit-content" | "100%";
    className?: string;
    delay?: number;
    direction?: "up" | "down" | "left" | "right";
    distance?: number;
    fullHeight?: boolean;
}

export const ScrollReveal = ({
    children,
    width = "100%",
    className = "",
    delay = 0,
    direction = "up",
    distance = 30,
    fullHeight = false,
}: ScrollRevealProps) => {
    const variants = {
        hidden: {
            opacity: 0,
            x: direction === "left" ? distance : direction === "right" ? -distance : 0,
            y: direction === "up" ? distance : direction === "down" ? -distance : 0,
        },
        visible: {
            opacity: 1,
            x: 0,
            y: 0,
            transition: {
                duration: 0.8,
                ease: [0.21, 0.47, 0.32, 0.98] as any, // Custom premium ease
                delay: delay,
            },
        },
    };

    return (
        <div style={{ width, position: "relative" }} className={className}>
            <motion.div
                variants={variants}
                initial="hidden"
                whileInView="visible"
                viewport={{ once: true, margin: "-10%" }}
                className={fullHeight ? "h-full" : undefined}
            >
                {children}
            </motion.div>
        </div>
    );
};
