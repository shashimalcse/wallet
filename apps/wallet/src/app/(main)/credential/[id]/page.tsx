"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { motion } from "framer-motion";
import { ChevronLeft } from "lucide-react";
import { getCredential, type StoredCredential } from "@/lib/credential-store";
import { CredentialCard } from "@/components/credential-card";

export default function CredentialDetailPage() {
  const params = useParams();
  const router = useRouter();
  const [credential, setCredential] = useState<StoredCredential | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const id = params.id as string;
    getCredential(id).then((cred) => {
      setCredential(cred ?? null);
      setLoading(false);
    });
  }, [params.id]);

  if (loading) {
    return (
      <div className="max-w-lg mx-auto px-5 pt-6">
        <div className="h-[180px] rounded-2xl skeleton-shimmer" />
      </div>
    );
  }

  if (!credential) {
    return (
      <div className="max-w-lg mx-auto px-5 pt-6 text-center">
        <p className="text-muted-foreground">Credential not found.</p>
        <button
          onClick={() => router.push("/home")}
          className="mt-4 text-primary underline"
        >
          Back to Wallet
        </button>
      </div>
    );
  }

  const claimEntries = Object.entries(credential.claims);

  return (
    <div className="max-w-lg mx-auto pb-24">
      {/* Top bar */}
      <div className="px-6 pt-10 pb-6 flex items-center">
        <button
          onClick={() => router.push("/home")}
          className="p-2.5 -ml-2 rounded-full hover:bg-white/5 transition-colors glass-panel border border-white/10 group"
        >
          <ChevronLeft className="h-5 w-5 text-muted-foreground group-hover:text-foreground transition-colors" />
        </button>
        <h1 className="ml-4 text-2xl font-extrabold tracking-tight text-foreground">Credential</h1>
      </div>

      {/* Card preview */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="px-6 relative z-10"
      >
        <CredentialCard credential={credential} />
      </motion.div>

      {/* Details card */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1 }}
        className="mx-6 mt-8 rounded-3xl glass-panel p-6 border border-white/5"
      >
        <h2 className="text-lg font-bold tracking-tight mb-5">Details</h2>

        <div className="divide-y divide-border/50">
          {claimEntries.map(([key, value]) => (
            <div key={key} className="py-3.5 first:pt-0 last:pb-0">
              <p className="text-[11px] font-medium uppercase tracking-wider text-muted-foreground mb-1">
                {key.replace(/_/g, " ")}
              </p>
              <p className="text-sm font-medium text-foreground break-all">
                {String(value)}
              </p>
            </div>
          ))}

          <div className="py-3.5">
            <p className="text-[11px] font-medium uppercase tracking-wider text-muted-foreground mb-1">Format</p>
            <p className="text-sm font-medium text-foreground">{credential.format}</p>
          </div>

          <div className="py-3.5">
            <p className="text-[11px] font-medium uppercase tracking-wider text-muted-foreground mb-1">Issued</p>
            <p className="text-sm font-medium text-foreground">
              {new Date(credential.issuedAt).toLocaleDateString()}
            </p>
          </div>

          {credential.expiresAt && (
            <div className="py-3.5 last:pb-0">
              <p className="text-[11px] font-medium uppercase tracking-wider text-muted-foreground mb-1">Expires</p>
              <p className="text-sm font-medium text-foreground">
                {new Date(credential.expiresAt).toLocaleDateString()}
              </p>
            </div>
          )}
        </div>
      </motion.div>
    </div>
  );
}
