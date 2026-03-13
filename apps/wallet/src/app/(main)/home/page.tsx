"use client";

import { useCredentials } from "@/hooks/use-credentials";
import { CredentialList } from "@/components/credential-list";

export default function HomePage() {
  const { credentials, loading } = useCredentials();

  return (
    <div className="max-w-lg mx-auto">
      <div className="px-4 pt-6 pb-2">
        <h1 className="text-2xl font-bold">My Credentials</h1>
      </div>

      {loading ? (
        <div className="space-y-4 p-4">
          {[1, 2].map((i) => (
            <div
              key={i}
              className="h-[180px] rounded-2xl bg-muted animate-pulse"
            />
          ))}
        </div>
      ) : (
        <CredentialList credentials={credentials} />
      )}
    </div>
  );
}
