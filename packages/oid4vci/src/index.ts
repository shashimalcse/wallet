// Types
export type {
  JWK,
  CryptoProvider,
  HttpClient,
} from "./types/common.js";
export type {
  CredentialOffer,
  CredentialOfferGrants,
} from "./types/offer.js";
export type {
  IssuerMetadata,
  AuthorizationServerMetadata,
  CredentialConfigurationSupported,
  CredentialDisplay,
  ClaimDisplay,
} from "./types/metadata.js";
export type {
  TokenRequest,
  TokenResponse,
  PreAuthorizedTokenRequest,
  AuthorizationCodeTokenRequest,
} from "./types/token.js";
export type {
  CredentialRequest,
  CredentialResponse,
  CredentialRequestProof,
} from "./types/credential.js";

// Modules
export { parseCredentialOfferUri, resolveCredentialOffer } from "./offer.js";
export {
  fetchIssuerMetadata,
  fetchAuthServerMetadata,
} from "./metadata.js";
export {
  buildAuthorizationUrl,
  pushAuthorizationRequest,
  parseAuthorizationResponse,
  generatePKCE,
} from "./authorization.js";
export type {
  PKCEParams,
  AuthorizationUrlParams,
  PARParams,
  PARResponse,
} from "./authorization.js";
export { requestToken } from "./token.js";
export { createJwtProof } from "./proof.js";
export type { ProofParams } from "./proof.js";
export {
  requestCredential,
  requestDeferredCredential,
} from "./credential.js";

// Client
export { OID4VCIClient } from "./client.js";
export type { OID4VCIClientConfig, ProcessedOffer } from "./client.js";

// Errors
export {
  OID4VCIError,
  InvalidOfferError,
  MetadataError,
  TokenError,
  CredentialError,
  IssuancePendingError,
} from "./utils/errors.js";
