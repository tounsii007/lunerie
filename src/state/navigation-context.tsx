import { createContext, useContext, useMemo, useState } from 'react';
import type { AppTab } from '@/constants/app';
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

export function NavigationProvider({ children }: { children: React.ReactNode }) {
  const [activeTab, setActiveTab] = useState<AppTab>('explore');
  const [selectedPlace, setSelectedPlace] = useState<Place | null>(null);
  const [selectedCountry, setSelectedCountry] = useState<Country | null>(null);

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
    [activeTab, selectedPlace, selectedCountry],
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
