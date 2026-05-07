import { createContext, useContext, useMemo, useState } from 'react';
import { DEFAULT_LOCALE, DEFAULT_RADIUS_KM } from '@/constants/app';
import { STORAGE_KEYS, STORAGE_VERSION } from '@/constants/storage';
import { SearchFiltersSchema, UserPreferencesSchema, type UserPreferences } from '@/domain/models';
import { PersistentStore } from '@/storage/persistentStore';
import { isRtlLocale } from '@/utils/locale';
import type { AccentColorId, BackgroundStyleId } from '@/theme/tokens';

const defaultPreferences: UserPreferences = UserPreferencesSchema.parse({
  locale: DEFAULT_LOCALE,
  theme: 'dark',
  accentColor: 'sunset',
  backgroundStyle: 'aurora',
  reducedMotion: false,
  hapticFeedback: true,
  rtl: false,
  onboardingCompleted: false,
  selectedCategories: ['viewpoint', 'photo_spot', 'hidden_gem'],
  filters: SearchFiltersSchema.parse({
    radiusKm: DEFAULT_RADIUS_KM,
    sortBy: 'relevance',
    withImageOnly: true,
  }),
});

const store = new PersistentStore(STORAGE_KEYS.preferences, UserPreferencesSchema, STORAGE_VERSION, defaultPreferences);

interface PreferencesContextValue {
  preferences: UserPreferences;
  updatePreferences: (updater: (current: UserPreferences) => UserPreferences) => void;
}

const PreferencesContext = createContext<PreferencesContextValue | null>(null);

export function PreferencesProvider({ children }: { children: React.ReactNode }) {
  const [preferences, setPreferences] = useState<UserPreferences>(() => store.read());

  const updatePreferences = (updater: (current: UserPreferences) => UserPreferences) => {
    setPreferences((current) => {
      const next = UserPreferencesSchema.parse(updater(current));
      store.write(next);
      return next;
    });
  };

  const value = useMemo(() => ({ preferences, updatePreferences }), [preferences]);
  return <PreferencesContext.Provider value={value}>{children}</PreferencesContext.Provider>;
}

export function usePreferences() {
  const context = useContext(PreferencesContext);
  if (!context) {
    throw new Error('usePreferences must be used within PreferencesProvider');
  }

  return {
    ...context,
    setLocale: (locale: UserPreferences['locale']) =>
      context.updatePreferences((current) => ({
        ...current,
        locale,
        rtl: isRtlLocale(locale),
      })),
    setTheme: (theme: UserPreferences['theme']) =>
      context.updatePreferences((current) => ({
        ...current,
        theme,
      })),
    setAccentColor: (accentColor: AccentColorId) =>
      context.updatePreferences((current) => ({
        ...current,
        accentColor,
      })),
    setBackgroundStyle: (backgroundStyle: BackgroundStyleId) =>
      context.updatePreferences((current) => ({
        ...current,
        backgroundStyle,
      })),
    setReducedMotion: (reducedMotion: boolean) =>
      context.updatePreferences((current) => ({
        ...current,
        reducedMotion,
      })),
    setHapticFeedback: (hapticFeedback: boolean) =>
      context.updatePreferences((current) => ({
        ...current,
        hapticFeedback,
      })),
    completeOnboarding: () =>
      context.updatePreferences((current) => ({
        ...current,
        onboardingCompleted: true,
      })),
    resetOnboarding: () =>
      context.updatePreferences((current) => ({
        ...current,
        onboardingCompleted: false,
      })),
    setFilters: (filters: UserPreferences['filters']) =>
      context.updatePreferences((current) => ({
        ...current,
        filters,
      })),
    toggleCategory: (category: UserPreferences['selectedCategories'][number]) =>
      context.updatePreferences((current) => ({
        ...current,
        selectedCategories: current.selectedCategories.includes(category)
          ? current.selectedCategories.filter((item) => item !== category)
          : [...current.selectedCategories, category],
      })),
  };
}
