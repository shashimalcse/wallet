import type { AuthorizationServerMetadata } from "./types/metadata.js";
import type { CredentialOffer } from "./types/offer.js";
import type { HttpClient } from "./types/common.js";
import { defaultHttpClient } from "./types/common.js";

export interface PKCEParams {
  codeVerifier: string;
  codeChallenge: string;
  codeChallengeMethod: string;
}

export interface AuthorizationUrlParams {
  authServerMetadata: AuthorizationServerMetadata;
  clientId: string;
  redirectUri: string;
  credentialOffer: CredentialOffer;
  pkce: PKCEParams;
  scope?: string;
  state?: string;
  requestUri?: string;
}

export interface PARParams {
  parEndpoint: string;
  clientId: string;
  redirectUri: string;
  scope: string;
  pkce: PKCEParams;
  state?: string;
  issuerState?: string;
  httpClient?: HttpClient;
}

export interface PARResponse {
  request_uri: string;
  expires_in?: number;
}

export async function pushAuthorizationRequest(
  params: PARParams
): Promise<PARResponse> {
  const http = params.httpClient || defaultHttpClient;

  const body = new URLSearchParams();
  body.set("response_type", "code");
  body.set("client_id", params.clientId);
  body.set("redirect_uri", params.redirectUri);
  body.set("scope", params.scope);
  body.set("code_challenge", params.pkce.codeChallenge);
  body.set("code_challenge_method", params.pkce.codeChallengeMethod);

  if (params.state) {
    body.set("state", params.state);
  }

  if (params.issuerState) {
    body.set("issuer_state", params.issuerState);
  }

  const response = await http.fetch(params.parEndpoint, {
    method: "POST",
    headers: { "Content-Type": "application/x-www-form-urlencoded" },
    body: body.toString(),
  });

  if (!response.ok) {
    let message = `PAR request failed (${response.status})`;
    try {
      const errorJson = await response.json();
      const desc = errorJson.error_description || errorJson.error;
      if (desc) message += `: ${desc}`;
    } catch {
      const text = await response.text();
      if (text) message += `: ${text}`;
    }
    throw new Error(message);
  }

  return response.json() as Promise<PARResponse>;
}

export function buildAuthorizationUrl(params: AuthorizationUrlParams): string {
  const {
    authServerMetadata,
    clientId,
    redirectUri,
    credentialOffer,
    pkce,
    scope,
    state,
    requestUri,
  } = params;

  const url = new URL(authServerMetadata.authorization_endpoint);

  url.searchParams.set("client_id", clientId);

  if (requestUri) {
    // PAR redirect: only client_id and request_uri
    url.searchParams.set("request_uri", requestUri);
    return url.toString();
  }

  // Non-PAR fallback: include all params with scope
  url.searchParams.set("response_type", "code");
  url.searchParams.set("redirect_uri", redirectUri);
  url.searchParams.set("code_challenge", pkce.codeChallenge);
  url.searchParams.set("code_challenge_method", pkce.codeChallengeMethod);

  if (scope) {
    url.searchParams.set("scope", scope);
  }

  if (state) {
    url.searchParams.set("state", state);
  }

  const issuerState =
    credentialOffer.grants?.authorization_code?.issuer_state;
  if (issuerState) {
    url.searchParams.set("issuer_state", issuerState);
  }

  return url.toString();
}

export function parseAuthorizationResponse(url: string): {
  code: string;
  state?: string;
} {
  const parsedUrl = new URL(url);
  const code = parsedUrl.searchParams.get("code");
  const error = parsedUrl.searchParams.get("error");

  if (error) {
    const description =
      parsedUrl.searchParams.get("error_description") || error;
    throw new Error(`Authorization error: ${description}`);
  }

  if (!code) {
    throw new Error("Missing authorization code in response");
  }

  return {
    code,
    state: parsedUrl.searchParams.get("state") || undefined,
  };
}

export async function generatePKCE(): Promise<PKCEParams> {
  const buffer = new Uint8Array(32);
  crypto.getRandomValues(buffer);
  const codeVerifier = base64urlEncode(buffer);

  const encoder = new TextEncoder();
  const data = encoder.encode(codeVerifier);
  const hash = await crypto.subtle.digest("SHA-256", data);
  const codeChallenge = base64urlEncode(new Uint8Array(hash));

  return {
    codeVerifier,
    codeChallenge,
    codeChallengeMethod: "S256",
  };
}

function base64urlEncode(data: Uint8Array): string {
  let binary = "";
  for (let i = 0; i < data.length; i++) {
    binary += String.fromCharCode(data[i]);
  }
  return btoa(binary).replace(/\+/g, "-").replace(/\//g, "_").replace(/=+$/, "");
}
