import { z } from 'zod';

export const NominatimItemSchema = z.object({
  place_id: z.number(),
  display_name: z.string(),
  lat: z.string(),
  lon: z.string(),
  name: z.string().optional(),
  type: z.string().optional(),
  boundingbox: z.array(z.string()).optional(),
  address: z.record(z.string(), z.string()).optional(),
});

export const OverpassElementSchema = z.object({
  id: z.number(),
  type: z.enum(['node', 'way', 'relation']),
  lat: z.number().optional(),
  lon: z.number().optional(),
  center: z.object({ lat: z.number(), lon: z.number() }).optional(),
  tags: z.record(z.string(), z.string()).default({}),
});

export const OverpassResponseSchema = z.object({
  elements: z.array(OverpassElementSchema),
});

export const GeoNamesEntrySchema = z.object({
  title: z.string(),
  summary: z.string().optional(),
  wikipediaUrl: z.string().optional(),
  thumbnailImg: z.string().url().optional(),
});

export const GeoNamesResponseSchema = z.object({
  geonames: z.array(GeoNamesEntrySchema).default([]),
});

export const PexelsPhotoSchema = z.object({
  id: z.number(),
  width: z.number(),
  height: z.number(),
  url: z.string().url(),
  photographer: z.string(),
  alt: z.string().optional(),
  src: z.object({
    large: z.string().url(),
    medium: z.string().url(),
  }),
});

export const PexelsResponseSchema = z.object({
  photos: z.array(PexelsPhotoSchema).default([]),
});

export const UnsplashPhotoSchema = z.object({
  id: z.string(),
  alt_description: z.string().nullable().optional(),
  description: z.string().nullable().optional(),
  width: z.number().optional(),
  height: z.number().optional(),
  urls: z.object({
    regular: z.string().url(),
    small: z.string().url().optional(),
  }),
  user: z.object({
    name: z.string(),
  }),
});

export const UnsplashSearchResponseSchema = z.object({
  results: z.array(UnsplashPhotoSchema).default([]),
});

export const RestCountrySchema = z.object({
  cca2: z.string(),
  cca3: z.string(),
  name: z.object({
    common: z.string(),
    official: z.string(),
    nativeName: z.record(z.string(), z.object({ common: z.string() })).optional(),
  }),
  region: z.string().optional(),
  subregion: z.string().optional(),
  capital: z.array(z.string()).optional(),
  population: z.number().optional(),
  flags: z.object({
    png: z.string().url().optional(),
    svg: z.string().url().optional(),
  }),
  languages: z.record(z.string(), z.string()).optional(),
  currencies: z.record(z.string(), z.object({ name: z.string() })).optional(),
});
