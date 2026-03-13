export class OID4VCIError extends Error {
  constructor(
    message: string,
    public readonly code: string,
    public readonly statusCode?: number
  ) {
    super(message);
    this.name = "OID4VCIError";
  }
}

export class InvalidOfferError extends OID4VCIError {
  constructor(message: string) {
    super(message, "invalid_credential_offer");
    this.name = "InvalidOfferError";
  }
}

export class MetadataError extends OID4VCIError {
  constructor(message: string, statusCode?: number) {
    super(message, "metadata_error", statusCode);
    this.name = "MetadataError";
  }
}

export class TokenError extends OID4VCIError {
  constructor(message: string, code: string = "token_error", statusCode?: number) {
    super(message, code, statusCode);
    this.name = "TokenError";
  }
}

export class CredentialError extends OID4VCIError {
  constructor(message: string, code: string = "credential_error", statusCode?: number) {
    super(message, code, statusCode);
    this.name = "CredentialError";
  }
}

export class IssuancePendingError extends OID4VCIError {
  constructor(
    public readonly transactionId: string,
    public readonly retryInterval?: number
  ) {
    super("Credential issuance is pending", "issuance_pending");
    this.name = "IssuancePendingError";
  }
}
