import { describe, it, expect } from "vitest";
import { parseCredentialOfferUri, resolveCredentialOffer } from "../src/offer";
import type { HttpClient } from "../src/types/common";

describe("parseCredentialOfferUri", () => {
  it("should parse inline credential offer", () => {
    const offer = {
      credential_issuer: "https://issuer.example.com",
      credential_configuration_ids: ["UniversityDegreeCredential"],
      grants: {
        "urn:ietf:params:oauth:grant-type:pre-authorized_code": {
          "pre-authorized_code": "abc123",
        },
      },
    };
    const uri = `openid-credential-offer://?credential_offer=${encodeURIComponent(JSON.stringify(offer))}`;

    const result = parseCredentialOfferUri(uri);
    expect(result.credentialOffer).toEqual(offer);
    expect(result.credentialOfferUri).toBeUndefined();
  });

  it("should parse credential offer URI reference", () => {
    const uri = `openid-credential-offer://?credential_offer_uri=${encodeURIComponent("https://issuer.example.com/offers/123")}`;

    const result = parseCredentialOfferUri(uri);
    expect(result.credentialOffer).toBeUndefined();
    expect(result.credentialOfferUri).toBe(
      "https://issuer.example.com/offers/123"
    );
  });

  it("should throw on invalid URI scheme", () => {
    expect(() => parseCredentialOfferUri("invalid://foo")).toThrow(
      "Invalid credential offer URI scheme"
    );
  });

  it("should throw on missing parameters", () => {
    expect(() =>
      parseCredentialOfferUri("openid-credential-offer://")
    ).toThrow("credential_offer or credential_offer_uri");
  });

  it("should throw on missing credential_issuer", () => {
    const offer = { credential_configuration_ids: ["test"] };
    const uri = `openid-credential-offer://?credential_offer=${encodeURIComponent(JSON.stringify(offer))}`;
    expect(() => parseCredentialOfferUri(uri)).toThrow("credential_issuer");
  });

  it("should throw on missing credential_configuration_ids", () => {
    const offer = { credential_issuer: "https://issuer.example.com" };
    const uri = `openid-credential-offer://?credential_offer=${encodeURIComponent(JSON.stringify(offer))}`;
    expect(() => parseCredentialOfferUri(uri)).toThrow(
      "credential_configuration_ids"
    );
  });

  it("should parse https URI with credential_offer param", () => {
    const offer = {
      credential_issuer: "https://issuer.example.com",
      credential_configuration_ids: ["TestCredential"],
    };
    const uri = `https://wallet.example.com?credential_offer=${encodeURIComponent(JSON.stringify(offer))}`;

    const result = parseCredentialOfferUri(uri);
    expect(result.credentialOffer).toEqual(offer);
  });
});

describe("resolveCredentialOffer", () => {
  it("should resolve inline offer", async () => {
    const offer = {
      credential_issuer: "https://issuer.example.com",
      credential_configuration_ids: ["TestCredential"],
    };
    const uri = `openid-credential-offer://?credential_offer=${encodeURIComponent(JSON.stringify(offer))}`;

    const result = await resolveCredentialOffer(uri);
    expect(result).toEqual(offer);
  });

  it("should fetch offer from URI reference", async () => {
    const offer = {
      credential_issuer: "https://issuer.example.com",
      credential_configuration_ids: ["TestCredential"],
    };

    const mockHttpClient: HttpClient = {
      fetch: async () =>
        new Response(JSON.stringify(offer), { status: 200 }),
    };

    const uri = `openid-credential-offer://?credential_offer_uri=${encodeURIComponent("https://issuer.example.com/offers/123")}`;

    const result = await resolveCredentialOffer(uri, mockHttpClient);
    expect(result).toEqual(offer);
  });

  it("should throw on failed fetch", async () => {
    const mockHttpClient: HttpClient = {
      fetch: async () => new Response(null, { status: 404 }),
    };

    const uri = `openid-credential-offer://?credential_offer_uri=${encodeURIComponent("https://issuer.example.com/offers/404")}`;

    await expect(
      resolveCredentialOffer(uri, mockHttpClient)
    ).rejects.toThrow("Failed to fetch");
  });
});
