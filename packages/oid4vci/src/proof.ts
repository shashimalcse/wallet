import type { CryptoProvider, JWK } from "./types/common.js";

export interface ProofParams {
  cryptoProvider: CryptoProvider;
  keyId: string;
  issuer: string;
  clientId?: string;
  nonce?: string;
}

export async function createJwtProof(params: ProofParams): Promise<string> {
  const { cryptoProvider, keyId, issuer, clientId, nonce } = params;

  const publicKeyJwk = await cryptoProvider.getPublicKeyJwk(keyId);

  const header: Record<string, unknown> = {
    typ: "openid4vci-proof+jwt",
    alg: getAlgorithm(publicKeyJwk),
    jwk: publicKeyJwk,
  };

  const now = Math.floor(Date.now() / 1000);
  const payload: Record<string, unknown> = {
    iss: clientId,
    aud: issuer,
    iat: now,
  };

  if (nonce) {
    payload.nonce = nonce;
  }

  const headerB64 = base64urlEncode(
    new TextEncoder().encode(JSON.stringify(header))
  );
  const payloadB64 = base64urlEncode(
    new TextEncoder().encode(JSON.stringify(payload))
  );

  const signingInput = `${headerB64}.${payloadB64}`;
  const signature = await cryptoProvider.sign(
    new TextEncoder().encode(signingInput),
    keyId
  );

  const signatureB64 = base64urlEncode(signature);

  return `${signingInput}.${signatureB64}`;
}

function getAlgorithm(jwk: JWK): string {
  if (jwk.alg) return jwk.alg;
  if (jwk.kty === "EC") {
    switch (jwk.crv) {
      case "P-256":
        return "ES256";
      case "P-384":
        return "ES384";
      case "P-521":
        return "ES512";
    }
  }
  return "ES256";
}

function base64urlEncode(data: Uint8Array): string {
  let binary = "";
  for (let i = 0; i < data.length; i++) {
    binary += String.fromCharCode(data[i]);
  }
  return btoa(binary).replace(/\+/g, "-").replace(/\//g, "_").replace(/=+$/, "");
}
