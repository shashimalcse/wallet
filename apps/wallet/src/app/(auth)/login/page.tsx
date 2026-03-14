"use client";

import { signIn } from "next-auth/react";
import { motion } from "framer-motion";
import { Shield } from "lucide-react";
import { Button } from "@/components/ui/button";

export default function LoginPage() {
  return (
    <div className="relative flex h-dvh flex-col items-center justify-center px-6 overflow-hidden bg-background">
      
      {/* Top and Bottom Fades to blend the edges */}
      <div className="absolute inset-0 z-0 bg-gradient-to-b from-background via-transparent to-background pointer-events-none" />

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="relative flex flex-col items-center text-center"
      >

        <motion.h1
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="text-3xl font-bold tracking-tight mb-10"
        >
          Welcome to Wallet
        </motion.h1>

        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
          className="w-full"
        >
          <Button
            variant="glass"
            size="lg"
            className="w-full max-w-[300px] h-12 text-base"
            onClick={() => signIn("asgardeo", { callbackUrl: "/home" })}
          >
            Sign In
          </Button>
        </motion.div>
      </motion.div>
    </div>
  );
}
