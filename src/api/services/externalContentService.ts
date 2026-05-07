import { z } from 'zod';
import { API_CACHE_TTL_MS, FEATURE_FLAGS, GEO_CACHE_TTL_MS, MAX_RESULTS } from '@/constants/app';
import { apiConfig } from '@/config/env';
import { mockCountries, mockPlaces } from '@/data/mockPlaces';
import type { Country, PaginatedResult, Place, SearchFilters, SearchQuery } from '@/domain/models';
import { AppError } from '@/errors/appError';
import { logger } from '@/logging/logger';
import { HttpClient } from '@/api/httpClient';
import { mapNominatimToLocation, mapOverpassElementToPlace, mapPexelsPhotoToImage, mapRestCountryToDomain, mapUnsplashPhotoToImage } from '@/api/mappers';
import { GeoNamesResponseSchema, NominatimItemSchema, OverpassResponseSchema, PexelsResponseSchema, RestCountrySchema, UnsplashSearchResponseSchema } from '@/api/schemas';
import { ResponseCache } from '@/api/responseCache';
import { PlaceSchema } from '@/domain/models';

function textMatches(place: Place, query: string): boolean {
  const haystack = [place.name, place.countryName, place.region, place.city, place.description, ...place.tags].join(' ').toLowerCase();
  return haystack.includes(query.toLowerCase());
}

function filterPlaces(places: Place[], filters?: Partial<SearchFilters>) {
  return places.filter((place) => {
    if (filters?.countryCode && place.countryCode !== filters.countryCode) return false;
    if (filters?.category && !place.categories.includes(filters.category)) return false;
    if (filters?.withImageOnly && !place.hasImage) return false;
    return true;
  });
}

const PlaceListSchema = z.array(PlaceSchema);
const CountryListSchema = RestCountrySchema.array();

export class ExternalContentService {
  private readonly nominatimClient = new HttpClient(apiConfig.nominatimBaseUrl, {
    'Accept-Language': 'en',
  });

  private readonly overpassClient = new HttpClient(apiConfig.overpassBaseUrl);
  private readonly geoNamesClient = new HttpClient(apiConfig.geoNamesBaseUrl);
  private readonly pexelsClient = new HttpClient(apiConfig.pexelsBaseUrl, apiConfig.pexelsApiKey ? { Authorization: apiConfig.pexelsApiKey } : {});
  private readonly unsplashClient = new HttpClient(apiConfig.unsplashBaseUrl, apiConfig.unsplashAccessKey ? { Authorization: `Client-ID ${apiConfig.unsplashAccessKey}` } : {});
  private readonly restCountriesClient = new HttpClient(apiConfig.restCountriesBaseUrl);
  private readonly cache = new ResponseCache('lunerie-api');

  private shouldUseLiveApis(): boolean {
    return FEATURE_FLAGS.enableLiveApis && import.meta.env.MODE !== 'test' && typeof navigator !== 'undefined' && navigator.onLine;
  }

  private async withCache<T>(key: string, schema: z.ZodType<T>, ttlMs: number, loader: () => Promise<T>): Promise<T> {
    const cached = this.cache.read(key, schema);
    if (cached) {
      return cached;
    }

    const value = await loader();
    this.cache.write(key, value, ttlMs);
    return value;
  }

  private buildOverpassQuery(coords: { latitude: number; longitude: number }, radiusKm: number): string {
    const radiusMeters = Math.min(Math.max(radiusKm * 1000, 2000), 18000);
    const lat = coords.latitude.toFixed(5);
    const lon = coords.longitude.toFixed(5);

    return `
[out:json][timeout:25];
(
  nwr["tourism"~"viewpoint|attraction|museum"](around:${radiusMeters},${lat},${lon});
  nwr["historic"](around:${radiusMeters},${lat},${lon});
  nwr["natural"~"peak|waterfall|beach|cape|spring|water|rock"](around:${radiusMeters},${lat},${lon});
  nwr["leisure"="park"](around:${radiusMeters},${lat},${lon});
);
out center 24;
`;
  }

  private async fetchImages(query: string) {
    if (apiConfig.pexelsApiKey) {
      const response = await this.pexelsClient.getJson('/search', PexelsResponseSchema, {
        query: { query, per_page: 6 },
      });

      return response.photos.map((photo) => mapPexelsPhotoToImage(photo, query));
    }

    if (apiConfig.unsplashAccessKey) {
      const response = await this.unsplashClient.getJson('/search/photos', UnsplashSearchResponseSchema, {
        query: { query, per_page: 6, orientation: 'landscape' },
      });

      return response.results.map((photo) => mapUnsplashPhotoToImage(photo, query));
    }

    return [];
  }

  private mergeWithFallbacks(livePlaces: Place[], queryText: string, filters?: Partial<SearchFilters>): Place[] {
    const fallback = filterPlaces(mockPlaces, filters).filter((place) => textMatches(place, queryText));
    const merged = [...livePlaces];

    fallback.forEach((place) => {
      if (!merged.some((item) => item.id === place.id)) {
        merged.push(place);
      }
    });

    return merged.slice(0, MAX_RESULTS);
  }

  async getExplorePlaces(filters?: Partial<SearchFilters>): Promise<PaginatedResult<Place>> {
    const items = filterPlaces(mockPlaces, filters).slice(0, MAX_RESULTS);
    return { items, total: items.length, fromCache: true };
  }

  async searchPlaces(query: SearchQuery, filters?: Partial<SearchFilters>): Promise<PaginatedResult<Place>> {
    const fallbackItems = filterPlaces(mockPlaces, filters).filter((place) => textMatches(place, query.text)).slice(0, MAX_RESULTS);

    if (!this.shouldUseLiveApis()) {
      return { items: fallbackItems, total: fallbackItems.length, fromCache: true };
    }

    try {
      const items = await this.withCache(
        `search:${query.text}:${JSON.stringify(filters ?? {})}`,
        PlaceListSchema,
        API_CACHE_TTL_MS,
        async () => {
          const locations = await this.nominatimClient.getJson('/search', z.array(NominatimItemSchema), {
            query: {
              q: query.text,
              format: 'jsonv2',
              addressdetails: 1,
              limit: 3,
            },
          });

          const primary = locations[0];
          if (!primary) {
            return fallbackItems;
          }

          const location = mapNominatimToLocation(primary);
          const overpass = await this.overpassClient.getJson('/interpreter', OverpassResponseSchema, {
            method: 'POST',
            headers: { 'Content-Type': 'text/plain' },
            body: this.buildOverpassQuery(location.coordinates, filters?.radiusKm ?? 40),
          });

          const geoNames = apiConfig.geoNamesUsername
            ? await this.geoNamesClient.getJson('/findNearbyWikipediaJSON', GeoNamesResponseSchema, {
                query: {
                  lat: location.coordinates.latitude,
                  lng: location.coordinates.longitude,
                  username: apiConfig.geoNamesUsername,
                  maxRows: 10,
                },
              })
            : { geonames: [] };

          const images = await this.fetchImages(`${location.name} ${location.countryName}`);

          const livePlaces = overpass.elements.slice(0, MAX_RESULTS).map((element, index) =>
            mapOverpassElementToPlace({
              element,
              geoName: geoNames.geonames[index],
              countryCode: location.countryCode,
              countryName: location.countryName,
              region: location.region,
              city: location.city,
              photo: images[index]
                ? {
                    id: index,
                    width: images[index].width ?? 1200,
                    height: images[index].height ?? 800,
                    url: images[index].url,
                    photographer: images[index].photographer ?? 'Unknown',
                    alt: images[index].alt,
                    src: { large: images[index].url, medium: images[index].url },
                  }
                : undefined,
            }),
          );

          return this.mergeWithFallbacks(filterPlaces(livePlaces, filters), query.text, filters);
        },
      );

      return { items, total: items.length, fromCache: false };
    } catch (error) {
      logger.warn('Live search failed, falling back to local data', { query: query.text, error: error instanceof Error ? error.message : 'Unknown' });
      return { items: fallbackItems, total: fallbackItems.length, fromCache: true };
    }
  }

  async getCountryCatalog(): Promise<Country[]> {
    if (!this.shouldUseLiveApis()) {
      return mockCountries;
    }

    const rawCountries = await this.withCache('countries:all', CountryListSchema, GEO_CACHE_TTL_MS, () =>
      this.restCountriesClient.getJson('/all', CountryListSchema, {
        query: {
          fields: 'name,flags,cca2,cca3,region,subregion,languages,currencies,capital,maps,population',
        },
      }),
    );

    return rawCountries.map((country) => mapRestCountryToDomain(country));
  }

  async getPlacesByCountry(countryCode: string): Promise<PaginatedResult<Place>> {
    const fallbackItems = mockPlaces.filter((place) => place.countryCode === countryCode.toUpperCase());

    if (!this.shouldUseLiveApis()) {
      return { items: fallbackItems, total: fallbackItems.length, fromCache: true };
    }

    try {
      const countrySeed = fallbackItems[0];
      if (!countrySeed) {
        return { items: fallbackItems, total: fallbackItems.length, fromCache: true };
      }

      const items = await this.withCache(
        `country:${countryCode}`,
        PlaceListSchema,
        GEO_CACHE_TTL_MS,
        async () => {
          const overpass = await this.overpassClient.getJson('/interpreter', OverpassResponseSchema, {
            method: 'POST',
            headers: { 'Content-Type': 'text/plain' },
            body: this.buildOverpassQuery(countrySeed.coordinates, 80),
          });

          const images = await this.fetchImages(`${countrySeed.countryName} landscape`);
          return overpass.elements.slice(0, MAX_RESULTS).map((element, index) =>
            mapOverpassElementToPlace({
              element,
              countryCode: countrySeed.countryCode,
              countryName: countrySeed.countryName,
              region: countrySeed.region,
              city: countrySeed.city,
              photo: images[index]
                ? {
                    id: index,
                    width: images[index].width ?? 1200,
                    height: images[index].height ?? 800,
                    url: images[index].url,
                    photographer: images[index].photographer ?? 'Unknown',
                    alt: images[index].alt,
                    src: { large: images[index].url, medium: images[index].url },
                  }
                : undefined,
            }),
          );
        },
      );

      return { items: this.mergeWithFallbacks(items, countryCode, { countryCode }), total: items.length, fromCache: false };
    } catch {
      return { items: fallbackItems, total: fallbackItems.length, fromCache: true };
    }
  }

  async getNearbyPlaces(coords: { latitude: number; longitude: number }): Promise<PaginatedResult<Place>> {
    const fallbackItems = [...mockPlaces]
      .sort((a, b) => {
        const distanceA = Math.hypot(a.coordinates.latitude - coords.latitude, a.coordinates.longitude - coords.longitude);
        const distanceB = Math.hypot(b.coordinates.latitude - coords.latitude, b.coordinates.longitude - coords.longitude);
        return distanceA - distanceB;
      })
      .slice(0, 4);

    if (!this.shouldUseLiveApis()) {
      return { items: fallbackItems, total: fallbackItems.length, fromCache: true };
    }

    try {
      const items = await this.withCache(
        `nearby:${coords.latitude.toFixed(3)}:${coords.longitude.toFixed(3)}`,
        PlaceListSchema,
        API_CACHE_TTL_MS,
        async () => {
          const reverse = await this.nominatimClient.getJson('/reverse', NominatimItemSchema, {
            query: {
              lat: coords.latitude,
              lon: coords.longitude,
              format: 'jsonv2',
              addressdetails: 1,
            },
          });

          const location = mapNominatimToLocation(reverse);
          const overpass = await this.overpassClient.getJson('/interpreter', OverpassResponseSchema, {
            method: 'POST',
            headers: { 'Content-Type': 'text/plain' },
            body: this.buildOverpassQuery(coords, 25),
          });

          const geoNames = apiConfig.geoNamesUsername
            ? await this.geoNamesClient.getJson('/findNearbyWikipediaJSON', GeoNamesResponseSchema, {
                query: {
                  lat: coords.latitude,
                  lng: coords.longitude,
                  username: apiConfig.geoNamesUsername,
                  maxRows: 8,
                },
              })
            : { geonames: [] };

          const images = await this.fetchImages(`${location.city} ${location.countryName}`);
          return overpass.elements.slice(0, MAX_RESULTS).map((element, index) =>
            mapOverpassElementToPlace({
              element,
              geoName: geoNames.geonames[index],
              countryCode: location.countryCode,
              countryName: location.countryName,
              region: location.region,
              city: location.city,
              photo: images[index]
                ? {
                    id: index,
                    width: images[index].width ?? 1200,
                    height: images[index].height ?? 800,
                    url: images[index].url,
                    photographer: images[index].photographer ?? 'Unknown',
                    alt: images[index].alt,
                    src: { large: images[index].url, medium: images[index].url },
                  }
                : undefined,
            }),
          );
        },
      );

      return { items: items.slice(0, 8), total: items.length, fromCache: false };
    } catch (error) {
      logger.warn('Nearby live lookup failed, falling back to curated places', { error: error instanceof Error ? error.message : 'Unknown' });
      return { items: fallbackItems, total: fallbackItems.length, fromCache: true };
    }
  }

  async hydratePlaceFromApis(placeName: string, countryCode: string): Promise<Place[]> {
    if (!FEATURE_FLAGS.enableLiveApis) {
      return mockPlaces.filter((place) => place.name.toLowerCase().includes(placeName.toLowerCase()));
    }

    try {
      const overpass = await this.overpassClient.getJson('/interpreter', OverpassResponseSchema, {
        method: 'POST',
        headers: { 'Content-Type': 'text/plain' },
        body: '[out:json];node["tourism"~"viewpoint|attraction"](around:5000,36.8,10.1);out center 12;',
      });

      const geoNames = await this.geoNamesClient.getJson('/findNearbyWikipediaJSON', GeoNamesResponseSchema, {
        query: { lat: 36.8, lng: 10.1, username: apiConfig.geoNamesUsername },
      });

      const photos = await this.pexelsClient.getJson('/search', PexelsResponseSchema, {
        query: { query: placeName, per_page: 5 },
      });

      return overpass.elements.slice(0, 5).map((element, index) =>
        mapOverpassElementToPlace({
          element,
          geoName: geoNames.geonames[index],
          photo: photos.photos[index],
          countryCode,
          countryName: countryCode,
          region: 'Unknown region',
          city: 'Unknown city',
        }),
      );
    } catch (error) {
      logger.error('Live API hydration failed', { placeName, countryCode });
      throw new AppError({
        code: 'LIVE_API_FAILURE',
        message: 'Unable to hydrate place data from live APIs.',
        source: 'ExternalContentService',
        retryable: true,
      });
    }
  }
}

export const externalContentService = new ExternalContentService();
