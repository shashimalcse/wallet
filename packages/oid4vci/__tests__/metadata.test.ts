import { describe, it, expect } from "vitest";
import { fetchIssuerMetadata, fetchAuthServerMetadata } from "../src/metadata";
import type { HttpClient } from "../src/types/common";
import type { IssuerMetadata, AuthorizationServerMetadata } from "../src/types/metadata";

describe("fetchIssuerMetadata", () => {
  const validMetadata: IssuerMetadata = {
    credential_issuer: "https://issuer.example.com",
    credential_endpoint: "https://issuer.example.com/credential",
    credential_configurations_supported: {
      UniversityDegreeCredential: {
        format: "jwt_vc_json",
        display: [{ name: "University Degree" }],
      },
    },
  };

  it("should fetch and return valid issuer metadata", async () => {
    const mockClient: HttpClient = {
      fetch: async (url) => {
        expect(url).toBe(
          "https://issuer.example.com/.well-known/openid-credential-issuer"
        );
        return new Response(JSON.stringify(validMetadata), { status: 200 });
      },
    };

    const result = await fetchIssuerMetadata(
      "https://issuer.example.com",
      mockClient
    );
    expect(result).toEqual(validMetadata);
  });

  it("should strip trailing slash from issuer URL", async () => {
    const mockClient: HttpClient = {
      fetch: async (url) => {
        expect(url).toBe(
          "https://issuer.example.com/.well-known/openid-credential-issuer"
        );
        return new Response(JSON.stringify(validMetadata), { status: 200 });
      },
    };

    await fetchIssuerMetadata("https://issuer.example.com/", mockClient);
  });

  it("should throw on HTTP error", async () => {
    const mockClient: HttpClient = {
      fetch: async () => new Response(null, { status: 500 }),
    };

    await expect(
      fetchIssuerMetadata("https://issuer.example.com", mockClient)
    ).rejects.toThrow("Failed to fetch issuer metadata");
  });

  it("should throw on missing credential_endpoint", async () => {
    const mockClient: HttpClient = {
      fetch: async () =>
        new Response(
          JSON.stringify({
            credential_issuer: "https://issuer.example.com",
            credential_configurations_supported: {},
          }),
          { status: 200 }
        ),
    };

    await expect(
      fetchIssuerMetadata("https://issuer.example.com", mockClient)
    ).rejects.toThrow("missing credential_endpoint");
  });
});

describe("fetchAuthServerMetadata", () => {
  const validMetadata: AuthorizationServerMetadata = {
    issuer: "https://auth.example.com",
    authorization_endpoint: "https://auth.example.com/authorize",
    token_endpoint: "https://auth.example.com/token",
  };

  it("should try OAuth metadata first, then OIDC", async () => {
    const calls: string[] = [];
    const mockClient: HttpClient = {
      fetch: async (url) => {
        calls.push(url);
        if (url.includes("oauth-authorization-server")) {
          return new Response(null, { status: 404 });
        }
        return new Response(JSON.stringify(validMetadata), { status: 200 });
      },
    };

    const result = await fetchAuthServerMetadata(
      "https://auth.example.com",
      mockClient
    );
    expect(result).toEqual(validMetadata);
    expect(calls).toHaveLength(2);
  });

  it("should throw on missing token_endpoint", async () => {
    const mockClient: HttpClient = {
      fetch: async () =>
        new Response(
          JSON.stringify({
            issuer: "https://auth.example.com",
            authorization_endpoint: "https://auth.example.com/authorize",
          }),
          { status: 200 }
        ),
    };

    await expect(
      fetchAuthServerMetadata("https://auth.example.com", mockClient)
    ).rejects.toThrow("missing token_endpoint");
  });
});
