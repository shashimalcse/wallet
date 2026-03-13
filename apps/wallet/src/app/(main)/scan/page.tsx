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
            components={{ audio: false }}
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
              <div className="absolute top-0 left-0 w-8 h-8 border-t-4 border-l-4 border-white rounded-tl-xl" />
              <div className="absolute top-0 right-0 w-8 h-8 border-t-4 border-r-4 border-white rounded-tr-xl" />
              <div className="absolute bottom-0 left-0 w-8 h-8 border-b-4 border-l-4 border-white rounded-bl-xl" />
              <div className="absolute bottom-0 right-0 w-8 h-8 border-b-4 border-r-4 border-white rounded-br-xl" />
            </div>
          </motion.div>

          <p className="mt-8 text-white text-sm font-medium drop-shadow-lg">
            Point your camera at a QR code
          </p>
        </div>
      </div>
    </div>
  );
}
