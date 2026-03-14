"use client";

import { useCallback, useState } from "react";
import { useRouter } from "next/navigation";
import dynamic from "next/dynamic";
import { motion } from "framer-motion";
import { toast } from "sonner";

const Scanner = dynamic(
  () => import("@yudiel/react-qr-scanner").then((mod) => mod.Scanner),
  { ssr: false }
);

const OFFER_SCHEME = "openid-credential-offer://";

export default function ScanPage() {
  const router = useRouter();
  const [scanning, setScanning] = useState(true);

  const handleScan = useCallback(
    (results: Array<{ rawValue: string }>) => {
      if (!scanning || results.length === 0) return;

      const value = results[0].rawValue;
      if (
        value.startsWith(OFFER_SCHEME) ||
        value.includes("credential_offer")
      ) {
        setScanning(false);
        router.push(`/offer?uri=${encodeURIComponent(value)}`);
      } else {
        toast.error("Not a credential offer QR code");
      }
    },
    [scanning, router]
  );

  return (
    <div className="relative h-full">
      <div className="absolute inset-0">
        {scanning && (
          <Scanner
            onScan={handleScan}
            onError={(error) => {
              console.error("Scanner error:", error);
              toast.error("Camera error. Please check permissions.");
            }}
            styles={{
              container: { width: "100%", height: "100%" },
              video: { objectFit: "cover" },
            }}
            components={{ audio: false, finder: false }}
          />
        )}
      </div>

      {/* Overlay */}
      <div className="absolute inset-0 pointer-events-none">
        <div className="flex flex-col items-center justify-center h-full">
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            className="relative"
          >
            {/* Scanner frame */}
            <div className="w-64 h-64 relative">
              <div className="absolute top-0 left-0 w-10 h-10 border-t-[3px] border-l-[3px] border-primary rounded-tl-2xl" />
              <div className="absolute top-0 right-0 w-10 h-10 border-t-[3px] border-r-[3px] border-primary rounded-tr-2xl" />
              <div className="absolute bottom-0 left-0 w-10 h-10 border-b-[3px] border-l-[3px] border-primary rounded-bl-2xl" />
              <div className="absolute bottom-0 right-0 w-10 h-10 border-b-[3px] border-r-[3px] border-primary rounded-br-2xl" />

              {/* Animated scan line */}
              <motion.div
                className="absolute left-2 right-2 h-0.5"
                style={{
                  background:
                    "linear-gradient(90deg, transparent, hsl(var(--primary)), transparent)",
                }}
                animate={{ top: ["0%", "100%", "0%"] }}
                transition={{
                  duration: 2.5,
                  repeat: Infinity,
                  ease: "easeInOut",
                }}
              />
            </div>
          </motion.div>

          {/* Glass pill instruction */}
          <div className="mt-8 glass rounded-2xl px-5 py-2.5 shadow-card">
            <p className="text-foreground text-sm font-medium">
              Point your camera at a QR code
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
