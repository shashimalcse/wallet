import { describe, it, expect, vi } from "vitest";
import { requestToken } from "../src/token";
import type { HttpClient } from "../src/types/common";

describe("requestToken", () => {
  it("should request token with pre-authorized_code", async () => {
    const mockClient: HttpClient = {
      fetch: vi.fn(async (_url, init) => {
        const body = new URLSearchParams(init?.body as string);
        expect(body.get("grant_type")).toBe(
          "urn:ietf:params:oauth:grant-type:pre-authorized_code"
        );
        expect(body.get("pre-authorized_code")).toBe("test-code");
        expect(body.get("tx_code")).toBe("1234");
        return new Response(
          JSON.stringify({
            access_token: "token-123",
            token_type: "Bearer",
            c_nonce: "nonce-abc",
          }),
          { status: 200 }
        );
      }),
    };

    const result = await requestToken(
      "https://auth.example.com/token",
      {
        grant_type: "urn:ietf:params:oauth:grant-type:pre-authorized_code",
        "pre-authorized_code": "test-code",
        tx_code: "1234",
      },
      mockClient
    );

    expect(result.access_token).toBe("token-123");
    expect(result.c_nonce).toBe("nonce-abc");
  });

  it("should request token with authorization_code", async () => {
    const mockClient: HttpClient = {
      fetch: vi.fn(async (_url, init) => {
        const body = new URLSearchParams(init?.body as string);
        expect(body.get("grant_type")).toBe("authorization_code");
        expect(body.get("code")).toBe("auth-code");
        expect(body.get("redirect_uri")).toBe("https://wallet.example.com/callback");
        expect(body.get("code_verifier")).toBe("verifier-xyz");
        return new Response(
          JSON.stringify({
            access_token: "token-456",
            token_type: "Bearer",
          }),
          { status: 200 }
        );
      }),
    };

    const result = await requestToken(
      "https://auth.example.com/token",
      {
        grant_type: "authorization_code",
        code: "auth-code",
        redirect_uri: "https://wallet.example.com/callback",
        code_verifier: "verifier-xyz",
      },
      mockClient
    );

    expect(result.access_token).toBe("token-456");
  });

  it("should throw on error response", async () => {
    const mockClient: HttpClient = {
      fetch: async () =>
        new Response(
          JSON.stringify({
            error: "invalid_grant",
            error_description: "The pre-authorized code has expired",
          }),
          { status: 400 }
        ),
    };

    await expect(
      requestToken(
        "https://auth.example.com/token",
        {
          grant_type: "urn:ietf:params:oauth:grant-type:pre-authorized_code",
          "pre-authorized_code": "expired-code",
        },
        mockClient
      )
    ).rejects.toThrow("pre-authorized code has expired");
  });
});
