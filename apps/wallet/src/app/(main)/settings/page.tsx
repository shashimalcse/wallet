"use client";

import { signOut, useSession } from "next-auth/react";
import { motion } from "framer-motion";
import { LogOut, Trash2, Info, CreditCard } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { useCredentials } from "@/hooks/use-credentials";
import { toast } from "sonner";

export default function SettingsPage() {
  const { data: session } = useSession();
  const { credentials, clearAll } = useCredentials();

  const handleClearCredentials = async () => {
    if (
      !window.confirm(
        "Are you sure you want to delete all stored credentials? This cannot be undone."
      )
    ) {
      return;
    }
    await clearAll();
    toast.success("All credentials cleared");
  };

  const initials = session?.user?.name
    ?.split(" ")
    .map((n) => n[0])
    .join("")
    .toUpperCase() || "?";

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      className="max-w-lg mx-auto px-6 pt-10"
    >
      <div className="mb-8">
        <h1 className="text-3xl font-extrabold tracking-tight text-foreground mb-1">Settings</h1>
        <p className="text-sm font-medium text-muted-foreground">
          Manage your account and preferences
        </p>
      </div>

      {/* Profile card */}
      <div className="rounded-3xl glass-panel shadow-card p-6 mb-6 relative overflow-hidden">
        <div className="flex items-center gap-4">
          <div className="relative">
            {/* Gradient border ring */}
            <div className="absolute -inset-0.5 rounded-full bg-gradient-to-br from-primary to-accent opacity-60" />
            <Avatar className="relative h-14 w-14 border-2 border-background">
              <AvatarFallback className="text-lg bg-primary/10 text-primary font-semibold">
                {initials}
              </AvatarFallback>
            </Avatar>
          </div>
          <div className="flex-1 min-w-0">
            <p className="font-semibold truncate">
              {session?.user?.name || "User"}
            </p>
            <p className="text-sm text-muted-foreground truncate">
              {session?.user?.email}
            </p>
          </div>
        </div>
      </div>

      {/* General settings card */}
      <div className="rounded-3xl glass-panel shadow-card overflow-hidden mb-6">
        {/* Credentials info */}
        <div className="flex items-center gap-4 p-4">
          <div className="rounded-xl bg-primary/10 p-2.5">
            <CreditCard className="h-5 w-5 text-primary" />
          </div>
          <div className="flex-1">
            <p className="text-sm font-medium">Stored Credentials</p>
            <p className="text-xs text-muted-foreground">
              {credentials.length} credential
              {credentials.length !== 1 ? "s" : ""} on this device
            </p>
          </div>
        </div>

        <div className="h-px bg-border ml-[68px]" />

        {/* Sign out */}
        <button
          onClick={() => signOut({ callbackUrl: "/login" })}
          className="flex items-center gap-4 p-4 w-full text-left hover:bg-white/5 transition-colors group"
        >
          <div className="rounded-xl bg-muted/50 p-2.5 group-hover:bg-muted transition-colors">
            <LogOut className="h-5 w-5 text-muted-foreground group-hover:text-foreground transition-colors" />
          </div>
          <p className="text-sm font-medium group-hover:text-primary transition-colors">Sign Out</p>
        </button>
      </div>

      {/* Destructive actions card */}
      <div className="rounded-3xl glass-panel shadow-card overflow-hidden mb-8 border-destructive/20">
        <button
          onClick={handleClearCredentials}
          disabled={credentials.length === 0}
          className="flex items-center gap-4 p-4 w-full text-left hover:bg-destructive/5 transition-colors disabled:opacity-50"
        >
          <div className="rounded-xl bg-destructive/10 p-2.5">
            <Trash2 className="h-5 w-5 text-destructive" />
          </div>
          <p className="text-sm font-medium text-destructive">
            Clear All Credentials
          </p>
        </button>
      </div>

      <p className="text-xs text-muted-foreground text-center mt-10">
        Wallet v0.1.0
      </p>
    </motion.div>
  );
}
