import { useQuery } from '@tanstack/react-query';
import { externalContentService } from '@/api/services/externalContentService';
import { queryKeys } from '@/constants/queryKeys';
import { usePreferences } from '@/state/preferences-context';

export function useExplorePlaces() {
  const { preferences } = usePreferences();
  return useQuery({
    queryKey: [...queryKeys.places.explore, preferences.filters],
    queryFn: () => externalContentService.getExplorePlaces(preferences.filters),
  });
}
