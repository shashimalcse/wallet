import type { AuthorizationServerMetadata } from "./types/metadata.js";
import type { CredentialOffer } from "./types/offer.js";

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
  } = params;

  const url = new URL(authServerMetadata.authorization_endpoint);

  url.searchParams.set("response_type", "code");
  url.searchParams.set("client_id", clientId);
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

  // Add authorization_details for requested credential configurations
  const authorizationDetails = credentialOffer.credential_configuration_ids.map(
    (id) => ({
      type: "openid_credential",
      credential_configuration_id: id,
    })
  );
  url.searchParams.set(
    "authorization_details",
    JSON.stringify(authorizationDetails)
  );

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
