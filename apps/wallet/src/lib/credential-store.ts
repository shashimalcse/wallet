"use client";

import { openDB, type IDBPDatabase } from "idb";

const DB_NAME = "wallet-credentials";
const DB_VERSION = 1;
const CREDENTIALS_STORE = "credentials";

export interface StoredCredential {
  id: string;
  rawCredential: string;
  format: string;
  credentialConfigurationId: string;
  issuer: string;
  issuerDisplay?: {
    name?: string;
    logo?: string;
  };
  display?: {
    name: string;
    description?: string;
    backgroundColor?: string;
    textColor?: string;
    logo?: string;
  };
  claims: Record<string, unknown>;
  issuedAt: number;
  expiresAt?: number;
}

let dbPromise: Promise<IDBPDatabase> | null = null;

function getDB() {
  if (!dbPromise) {
    dbPromise = openDB(DB_NAME, DB_VERSION, {
      upgrade(db) {
        if (!db.objectStoreNames.contains(CREDENTIALS_STORE)) {
          db.createObjectStore(CREDENTIALS_STORE, { keyPath: "id" });
        }
      },
    });
  }
  return dbPromise;
}

export async function getAllCredentials(): Promise<StoredCredential[]> {
  const db = await getDB();
  return db.getAll(CREDENTIALS_STORE);
}

export async function getCredential(
  id: string
): Promise<StoredCredential | undefined> {
  const db = await getDB();
  return db.get(CREDENTIALS_STORE, id);
}

export async function saveCredential(
  credential: StoredCredential
): Promise<void> {
  const db = await getDB();
  await db.put(CREDENTIALS_STORE, credential);
}

export async function deleteCredential(id: string): Promise<void> {
  const db = await getDB();
  await db.delete(CREDENTIALS_STORE, id);
}

export async function clearAllCredentials(): Promise<void> {
  const db = await getDB();
  await db.clear(CREDENTIALS_STORE);
}
