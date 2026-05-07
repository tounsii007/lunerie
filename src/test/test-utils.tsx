import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { render, renderHook } from '@testing-library/react';
import type { ReactNode } from 'react';
import { FavoritesProvider } from '@/state/favorites-context';
import { I18nProvider } from '@/i18n/I18nProvider';
import { NavigationProvider } from '@/state/navigation-context';
import { PreferencesProvider } from '@/state/preferences-context';
import { AuthProvider } from '@/state/auth-context';
import { CommandPaletteProvider } from '@/state/command-palette-context';
import { ThemeProvider } from '@/theme/ThemeProvider';

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
          <ThemeProvider mode="dark" accentColor="sunset" backgroundStyle="aurora">
            <I18nProvider locale="en">
              <AuthProvider>
                <NavigationProvider>
                  <FavoritesProvider>
                    <CommandPaletteProvider>{children}</CommandPaletteProvider>
                  </FavoritesProvider>
                </NavigationProvider>
              </AuthProvider>
            </I18nProvider>
          </ThemeProvider>
        </PreferencesProvider>
      </QueryClientProvider>
    );
  };
}

export { renderHook };
export { render };
