import { useQuery } from '@tanstack/react-query';
import { externalContentService } from '@/api/services/externalContentService';
import { queryKeys } from '@/constants/queryKeys';

export function useCountries() {
  return useQuery({
    queryKey: queryKeys.countries.all,
    queryFn: () => externalContentService.getCountryCatalog(),
  });
}
