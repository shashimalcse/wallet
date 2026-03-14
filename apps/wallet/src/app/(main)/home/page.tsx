"use client";

import { useCredentials } from "@/hooks/use-credentials";
import { CredentialList } from "@/components/credential-list";
import { UserCircle } from "lucide-react";

export default function HomePage() {
  const { credentials, loading } = useCredentials();

  return (
    <div className="max-w-lg mx-auto">
      <div className="px-6 pt-10 pb-4 flex items-center justify-between">
        <h1 className="text-3xl font-extrabold tracking-tight text-foreground">Wallet</h1>
        <div className="p-2 rounded-full glass-panel shadow-sm border border-white/10">
          <UserCircle className="h-6 w-6 text-foreground" />
        </div>
      </div>

      {loading ? (
        <div className="space-y-5 px-5 pt-2">
          {[1, 2].map((i) => (
            <div
              key={i}
              className="h-[180px] rounded-2xl skeleton-shimmer"
            />
          ))}
        </div>
      ) : (
        <CredentialList credentials={credentials} />
      )}
    </div>
  );
}
