import '@testing-library/jest-dom/vitest';
import { afterEach } from 'vitest';

/**
 * jsdom 29 ships a Storage shim whose `setItem` is missing in some Node
 * configurations (Vitest 4 + jsdom 29). Replace `window.localStorage` /
 * `window.sessionStorage` with a deterministic in-memory polyfill so tests
 * around PersistentStore, preferences-context, and friends behave the same
 * regardless of the underlying jsdom version.
 */
function makeStorage(): Storage {
  const store = new Map<string, string>();
  return {
    get length() {
      return store.size;
    },
    key(index: number) {
      return Array.from(store.keys())[index] ?? null;
    },
    getItem(key: string) {
      return store.has(key) ? (store.get(key) as string) : null;
    },
    setItem(key: string, value: string) {
      store.set(key, String(value));
    },
    removeItem(key: string) {
      store.delete(key);
    },
    clear() {
      store.clear();
    },
  };
}

Object.defineProperty(globalThis, 'localStorage', { value: makeStorage(), configurable: true });
Object.defineProperty(globalThis, 'sessionStorage', { value: makeStorage(), configurable: true });

afterEach(() => {
  globalThis.localStorage.clear();
  globalThis.sessionStorage.clear();
});
