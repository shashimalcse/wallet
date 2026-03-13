"use client";

import { useState, useCallback } from "react";
import {
  OID4VCIClient,
  type ProcessedOffer,
  type CredentialResponse,
  type CredentialDisplay,
} from "@wallet/oid4vci";
import { createCryptoProvider, generateKeyPair } from "@/lib/key-manager";
import { type StoredCredential } from "@/lib/credential-store";

export type FlowState =
  | "idle"
  | "loading-metadata"
  | "awaiting-review"
  | "requesting"
  | "success"
  | "error";

export interface FlowResult {
  credentials: StoredCredential[];
}

export function useOid4vciFlow() {
  const [state, setState] = useState<FlowState>("idle");
  const [processedOffer, setProcessedOffer] = useState<ProcessedOffer | null>(
    null
  );
  const [error, setError] = useState<string | null>(null);
  const [result, setResult] = useState<FlowResult | null>(null);

  const client = new OID4VCIClient({
    cryptoProvider: createCryptoProvider(),
    clientId: "wallet",
    redirectUri: `${window.location.origin}/api/wallet/oid4vci/callback`,
  });

  const startFlow = useCallback(
    async (offerUri: string) => {
      setState("loading-metadata");
      setError(null);
      setResult(null);

      try {
        const offer = await client.processOffer(offerUri);
        setProcessedOffer(offer);
        setState("awaiting-review");
      } catch (e) {
        setError(e instanceof Error ? e.message : "Failed to process offer");
        setState("error");
      }
    },
    // eslint-disable-next-line react-hooks/exhaustive-deps
    []
  );

  const acceptOffer = useCallback(
    async (pin?: string): Promise<StoredCredential[]> => {
      if (!processedOffer) {
        throw new Error("No offer to accept");
      }

      setState("requesting");
      setError(null);

      try {
        const keyId = await generateKeyPair();
        const responses = await client.executePreAuthorizedFlow(
          processedOffer,
          keyId,
          pin
        );

        const storedCredentials = responses
          .map((response, index) => {
            if (!response.credential) return null;
            const configId =
              processedOffer.offer.credential_configuration_ids[index];
            const config =
              processedOffer.credentialConfigurations[configId];

            return responseToStoredCredential(
              response,
              configId,
              processedOffer.offer.credential_issuer,
              config?.display?.[0],
              processedOffer.issuerMetadata.display?.[0]
            );
          })
          .filter(Boolean) as StoredCredential[];

        setResult({ credentials: storedCredentials });
        setState("success");
        return storedCredentials;
      } catch (e) {
        setError(
          e instanceof Error ? e.message : "Failed to obtain credential"
        );
        setState("error");
        return [];
      }
    },
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [processedOffer]
  );

  const reset = useCallback(() => {
    setState("idle");
    setProcessedOffer(null);
    setError(null);
    setResult(null);
  }, []);

  return {
    state,
    processedOffer,
    error,
    result,
    startFlow,
    acceptOffer,
    reset,
  };
}

function responseToStoredCredential(
  response: CredentialResponse,
  configId: string,
  issuer: string,
  credDisplay?: CredentialDisplay,
  issuerDisplay?: { name?: string; logo?: { uri: string } }
): StoredCredential {
  const claims = decodeCredentialClaims(response.credential || "");

  return {
    id: crypto.randomUUID(),
    rawCredential: response.credential || "",
    format: "jwt_vc_json",
    credentialConfigurationId: configId,
    issuer,
    issuerDisplay: issuerDisplay
      ? { name: issuerDisplay.name, logo: issuerDisplay.logo?.uri }
      : undefined,
    display: credDisplay
      ? {
          name: credDisplay.name,
          description: credDisplay.description,
          backgroundColor: credDisplay.background_color,
          textColor: credDisplay.text_color,
          logo: credDisplay.logo?.uri,
        }
      : undefined,
    claims,
    issuedAt: Date.now(),
  };
}

function decodeCredentialClaims(
  credential: string
): Record<string, unknown> {
  try {
    // Handle JWT format (header.payload.signature)
    const parts = credential.split(".");
    if (parts.length >= 2) {
      const payload = parts[1];
      const decoded = atob(
        payload.replace(/-/g, "+").replace(/_/g, "/")
      );
      const parsed = JSON.parse(decoded);
      // Extract claims from vc.credentialSubject or top-level
      return parsed.vc?.credentialSubject || parsed;
    }
  } catch {
    // Not a decodable JWT
  }
  return {};
}
