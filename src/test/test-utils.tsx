import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { render, renderHook } from '@testing-library/react';
import type { ReactNode } from 'react';
import { FavoritesProvider } from '@/state/favorites-context';
import { I18nProvider } from '@/i18n/I18nProvider';
import { NavigationProvider } from '@/state/navigation-context';
import { PreferencesProvider, usePreferences } from '@/state/preferences-context';
import { AuthProvider } from '@/state/auth-context';
import { CommandPaletteProvider } from '@/state/command-palette-context';
import { ThemeProvider } from '@/theme/ThemeProvider';

/**
 * Bridge component: subscribes to PreferencesProvider and feeds the live locale +
 * theme + accent into the downstream providers, mirroring what app/providers.tsx
 * does at runtime. Without this the test wrapper would freeze locale at 'en' and
 * UI changes that depend on preferences updates (language switch, theme switch,
 * accent change) would silently no-op in tests.
 */
function RuntimeBridge({ children }: { children: ReactNode }) {
  const { preferences } = usePreferences();
  return (
    <ThemeProvider
      mode={preferences.theme}
      accentColor={preferences.accentColor}
      backgroundStyle={preferences.backgroundStyle}
      reducedMotion={preferences.reducedMotion}
    >
      <I18nProvider locale={preferences.locale}>
        <AuthProvider>
          <NavigationProvider>
            <FavoritesProvider>
              <CommandPaletteProvider>{children}</CommandPaletteProvider>
            </FavoritesProvider>
          </NavigationProvider>
        </AuthProvider>
      </I18nProvider>
    </ThemeProvider>
  );
}

export function createWrapper() {
  const queryClient = new QueryClient({
    defaultOptions: {
      queries: { retry: false },
    },
  });

  return function Wrapper({ children }: { children: ReactNode }) {
    return (
      <QueryClientProvider client={queryClient}>
        <PreferencesProvider>
          <RuntimeBridge>{children}</RuntimeBridge>
        </PreferencesProvider>
      </QueryClientProvider>
    );
  };
}

export { renderHook };
export { render };
