import type { CredentialOffer } from "./types/offer.js";
import type { HttpClient } from "./types/common.js";
import { defaultHttpClient } from "./types/common.js";
import { InvalidOfferError } from "./utils/errors.js";

const OFFER_URI_SCHEME = "openid-credential-offer://";

export function parseCredentialOfferUri(uri: string): {
  credentialOffer?: CredentialOffer;
  credentialOfferUri?: string;
} {
  if (!uri.startsWith(OFFER_URI_SCHEME) && !uri.startsWith("https://")) {
    throw new InvalidOfferError(`Invalid credential offer URI scheme: ${uri}`);
  }

  let searchParams: URLSearchParams;

  if (uri.startsWith(OFFER_URI_SCHEME)) {
    const queryString = uri.slice(OFFER_URI_SCHEME.length);
    searchParams = new URLSearchParams(
      queryString.startsWith("?") ? queryString.slice(1) : queryString
    );
  } else {
    const url = new URL(uri);
    searchParams = url.searchParams;
  }

  const credentialOfferParam = searchParams.get("credential_offer");
  const credentialOfferUriParam = searchParams.get("credential_offer_uri");

  if (credentialOfferParam) {
    try {
      const offer = JSON.parse(credentialOfferParam) as CredentialOffer;
      validateCredentialOffer(offer);
      return { credentialOffer: offer };
    } catch (e) {
      if (e instanceof InvalidOfferError) throw e;
      throw new InvalidOfferError("Failed to parse inline credential offer");
    }
  }

  if (credentialOfferUriParam) {
    return { credentialOfferUri: credentialOfferUriParam };
  }

  throw new InvalidOfferError(
    "URI must contain either credential_offer or credential_offer_uri parameter"
  );
}

export async function resolveCredentialOffer(
  uri: string,
  httpClient: HttpClient = defaultHttpClient
): Promise<CredentialOffer> {
  const parsed = parseCredentialOfferUri(uri);

  if (parsed.credentialOffer) {
    return parsed.credentialOffer;
  }

  if (parsed.credentialOfferUri) {
    const response = await httpClient.fetch(parsed.credentialOfferUri);
    if (!response.ok) {
      throw new InvalidOfferError(
        `Failed to fetch credential offer from URI: ${response.status}`
      );
    }
    const offer = (await response.json()) as CredentialOffer;
    validateCredentialOffer(offer);
    return offer;
  }

  throw new InvalidOfferError("Could not resolve credential offer");
}

function validateCredentialOffer(offer: CredentialOffer): void {
  if (!offer.credential_issuer) {
    throw new InvalidOfferError("Missing credential_issuer in offer");
  }
  if (
    !offer.credential_configuration_ids ||
    !Array.isArray(offer.credential_configuration_ids) ||
    offer.credential_configuration_ids.length === 0
  ) {
    throw new InvalidOfferError(
      "Missing or empty credential_configuration_ids in offer"
    );
  }
}
