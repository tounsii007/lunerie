import { lazy, type ComponentType } from 'react';
import type { AppTab } from '@/constants/app';
import { ExploreScreen } from '@/screens/ExploreScreen';

/**
 * Single source of truth for "which component renders for which tab".
 *
 * The first-load tab (Explore) is statically imported so the initial
 * paint doesn't wait on a chunk fetch. Every other tab is lazily
 * code-split — react-leaflet (Nearby), embla (Search), the heavy
 * SettingsScreen, etc. only land in the bundle when actually navigated to.
 */
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
