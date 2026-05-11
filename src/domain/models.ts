import { z } from 'zod';
import { PLACE_CATEGORIES } from '@/constants/categories';
import { SUPPORTED_LOCALES, THEMES } from '@/constants/app';

export const CoordinatesSchema = z.object({
  latitude: z.number().min(-90).max(90),
  longitude: z.number().min(-180).max(180),
});

export const CountryCodeSchema = z.string().trim().min(2).max(3).transform((value) => value.toUpperCase());
export const LocalizedTextSchema = z.record(z.string(), z.string());
export const PlaceCategorySchema = z.enum(PLACE_CATEGORIES);

export const ImageAssetSchema = z.object({
  id: z.string(),
  url: z.string().url(),
  alt: z.string(),
  source: z.enum(['pexels', 'unsplash', 'geonames', 'curated']),
  photographer: z.string().optional(),
  width: z.number().positive().optional(),
  height: z.number().positive().optional(),
});

export const PlaceSchema = z.object({
  id: z.string(),
  slug: z.string(),
  name: z.string(),
  description: z.string(),
  countryCode: CountryCodeSchema,
  countryName: z.string(),
  region: z.string(),
  city: z.string(),
  coordinates: CoordinatesSchema,
  categories: z.array(PlaceCategorySchema).min(1),
  tags: z.array(z.string()),
  heroImage: ImageAssetSchema,
  gallery: z.array(ImageAssetSchema),
  sourceLinks: z.array(z.object({ label: z.string(), url: z.string().url() })),
  sourceAttribution: z.string(),
  popularity: z.number().min(0).max(100),
  relevance: z.number().min(0).max(100),
  updatedAt: z.string(),
  hasImage: z.boolean(),
});

export const CountrySchema = z.object({
  code: CountryCodeSchema,
  code3: z.string().trim().min(3).max(3).transform((value) => value.toUpperCase()),
  name: z.string(),
  nativeName: z.string(),
  region: z.string(),
  subregion: z.string(),
  capital: z.string(),
  population: z.number().nonnegative(),
  languages: z.array(z.string()),
  currencies: z.array(z.string()),
  flagEmoji: z.string(),
  heroImage: ImageAssetSchema.optional(),
});

export const SearchQuerySchema = z.object({
  text: z.string().trim().min(1),
  countryCode: CountryCodeSchema.optional(),
  coordinates: CoordinatesSchema.optional(),
});

export const SearchFiltersSchema = z.object({
  countryCode: CountryCodeSchema.optional(),
  category: PlaceCategorySchema.optional(),
  radiusKm: z.number().min(1).max(200).default(80),
  sortBy: z.enum(['relevance', 'popularity', 'distance']).default('relevance'),
  withImageOnly: z.boolean().default(false),
});

export const ACCENT_COLOR_IDS = ['sunset', 'ocean', 'rose', 'forest', 'lavender', 'gold', 'crimson', 'mint'] as const;
export const BACKGROUND_STYLE_IDS = ['aurora', 'midnight', 'sahara', 'forest', 'rose', 'minimal'] as const;

export const UserPreferencesSchema = z.object({
  locale: z.enum(SUPPORTED_LOCALES),
  theme: z.enum(THEMES),
  accentColor: z.enum(ACCENT_COLOR_IDS).default('sunset'),
  backgroundStyle: z.enum(BACKGROUND_STYLE_IDS).default('aurora'),
  reducedMotion: z.boolean().default(false),
  hapticFeedback: z.boolean().default(true),
  rtl: z.boolean(),
  onboardingCompleted: z.boolean(),
  selectedCategories: z.array(PlaceCategorySchema),
  filters: SearchFiltersSchema,
});

export const FavoritePlaceSchema = z.object({
  placeId: z.string(),
  savedAt: z.string(),
  /**
   * Snapshot of the Place at the time it was favorited. Optional for
   * backwards-compatibility with stored entries written before this field
   * existed; new entries always populate it so the FavoritesScreen can
   * render without a separate Place lookup.
   */
  place: z.lazy(() => PlaceSchema).optional(),
});

export const ApiErrorSchema = z.object({
  code: z.string(),
  message: z.string(),
  source: z.string(),
  retryable: z.boolean(),
  details: z.record(z.string(), z.unknown()).optional(),
});

export type Coordinates = z.infer<typeof CoordinatesSchema>;
export type CountryCode = z.infer<typeof CountryCodeSchema>;
export type PlaceCategory = z.infer<typeof PlaceCategorySchema>;
export type ImageAsset = z.infer<typeof ImageAssetSchema>;
export type Place = z.infer<typeof PlaceSchema>;
export type Country = z.infer<typeof CountrySchema>;
export type SearchQuery = z.infer<typeof SearchQuerySchema>;
export type SearchFilters = z.infer<typeof SearchFiltersSchema>;
export type UserPreferences = z.infer<typeof UserPreferencesSchema>;
export type FavoritePlace = z.infer<typeof FavoritePlaceSchema>;
export type ApiError = z.infer<typeof ApiErrorSchema>;
export type PaginatedResult<T> = {
  items: T[];
  total: number;
  nextCursor?: string;
  fromCache: boolean;
};
