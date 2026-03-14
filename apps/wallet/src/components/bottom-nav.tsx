"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Home, ScanLine, Settings } from "lucide-react";
import { motion } from "framer-motion";
import { cn } from "@/lib/utils";

const navItems = [
  { href: "/home", icon: Home, label: "Home" },
  { href: "/scan", icon: ScanLine, label: "Scan" },
  { href: "/settings", icon: Settings, label: "Settings" },
];

export function BottomNav() {
  const pathname = usePathname();

  return (
    <nav className="fixed bottom-6 left-1/2 -translate-x-1/2 z-40 glass-panel rounded-full shadow-sm border-t border-white/5 px-2 py-2 w-max max-w-[90vw]">
      <div className="flex items-center gap-2">
        {navItems.map(({ href, icon: Icon, label }) => {
          const isActive = pathname === href;
          return (
            <Link
              key={href}
              href={href}
              className={cn(
                "relative flex flex-col items-center justify-center gap-1 min-w-[72px] min-h-[56px] rounded-full px-4 py-2 transition-all duration-300 no-select",
                isActive
                  ? "text-primary-foreground"
                  : "text-muted-foreground hover:text-foreground hover:bg-secondary/20"
              )}
            >
              {isActive && (
                <motion.div
                  layoutId="nav-pill"
                  className="absolute inset-0 rounded-full bg-primary/20"
                  transition={{ type: "spring", stiffness: 400, damping: 30 }}
                />
              )}
              <Icon
                className="h-5 w-5 relative z-10"
                strokeWidth={isActive ? 2.5 : 2}
              />
              <span className="text-[10px] font-medium relative z-10 tracking-wide">
                {label}
              </span>
            </Link>
          );
        })}
      </div>
    </nav>
  );
}
