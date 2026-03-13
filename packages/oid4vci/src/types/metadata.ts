export interface CredentialDisplay {
  name: string;
  locale?: string;
  logo?: {
    uri: string;
    alt_text?: string;
  };
  description?: string;
  background_color?: string;
  background_image?: {
    uri: string;
  };
  text_color?: string;
}

export interface ClaimDisplay {
  name?: string;
  locale?: string;
}

export interface CredentialConfigurationSupported {
  format: string;
  scope?: string;
  cryptographic_binding_methods_supported?: string[];
  credential_signing_alg_values_supported?: string[];
  proof_types_supported?: {
    jwt?: {
      proof_signing_alg_values_supported: string[];
    };
  };
  display?: CredentialDisplay[];
  claims?: Record<string, { display?: ClaimDisplay[]; mandatory?: boolean }>;
  [key: string]: unknown;
}

export interface IssuerMetadata {
  credential_issuer: string;
  credential_endpoint: string;
  deferred_credential_endpoint?: string;
  credential_configurations_supported: Record<
    string,
    CredentialConfigurationSupported
  >;
  display?: {
    name?: string;
    locale?: string;
    logo?: { uri: string; alt_text?: string };
  }[];
  authorization_servers?: string[];
  [key: string]: unknown;
}

export interface AuthorizationServerMetadata {
  issuer: string;
  authorization_endpoint: string;
  token_endpoint: string;
  pushed_authorization_request_endpoint?: string;
  code_challenge_methods_supported?: string[];
  [key: string]: unknown;
}
