"use client";

import { motion } from "framer-motion";
import { Shield, X } from "lucide-react";
import { Button } from "./ui/button";
import { PinInput } from "./pin-input";
import type { ProcessedOffer } from "@wallet/oid4vci";
import { useState } from "react";

interface OfferReviewProps {
  processedOffer: ProcessedOffer;
  onAccept: (pin?: string) => void;
  onDecline: () => void;
  loading?: boolean;
}

export function OfferReview({
  processedOffer,
  onAccept,
  onDecline,
  loading,
}: OfferReviewProps) {
  const [pin, setPin] = useState("");
  const { issuerMetadata, credentialConfigurations, requiresPin } =
    processedOffer;

  const issuerName =
    issuerMetadata.display?.[0]?.name || issuerMetadata.credential_issuer;
  const issuerLogo = issuerMetadata.display?.[0]?.logo?.uri;

  const credentials = Object.entries(credentialConfigurations);

  return (
    <motion.div
      initial={{ opacity: 0, y: 30 }}
      animate={{ opacity: 1, y: 0 }}
      className="flex flex-col h-full"
    >
      <div className="flex items-center justify-between p-4">
        <h1 className="text-lg font-semibold">Credential Offer</h1>
        <button
          onClick={onDecline}
          className="rounded-full p-2 hover:bg-muted transition-colors"
        >
          <X className="h-5 w-5" />
        </button>
      </div>

      <div className="flex-1 overflow-y-auto px-4 pb-4">
        {/* Issuer info */}
        <div className="flex items-center gap-3 rounded-2xl bg-muted/50 p-4 mb-6">
          {issuerLogo ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img
              src={issuerLogo}
              alt=""
              className="h-12 w-12 rounded-full"
            />
          ) : (
            <div className="flex h-12 w-12 items-center justify-center rounded-full bg-primary/10">
              <Shield className="h-6 w-6 text-primary" />
            </div>
          )}
          <div>
            <p className="font-semibold">{issuerName}</p>
            <p className="text-sm text-muted-foreground">
              wants to issue you {credentials.length} credential
              {credentials.length !== 1 ? "s" : ""}
            </p>
          </div>
        </div>

        {/* Credential list */}
        <div className="space-y-3 mb-6">
          {credentials.map(([id, config]) => {
            const display = config.display?.[0];
            return (
              <div
                key={id}
                className="rounded-xl border p-4"
                style={
                  display?.background_color
                    ? {
                        borderColor: display.background_color,
                        backgroundColor: `${display.background_color}10`,
                      }
                    : undefined
                }
              >
                <p className="font-medium">{display?.name || id}</p>
                {display?.description && (
                  <p className="text-sm text-muted-foreground mt-1">
                    {display.description}
                  </p>
                )}
                <p className="text-xs text-muted-foreground mt-2">
                  Format: {config.format}
                </p>
              </div>
            );
          })}
        </div>

        {/* PIN input */}
        {requiresPin && (
          <div className="mb-6">
            <p className="text-sm font-medium mb-1">
              {processedOffer.pinDescription || "Enter PIN"}
            </p>
            <p className="text-xs text-muted-foreground mb-3">
              Enter the code provided by the issuer
            </p>
            <PinInput
              length={processedOffer.pinLength || 4}
              inputMode={processedOffer.pinInputMode || "numeric"}
              onComplete={setPin}
            />
          </div>
        )}
      </div>

      {/* Actions */}
      <div className="flex gap-3 p-4 border-t pb-safe">
        <Button
          variant="outline"
          size="lg"
          className="flex-1"
          onClick={onDecline}
          disabled={loading}
        >
          Decline
        </Button>
        <Button
          size="lg"
          className="flex-1"
          onClick={() => onAccept(requiresPin ? pin : undefined)}
          disabled={loading || (requiresPin && !pin)}
        >
          {loading ? "Accepting..." : "Accept"}
        </Button>
      </div>
    </motion.div>
  );
}
