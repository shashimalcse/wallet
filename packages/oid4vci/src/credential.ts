import type {
  CredentialRequest,
  CredentialResponse,
} from "./types/credential.js";
import type { HttpClient } from "./types/common.js";
import { defaultHttpClient } from "./types/common.js";
import { CredentialError, IssuancePendingError } from "./utils/errors.js";

export async function requestCredential(
  credentialEndpoint: string,
  accessToken: string,
  credentialRequest: CredentialRequest,
  httpClient: HttpClient = defaultHttpClient
): Promise<CredentialResponse> {
  const response = await httpClient.fetch(credentialEndpoint, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${accessToken}`,
    },
    body: JSON.stringify(credentialRequest),
  });

  if (!response.ok) {
    let errorBody: { error?: string; error_description?: string } | undefined;
    try {
      errorBody = await response.json();
    } catch {
      // ignore
    }

    throw new CredentialError(
      errorBody?.error_description ||
        `Credential request failed: ${response.status}`,
      errorBody?.error || "credential_error",
      response.status
    );
  }

  return (await response.json()) as CredentialResponse;
}

export async function requestDeferredCredential(
  deferredEndpoint: string,
  accessToken: string,
  transactionId: string,
  httpClient: HttpClient = defaultHttpClient
): Promise<CredentialResponse> {
  const response = await httpClient.fetch(deferredEndpoint, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${accessToken}`,
    },
    body: JSON.stringify({ transaction_id: transactionId }),
  });

  if (!response.ok) {
    let errorBody: {
      error?: string;
      error_description?: string;
      interval?: number;
    } | undefined;
    try {
      errorBody = await response.json();
    } catch {
      // ignore
    }

    if (errorBody?.error === "issuance_pending") {
      throw new IssuancePendingError(transactionId, errorBody.interval);
    }

    throw new CredentialError(
      errorBody?.error_description ||
        `Deferred credential request failed: ${response.status}`,
      errorBody?.error || "credential_error",
      response.status
    );
  }

  return (await response.json()) as CredentialResponse;
}
