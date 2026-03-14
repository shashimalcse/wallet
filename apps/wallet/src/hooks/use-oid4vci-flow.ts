"use client";

import { useState, useCallback, useRef } from "react";
import {
  OID4VCIClient,
  type ProcessedOffer,
  type CredentialResponse,
  type CredentialDisplay,
  type PKCEParams,
} from "@wallet/oid4vci";
import { createCryptoProvider, generateKeyPair } from "@/lib/key-manager";
import { type StoredCredential } from "@/lib/credential-store";

const SESSION_KEY = "oid4vci_auth_flow";

export type GrantType = "pre-authorized_code" | "authorization_code";

export type FlowState =
  | "idle"
  | "loading-metadata"
  | "awaiting-review"
  | "requesting"
  | "redirecting"
  | "completing"
  | "success"
  | "error";

export interface FlowResult {
  credentials: StoredCredential[];
}

interface PersistedAuthFlowData {
  pkce: PKCEParams;
  state: string;
  offerUri: string;
  keyId: string;
}

function getGrantType(offer: ProcessedOffer): GrantType {
  if (
    offer.offer.grants?.[
      "urn:ietf:params:oauth:grant-type:pre-authorized_code"
    ]
  ) {
    return "pre-authorized_code";
  }
  if (offer.offer.grants?.authorization_code) {
    return "authorization_code";
  }
  throw new Error("Credential offer does not specify a supported grant type");
}

export { getGrantType };

function persistAuthFlowData(data: PersistedAuthFlowData) {
  sessionStorage.setItem(SESSION_KEY, JSON.stringify(data));
}

function loadAuthFlowData(): PersistedAuthFlowData | null {
  const raw = sessionStorage.getItem(SESSION_KEY);
  if (!raw) return null;
  return JSON.parse(raw) as PersistedAuthFlowData;
}

function clearAuthFlowData() {
  sessionStorage.removeItem(SESSION_KEY);
}

export function useOid4vciFlow() {
  const [state, setState] = useState<FlowState>("idle");
  const [processedOffer, setProcessedOffer] = useState<ProcessedOffer | null>(
    null
  );
  const [error, setError] = useState<string | null>(null);
  const [result, setResult] = useState<FlowResult | null>(null);

  const clientRef = useRef<OID4VCIClient | null>(null);
  if (!clientRef.current) {
    clientRef.current = new OID4VCIClient({
      cryptoProvider: createCryptoProvider(),
      clientId: "wallet",
      redirectUri: `${window.location.origin}/api/wallet/oid4vci/callback`,
    });
  }
  const client = clientRef.current;
  const offerUriRef = useRef<string | null>(null);

  const startFlow = useCallback(
    async (offerUri: string) => {
      setState("loading-metadata");
      setError(null);
      setResult(null);
      offerUriRef.current = offerUri;

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

      const grantType = getGrantType(processedOffer);

      if (grantType === "authorization_code") {
        setState("redirecting");
        setError(null);

        try {
          const keyId = await generateKeyPair();
          const { url, pkce, state: authState } =
            await client.buildAuthorizationRequest(processedOffer);

          // Persist the original offerUri so we can re-process the offer after redirect
          const offerUri =
            offerUriRef.current ||
            `openid-credential-offer://?credential_offer=${encodeURIComponent(
              JSON.stringify(processedOffer.offer)
            )}`;

          persistAuthFlowData({
            pkce,
            state: authState,
            offerUri,
            keyId,
          });

          window.location.href = url;
          return []; // Will redirect away
        } catch (e) {
          setError(
            e instanceof Error ? e.message : "Failed to start authorization"
          );
          setState("error");
          return [];
        }
      }

      // Pre-authorized code flow
      setState("requesting");
      setError(null);

      try {
        const keyId = await generateKeyPair();
        const responses = await client.executePreAuthorizedFlow(
          processedOffer,
          keyId,
          pin
        );

        const storedCredentials = responsesToStoredCredentials(
          responses,
          processedOffer
        );

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

  const completeAuthCodeFlow = useCallback(
    async (code: string, returnedState: string): Promise<StoredCredential[]> => {
      setState("completing");
      setError(null);

      try {
        const persisted = loadAuthFlowData();
        if (!persisted) {
          throw new Error("No in-progress authorization flow found");
        }

        if (persisted.state !== returnedState) {
          throw new Error("State mismatch — possible CSRF attack");
        }

        // Re-process the offer to get metadata
        const offer = await client.processOffer(persisted.offerUri);
        setProcessedOffer(offer);

        const responses = await client.completeAuthorizationFlow(
          offer,
          code,
          persisted.pkce,
          persisted.keyId
        );

        clearAuthFlowData();

        const storedCredentials = responsesToStoredCredentials(
          responses,
          offer
        );

        setResult({ credentials: storedCredentials });
        setState("success");
        return storedCredentials;
      } catch (e) {
        clearAuthFlowData();
        setError(
          e instanceof Error ? e.message : "Failed to complete authorization"
        );
        setState("error");
        return [];
      }
    },
    // eslint-disable-next-line react-hooks/exhaustive-deps
    []
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
    completeAuthCodeFlow,
    reset,
  };
}

function responsesToStoredCredentials(
  responses: CredentialResponse[],
  processedOffer: ProcessedOffer
): StoredCredential[] {
  return responses
    .map((response, index) => {
      if (!response.credential) return null;
      const configId =
        processedOffer.offer.credential_configuration_ids[index];
      const config = processedOffer.credentialConfigurations[configId];

      return responseToStoredCredential(
        response,
        configId,
        processedOffer.offer.credential_issuer,
        config?.display?.[0],
        processedOffer.issuerMetadata.display?.[0]
      );
    })
    .filter(Boolean) as StoredCredential[];
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
