/**
 * Typed client for the Lunerie backend (Spring Boot @ /api).
 *
 * - JSON-only, fetch-based, no third-party deps.
 * - Bearer-token auth with automatic refresh via the /api/auth/refresh rotation flow.
 * - Tokens are persisted to localStorage so the SPA survives reloads.
 * - Network/parse errors surface as `LunerieApiError`.
 * - Every request carries a W3C `traceparent` header so backend traces
 *   inherit the frontend trace id (see {@link ../tracing}).
 */

import { buildTraceparent } from '@/api/tracing';

const TOKEN_STORAGE_KEY = 'lunerie/auth-tokens-v1';

const RESOLVED_BASE_URL = (() => {
  const env = (import.meta as ImportMetaWithEnv).env;
  if (env?.VITE_LUNERIE_API_URL) return env.VITE_LUNERIE_API_URL.replace(/\/$/, '');
  return 'http://localhost:8080';
})();

type ImportMetaWithEnv = ImportMeta & { env?: { VITE_LUNERIE_API_URL?: string } };

export class LunerieApiError extends Error {
  constructor(
    public readonly status: number,
    public readonly code: string,
    message: string,
    public readonly path?: string,
    public readonly violations?: Array<{ field: string; message: string; rejectedValue: unknown }>,
    public readonly requestId?: string,
    public readonly retryAfterSeconds?: number,
  ) {
    super(message);
    this.name = 'LunerieApiError';
  }
}

interface AuthTokens {
  tokenType: string;
  accessToken: string;
  accessTokenExpiresInSeconds: number;
  refreshToken: string;
  refreshTokenExpiresInSeconds: number;
  user: { id: string; email: string; displayName: string; roles: string[] };
}

interface StoredTokens extends AuthTokens {
  /** Wall-clock ms when the access token will expire. */
  accessTokenExpiresAt: number;
  refreshTokenExpiresAt: number;
}

/** Strip the refresh token before persisting — it lives in the HttpOnly cookie. */
function redactForStorage(tokens: StoredTokens): StoredTokens {
  return { ...tokens, refreshToken: '' };
}

type Listener = (tokens: StoredTokens | null) => void;

class TokenStore {
  private current: StoredTokens | null = readFromStorage();
  private listeners = new Set<Listener>();

  get tokens(): StoredTokens | null {
    return this.current;
  }

  set(tokens: AuthTokens | null): void {
    if (!tokens) {
      this.current = null;
      writeToStorage(null);
    } else {
      const now = Date.now();
      this.current = {
        ...tokens,
        accessTokenExpiresAt: now + tokens.accessTokenExpiresInSeconds * 1000,
        refreshTokenExpiresAt: now + tokens.refreshTokenExpiresInSeconds * 1000,
      };
      writeToStorage(this.current);
    }
    this.listeners.forEach((listener) => listener(this.current));
  }

  subscribe(listener: Listener): () => void {
    this.listeners.add(listener);
    return () => this.listeners.delete(listener);
  }
}

function readFromStorage(): StoredTokens | null {
  if (typeof window === 'undefined') return null;
  try {
    const raw = window.localStorage.getItem(TOKEN_STORAGE_KEY);
    return raw ? (JSON.parse(raw) as StoredTokens) : null;
  } catch {
    return null;
  }
}

function writeToStorage(tokens: StoredTokens | null): void {
  if (typeof window === 'undefined') return;
  if (!tokens) window.localStorage.removeItem(TOKEN_STORAGE_KEY);
  else window.localStorage.setItem(TOKEN_STORAGE_KEY, JSON.stringify(redactForStorage(tokens)));
}

const tokenStore = new TokenStore();

// Multi-tab sync: when another tab updates the token store, propagate.
if (typeof window !== 'undefined') {
  window.addEventListener('storage', (event) => {
    if (event.key !== TOKEN_STORAGE_KEY) return;
    const fromOther = readFromStorage();
    const here = tokenStore.tokens;
    if (JSON.stringify(fromOther) !== JSON.stringify(here)) {
      // Re-write through the store so subscribers fire
      tokenStore.set(fromOther ? {
        tokenType: fromOther.tokenType,
        accessToken: fromOther.accessToken,
        accessTokenExpiresInSeconds: Math.max(0, Math.round((fromOther.accessTokenExpiresAt - Date.now()) / 1000)),
        refreshToken: '',
        refreshTokenExpiresInSeconds: Math.max(0, Math.round((fromOther.refreshTokenExpiresAt - Date.now()) / 1000)),
        user: fromOther.user,
      } : null);
    }
  });
}

export interface RequestOptions {
  method?: string;
  body?: unknown;
  query?: Record<string, string | number | boolean | null | undefined>;
  headers?: Record<string, string>;
  signal?: AbortSignal;
  auth?: 'required' | 'optional' | 'none';
  timeoutMs?: number;
}

let refreshInflight: Promise<StoredTokens | null> | null = null;

async function refreshAccessToken(): Promise<StoredTokens | null> {
  if (refreshInflight) return refreshInflight;

  refreshInflight = (async () => {
    try {
      // Refresh token lives in an HttpOnly cookie; no body payload needed.
      const next = await rawJson<AuthTokens>('/api/auth/refresh', {
        method: 'POST',
        auth: 'none',
      });
      tokenStore.set(next);
      return tokenStore.tokens;
    } catch (error) {
      if (error instanceof LunerieApiError && (error.status === 401 || error.status === 400)) {
        tokenStore.set(null);
      }
      throw error;
    } finally {
      refreshInflight = null;
    }
  })();
  return refreshInflight;
}

async function rawJson<T>(path: string, options: RequestOptions = {}): Promise<T> {
  const url = buildUrl(path, options.query);
  const controller = new AbortController();
  const timeout = options.timeoutMs ?? 12000;
  const timer = window.setTimeout(() => controller.abort(), timeout);
  const linkedSignal = mergeSignals(options.signal, controller.signal);

  const headers: Record<string, string> = {
    Accept: 'application/json',
    ...(options.headers ?? {}),
  };
  if (options.body !== undefined && !(options.body instanceof FormData)) {
    headers['Content-Type'] = 'application/json';
  }
  // W3C TraceContext propagation — backend's Micrometer Tracing picks this up
  // and the resulting span becomes a child of the frontend trace.
  if (!headers['traceparent']) {
    headers['traceparent'] = buildTraceparent().header;
  }

  const tokens = tokenStore.tokens;
  if (options.auth !== 'none' && tokens?.accessToken) {
    headers.Authorization = `${tokens.tokenType} ${tokens.accessToken}`;
  } else if (options.auth === 'required') {
    throw new LunerieApiError(401, 'UNAUTHENTICATED', 'Authentication required');
  }

  let response: Response;
  try {
    response = await fetch(url, {
      method: options.method ?? 'GET',
      headers,
      body: serializeBody(options.body),
      signal: linkedSignal,
      // Send cookies so the HttpOnly refresh-token cookie reaches /api/auth/*.
      credentials: 'include',
    });
  } catch (error) {
    window.clearTimeout(timer);
    throw new LunerieApiError(0, 'NETWORK_ERROR', (error as Error).message ?? 'Network error');
  } finally {
    window.clearTimeout(timer);
  }

  if (response.status === 204) {
    return undefined as unknown as T;
  }

  const text = await response.text();
  let payload: unknown = undefined;
  if (text) {
    try {
      payload = JSON.parse(text);
    } catch {
      // non-JSON; return raw text under data field
      payload = { raw: text };
    }
  }

  if (!response.ok) {
    const errBody =
      (payload as {
        code?: string;
        message?: string;
        path?: string;
        violations?: [];
        requestId?: string;
        retryAfterSeconds?: number;
      } | undefined) ?? {};
    const retryAfterHeader = response.headers.get('Retry-After');
    const retryAfter = errBody.retryAfterSeconds
      ?? (retryAfterHeader ? Number.parseInt(retryAfterHeader, 10) : undefined);
    throw new LunerieApiError(
      response.status,
      errBody.code ?? `HTTP_${response.status}`,
      errBody.message ?? `Request failed (${response.status})`,
      errBody.path,
      errBody.violations,
      errBody.requestId ?? response.headers.get('X-Request-Id') ?? undefined,
      Number.isFinite(retryAfter) ? retryAfter : undefined,
    );
  }

  return payload as T;
}

function serializeBody(body: unknown): BodyInit | null {
  if (body === undefined) return null;
  if (body instanceof FormData) return body;
  return JSON.stringify(body);
}

function buildUrl(path: string, query?: RequestOptions['query']): string {
  const url = new URL(path, RESOLVED_BASE_URL);
  for (const [key, value] of Object.entries(query ?? {})) {
    if (value === undefined || value === null) continue;
    url.searchParams.set(key, String(value));
  }
  return url.toString();
}

function mergeSignals(...signals: Array<AbortSignal | undefined>): AbortSignal {
  const usable = signals.filter(Boolean) as AbortSignal[];
  if (usable.length === 1) return usable[0];
  const controller = new AbortController();
  for (const s of usable) {
    if (s.aborted) {
      controller.abort();
      break;
    }
    s.addEventListener('abort', () => controller.abort(), { once: true });
  }
  return controller.signal;
}

/** Public client with auto-refresh. */
export async function api<T>(path: string, options: RequestOptions = {}): Promise<T> {
  try {
    return await rawJson<T>(path, options);
  } catch (error) {
    if (
      error instanceof LunerieApiError &&
      error.status === 401 &&
      options.auth !== 'none' &&
      tokenStore.tokens // had been authenticated; refresh cookie may still be valid
    ) {
      const refreshed = await refreshAccessToken();
      if (refreshed) {
        return rawJson<T>(path, options);
      }
    }
    throw error;
  }
}

export interface PageResponse<T> {
  items: T[];
  page: number;
  size: number;
  total: number;
  totalPages: number;
  first: boolean;
  last: boolean;
}

export const auth = {
  async login(email: string, password: string) {
    const tokens = await api<AuthTokens>('/api/auth/login', {
      method: 'POST',
      body: { email, password },
      auth: 'none',
    });
    tokenStore.set(tokens);
    return tokens;
  },
  async register(email: string, password: string, displayName: string) {
    const tokens = await api<AuthTokens>('/api/auth/register', {
      method: 'POST',
      body: { email, password, displayName },
      auth: 'none',
    });
    tokenStore.set(tokens);
    return tokens;
  },
  async logout() {
    try {
      await api<void>('/api/auth/logout', { method: 'POST', auth: 'none' });
    } catch {
      // best-effort
    } finally {
      tokenStore.set(null);
    }
  },
  async logoutAll() {
    await api<void>('/api/auth/logout-all', { method: 'POST', auth: 'required' });
    tokenStore.set(null);
  },
  async me() {
    return api<AuthTokens['user']>('/api/auth/me', { auth: 'required' });
  },
  isAuthenticated(): boolean {
    return !!tokenStore.tokens?.accessToken;
  },
  current(): StoredTokens | null {
    return tokenStore.tokens;
  },
  subscribe(listener: Listener) {
    return tokenStore.subscribe(listener);
  },

  /* Verification + password reset */
  sendVerificationEmail() {
    return api<void>('/api/auth/verification/send', { method: 'POST', auth: 'required' });
  },
  confirmEmail(token: string) {
    return api<void>('/api/auth/verification/confirm', { method: 'POST', body: { token }, auth: 'none' });
  },
  forgotPassword(email: string) {
    return api<void>('/api/auth/password/forgot', { method: 'POST', body: { email }, auth: 'none' });
  },
  resetPassword(token: string, newPassword: string) {
    return api<void>('/api/auth/password/reset', { method: 'POST', body: { token, newPassword }, auth: 'none' });
  },
};

/* ------------------------------------------------------------------------- *
 * Typed places client — runtime-validated via zod for safety.
 * ------------------------------------------------------------------------- */

import {
  CountrySummarySchema,
  PageResponseSchema,
  PlaceDetailSchema,
  PlaceSummarySchema,
  type CountrySummary,
  type PlaceDetail,
  type PlaceSummary,
} from '@/api/lunerie/schemas';
import { z } from 'zod';

const PlacePageSchema = PageResponseSchema(PlaceSummarySchema);
const CountryPageSchema = PageResponseSchema(CountrySummarySchema);

async function parseOrLog<T>(schema: { parse: (raw: unknown) => T }, value: unknown): Promise<T> {
  try {
    return schema.parse(value);
  } catch (error) {
    // eslint-disable-next-line no-console
    console.warn('lunerieClient.parseError', error);
    return value as T;
  }
}

export const places = {
  list: async (params: Record<string, unknown> = {}) =>
    parseOrLog(PlacePageSchema, await api('/api/places', { query: params as RequestOptions['query'] })),
  count: () => api<{ total: number }>('/api/places/count'),
  categories: () => api<string[]>('/api/places/categories'),
  stats: () => api<unknown>('/api/places/stats'),
  explore: async (page = 0, size = 24) =>
    parseOrLog(PlacePageSchema, await api('/api/places/explore', { query: { page, size } })),
  search: async (q: string, params: Record<string, unknown> = {}) =>
    parseOrLog(PlacePageSchema, await api('/api/places/search', { query: { q, ...params } as RequestOptions['query'] })),
  fts: async (q: string, page = 0, size = 24) =>
    parseOrLog(PlacePageSchema, await api('/api/places/fts', { query: { q, page, size } })),
  nearby: async (lat: number, lon: number, radiusKm = 80, limit = 20) =>
    parseOrLog(z.array(PlaceSummarySchema), await api('/api/places/nearby', { query: { lat, lon, radiusKm, limit } })),
  byCountry: async (countryCode: string, page = 0, size = 24) =>
    parseOrLog(PlacePageSchema, await api(`/api/places/by-country/${countryCode}`, { query: { page, size } })),
  byCategory: async (category: string, page = 0, size = 24) =>
    parseOrLog(PlacePageSchema, await api(`/api/places/by-category/${category}`, { query: { page, size } })),
  byTag: async (tag: string, page = 0, size = 24) =>
    parseOrLog(PlacePageSchema, await api(`/api/places/by-tag/${encodeURIComponent(tag)}`, { query: { page, size } })),
  popular: async (minPopularity = 85, page = 0, size = 24) =>
    parseOrLog(PlacePageSchema, await api('/api/places/popular', { query: { minPopularity, page, size } })),
  recent: async (page = 0, size = 24) =>
    parseOrLog(PlacePageSchema, await api('/api/places/recent', { query: { page, size } })),
  random: async (limit = 8) =>
    parseOrLog(z.array(PlaceSummarySchema), await api('/api/places/random', { query: { limit } })),
  byId: async (id: string): Promise<PlaceDetail> =>
    parseOrLog(PlaceDetailSchema, await api(`/api/places/${id}`)),
  bySlug: async (slug: string): Promise<PlaceDetail> =>
    parseOrLog(PlaceDetailSchema, await api(`/api/places/by-slug/${slug}`)),
  suggest: async (prefix: string, limit = 8): Promise<PlaceSummary[]> =>
    parseOrLog(z.array(PlaceSummarySchema), await api('/api/places/suggest', { query: { prefix, limit } })),
  related: async (id: string, limit = 6): Promise<PlaceSummary[]> =>
    parseOrLog(z.array(PlaceSummarySchema), await api(`/api/places/${id}/related`, { query: { limit } })),
};

export const countries = {
  list: async (page = 0, size = 50) =>
    parseOrLog(CountryPageSchema, await api('/api/countries', { query: { page, size } })),
  all: async (): Promise<CountrySummary[]> =>
    parseOrLog(z.array(CountrySummarySchema), await api('/api/countries/all')),
  count: () => api<{ total: number }>('/api/countries/count'),
  regions: () => api<string[]>('/api/countries/regions'),
  regionStats: () =>
    api<Array<{ region: string; countryCount: number; totalPopulation: number }>>('/api/countries/regions/stats'),
  byRegion: async (region: string) =>
    parseOrLog(CountryPageSchema, await api(`/api/countries/by-region/${encodeURIComponent(region)}`)),
  search: async (q: string) =>
    parseOrLog(CountryPageSchema, await api('/api/countries/search', { query: { q } })),
  byCode: async (code: string): Promise<CountrySummary> =>
    parseOrLog(CountrySummarySchema, await api(`/api/countries/${code}`)),
  byCode3: async (code3: string): Promise<CountrySummary> =>
    parseOrLog(CountrySummarySchema, await api(`/api/countries/by-code3/${code3}`)),
  places: async (code: string, page = 0, size = 24) =>
    parseOrLog(PlacePageSchema, await api(`/api/countries/${code}/places`, { query: { page, size } })),
  stats: (code: string) => api<{ country: CountrySummary; placeCount: number }>(`/api/countries/${code}/stats`),
};

export const tags = {
  all: () => api<string[]>('/api/tags'),
  trending: (limit = 20) => api<Array<{ tag: string; count: number }>>('/api/tags/trending', { query: { limit } }),
};

export const favorites = {
  list: (page = 0, size = 50) => api<PageResponse<unknown>>('/api/favorites', { query: { page, size }, auth: 'required' }),
  count: () => api<{ total: number }>('/api/favorites/count', { auth: 'required' }),
  check: (placeId: string) => api<{ favorite: boolean }>(`/api/favorites/check/${placeId}`, { auth: 'required' }),
  add: (placeId: string) => api<unknown>(`/api/favorites/${placeId}`, { method: 'POST', auth: 'required' }),
  remove: (placeId: string) => api<void>(`/api/favorites/${placeId}`, { method: 'DELETE', auth: 'required' }),
  clear: () => api<void>('/api/favorites', { method: 'DELETE', auth: 'required' }),
};

export const recentViews = {
  list: (page = 0, size = 12) => api<PageResponse<unknown>>('/api/recent-views', { query: { page, size }, auth: 'required' }),
  top: () => api<unknown[]>('/api/recent-views/top', { auth: 'required' }),
  count: () => api<{ total: number }>('/api/recent-views/count', { auth: 'required' }),
  push: (placeId: string) => api<unknown>(`/api/recent-views/${placeId}`, { method: 'POST', auth: 'required' }),
  remove: (placeId: string) => api<void>(`/api/recent-views/${placeId}`, { method: 'DELETE', auth: 'required' }),
  clear: () => api<void>('/api/recent-views', { method: 'DELETE', auth: 'required' }),
};

export const recentSearches = {
  list: (page = 0, size = 16) => api<PageResponse<unknown>>('/api/recent-searches', { query: { page, size }, auth: 'required' }),
  top: () => api<unknown[]>('/api/recent-searches/top', { auth: 'required' }),
  trending: (limit = 10) => api<Array<{ term: string; count: number }>>('/api/recent-searches/trending', { query: { limit } }),
  record: (query: string, resultCount?: number) =>
    api<unknown>('/api/recent-searches', { method: 'POST', body: { query, resultCount }, auth: 'required' }),
  remove: (id: string) => api<void>(`/api/recent-searches/${id}`, { method: 'DELETE', auth: 'required' }),
  clear: () => api<void>('/api/recent-searches', { method: 'DELETE', auth: 'required' }),
};

export const profile = {
  me: () => api<unknown>('/api/users/me', { auth: 'required' }),
  updateName: (displayName: string) =>
    api<unknown>('/api/users/me', { method: 'PATCH', body: { displayName }, auth: 'required' }),
  changePassword: (currentPassword: string, newPassword: string) =>
    api<void>('/api/users/me/password', { method: 'POST', body: { currentPassword, newPassword }, auth: 'required' }),
  preferences: () => api<unknown>('/api/users/me/preferences', { auth: 'required' }),
  patchPreferences: (patch: Record<string, unknown>) =>
    api<unknown>('/api/users/me/preferences', { method: 'PATCH', body: patch, auth: 'required' }),
  replacePreferences: (prefs: Record<string, unknown>) =>
    api<unknown>('/api/users/me/preferences', { method: 'PUT', body: prefs, auth: 'required' }),
  exportData: () => api<unknown>('/api/users/me/export', { auth: 'required' }),
  deactivate: () => api<void>('/api/users/me', { method: 'DELETE', auth: 'required' }),
  hardDelete: (currentPassword: string, confirmation: string) =>
    api<void>('/api/users/me/permanent', {
      method: 'POST',
      body: { currentPassword, confirmation },
      auth: 'required',
    }),
};

export const lunerie = {
  baseUrl: RESOLVED_BASE_URL,
  api,
  auth,
  places,
  countries,
  tags,
  favorites,
  recentViews,
  recentSearches,
  profile,
};

export default lunerie;
