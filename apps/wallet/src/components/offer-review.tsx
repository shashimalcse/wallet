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
  isAuthCodeFlow?: boolean;
}

export function OfferReview({
  processedOffer,
  onAccept,
  onDecline,
  loading,
  isAuthCodeFlow,
}: OfferReviewProps) {
  const [pin, setPin] = useState("");
  const { issuerMetadata, credentialConfigurations, requiresPin } =
    processedOffer;
  const showPin = requiresPin && !isAuthCodeFlow;

  const issuerName =
    issuerMetadata.display?.[0]?.name || issuerMetadata.credential_issuer;
  const issuerLogo = issuerMetadata.display?.[0]?.logo?.uri;

  const credentials = Object.entries(credentialConfigurations);

  return (
    <motion.div
      initial={{ opacity: 0, y: "100%", rotateX: -5 }}
      animate={{ opacity: 1, y: 0, rotateX: 0 }}
      transition={{ type: "spring", damping: 28, stiffness: 280 }}
      className="flex flex-col h-full"
    >
      <div className="flex items-center justify-between p-5">
        {/* Drag handle */}
        <div className="absolute top-2 left-1/2 -translate-x-1/2 h-1 w-10 rounded-full bg-muted-foreground/20" />
        <h1 className="text-lg font-semibold">Credential Offer</h1>
        <button
          onClick={onDecline}
          className="rounded-full p-2 hover:bg-muted transition-colors"
        >
          <X className="h-5 w-5" />
        </button>
      </div>

      <div className="flex-1 overflow-y-auto px-5 pb-4">
        {/* Issuer info */}
        <div className="flex items-center gap-3 rounded-3xl glass-panel p-4 mb-6 border border-white/5">
          {issuerLogo ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img
              src={issuerLogo}
              alt=""
              className="h-12 w-12 rounded-full"
            />
          ) : (
            <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-primary/10">
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
              <motion.div
                key={id}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                className="rounded-2xl glass-panel p-4 border border-white/5"
                style={
                  display?.background_color
                    ? {
                        borderColor: display.background_color,
                        borderWidth: 1,
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
              </motion.div>
            );
          })}
        </div>

        {/* PIN input */}
        {showPin && (
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
      <div className="flex gap-3 p-5 pb-safe">
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
          variant="glass"
          size="lg"
          className="flex-1"
          onClick={() => onAccept(showPin ? pin : undefined)}
          disabled={loading || (showPin && !pin)}
        >
          {loading
            ? isAuthCodeFlow
              ? "Redirecting..."
              : "Accepting..."
            : isAuthCodeFlow
              ? "Continue"
              : "Accept"}
        </Button>
      </div>
    </motion.div>
  );
}
