export interface PreAuthorizedTokenRequest {
  grant_type: "urn:ietf:params:oauth:grant-type:pre-authorized_code";
  "pre-authorized_code": string;
  tx_code?: string;
  scope?: string;
}

export interface AuthorizationCodeTokenRequest {
  grant_type: "authorization_code";
  code: string;
  redirect_uri: string;
  code_verifier?: string;
  scope?: string;
}

export type TokenRequest =
  | PreAuthorizedTokenRequest
  | AuthorizationCodeTokenRequest;

export interface TokenResponse {
  access_token: string;
  token_type: string;
  expires_in?: number;
  c_nonce?: string;
  c_nonce_expires_in?: number;
  authorization_details?: Array<{
    type: string;
    credential_configuration_id?: string;
    [key: string]: unknown;
  }>;
}
