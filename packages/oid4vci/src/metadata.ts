import type {
  IssuerMetadata,
  AuthorizationServerMetadata,
} from "./types/metadata.js";
import type { HttpClient } from "./types/common.js";
import { defaultHttpClient } from "./types/common.js";
import { MetadataError } from "./utils/errors.js";

export async function fetchIssuerMetadata(
  credentialIssuer: string,
  httpClient: HttpClient = defaultHttpClient
): Promise<IssuerMetadata> {
  const url = `${credentialIssuer.replace(/\/$/, "")}/.well-known/openid-credential-issuer`;

  const response = await httpClient.fetch(url);
  if (!response.ok) {
    throw new MetadataError(
      `Failed to fetch issuer metadata: ${response.status}`,
      response.status
    );
  }

  const metadata = (await response.json()) as IssuerMetadata;

  if (!metadata.credential_issuer) {
    throw new MetadataError("Invalid issuer metadata: missing credential_issuer");
  }
  if (!metadata.credential_endpoint) {
    throw new MetadataError("Invalid issuer metadata: missing credential_endpoint");
  }
  if (!metadata.credential_configurations_supported) {
    throw new MetadataError(
      "Invalid issuer metadata: missing credential_configurations_supported"
    );
  }

  return metadata;
}

export async function fetchAuthServerMetadata(
  authorizationServer: string,
  httpClient: HttpClient = defaultHttpClient
): Promise<AuthorizationServerMetadata> {
  const baseUrl = authorizationServer.replace(/\/$/, "");

  // Try OAuth 2.0 Authorization Server Metadata first
  const oauthUrl = `${baseUrl}/.well-known/oauth-authorization-server`;
  let response = await httpClient.fetch(oauthUrl);

  if (!response.ok) {
    // Fallback to OpenID Connect Discovery
    const oidcUrl = `${baseUrl}/.well-known/openid-configuration`;
    response = await httpClient.fetch(oidcUrl);
  }

  if (!response.ok) {
    throw new MetadataError(
      `Failed to fetch authorization server metadata: ${response.status}`,
      response.status
    );
  }

  const metadata = (await response.json()) as AuthorizationServerMetadata;

  if (!metadata.token_endpoint) {
    throw new MetadataError(
      "Invalid authorization server metadata: missing token_endpoint"
    );
  }

  return metadata;
}
