"use client";

import { useState, useEffect, useCallback } from "react";
import {
  getAllCredentials,
  saveCredential,
  deleteCredential as deleteFromStore,
  clearAllCredentials,
  type StoredCredential,
} from "@/lib/credential-store";

export function useCredentials() {
  const [credentials, setCredentials] = useState<StoredCredential[]>([]);
  const [loading, setLoading] = useState(true);

  const refresh = useCallback(async () => {
    try {
      const creds = await getAllCredentials();
      setCredentials(creds.sort((a, b) => b.issuedAt - a.issuedAt));
    } catch (error) {
      console.error("Failed to load credentials:", error);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    refresh();
  }, [refresh]);

  const addCredential = useCallback(
    async (credential: StoredCredential) => {
      await saveCredential(credential);
      await refresh();
    },
    [refresh]
  );

  const removeCredential = useCallback(
    async (id: string) => {
      await deleteFromStore(id);
      await refresh();
    },
    [refresh]
  );

  const clearAll = useCallback(async () => {
    await clearAllCredentials();
    await refresh();
  }, [refresh]);

  return { credentials, loading, addCredential, removeCredential, clearAll, refresh };
}
