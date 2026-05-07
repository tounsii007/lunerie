import { startTransition, useEffect, useMemo, useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { SEARCH_DEBOUNCE_MS } from '@/constants/app';
import { queryKeys } from '@/constants/queryKeys';
import { SearchQuerySchema } from '@/domain/models';
import { externalContentService } from '@/api/services/externalContentService';
import { usePreferences } from '@/state/preferences-context';

export function usePlaceSearch() {
  const { preferences } = usePreferences();
  const [searchText, setSearchText] = useState('');
  const [debouncedQuery, setDebouncedQuery] = useState('');

  useEffect(() => {
    const timeout = window.setTimeout(() => {
      startTransition(() => setDebouncedQuery(searchText.trim()));
    }, SEARCH_DEBOUNCE_MS);

    return () => window.clearTimeout(timeout);
  }, [searchText]);

  const enabled = debouncedQuery.length > 1;
  const parsedQuery = useMemo(() => (enabled ? SearchQuerySchema.parse({ text: debouncedQuery }) : null), [debouncedQuery, enabled]);

  const query = useQuery({
    queryKey: queryKeys.places.search(debouncedQuery),
    enabled,
    queryFn: () => externalContentService.searchPlaces(parsedQuery as { text: string }, preferences.filters),
  });

  return {
    searchText,
    setSearchText,
    results: query.data?.items ?? [],
    total: query.data?.total ?? 0,
    fromCache: query.data?.fromCache ?? false,
    isLoading: query.isLoading,
    isEmpty: enabled && (query.data?.items.length ?? 0) === 0,
  };
}
