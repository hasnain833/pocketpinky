"use client";

import { useEffect, useState } from "react";
import { usePathname } from "next/navigation";

export const RouteProgressBar = () => {
  const pathname = usePathname();
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    if (!pathname) return;
    setVisible(true);

    const timeout = setTimeout(() => {
      setVisible(false);
    }, 400);

    return () => clearTimeout(timeout);
  }, [pathname]);

  return (
    <div className="fixed inset-x-0 top-0 z-50 pointer-events-none">
      <div
        className={`h-0.5 md:h-1 bg-gradient-to-r from-primary via-coral to-gold transform origin-left transition-transform transition-opacity duration-300 ${
          visible ? "scale-x-100 opacity-100" : "scale-x-0 opacity-0"
        }`}
      />
    </div>
  );
};

