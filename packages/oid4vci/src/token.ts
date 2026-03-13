import type { TokenRequest, TokenResponse } from "./types/token.js";
import type { HttpClient } from "./types/common.js";
import { defaultHttpClient } from "./types/common.js";
import { TokenError } from "./utils/errors.js";

export async function requestToken(
  tokenEndpoint: string,
  tokenRequest: TokenRequest,
  httpClient: HttpClient = defaultHttpClient
): Promise<TokenResponse> {
  const body = new URLSearchParams();

  body.set("grant_type", tokenRequest.grant_type);

  if (tokenRequest.grant_type === "urn:ietf:params:oauth:grant-type:pre-authorized_code") {
    body.set("pre-authorized_code", tokenRequest["pre-authorized_code"]);
    if (tokenRequest.tx_code) {
      body.set("tx_code", tokenRequest.tx_code);
    }
  } else if (tokenRequest.grant_type === "authorization_code") {
    body.set("code", tokenRequest.code);
    body.set("redirect_uri", tokenRequest.redirect_uri);
    if (tokenRequest.code_verifier) {
      body.set("code_verifier", tokenRequest.code_verifier);
    }
  }

  const response = await httpClient.fetch(tokenEndpoint, {
    method: "POST",
    headers: {
      "Content-Type": "application/x-www-form-urlencoded",
    },
    body: body.toString(),
  });

  if (!response.ok) {
    let errorBody: { error?: string; error_description?: string } | undefined;
    try {
      errorBody = await response.json();
    } catch {
      // ignore parse errors
    }

    throw new TokenError(
      errorBody?.error_description || `Token request failed: ${response.status}`,
      errorBody?.error || "token_error",
      response.status
    );
  }

  return (await response.json()) as TokenResponse;
}
