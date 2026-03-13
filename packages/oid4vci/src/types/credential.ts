export interface CredentialRequestProof {
  proof_type: "jwt";
  jwt: string;
}

export interface CredentialRequest {
  credential_identifier?: string;
  format?: string;
  proof?: CredentialRequestProof;
  [key: string]: unknown;
}

export interface CredentialResponse {
  credential?: string;
  transaction_id?: string;
  c_nonce?: string;
  c_nonce_expires_in?: number;
}
