export interface JWK {
  kty: string;
  crv?: string;
  x?: string;
  y?: string;
  kid?: string;
  use?: string;
  alg?: string;
  [key: string]: unknown;
}

export interface CryptoProvider {
  sign(data: Uint8Array, keyId: string): Promise<Uint8Array>;
  getPublicKeyJwk(keyId: string): Promise<JWK>;
}

export interface HttpClient {
  fetch(url: string, init?: RequestInit): Promise<Response>;
}

export const defaultHttpClient: HttpClient = {
  fetch: (url, init) => globalThis.fetch(url, init),
};
