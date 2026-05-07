export const queryKeys = {
  places: {
    explore: ['places', 'explore'] as const,
    trending: ['places', 'trending'] as const,
    nearby: (lat: number, lon: number) => ['places', 'nearby', lat, lon] as const,
    search: (query: string) => ['places', 'search', query] as const,
    country: (countryCode: string) => ['places', 'country', countryCode] as const,
  },
  countries: {
    all: ['countries', 'all'] as const,
  },
};
