import { useCallback, useEffect, useState } from 'react';

interface Options<T> {
  serialize?: (value: T) => string;
  deserialize?: (raw: string) => T;
  /** Called when reading fails; falls back to {@code initial}. */
  onError?: (error: unknown) => void;
}

/**
 * Persistent React state backed by {@code localStorage}. Reads on mount, writes
 * on change, and listens to {@code storage} events to stay in sync across tabs.
 *
 * @example
 *   const [theme, setTheme] = useLocalStorageState('lunerie/theme', 'dark');
 */
export function useLocalStorageState<T>(
  key: string,
  initial: T,
  options: Options<T> = {},
): [T, (value: T | ((current: T) => T)) => void, () => void] {
  const serialize = options.serialize ?? JSON.stringify;
  const deserialize = (options.deserialize ?? JSON.parse) as (raw: string) => T;

  const read = useCallback((): T => {
    if (typeof window === 'undefined') return initial;
    try {
      const raw = window.localStorage.getItem(key);
      return raw == null ? initial : deserialize(raw);
    } catch (error) {
      options.onError?.(error);
      return initial;
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [key]);

  const [value, setValue] = useState<T>(read);

  const write = useCallback((next: T | ((current: T) => T)) => {
    setValue((prev) => {
      const resolved = typeof next === 'function' ? (next as (current: T) => T)(prev) : next;
      try {
        window.localStorage.setItem(key, serialize(resolved));
      } catch (error) {
        options.onError?.(error);
      }
      return resolved;
    });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [key]);

  const reset = useCallback(() => {
    try {
      window.localStorage.removeItem(key);
    } catch (error) {
      options.onError?.(error);
    }
    setValue(initial);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [key]);

  useEffect(() => {
    const handler = (event: StorageEvent) => {
      if (event.key !== key) return;
      setValue(read());
    };
    window.addEventListener('storage', handler);
    return () => window.removeEventListener('storage', handler);
  }, [key, read]);

  return [value, write, reset];
}
