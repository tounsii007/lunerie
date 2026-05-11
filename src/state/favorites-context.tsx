import { createContext, useCallback, useContext, useEffect, useMemo, useRef, useState } from 'react';
import { z } from 'zod';
import { STORAGE_KEYS, STORAGE_VERSION } from '@/constants/storage';
import { FavoritePlaceSchema, PlaceSchema, type FavoritePlace, type Place } from '@/domain/models';
import { PersistentStore } from '@/storage/persistentStore';
import { safeIsoDate } from '@/utils/datetime';
import lunerie from '@/api/lunerie/lunerieClient';
import { useAuth } from '@/state/auth-context';
import { toErrorToast } from '@/utils/apiToast';

const FavoritePlacesSchema = z.array(FavoritePlaceSchema);
const RecentViewsSchema = z.array(PlaceSchema);
const RemovedFavoritesSchema = z.array(z.string());

const favoritesStore = new PersistentStore(STORAGE_KEYS.favorites, FavoritePlacesSchema, STORAGE_VERSION, []);
const recentViewsStore = new PersistentStore(STORAGE_KEYS.recentViews, RecentViewsSchema, STORAGE_VERSION, []);
/** Tombstones for offline removals so we can sync them up when we come back online / sign in. */
const removedFavoritesStore = new PersistentStore(STORAGE_KEYS.removedFavorites, RemovedFavoritesSchema, STORAGE_VERSION, []);

interface FavoritesContextValue {
  favorites: FavoritePlace[];
  recentViews: Place[];
  /**
   * Toggle favorite. Pass the full Place when you have it (callers in
   * PlaceCard / PlaceDetails do) — it gets snapshotted into the favorite so
   * the FavoritesScreen can render without an extra fetch / mock-data lookup.
   * Passing only an id still works (legacy code paths).
   */
  toggleFavorite: (placeOrId: Place | string) => void;
  isFavorite: (placeId: string) => boolean;
  pushRecentView: (place: Place) => void;
  syncStatus: 'idle' | 'syncing' | 'synced' | 'error';
}

const FavoritesContext = createContext<FavoritesContextValue | null>(null);

export function FavoritesProvider({ children }: { children: React.ReactNode }) {
  const [favorites, setFavorites] = useState<FavoritePlace[]>(() => favoritesStore.read());
  const [recentViews, setRecentViews] = useState<Place[]>(() => recentViewsStore.read());
  const [syncStatus, setSyncStatus] = useState<FavoritesContextValue['syncStatus']>('idle');
  const removedRef = useRef<string[]>(removedFavoritesStore.read());
  const { user } = useAuth();

  /* ----- Local storage updates (single source of truth) -------------------- */

  const persistFavorites = (next: FavoritePlace[]) => {
    favoritesStore.write(next);
    setFavorites(next);
  };

  const persistRemoved = (next: string[]) => {
    removedFavoritesStore.write(next);
    removedRef.current = next;
  };

  /* ----- Two-way sync on auth transition ---------------------------------- */

  const syncWithBackend = useCallback(async () => {
    if (!user) return;
    setSyncStatus('syncing');
    try {
      // 1) Push pending tombstones
      const tombstones = [...removedRef.current];
      for (const placeId of tombstones) {
        await lunerie.favorites.remove(placeId).catch(() => undefined); // best-effort
      }
      persistRemoved([]);

      // 2) Push local additions that aren't on the server yet
      const remote = await lunerie.favorites.list(0, 200);
      const remoteIds = new Set((remote.items as Array<{ id: string }>).map((p) => p.id));
      for (const local of favoritesStore.read()) {
        if (!remoteIds.has(local.placeId)) {
          await lunerie.favorites.add(local.placeId).catch(() => undefined);
        }
      }

      // 3) Re-read from server as the source of truth
      const refreshed = await lunerie.favorites.list(0, 200);
      const merged: FavoritePlace[] = (refreshed.items as Array<{ id: string }>).map((place) => ({
        placeId: place.id,
        savedAt: safeIsoDate(new Date()),
      }));
      persistFavorites(merged);
      setSyncStatus('synced');
    } catch (error) {
      setSyncStatus('error');
      // Surface only once
      toErrorToast(error);
    }
  }, [user]);

  useEffect(() => {
    if (user) {
      void syncWithBackend();
    } else {
      setSyncStatus('idle');
    }
  }, [user, syncWithBackend]);

  /* ----- Toggle / push recent view --------------------------------------- */

  const toggleFavorite = (placeOrId: Place | string) => {
    const placeId = typeof placeOrId === 'string' ? placeOrId : placeOrId.id;
    const placeSnapshot = typeof placeOrId === 'string' ? undefined : placeOrId;
    const exists = favorites.some((f) => f.placeId === placeId);
    const next = exists
      ? favorites.filter((f) => f.placeId !== placeId)
      : [
          ...favorites,
          { placeId, savedAt: safeIsoDate(new Date()), place: placeSnapshot },
        ];
    persistFavorites(next);

    if (user) {
      // Fire-and-forget; on failure, queue tombstone so next sync recovers.
      const op = exists ? lunerie.favorites.remove(placeId) : lunerie.favorites.add(placeId);
      op.catch((error) => {
        if (exists) {
          persistRemoved([...new Set([...removedRef.current, placeId])]);
        } else {
          // Could not persist add — leave local-only and rely on next sync.
        }
        toErrorToast(error);
      });
    } else if (exists) {
      // Offline removal — tombstone for later push
      persistRemoved([...new Set([...removedRef.current, placeId])]);
    }
  };

  const pushRecentView = (place: Place) => {
    const next = [place, ...recentViews.filter((item) => item.id !== place.id)].slice(0, 12);
    recentViewsStore.write(next);
    setRecentViews(next);
    if (user) {
      lunerie.recentViews.push(place.id).catch(() => undefined);
    }
  };

  /* ----- Multi-tab sync via storage events ------------------------------- */

  useEffect(() => {
    const handler = (event: StorageEvent) => {
      if (event.key === STORAGE_KEYS.favorites) {
        setFavorites(favoritesStore.read());
      } else if (event.key === STORAGE_KEYS.recentViews) {
        setRecentViews(recentViewsStore.read());
      }
    };
    window.addEventListener('storage', handler);
    return () => window.removeEventListener('storage', handler);
  }, []);

  const value = useMemo<FavoritesContextValue>(
    () => ({
      favorites,
      recentViews,
      toggleFavorite,
      isFavorite: (placeId) => favorites.some((favorite) => favorite.placeId === placeId),
      pushRecentView,
      syncStatus,
    }),
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [favorites, recentViews, syncStatus],
  );

  return <FavoritesContext.Provider value={value}>{children}</FavoritesContext.Provider>;
}

export function useFavorites() {
  const context = useContext(FavoritesContext);
  if (!context) {
    throw new Error('useFavorites must be used within FavoritesProvider');
  }
  return context;
}
