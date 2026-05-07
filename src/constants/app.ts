export const APP_NAME = 'Lunerie';
export const APP_TAGLINE = 'Hidden places, viewpoints and photogenic escapes worldwide';
export const APP_DESCRIPTION =
  'Premium mobile-first discovery app for hidden gems, viewpoints and beautiful places.';

export const DEFAULT_LOCALE = 'en';
export const RTL_LOCALES = ['ar'] as const;
export const SUPPORTED_LOCALES = ['de', 'en', 'fr', 'ar', 'es', 'pt'] as const;
export const THEMES = ['dark', 'light', 'system'] as const;
export const APP_TABS = ['explore', 'search', 'nearby', 'favorites', 'settings'] as const;

export const SPLASH_DURATION_MS = 1400;
export const QUERY_STALE_TIME_MS = 1000 * 60 * 10;
export const QUERY_GC_TIME_MS = 1000 * 60 * 30;
export const SEARCH_DEBOUNCE_MS = 250;
export const RECENT_SEARCH_LIMIT = 8;
export const RECENT_VIEW_LIMIT = 12;
export const FAVORITES_LIMIT = 100;
export const DEFAULT_RADIUS_KM = 80;
export const MAX_RESULTS = 24;
export const API_CACHE_TTL_MS = 1000 * 60 * 30;
export const GEO_CACHE_TTL_MS = 1000 * 60 * 60 * 24;
export const MAP_DEFAULT_ZOOM = 6;

export const FEATURE_FLAGS = {
  enableLiveApis: true,
  enablePwaReadyBadge: true,
  enableDebugLogs: true,
} as const;

export type AppTab = (typeof APP_TABS)[number];
export type LocaleCode = (typeof SUPPORTED_LOCALES)[number];
export type ThemeMode = (typeof THEMES)[number];
