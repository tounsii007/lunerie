import { useQuery } from '@tanstack/react-query';
import { externalContentService } from '@/api/services/externalContentService';
import { queryKeys } from '@/constants/queryKeys';

export function useCountryPlaces(countryCode: string | null) {
  return useQuery({
    queryKey: countryCode ? queryKeys.places.country(countryCode) : ['places', 'country', 'none'],
    enabled: Boolean(countryCode),
    queryFn: () => externalContentService.getPlacesByCountry(countryCode as string),
  });
}
