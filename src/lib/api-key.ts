"use client";

import { useCallback, useEffect, useState } from "react";

export const STORAGE_KEY = "bonsai.anthropic_api_key";
export const HEADER_NAME = "x-anthropic-key";

export function getStoredApiKey(): string | null {
  if (typeof window === "undefined") return null;
  try {
    return window.localStorage.getItem(STORAGE_KEY);
  } catch {
    return null;
  }
}

export function apiKeyHeader(): Record<string, string> {
  const k = getStoredApiKey();
  return k ? { [HEADER_NAME]: k } : {};
}

export function maskApiKey(key: string): string {
  if (key.length <= 11) return "••••" + key.slice(-4);
  return `${key.slice(0, 7)}…${key.slice(-4)}`;
}

export function useApiKey() {
  const [apiKey, setApiKeyState] = useState<string | null>(null);
  const [hydrated, setHydrated] = useState(false);

  useEffect(() => {
    setApiKeyState(getStoredApiKey());
    setHydrated(true);
    function onStorage(e: StorageEvent) {
      if (e.key === STORAGE_KEY) setApiKeyState(e.newValue);
    }
    window.addEventListener("storage", onStorage);
    return () => window.removeEventListener("storage", onStorage);
  }, []);

  const setApiKey = useCallback((key: string | null) => {
    if (typeof window === "undefined") return;
    try {
      if (key) {
        window.localStorage.setItem(STORAGE_KEY, key);
      } else {
        window.localStorage.removeItem(STORAGE_KEY);
      }
    } catch {
      /* quota or privacy mode — silently ignore */
    }
    setApiKeyState(key);
  }, []);

  return { apiKey, setApiKey, hydrated };
}
