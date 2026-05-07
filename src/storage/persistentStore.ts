import { z } from 'zod';

interface StoredEnvelope<T> {
  version: number;
  value: T;
}

export class PersistentStore<T> {
  constructor(
    private readonly key: string,
    private readonly schema: z.ZodType<T>,
    private readonly version: number,
    private readonly fallback: T,
  ) {}

  read(): T {
    try {
      const raw = window.localStorage.getItem(this.key);
      if (!raw) {
        return this.fallback;
      }

      const parsed = JSON.parse(raw) as StoredEnvelope<unknown>;
      if (parsed.version !== this.version) {
        return this.fallback;
      }

      return this.schema.parse(parsed.value);
    } catch {
      return this.fallback;
    }
  }

  write(value: T): void {
    const safeValue = this.schema.parse(value);
    const payload: StoredEnvelope<T> = { version: this.version, value: safeValue };
    window.localStorage.setItem(this.key, JSON.stringify(payload));
  }
}
