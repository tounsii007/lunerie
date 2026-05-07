import { AppError } from '@/errors/appError';

interface RequestOptions extends RequestInit {
  timeoutMs?: number;
  query?: Record<string, string | number | undefined>;
}

export class HttpClient {
  constructor(
    private readonly baseUrl: string,
    private readonly defaultHeaders: Record<string, string> = {},
  ) {}

  async getJson<T>(path: string, schema: { parse: (value: unknown) => T }, options: RequestOptions = {}): Promise<T> {
    const { timeoutMs = 8000, query, headers, signal, ...rest } = options;
    const controller = new AbortController();
    const timeout = window.setTimeout(() => controller.abort(), timeoutMs);
    const mergedSignal = signal ?? controller.signal;

    const url = new URL(path, this.baseUrl);
    Object.entries(query ?? {}).forEach(([key, value]) => {
      if (value !== undefined) {
        url.searchParams.set(key, String(value));
      }
    });

    try {
      const response = await fetch(url.toString(), {
        ...rest,
        signal: mergedSignal,
        headers: {
          Accept: 'application/json',
          ...this.defaultHeaders,
          ...(headers as Record<string, string> | undefined),
        },
      });

      if (!response.ok) {
        throw new AppError({
          code: `HTTP_${response.status}`,
          message: `Request failed with status ${response.status}`,
          source: this.baseUrl,
          retryable: response.status >= 500 || response.status === 429,
        });
      }

      const raw = (await response.json()) as unknown;
      return schema.parse(raw);
    } finally {
      window.clearTimeout(timeout);
    }
  }
}
