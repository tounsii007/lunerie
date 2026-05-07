import type { ComponentType } from 'react';
import type { AppTab } from '@/constants/app';
import { ExploreScreen } from '@/screens/ExploreScreen';
import { SearchScreen } from '@/screens/SearchScreen';
import { NearbyScreen } from '@/screens/NearbyScreen';
import { FavoritesScreen } from '@/screens/FavoritesScreen';
import { SettingsScreen } from '@/screens/SettingsScreen';

/**
 * Single source of truth for "which component renders for which tab".
 * Adding a new tab is one entry here + one entry in {@code APP_TABS}.
 */
export const screenRegistry: Record<AppTab, ComponentType> = {
  explore: ExploreScreen,
  search: SearchScreen,
  nearby: NearbyScreen,
  favorites: FavoritesScreen,
  settings: SettingsScreen,
} satisfies Record<AppTab, ComponentType>;
