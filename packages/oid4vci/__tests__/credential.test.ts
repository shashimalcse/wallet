import { describe, it, expect } from "vitest";
import { requestCredential, requestDeferredCredential } from "../src/credential";
import { IssuancePendingError } from "../src/utils/errors";
import type { HttpClient } from "../src/types/common";

describe("requestCredential", () => {
  it("should send credential request with auth header", async () => {
    const mockClient: HttpClient = {
      fetch: async (url, init) => {
        expect(init?.headers).toHaveProperty("Authorization", "Bearer test-token");
        expect(init?.headers).toHaveProperty("Content-Type", "application/json");
        const body = JSON.parse(init?.body as string);
        expect(body.credential_identifier).toBe("TestCredential");
        expect(body.proof.proof_type).toBe("jwt");
        return new Response(
          JSON.stringify({ credential: "ey..." }),
          { status: 200 }
        );
      },
    };

    const result = await requestCredential(
      "https://issuer.example.com/credential",
      "test-token",
      {
        credential_identifier: "TestCredential",
        proof: { proof_type: "jwt", jwt: "ey..." },
      },
      mockClient
    );

    expect(result.credential).toBe("ey...");
  });

  it("should throw on error response", async () => {
    const mockClient: HttpClient = {
      fetch: async () =>
        new Response(
          JSON.stringify({
            error: "invalid_proof",
            error_description: "Invalid proof",
          }),
          { status: 400 }
        ),
    };

    await expect(
      requestCredential(
        "https://issuer.example.com/credential",
        "test-token",
        { credential_identifier: "Test" },
        mockClient
      )
    ).rejects.toThrow("Invalid proof");
  });
});

describe("requestDeferredCredential", () => {
  it("should throw IssuancePendingError when pending", async () => {
    const mockClient: HttpClient = {
      fetch: async () =>
        new Response(
          JSON.stringify({
            error: "issuance_pending",
            interval: 5,
          }),
          { status: 400 }
        ),
    };

    try {
      await requestDeferredCredential(
        "https://issuer.example.com/deferred",
        "test-token",
        "tx-123",
        mockClient
      );
      expect.fail("Should have thrown");
    } catch (e) {
      expect(e).toBeInstanceOf(IssuancePendingError);
      expect((e as IssuancePendingError).transactionId).toBe("tx-123");
      expect((e as IssuancePendingError).retryInterval).toBe(5);
    }
  });

  it("should return credential when ready", async () => {
    const mockClient: HttpClient = {
      fetch: async () =>
        new Response(
          JSON.stringify({ credential: "deferred-cred" }),
          { status: 200 }
        ),
    };

    const result = await requestDeferredCredential(
      "https://issuer.example.com/deferred",
      "test-token",
      "tx-123",
      mockClient
    );

    expect(result.credential).toBe("deferred-cred");
  });
});
