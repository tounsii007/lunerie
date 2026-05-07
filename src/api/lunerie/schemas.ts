/**
 * Zod schemas for backend DTOs — used to validate hot-path responses
 * (places, countries) so the UI never crashes on malformed payloads.
 */
import { z } from 'zod';

export const PlaceCategoryEnum = z.enum([
  'VIEWPOINT', 'PHOTO_SPOT', 'NATURE', 'BEACH', 'MOUNTAIN', 'LAKE',
  'WATERFALL', 'HISTORIC', 'PARK', 'CULTURAL', 'HIDDEN_GEM',
]);

export const PlaceSummarySchema = z.object({
  id: z.string().uuid(),
  slug: z.string(),
  name: z.string(),
  city: z.string(),
  region: z.string(),
  countryCode: z.string().length(2),
  countryName: z.string(),
  latitude: z.number(),
  longitude: z.number(),
  popularity: z.number().int(),
  relevance: z.number().int(),
  hasImage: z.boolean(),
  heroImageUrl: z.string().nullable().optional(),
  categories: z.array(PlaceCategoryEnum),
});

export const PlaceDetailSchema = PlaceSummarySchema.extend({
  description: z.string(),
  heroImageAlt: z.string().nullable().optional(),
  heroImageSource: z.string().nullable().optional(),
  heroImagePhotographer: z.string().nullable().optional(),
  galleryUrls: z.array(z.string()).default([]),
  sourceAttribution: z.string().nullable().optional(),
  tags: z.array(z.string()).default([]),
  createdAt: z.string(),
  updatedAt: z.string(),
});

export const CountrySummarySchema = z.object({
  code: z.string().length(2),
  code3: z.string().length(3),
  name: z.string(),
  nativeName: z.string().nullable().optional(),
  region: z.string(),
  subregion: z.string().nullable().optional(),
  capital: z.string().nullable().optional(),
  population: z.number(),
  flagEmoji: z.string().nullable().optional(),
  heroImageUrl: z.string().nullable().optional(),
  languages: z.array(z.string()).default([]),
  currencies: z.array(z.string()).default([]),
});

export const PageResponseSchema = <T extends z.ZodTypeAny>(item: T) =>
  z.object({
    items: z.array(item),
    page: z.number().int(),
    size: z.number().int(),
    total: z.number().int(),
    totalPages: z.number().int(),
    first: z.boolean(),
    last: z.boolean(),
  });

export type PlaceCategory = z.infer<typeof PlaceCategoryEnum>;
export type PlaceSummary = z.infer<typeof PlaceSummarySchema>;
export type PlaceDetail = z.infer<typeof PlaceDetailSchema>;
export type CountrySummary = z.infer<typeof CountrySummarySchema>;
export type Page<T> = {
  items: T[];
  page: number;
  size: number;
  total: number;
  totalPages: number;
  first: boolean;
  last: boolean;
};

/* Auth + user related schemas — derived once, reused everywhere. */

export const UserSummarySchema = z.object({
  id: z.string(),
  email: z.string().email(),
  displayName: z.string(),
  roles: z.array(z.string()).default([]),
});

export const AuthTokensSchema = z.object({
  tokenType: z.string(),
  accessToken: z.string(),
  accessTokenExpiresInSeconds: z.number(),
  refreshToken: z.string().default(''),
  refreshTokenExpiresInSeconds: z.number(),
  user: UserSummarySchema,
});

export type UserSummary = z.infer<typeof UserSummarySchema>;
export type AuthTokens = z.infer<typeof AuthTokensSchema>;

export const TrendingTermSchema = z.object({ term: z.string(), count: z.number() });
export const TrendingTagSchema = z.object({ tag: z.string(), count: z.number() });
export type TrendingTerm = z.infer<typeof TrendingTermSchema>;
export type TrendingTag = z.infer<typeof TrendingTagSchema>;
