"use client";

import { motion } from "framer-motion";
import { ScanLine } from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { CredentialCard } from "./credential-card";
import { Button } from "./ui/button";
import type { StoredCredential } from "@/lib/credential-store";

interface CredentialListProps {
  credentials: StoredCredential[];
}

const container = {
  hidden: { opacity: 0 },
  show: {
    opacity: 1,
    transition: {
      staggerChildren: 0.1,
    },
  },
};

const item = {
  hidden: { opacity: 0, y: 20 },
  show: {
    opacity: 1,
    y: 0,
    transition: {
      type: "spring",
      stiffness: 300,
      damping: 25,
    },
  },
};

export function CredentialList({ credentials }: CredentialListProps) {
  const router = useRouter();

  if (credentials.length === 0) {
    return (
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="px-6 py-4"
      >
        <Link href="/scan" className="block w-full">
          <div className="relative overflow-hidden rounded-2xl glass-panel shadow-sm min-h-[190px] p-6 text-foreground flex flex-col items-center justify-center border border-white/5 hover:bg-white/5 transition-colors group cursor-pointer">
            <div className="rounded-full bg-primary/10 p-4 mb-4 group-hover:bg-primary/20 transition-colors">
              <ScanLine className="h-8 w-8 text-primary" />
            </div>
            <h3 className="text-lg font-bold tracking-tight mb-2">No credentials</h3>
            <p className="text-sm text-muted-foreground text-center max-w-[200px]">
              Tap here to scan a QR code and add your first credential.
            </p>
            
            {/* Subtle shimmering skeleton effect overlay */}
            <div className="absolute inset-0 skeleton-shimmer opacity-[0.03] pointer-events-none mix-blend-overlay" />
          </div>
        </Link>
      </motion.div>
    );
  }

  return (
    <motion.div
      variants={container}
      initial="hidden"
      animate="show"
      className="space-y-5 px-5"
    >
      {credentials.map((credential) => (
        <motion.div key={credential.id} variants={item}>
          <CredentialCard
            credential={credential}
            onClick={() => router.push(`/credential/${credential.id}`)}
          />
        </motion.div>
      ))}
    </motion.div>
  );
}
