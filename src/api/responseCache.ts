import { z } from 'zod';

const CacheEnvelopeSchema = z.object({
  expiresAt: z.number(),
  value: z.unknown(),
});

export class ResponseCache {
  constructor(private readonly namespace: string) {}

  private key(key: string): string {
    return `${this.namespace}:${key}`;
  }

  read<T>(key: string, schema: z.ZodType<T>): T | null {
    try {
      const raw = window.localStorage.getItem(this.key(key));
      if (!raw) {
        return null;
      }

      const parsed = CacheEnvelopeSchema.parse(JSON.parse(raw));
      if (parsed.expiresAt < Date.now()) {
        window.localStorage.removeItem(this.key(key));
        return null;
      }

      return schema.parse(parsed.value);
    } catch {
      return null;
    }
  }

  write<T>(key: string, value: T, ttlMs: number): void {
    try {
      window.localStorage.setItem(
        this.key(key),
        JSON.stringify({
          expiresAt: Date.now() + ttlMs,
          value,
        }),
      );
    } catch {
      return;
    }
  }
}
