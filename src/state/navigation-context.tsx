import { createContext, useCallback, useContext, useEffect, useMemo, useState } from 'react';
import { APP_TABS, type AppTab } from '@/constants/app';
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
const ALLOWED_TABS = new Set<string>(APP_TABS);

function readTabFromLocation(): AppTab | null {
  if (typeof window === 'undefined') return null;
  const param = new URLSearchParams(window.location.search).get(TAB_PARAM);
  return param && ALLOWED_TABS.has(param) ? (param as AppTab) : null;
}

/**
 * Replace `?tab=…` in the URL without adding a history entry. Keeps the
 * declared PWA shortcut URLs (/?tab=search&utm_source=pwa-shortcut) honest:
 * landing on the app from a shortcut moves you to that tab, and
 * subsequently switching tabs updates the URL so a refresh / share keeps
 * the same screen.
 */
function writeTabToLocation(tab: AppTab): void {
  if (typeof window === 'undefined') return;
  const url = new URL(window.location.href);
  if (url.searchParams.get(TAB_PARAM) === tab) return;
  url.searchParams.set(TAB_PARAM, tab);
  window.history.replaceState(window.history.state, '', url.toString());
}

export function NavigationProvider({ children }: { children: React.ReactNode }) {
  const [activeTab, setActiveTabRaw] = useState<AppTab>(() => readTabFromLocation() ?? 'explore');
  const [selectedPlace, setSelectedPlace] = useState<Place | null>(null);
  const [selectedCountry, setSelectedCountry] = useState<Country | null>(null);

  // Initial mount: if the URL specified a tab, reflect that in state. Subsequent
  // tab updates push back to the URL via writeTabToLocation.
  useEffect(() => {
    const onPopState = () => {
      const next = readTabFromLocation();
      if (next && next !== activeTab) setActiveTabRaw(next);
    };
    window.addEventListener('popstate', onPopState);
    return () => window.removeEventListener('popstate', onPopState);
  }, [activeTab]);

  const setActiveTab = useCallback((tab: AppTab) => {
    setActiveTabRaw(tab);
    writeTabToLocation(tab);
  }, []);

  const value = useMemo<NavigationContextValue>(
    () => ({
      activeTab,
      selectedPlace,
      selectedCountry,
      setActiveTab,
      openPlace: (place) => {
        setSelectedCountry(null);
        setSelectedPlace(place);
      },
      openCountry: (country) => {
        setSelectedPlace(null);
        setSelectedCountry(country);
      },
      closeOverlay: () => {
        setSelectedPlace(null);
        setSelectedCountry(null);
      },
    }),
    [activeTab, selectedPlace, selectedCountry, setActiveTab],
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
