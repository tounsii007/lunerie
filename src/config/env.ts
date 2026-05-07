interface ImportMetaEnvShape {
  readonly VITE_NOMINATIM_BASE_URL?: string;
  readonly VITE_OVERPASS_BASE_URL?: string;
  readonly VITE_GEONAMES_BASE_URL?: string;
  readonly VITE_GEONAMES_USERNAME?: string;
  readonly VITE_PEXELS_BASE_URL?: string;
  readonly VITE_PEXELS_API_KEY?: string;
  readonly VITE_UNSPLASH_BASE_URL?: string;
  readonly VITE_UNSPLASH_ACCESS_KEY?: string;
  readonly VITE_REST_COUNTRIES_BASE_URL?: string;
}

const env = import.meta.env as ImportMetaEnvShape;

export const apiConfig = {
  nominatimBaseUrl: env.VITE_NOMINATIM_BASE_URL ?? 'https://nominatim.openstreetmap.org',
  overpassBaseUrl: env.VITE_OVERPASS_BASE_URL ?? 'https://overpass-api.de/api',
  geoNamesBaseUrl: env.VITE_GEONAMES_BASE_URL ?? 'https://secure.geonames.org',
  geoNamesUsername: env.VITE_GEONAMES_USERNAME ?? '',
  pexelsBaseUrl: env.VITE_PEXELS_BASE_URL ?? 'https://api.pexels.com/v1',
  pexelsApiKey: env.VITE_PEXELS_API_KEY ?? '',
  unsplashBaseUrl: env.VITE_UNSPLASH_BASE_URL ?? 'https://api.unsplash.com',
  unsplashAccessKey: env.VITE_UNSPLASH_ACCESS_KEY ?? '',
  restCountriesBaseUrl: env.VITE_REST_COUNTRIES_BASE_URL ?? 'https://restcountries.com/v3.1',
} as const;
