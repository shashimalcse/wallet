"use client";

import { motion } from "framer-motion";
import type { StoredCredential } from "@/lib/credential-store";

const gradients: Record<string, string> = {
  default: "from-slate-800 to-slate-600",
  university: "from-blue-700 to-indigo-500",
  identity: "from-emerald-700 to-teal-500",
  employment: "from-purple-700 to-violet-500",
  license: "from-amber-700 to-orange-500",
  health: "from-rose-700 to-pink-500",
};

function getGradient(configId: string): string {
  const lower = configId.toLowerCase();
  for (const [key, gradient] of Object.entries(gradients)) {
    if (lower.includes(key)) return gradient;
  }
  return gradients.default;
}

interface CredentialCardProps {
  credential: StoredCredential;
  onClick?: () => void;
}

export function CredentialCard({ credential, onClick }: CredentialCardProps) {
  const gradient = credential.display?.backgroundColor
    ? ""
    : getGradient(credential.credentialConfigurationId);

  return (
    <motion.div
      whileTap={{ scale: 0.98 }}
      className={`relative overflow-hidden rounded-2xl shadow-lg cursor-pointer bg-gradient-to-br ${gradient} min-h-[180px] p-5 text-white`}
      style={
        credential.display?.backgroundColor
          ? { backgroundColor: credential.display.backgroundColor }
          : undefined
      }
      onClick={onClick}
    >
      <div className="flex items-start justify-between">
        <div className="flex-1">
          <p className="text-xs font-medium opacity-80 uppercase tracking-wider">
            {credential.issuerDisplay?.name || credential.issuer}
          </p>
          <h3 className="mt-1 text-lg font-bold">
            {credential.display?.name || credential.credentialConfigurationId}
          </h3>
          {credential.display?.description && (
            <p className="mt-1 text-sm opacity-80">
              {credential.display.description}
            </p>
          )}
        </div>
        {credential.issuerDisplay?.logo && (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={credential.issuerDisplay.logo}
            alt=""
            className="h-10 w-10 rounded-full bg-white/20 p-1"
          />
        )}
      </div>

      <div className="mt-6 space-y-1">
        {Object.entries(credential.claims)
          .slice(0, 3)
          .map(([key, value]) => (
            <div key={key} className="flex justify-between text-sm">
              <span className="opacity-70 capitalize">
                {key.replace(/_/g, " ")}
              </span>
              <span className="font-medium">{String(value)}</span>
            </div>
          ))}
      </div>

      {/* Decorative circle */}
      <div className="absolute -right-8 -top-8 h-32 w-32 rounded-full bg-white/10" />
      <div className="absolute -bottom-6 -left-6 h-24 w-24 rounded-full bg-white/5" />
    </motion.div>
  );
}
