"use client";

import { motion } from "framer-motion";
import {
  Car,
  GraduationCap,
  Heart,
  Briefcase,
  Shield,
  Wifi,
} from "lucide-react";
import type { StoredCredential } from "@/lib/credential-store";

const glowColors: Record<string, string> = {
  default: "bg-slate-500/30",
  university: "bg-blue-500/30",
  identity: "bg-emerald-500/30",
  employment: "bg-purple-500/30",
  license: "bg-amber-500/30",
  health: "bg-rose-500/30",
};

function getGlowColor(configId: string): string {
  const lower = configId.toLowerCase();
  for (const [key, glow] of Object.entries(glowColors)) {
    if (lower.includes(key)) return glow;
  }
  return glowColors.default;
}

function getCategoryIcon(configId: string) {
  const lower = configId.toLowerCase();
  if (lower.includes("license") || lower.includes("driving"))
    return Car;
  if (lower.includes("university") || lower.includes("degree") || lower.includes("diploma"))
    return GraduationCap;
  if (lower.includes("health") || lower.includes("medical"))
    return Heart;
  if (lower.includes("employment") || lower.includes("work"))
    return Briefcase;
  return Shield;
}

interface CredentialCardProps {
  credential: StoredCredential;
  onClick?: () => void;
}

export function CredentialCard({ credential, onClick }: CredentialCardProps) {
  const glowColor = credential.display?.backgroundColor
    ? ""
    : getGlowColor(credential.credentialConfigurationId);

  const CategoryIcon = getCategoryIcon(credential.credentialConfigurationId);

  return (
    <motion.div
      whileTap={onClick ? { scale: 0.98 } : undefined}
      className={`relative overflow-hidden rounded-2xl shadow-card ${onClick ? "cursor-pointer hover:shadow-glow hover:-translate-y-1 transition-all duration-300" : ""} glass-panel min-h-[190px] p-6 text-white flex flex-col justify-between border border-white/5`}
      style={
        credential.display?.backgroundColor
          ? { backgroundColor: credential.display.backgroundColor }
          : undefined
      }
      onClick={onClick}
    >
      {/* Colored glow effects */}
      {!credential.display?.backgroundColor && (
        <>
          <div className={`absolute -top-20 -right-20 h-48 w-48 rounded-full blur-[60px] ${glowColor} pointer-events-none mix-blend-screen opacity-70`} />
          <div className={`absolute -bottom-20 -left-20 h-40 w-40 rounded-full blur-[50px] ${glowColor} pointer-events-none mix-blend-screen opacity-40`} />
        </>
      )}
      {/* Top row: category icon + contactless icon */}
      <div className="flex items-start justify-between">
        <div className="rounded-full bg-white/20 p-2.5 backdrop-blur-md shadow-sm border border-white/10">
          <CategoryIcon className="h-5 w-5 text-white drop-shadow-md" />
        </div>
        <div className="text-white/40">
          <Wifi className="h-5 w-5 rotate-90" />
        </div>
      </div>

      {/* Bottom: issuer + credential name */}
      <div>
        <p className="text-xs font-medium text-white/80 uppercase tracking-wider">
          {credential.issuerDisplay?.name || credential.issuer}
        </p>
        <h3 className="mt-0.5 text-lg font-bold text-white">
          {credential.display?.name || credential.credentialConfigurationId}
        </h3>
      </div>

      {/* Decorative circles */}
      <div className="absolute -right-8 -top-8 h-32 w-32 rounded-full bg-white/10" />
      <div className="absolute -bottom-6 -left-6 h-24 w-24 rounded-full bg-white/5" />
    </motion.div>
  );
}
