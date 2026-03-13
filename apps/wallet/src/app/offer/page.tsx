"use client";

import { useSearchParams, useRouter } from "next/navigation";
import { useEffect, Suspense } from "react";
import { toast } from "sonner";
import { OfferReview } from "@/components/offer-review";
import { useOid4vciFlow } from "@/hooks/use-oid4vci-flow";
import { useCredentials } from "@/hooks/use-credentials";
import { motion } from "framer-motion";
import { Loader2 } from "lucide-react";

function OfferContent() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const uri = searchParams.get("uri");
  const { state, processedOffer, error, startFlow, acceptOffer, reset } =
    useOid4vciFlow();
  const { addCredential } = useCredentials();

  useEffect(() => {
    if (uri && state === "idle") {
      startFlow(uri);
    }
  }, [uri, state, startFlow]);

  useEffect(() => {
    if (error) {
      toast.error(error);
    }
  }, [error]);

  const handleAccept = async (pin?: string) => {
    const storedCredentials = await acceptOffer(pin);
    for (const cred of storedCredentials) {
      await addCredential(cred);
    }
    if (storedCredentials.length > 0) {
      toast.success("Credential received!");
      router.push("/home");
    }
  };

  const handleDecline = () => {
    reset();
    router.push("/home");
  };

  if (state === "loading-metadata") {
    return (
      <div className="flex h-dvh items-center justify-center">
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="flex flex-col items-center gap-4"
        >
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
          <p className="text-sm text-muted-foreground">Loading offer...</p>
        </motion.div>
      </div>
    );
  }

  if (state === "error") {
    return (
      <div className="flex h-dvh items-center justify-center px-6">
        <div className="text-center">
          <p className="text-destructive font-medium mb-4">{error}</p>
          <button
            onClick={() => router.push("/home")}
            className="text-sm text-primary underline"
          >
            Back to Home
          </button>
        </div>
      </div>
    );
  }

  if (processedOffer && (state === "awaiting-review" || state === "requesting")) {
    return (
      <OfferReview
        processedOffer={processedOffer}
        onAccept={handleAccept}
        onDecline={handleDecline}
        loading={state === "requesting"}
      />
    );
  }

  return null;
}

export default function OfferPage() {
  return (
    <Suspense
      fallback={
        <div className="flex h-dvh items-center justify-center">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
        </div>
      }
    >
      <OfferContent />
    </Suspense>
  );
}
