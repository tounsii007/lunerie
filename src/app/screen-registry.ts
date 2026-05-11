import { lazy, type ComponentType } from 'react';
import type { AppTab } from '@/constants/app';

/**
 * Single source of truth for "which component renders for which tab".
 * Adding a new tab is one entry here + one entry in {@code APP_TABS}.
 *
 * Each screen is loaded lazily so the initial bundle only ships the active
 * tab. Suspense fallbacks are handled one level up (see AppRouter).
 */
const ExploreScreen = lazy(() =>
  import('@/screens/ExploreScreen').then((m) => ({ default: m.ExploreScreen })),
);
const SearchScreen = lazy(() =>
  import('@/screens/SearchScreen').then((m) => ({ default: m.SearchScreen })),
);
const NearbyScreen = lazy(() =>
  import('@/screens/NearbyScreen').then((m) => ({ default: m.NearbyScreen })),
);
const FavoritesScreen = lazy(() =>
  import('@/screens/FavoritesScreen').then((m) => ({ default: m.FavoritesScreen })),
);
const SettingsScreen = lazy(() =>
  import('@/screens/SettingsScreen').then((m) => ({ default: m.SettingsScreen })),
);

export const screenRegistry: Record<AppTab, ComponentType> = {
  explore: ExploreScreen,
  search: SearchScreen,
  nearby: NearbyScreen,
  favorites: FavoritesScreen,
  settings: SettingsScreen,
} satisfies Record<AppTab, ComponentType>;
