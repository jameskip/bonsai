"use client";

import { useCallback, useSyncExternalStore } from "react";

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

function subscribeStorage(callback: () => void) {
  if (typeof window === "undefined") return () => {};
  window.addEventListener("storage", callback);
  return () => window.removeEventListener("storage", callback);
}

function noopSubscribe() {
  return () => {};
}

const trueOnClient = () => true;
const falseOnServer = () => false;
const nullOnServer = () => null;

export function useApiKey() {
  const apiKey = useSyncExternalStore(
    subscribeStorage,
    getStoredApiKey,
    nullOnServer
  );
  const hydrated = useSyncExternalStore(
    noopSubscribe,
    trueOnClient,
    falseOnServer
  );

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
    // localStorage.setItem fires storage events only in *other* tabs.
    // Dispatch a synthetic event so this tab's subscribers re-read.
    window.dispatchEvent(
      new StorageEvent("storage", { key: STORAGE_KEY, newValue: key })
    );
  }, []);

  return { apiKey, setApiKey, hydrated };
}
