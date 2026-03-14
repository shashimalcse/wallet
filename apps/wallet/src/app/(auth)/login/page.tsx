"use client";

import { signIn } from "next-auth/react";
import { motion } from "framer-motion";
import { Shield } from "lucide-react";
import { Button } from "@/components/ui/button";

export default function LoginPage() {
  return (
    <div className="relative flex h-dvh flex-col items-center justify-center px-6 overflow-hidden">
      {/* Aurora background orbs */}
      <div className="absolute inset-0 pointer-events-none overflow-hidden">
        <motion.div
          animate={{ x: [0, 30, 0], y: [0, -20, 0] }}
          transition={{ duration: 8, repeat: Infinity, ease: "easeInOut" }}
          className="absolute -top-20 -left-20 h-72 w-72 rounded-full bg-primary/20 blur-3xl"
        />
        <motion.div
          animate={{ x: [0, -20, 0], y: [0, 30, 0] }}
          transition={{ duration: 10, repeat: Infinity, ease: "easeInOut" }}
          className="absolute -bottom-20 -right-20 h-72 w-72 rounded-full bg-accent/20 blur-3xl"
        />
        <motion.div
          animate={{ x: [0, 15, 0], y: [0, 15, 0] }}
          transition={{ duration: 12, repeat: Infinity, ease: "easeInOut" }}
          className="absolute top-1/3 right-1/4 h-48 w-48 rounded-full bg-primary/10 blur-3xl"
        />
      </div>

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="relative flex flex-col items-center text-center"
      >
        {/* 3D floating shield */}
        <motion.div
          animate={{
            y: [0, -8, 0],
            rotateX: [0, 5, 0],
            rotateY: [0, -5, 0, 5, 0],
          }}
          transition={{ duration: 4, repeat: Infinity, ease: "easeInOut" }}
          style={{ transformStyle: "preserve-3d", perspective: "800px" }}
          className="mb-8"
        >
          <div className="relative">
            {/* Glow ring */}
            <div className="absolute inset-0 rounded-3xl bg-primary/20 blur-xl scale-110" />
            {/* Glass card behind icon */}
            <div className="relative rounded-3xl glass shadow-elevated p-7">
              <Shield className="h-14 w-14 text-primary" />
            </div>
          </div>
        </motion.div>

        <motion.h1
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="text-3xl font-bold tracking-tight mb-2"
        >
          Wallet
        </motion.h1>
        <motion.p
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="text-muted-foreground mb-10 max-w-[280px]"
        >
          Your digital identity, securely stored on your device.
        </motion.p>

        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
          className="w-full"
        >
          <Button
            variant="gradient"
            size="lg"
            className="w-full max-w-[300px] h-12 text-base shadow-elevated"
            onClick={() => signIn("asgardeo", { callbackUrl: "/home" })}
          >
            Sign in with Asgardeo
          </Button>
        </motion.div>

        <motion.p
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.6 }}
          className="mt-6 text-xs text-muted-foreground max-w-[280px]"
        >
          Your credentials are stored locally and never leave your device.
        </motion.p>
      </motion.div>
    </div>
  );
}
