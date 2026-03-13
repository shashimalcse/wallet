"use client";

import { motion } from "framer-motion";
import { ScanLine } from "lucide-react";
import Link from "next/link";
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
    transition: { staggerChildren: 0.1 },
  },
};

const item = {
  hidden: { opacity: 0, y: 20 },
  show: { opacity: 1, y: 0 },
};

export function CredentialList({ credentials }: CredentialListProps) {
  if (credentials.length === 0) {
    return (
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="flex flex-col items-center justify-center py-20 px-6 text-center"
      >
        <div className="rounded-full bg-muted p-6 mb-6">
          <ScanLine className="h-10 w-10 text-muted-foreground" />
        </div>
        <h2 className="text-xl font-semibold mb-2">No credentials yet</h2>
        <p className="text-muted-foreground mb-6 max-w-[280px]">
          Scan a QR code from an issuer to receive your first credential.
        </p>
        <Link href="/scan">
          <Button size="lg">Scan QR Code</Button>
        </Link>
      </motion.div>
    );
  }

  return (
    <motion.div
      variants={container}
      initial="hidden"
      animate="show"
      className="space-y-4 p-4"
    >
      {credentials.map((credential) => (
        <motion.div key={credential.id} variants={item}>
          <CredentialCard credential={credential} />
        </motion.div>
      ))}
    </motion.div>
  );
}
