"use client";

import { signIn } from "next-auth/react";
import { motion } from "framer-motion";
import { Shield } from "lucide-react";
import { Button } from "@/components/ui/button";

export default function LoginPage() {
  return (
    <div className="relative flex h-dvh flex-col items-center justify-center px-6 overflow-hidden">

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
            {/* Flat Glass card behind icon */}
            <div className="relative rounded-3xl glass-panel p-7 border border-white/5">
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
            variant="default"
            size="lg"
            className="w-full max-w-[300px] h-12 text-base"
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
