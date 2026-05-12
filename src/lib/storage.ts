function hasStorage(): boolean {
  try {
    return typeof globalThis !== 'undefined' && typeof globalThis.localStorage !== 'undefined';
  } catch {
    return false;
  }
}

export function readJSON<T>(key: string, fallback: T): T {
  if (!hasStorage()) return fallback;
  const raw = localStorage.getItem(key);
  if (raw === null) return fallback;
  try {
    return JSON.parse(raw) as T;
  } catch {
    return fallback;
  }
}

export function writeJSON(key: string, value: unknown): void {
  if (!hasStorage()) return;
  try {
    localStorage.setItem(key, JSON.stringify(value));
  } catch {
    // quota or serialization failure — swallow; caller can't recover
  }
}

export function removeKey(key: string): void {
  if (!hasStorage()) return;
  localStorage.removeItem(key);
}
