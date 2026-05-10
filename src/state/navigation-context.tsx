import { createContext, useCallback, useContext, useEffect, useMemo, useState } from 'react';
import { APP_TABS, type AppTab } from '@/constants/app';
import { mockCountries, mockPlaces } from '@/data/mockPlaces';
import type { Country, Place } from '@/domain/models';

interface NavigationContextValue {
  activeTab: AppTab;
  selectedPlace: Place | null;
  selectedCountry: Country | null;
  setActiveTab: (tab: AppTab) => void;
  openPlace: (place: Place) => void;
  openCountry: (country: Country) => void;
  closeOverlay: () => void;
}

const NavigationContext = createContext<NavigationContextValue | null>(null);

const TAB_PARAM = 'tab';
const PLACE_PARAM = 'place';
const COUNTRY_PARAM = 'country';
const ALLOWED_TABS = new Set<string>(APP_TABS);

interface InitialUrlState {
  tab: AppTab | null;
  place: Place | null;
  country: Country | null;
}

function readUrlState(): InitialUrlState {
  if (typeof window === 'undefined') return { tab: null, place: null, country: null };
  const params = new URLSearchParams(window.location.search);
  const tab = params.get(TAB_PARAM);
  const placeSlug = params.get(PLACE_PARAM);
  const countryCode = params.get(COUNTRY_PARAM)?.toUpperCase();
  return {
    tab: tab && ALLOWED_TABS.has(tab) ? (tab as AppTab) : null,
    place: placeSlug ? (mockPlaces.find((p) => p.slug === placeSlug) ?? null) : null,
    country: countryCode ? (mockCountries.find((c) => c.code === countryCode) ?? null) : null,
  };
}

/**
 * Patch the URL search params without adding a history entry. We mutate one
 * key at a time so combinations (e.g. {@code ?tab=explore&place=xxx}) compose
 * correctly across multiple updates.
 */
function patchUrl(updates: Record<string, string | null>): void {
  if (typeof window === 'undefined') return;
  const url = new URL(window.location.href);
  let changed = false;
  for (const [key, value] of Object.entries(updates)) {
    const current = url.searchParams.get(key);
    if (value === null) {
      if (current !== null) {
        url.searchParams.delete(key);
        changed = true;
      }
    } else if (current !== value) {
      url.searchParams.set(key, value);
      changed = true;
    }
  }
  if (changed) {
    window.history.replaceState(window.history.state, '', url.toString());
  }
}

export function NavigationProvider({ children }: { children: React.ReactNode }) {
  const initial = useMemo(() => readUrlState(), []);
  const [activeTab, setActiveTabRaw] = useState<AppTab>(initial.tab ?? 'explore');
  const [selectedPlace, setSelectedPlace] = useState<Place | null>(initial.place);
  const [selectedCountry, setSelectedCountry] = useState<Country | null>(initial.country);

  // popstate (browser back/forward) → re-derive everything from URL.
  useEffect(() => {
    const onPopState = () => {
      const next = readUrlState();
      setActiveTabRaw(next.tab ?? 'explore');
      setSelectedPlace(next.place);
      setSelectedCountry(next.country);
    };
    window.addEventListener('popstate', onPopState);
    return () => window.removeEventListener('popstate', onPopState);
  }, []);

  const setActiveTab = useCallback((tab: AppTab) => {
    setActiveTabRaw(tab);
    patchUrl({ [TAB_PARAM]: tab });
  }, []);

  const openPlace = useCallback((place: Place) => {
    setSelectedCountry(null);
    setSelectedPlace(place);
    patchUrl({ [PLACE_PARAM]: place.slug, [COUNTRY_PARAM]: null });
  }, []);

  const openCountry = useCallback((country: Country) => {
    setSelectedPlace(null);
    setSelectedCountry(country);
    patchUrl({ [COUNTRY_PARAM]: country.code, [PLACE_PARAM]: null });
  }, []);

  const closeOverlay = useCallback(() => {
    setSelectedPlace(null);
    setSelectedCountry(null);
    patchUrl({ [PLACE_PARAM]: null, [COUNTRY_PARAM]: null });
  }, []);

  const value = useMemo<NavigationContextValue>(
    () => ({
      activeTab,
      selectedPlace,
      selectedCountry,
      setActiveTab,
      openPlace,
      openCountry,
      closeOverlay,
    }),
    [activeTab, selectedPlace, selectedCountry, setActiveTab, openPlace, openCountry, closeOverlay],
  );

  return <NavigationContext.Provider value={value}>{children}</NavigationContext.Provider>;
}

export function useNavigation() {
  const context = useContext(NavigationContext);
  if (!context) {
    throw new Error('useNavigation must be used within NavigationProvider');
  }

  return context;
}
