"use client";

import { forwardRef, useState, useEffect } from "react";
import { cn } from "@/lib/utils";

interface NavLinkProps extends React.AnchorHTMLAttributes<HTMLAnchorElement> {
  to: string;
  activeClassName?: string;
  pendingClassName?: string;
}

const NavLink = forwardRef<HTMLAnchorElement, NavLinkProps>(
  ({ className, activeClassName, to, ...props }, ref) => {
    const href = to.startsWith("#") ? to : `#${to}`;
    const [isActive, setIsActive] = useState(false);

    useEffect(() => {
      const check = () => setIsActive(typeof window !== "undefined" && window.location.hash === href);
      check();
      window.addEventListener("hashchange", check);
      return () => window.removeEventListener("hashchange", check);
    }, [href]);

    return (
      <a ref={ref} href={href} className={cn(className, isActive && activeClassName)} {...props} />
    );
  }
);

NavLink.displayName = "NavLink";

export { NavLink };
