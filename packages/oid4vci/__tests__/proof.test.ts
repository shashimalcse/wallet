import { describe, it, expect } from "vitest";
import { createJwtProof } from "../src/proof";
import type { CryptoProvider } from "../src/types/common";

describe("createJwtProof", () => {
  const mockCryptoProvider: CryptoProvider = {
    sign: async (data) => new Uint8Array(64).fill(1),
    getPublicKeyJwk: async () => ({
      kty: "EC",
      crv: "P-256",
      x: "test-x",
      y: "test-y",
    }),
  };

  it("should create a valid JWT proof structure", async () => {
    const jwt = await createJwtProof({
      cryptoProvider: mockCryptoProvider,
      keyId: "key-1",
      issuer: "https://issuer.example.com",
      clientId: "wallet-app",
      nonce: "server-nonce",
    });

    const parts = jwt.split(".");
    expect(parts).toHaveLength(3);

    const header = JSON.parse(atob(parts[0].replace(/-/g, "+").replace(/_/g, "/")));
    expect(header.typ).toBe("openid4vci-proof+jwt");
    expect(header.alg).toBe("ES256");
    expect(header.jwk).toBeDefined();
    expect(header.jwk.kty).toBe("EC");
    expect(header.jwk.crv).toBe("P-256");

    const payload = JSON.parse(atob(parts[1].replace(/-/g, "+").replace(/_/g, "/")));
    expect(payload.iss).toBe("wallet-app");
    expect(payload.aud).toBe("https://issuer.example.com");
    expect(payload.iat).toBeDefined();
    expect(payload.nonce).toBe("server-nonce");
  });

  it("should omit nonce when not provided", async () => {
    const jwt = await createJwtProof({
      cryptoProvider: mockCryptoProvider,
      keyId: "key-1",
      issuer: "https://issuer.example.com",
    });

    const parts = jwt.split(".");
    const payload = JSON.parse(atob(parts[1].replace(/-/g, "+").replace(/_/g, "/")));
    expect(payload.nonce).toBeUndefined();
  });
});
