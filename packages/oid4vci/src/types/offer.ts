export interface CredentialOfferGrants {
  authorization_code?: {
    issuer_state?: string;
    authorization_server?: string;
  };
  "urn:ietf:params:oauth:grant-type:pre-authorized_code"?: {
    "pre-authorized_code": string;
    tx_code?: {
      input_mode?: "numeric" | "text";
      length?: number;
      description?: string;
    };
    authorization_server?: string;
  };
}

export interface CredentialOffer {
  credential_issuer: string;
  credential_configuration_ids: string[];
  grants?: CredentialOfferGrants;
}
