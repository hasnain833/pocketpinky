"use client";

import { useEffect, useState } from "react";
import { usePathname } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";

export const RouteProgressBar = () => {
  const pathname = usePathname();
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    // When pathname changes, show the bar
    setVisible(true);

    // After a short duration, hide it
    const timeout = setTimeout(() => {
      setVisible(false);
    }, 800);

    return () => clearTimeout(timeout);
  }, [pathname]);

  return (
    <div className="fixed inset-x-0 top-0 z-[9999] pointer-events-none">
      <AnimatePresence>
        {visible && (
          <motion.div
            initial={{ scaleX: 0, opacity: 0 }}
            animate={{ scaleX: 1, opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{
              scaleX: { duration: 0.6, ease: "easeOut" },
              opacity: { duration: 0.2 }
            }}
            style={{ originX: 0 }}
            className="h-[3px] bg-gradient-to-r from-[hsl(var(--primary))] via-[hsl(var(--pink-accent))] to-[hsl(var(--gold))]"
          />
        )}
      </AnimatePresence>
    </div>
  );
};

