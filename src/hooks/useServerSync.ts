import { useEffect } from 'react';
import lunerie, { type PageResponse } from '@/api/lunerie/lunerieClient';
import { useAuth } from '@/state/auth-context';
import { useFavorites } from '@/state/favorites-context';

interface PlaceSummary {
  id: string;
  slug?: string;
  name: string;
  city?: string;
  countryCode?: string;
}

/**
 * When the user becomes authenticated, pulls server-side state and merges it
 * into local state. Acts as a one-way sync from server → client; user actions
 * still update local storage and the server independently.
 */
export function useServerSync() {
  const { user } = useAuth();
  const { favorites, toggleFavorite } = useFavorites();

  useEffect(() => {
    if (!user) return;
    let cancelled = false;

    (async () => {
      try {
        const remote = (await lunerie.favorites.list(0, 200)) as PageResponse<PlaceSummary>;
        if (cancelled) return;
        const localIds = new Set(favorites.map((f) => f.placeId));
        // Add anything the server has that the client doesn't.
        for (const place of remote.items) {
          if (!localIds.has(place.id)) {
            toggleFavorite(place.id);
          }
        }
      } catch {
        // Soft-fail — local state remains authoritative offline.
      }
    })();

    return () => {
      cancelled = true;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [user?.id]);
}
