"use client";

import { signIn } from "next-auth/react";
import { motion } from "framer-motion";
import { Shield } from "lucide-react";
import { Button } from "@/components/ui/button";

export default function LoginPage() {
  return (
    <div className="flex h-dvh flex-col items-center justify-center px-6">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="flex flex-col items-center text-center"
      >
        <motion.div
          initial={{ scale: 0.8 }}
          animate={{ scale: 1 }}
          transition={{ delay: 0.2, type: "spring", stiffness: 200 }}
          className="rounded-full bg-primary/10 p-6 mb-8"
        >
          <Shield className="h-14 w-14 text-primary" />
        </motion.div>

        <h1 className="text-3xl font-bold tracking-tight mb-2">Wallet</h1>
        <p className="text-muted-foreground mb-10 max-w-[280px]">
          Your digital identity, securely stored on your device.
        </p>

        <Button
          size="lg"
          className="w-full max-w-[300px] h-12 text-base"
          onClick={() => signIn("asgardeo", { callbackUrl: "/home" })}
        >
          Sign in with Asgardeo
        </Button>

        <p className="mt-6 text-xs text-muted-foreground max-w-[280px]">
          Your credentials are stored locally and never leave your device.
        </p>
      </motion.div>
    </div>
  );
}
