import type { z } from 'zod';
import { CATEGORY_COLORS } from '@/constants/categories';
import { CountrySchema, ImageAssetSchema, PlaceSchema, type Country, type Place, type PlaceCategory } from '@/domain/models';
import type { GeoNamesEntrySchema, NominatimItemSchema, OverpassElementSchema, PexelsPhotoSchema, RestCountrySchema, UnsplashPhotoSchema } from '@/api/schemas';
import { safeIsoDate } from '@/utils/datetime';

type OverpassElement = z.infer<typeof OverpassElementSchema>;
type GeoNamesEntry = z.infer<typeof GeoNamesEntrySchema>;
type NominatimItem = z.infer<typeof NominatimItemSchema>;
type PexelsPhoto = z.infer<typeof PexelsPhotoSchema>;
type UnsplashPhoto = z.infer<typeof UnsplashPhotoSchema>;
type RestCountry = z.infer<typeof RestCountrySchema>;

function slugify(value: string): string {
  return value.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '');
}

function detectCategory(tags: Record<string, string>): PlaceCategory {
  if (tags.tourism === 'viewpoint') return 'viewpoint';
  if (tags.tourism === 'attraction') return 'photo_spot';
  if (tags.natural === 'beach') return 'beach';
  if (tags.natural === 'peak') return 'mountain';
  if (tags.natural === 'waterfall') return 'waterfall';
  if (tags.natural === 'water') return 'lake';
  if (tags.leisure === 'park') return 'park';
  if (tags.historic) return 'historic';
  if (tags.tourism === 'museum') return 'cultural';
  return 'hidden_gem';
}

export function mapPexelsPhotoToImage(photo: PexelsPhoto, fallbackAlt: string) {
  return ImageAssetSchema.parse({
    id: `pexels-${photo.id}`,
    url: photo.src.large,
    alt: photo.alt?.trim() || fallbackAlt,
    source: 'pexels',
    photographer: photo.photographer,
    width: photo.width,
    height: photo.height,
  });
}

export function mapUnsplashPhotoToImage(photo: UnsplashPhoto, fallbackAlt: string) {
  return ImageAssetSchema.parse({
    id: `unsplash-${photo.id}`,
    url: photo.urls.regular,
    alt: photo.alt_description ?? photo.description ?? fallbackAlt,
    source: 'unsplash',
    photographer: photo.user.name,
    width: photo.width,
    height: photo.height,
  });
}

export function mapNominatimToLocation(item: NominatimItem) {
  const countryCode = item.address?.country_code?.toUpperCase() ?? 'UN';
  const countryName = item.address?.country ?? 'Unknown country';
  const region = item.address?.state ?? item.address?.region ?? countryName;
  const city = item.address?.city ?? item.address?.town ?? item.address?.village ?? item.address?.county ?? region;
  const name = item.name ?? item.address?.city ?? item.address?.town ?? item.display_name.split(',')[0] ?? 'Unknown location';

  return {
    name,
    countryCode,
    countryName,
    region,
    city,
    coordinates: {
      latitude: Number(item.lat),
      longitude: Number(item.lon),
    },
  };
}

export function mapOverpassElementToPlace(input: {
  element: OverpassElement;
  geoName?: GeoNamesEntry;
  photo?: PexelsPhoto;
  countryCode: string;
  countryName: string;
  region: string;
  city: string;
}): Place {
  const { element, geoName, photo, countryCode, countryName, region, city } = input;
  const latitude = element.lat ?? element.center?.lat ?? 0;
  const longitude = element.lon ?? element.center?.lon ?? 0;
  const name = element.tags.name || geoName?.title || 'Hidden place';
  const category = detectCategory(element.tags);
  const heroImage = photo
    ? mapPexelsPhotoToImage(photo, name)
    : ImageAssetSchema.parse({
        id: `gradient-${element.id}`,
        url: `https://dummyimage.com/1200x800/${CATEGORY_COLORS[category].replace('#', '')}/ffffff&text=${encodeURIComponent(name)}`,
        alt: name,
        source: 'curated',
      });

  return PlaceSchema.parse({
    id: `osm-${element.type}-${element.id}`,
    slug: slugify(`${name}-${countryCode}-${element.id}`),
    name,
    description: geoName?.summary || element.tags.description || `${name} is a curated scenic stop for explorers and photographers.`,
    countryCode,
    countryName,
    region,
    city,
    coordinates: { latitude, longitude },
    categories: [category],
    tags: Object.values(element.tags).slice(0, 4),
    heroImage,
    gallery: [heroImage],
    sourceLinks: geoName?.wikipediaUrl ? [{ label: 'Wikipedia', url: `https://${geoName.wikipediaUrl}` }] : [],
    sourceAttribution: 'OpenStreetMap, GeoNames and curated imagery',
    popularity: Math.min(100, Number(element.id % 100)),
    relevance: category === 'hidden_gem' ? 92 : 88,
    updatedAt: safeIsoDate(new Date()),
    hasImage: true,
  });
}

export function mapRestCountryToDomain(country: RestCountry, heroImage?: Place['heroImage']): Country {
  const nativeName = country.name.nativeName ? Object.values(country.name.nativeName)[0]?.common ?? country.name.common : country.name.common;
  return CountrySchema.parse({
    code: country.cca2,
    code3: country.cca3,
    name: country.name.common,
    nativeName,
    region: country.region ?? 'Unknown region',
    subregion: country.subregion ?? 'Unknown subregion',
    capital: country.capital?.[0] ?? 'Unknown capital',
    population: country.population ?? 0,
    languages: Object.values(country.languages ?? {}),
    currencies: Object.values(country.currencies ?? {}).map((currency) => currency.name),
    flagEmoji: country.flags.svg ?? country.flags.png ?? '',
    heroImage,
  });
}
