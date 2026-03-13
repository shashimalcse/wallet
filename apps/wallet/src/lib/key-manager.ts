"use client";

import { openDB, type IDBPDatabase } from "idb";
import type { CryptoProvider, JWK } from "@wallet/oid4vci";

const DB_NAME = "wallet-keys";
const DB_VERSION = 1;
const KEYS_STORE = "keys";

interface StoredKeyPair {
  id: string;
  privateKey: CryptoKey;
  publicKey: CryptoKey;
  createdAt: number;
}

let dbPromise: Promise<IDBPDatabase> | null = null;

function getDB() {
  if (!dbPromise) {
    dbPromise = openDB(DB_NAME, DB_VERSION, {
      upgrade(db) {
        if (!db.objectStoreNames.contains(KEYS_STORE)) {
          db.createObjectStore(KEYS_STORE, { keyPath: "id" });
        }
      },
    });
  }
  return dbPromise;
}

export async function generateKeyPair(keyId?: string): Promise<string> {
  const id = keyId || crypto.randomUUID();

  const keyPair = await crypto.subtle.generateKey(
    { name: "ECDSA", namedCurve: "P-256" },
    false, // non-extractable
    ["sign", "verify"]
  );

  const db = await getDB();
  await db.put(KEYS_STORE, {
    id,
    privateKey: keyPair.privateKey,
    publicKey: keyPair.publicKey,
    createdAt: Date.now(),
  } satisfies StoredKeyPair);

  return id;
}

async function getKeyPair(keyId: string): Promise<StoredKeyPair> {
  const db = await getDB();
  const stored = await db.get(KEYS_STORE, keyId);
  if (!stored) {
    throw new Error(`Key pair not found: ${keyId}`);
  }
  return stored as StoredKeyPair;
}

export async function deleteKeyPair(keyId: string): Promise<void> {
  const db = await getDB();
  await db.delete(KEYS_STORE, keyId);
}

function arrayBufferToBase64url(buffer: ArrayBuffer): string {
  const bytes = new Uint8Array(buffer);
  let binary = "";
  for (let i = 0; i < bytes.length; i++) {
    binary += String.fromCharCode(bytes[i]);
  }
  return btoa(binary).replace(/\+/g, "-").replace(/\//g, "_").replace(/=+$/, "");
}

export function createCryptoProvider(): CryptoProvider {
  return {
    async sign(data: Uint8Array, keyId: string): Promise<Uint8Array> {
      const keyPair = await getKeyPair(keyId);
      const signature = await crypto.subtle.sign(
        { name: "ECDSA", hash: "SHA-256" },
        keyPair.privateKey,
        data
      );
      return new Uint8Array(signature);
    },

    async getPublicKeyJwk(keyId: string): Promise<JWK> {
      const keyPair = await getKeyPair(keyId);
      const exported = await crypto.subtle.exportKey("jwk", keyPair.publicKey);
      return {
        kty: exported.kty!,
        crv: exported.crv,
        x: exported.x,
        y: exported.y,
      };
    },
  };
}
