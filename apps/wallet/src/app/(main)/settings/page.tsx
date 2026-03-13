"use client";

import { signOut, useSession } from "next-auth/react";
import { motion } from "framer-motion";
import { LogOut, Trash2, Info, User } from "lucide-react";
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
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="max-w-lg mx-auto px-4 pt-6"
    >
      <h1 className="text-2xl font-bold mb-6">Settings</h1>

      {/* Profile */}
      <div className="flex items-center gap-4 rounded-2xl bg-muted/50 p-4 mb-6">
        <Avatar className="h-14 w-14">
          <AvatarFallback className="text-lg">{initials}</AvatarFallback>
        </Avatar>
        <div className="flex-1 min-w-0">
          <p className="font-semibold truncate">
            {session?.user?.name || "User"}
          </p>
          <p className="text-sm text-muted-foreground truncate">
            {session?.user?.email}
          </p>
        </div>
      </div>

      <div className="space-y-2">
        {/* Credentials info */}
        <div className="flex items-center gap-3 rounded-xl p-4 bg-muted/30">
          <Info className="h-5 w-5 text-muted-foreground shrink-0" />
          <div className="flex-1">
            <p className="text-sm font-medium">Stored Credentials</p>
            <p className="text-xs text-muted-foreground">
              {credentials.length} credential
              {credentials.length !== 1 ? "s" : ""} on this device
            </p>
          </div>
        </div>

        {/* Clear credentials */}
        <Button
          variant="ghost"
          className="w-full justify-start gap-3 h-14 text-destructive hover:text-destructive hover:bg-destructive/10"
          onClick={handleClearCredentials}
          disabled={credentials.length === 0}
        >
          <Trash2 className="h-5 w-5" />
          Clear All Credentials
        </Button>

        {/* Sign out */}
        <Button
          variant="ghost"
          className="w-full justify-start gap-3 h-14"
          onClick={() => signOut({ callbackUrl: "/login" })}
        >
          <LogOut className="h-5 w-5" />
          Sign Out
        </Button>
      </div>

      <p className="text-xs text-muted-foreground text-center mt-10">
        Wallet v0.1.0
      </p>
    </motion.div>
  );
}
