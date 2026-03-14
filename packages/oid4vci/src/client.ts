import type { CredentialOffer } from "./types/offer.js";
import type {
  IssuerMetadata,
  AuthorizationServerMetadata,
  CredentialConfigurationSupported,
} from "./types/metadata.js";
import type { TokenResponse } from "./types/token.js";
import type { CredentialResponse } from "./types/credential.js";
import type { CryptoProvider, HttpClient } from "./types/common.js";
import { defaultHttpClient } from "./types/common.js";
import { resolveCredentialOffer } from "./offer.js";
import { fetchIssuerMetadata, fetchAuthServerMetadata } from "./metadata.js";
import {
  buildAuthorizationUrl,
  pushAuthorizationRequest,
  generatePKCE,
  type PKCEParams,
} from "./authorization.js";
import { requestToken } from "./token.js";
import { createJwtProof } from "./proof.js";
import { requestCredential, requestDeferredCredential } from "./credential.js";

export interface OID4VCIClientConfig {
  cryptoProvider: CryptoProvider;
  clientId?: string;
  redirectUri?: string;
  httpClient?: HttpClient;
}

export interface ProcessedOffer {
  offer: CredentialOffer;
  issuerMetadata: IssuerMetadata;
  authServerMetadata: AuthorizationServerMetadata;
  credentialConfigurations: Record<string, CredentialConfigurationSupported>;
  requiresPin: boolean;
  pinDescription?: string;
  pinInputMode?: "numeric" | "text";
  pinLength?: number;
}

export class OID4VCIClient {
  private cryptoProvider: CryptoProvider;
  private clientId: string;
  private redirectUri: string;
  private httpClient: HttpClient;

  constructor(config: OID4VCIClientConfig) {
    this.cryptoProvider = config.cryptoProvider;
    this.clientId = config.clientId || "";
    this.redirectUri = config.redirectUri || "";
    this.httpClient = config.httpClient || defaultHttpClient;
  }

  async processOffer(offerUri: string): Promise<ProcessedOffer> {
    const offer = await resolveCredentialOffer(offerUri, this.httpClient);
    const issuerMetadata = await fetchIssuerMetadata(
      offer.credential_issuer,
      this.httpClient
    );

    const authServer =
      issuerMetadata.authorization_servers?.[0] || offer.credential_issuer;
    const authServerMetadata = await fetchAuthServerMetadata(
      authServer,
      this.httpClient
    );

    const credentialConfigurations: Record<
      string,
      CredentialConfigurationSupported
    > = {};
    for (const id of offer.credential_configuration_ids) {
      const config = issuerMetadata.credential_configurations_supported[id];
      if (config) {
        credentialConfigurations[id] = config;
      }
    }

    const preAuthGrant =
      offer.grants?.[
        "urn:ietf:params:oauth:grant-type:pre-authorized_code"
      ];
    const txCode = preAuthGrant?.tx_code;

    return {
      offer,
      issuerMetadata,
      authServerMetadata,
      credentialConfigurations,
      requiresPin: !!txCode,
      pinDescription: txCode?.description,
      pinInputMode: txCode?.input_mode,
      pinLength: txCode?.length,
    };
  }

  async executePreAuthorizedFlow(
    processedOffer: ProcessedOffer,
    keyId: string,
    pin?: string
  ): Promise<CredentialResponse[]> {
    const preAuthGrant =
      processedOffer.offer.grants?.[
        "urn:ietf:params:oauth:grant-type:pre-authorized_code"
      ];

    if (!preAuthGrant) {
      throw new Error("Offer does not contain pre-authorized_code grant");
    }

    const resolvedScope = this.resolveScope(processedOffer);

    const tokenResponse = await requestToken(
      processedOffer.authServerMetadata.token_endpoint,
      {
        grant_type: "urn:ietf:params:oauth:grant-type:pre-authorized_code",
        "pre-authorized_code": preAuthGrant["pre-authorized_code"],
        tx_code: pin,
        ...(resolvedScope && { scope: resolvedScope }),
      },
      this.httpClient
    );

    return this.requestCredentials(
      processedOffer,
      tokenResponse,
      keyId
    );
  }

  async buildAuthorizationRequest(
    processedOffer: ProcessedOffer,
    scope?: string
  ): Promise<{ url: string; pkce: PKCEParams; state: string }> {
    const pkce = await generatePKCE();
    const state = crypto.randomUUID();

    // Collect scopes from credential configurations if not explicitly provided
    const resolvedScope = this.resolveScope(processedOffer, scope);

    const parEndpoint =
      processedOffer.authServerMetadata.pushed_authorization_request_endpoint;

    if (parEndpoint) {
      const issuerState =
        processedOffer.offer.grants?.authorization_code?.issuer_state;

      const parResponse = await pushAuthorizationRequest({
        parEndpoint,
        clientId: this.clientId,
        redirectUri: this.redirectUri,
        scope: resolvedScope || "openid",
        pkce,
        state,
        issuerState,
        httpClient: this.httpClient,
      });

      const url = buildAuthorizationUrl({
        authServerMetadata: processedOffer.authServerMetadata,
        clientId: this.clientId,
        redirectUri: this.redirectUri,
        credentialOffer: processedOffer.offer,
        pkce,
        state,
        requestUri: parResponse.request_uri,
      });

      return { url, pkce, state };
    }

    // Non-PAR fallback with scope
    const url = buildAuthorizationUrl({
      authServerMetadata: processedOffer.authServerMetadata,
      clientId: this.clientId,
      redirectUri: this.redirectUri,
      credentialOffer: processedOffer.offer,
      pkce,
      scope: resolvedScope,
      state,
    });

    return { url, pkce, state };
  }

  async completeAuthorizationFlow(
    processedOffer: ProcessedOffer,
    code: string,
    pkce: PKCEParams,
    keyId: string
  ): Promise<CredentialResponse[]> {
    const resolvedScope = this.resolveScope(processedOffer);

    const tokenResponse = await requestToken(
      processedOffer.authServerMetadata.token_endpoint,
      {
        grant_type: "authorization_code",
        code,
        redirect_uri: this.redirectUri,
        code_verifier: pkce.codeVerifier,
        ...(resolvedScope && { scope: resolvedScope }),
      },
      this.httpClient,
      this.clientId || undefined
    );

    return this.requestCredentials(
      processedOffer,
      tokenResponse,
      keyId
    );
  }

  async requestDeferredCredential(
    processedOffer: ProcessedOffer,
    accessToken: string,
    transactionId: string
  ): Promise<CredentialResponse> {
    const endpoint = processedOffer.issuerMetadata.deferred_credential_endpoint;
    if (!endpoint) {
      throw new Error("Issuer does not support deferred credential issuance");
    }

    return requestDeferredCredential(
      endpoint,
      accessToken,
      transactionId,
      this.httpClient
    );
  }

  private resolveScope(processedOffer: ProcessedOffer, scope?: string): string | undefined {
    return scope ||
      [...new Set(
        processedOffer.offer.credential_configuration_ids
          .map((id) => processedOffer.credentialConfigurations[id]?.scope)
          .filter(Boolean)
      )].join(" ") || undefined;
  }

  private async requestCredentials(
    processedOffer: ProcessedOffer,
    tokenResponse: TokenResponse,
    keyId: string
  ): Promise<CredentialResponse[]> {
    const results: CredentialResponse[] = [];
    let currentNonce = tokenResponse.c_nonce;

    for (const configId of processedOffer.offer.credential_configuration_ids) {
      const proof = await createJwtProof({
        cryptoProvider: this.cryptoProvider,
        keyId,
        issuer: processedOffer.offer.credential_issuer,
        clientId: this.clientId || undefined,
        nonce: currentNonce,
      });

      const response = await requestCredential(
        processedOffer.issuerMetadata.credential_endpoint,
        tokenResponse.access_token,
        {
          credential_identifier: configId,
          proof: {
            proof_type: "jwt",
            jwt: proof,
          },
        },
        this.httpClient
      );

      if (response.c_nonce) {
        currentNonce = response.c_nonce;
      }

      results.push(response);
    }

    return results;
  }
}
