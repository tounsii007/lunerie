import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { Toaster } from 'sonner';
import { ErrorBoundary } from '@/components/ErrorBoundary';
import { QUERY_GC_TIME_MS, QUERY_STALE_TIME_MS } from '@/constants/app';
import { FavoritesProvider } from '@/state/favorites-context';
import { I18nProvider } from '@/i18n/I18nProvider';
import { NavigationProvider } from '@/state/navigation-context';
import { PreferencesProvider, usePreferences } from '@/state/preferences-context';
import { ThemeProvider } from '@/theme/ThemeProvider';
import { CommandPaletteProvider } from '@/state/command-palette-context';
import { AuthProvider } from '@/state/auth-context';

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: QUERY_STALE_TIME_MS,
      gcTime: QUERY_GC_TIME_MS,
      retry: (failureCount, error) => {
        const message = error instanceof Error ? error.message : '';
        if (message.includes('429')) {
          return false;
        }
        return failureCount < 2;
      },
      refetchOnWindowFocus: false,
    },
  },
});

function RuntimeProviders({ children }: { children: React.ReactNode }) {
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
              <CommandPaletteProvider>
                {children}
                <Toaster
                  position="top-center"
                  theme={preferences.theme === 'system' ? 'system' : preferences.theme}
                  richColors
                  closeButton
                  toastOptions={{
                    style: {
                      background: 'var(--app-elevated)',
                      border: '1px solid var(--app-border)',
                      color: 'var(--app-text)',
                    },
                  }}
                />
              </CommandPaletteProvider>
            </FavoritesProvider>
          </NavigationProvider>
        </AuthProvider>
      </I18nProvider>
    </ThemeProvider>
  );
}

export function AppProviders({ children }: { children: React.ReactNode }) {
  return (
    <ErrorBoundary>
      <QueryClientProvider client={queryClient}>
        <PreferencesProvider>
          <RuntimeProviders>{children}</RuntimeProviders>
        </PreferencesProvider>
      </QueryClientProvider>
    </ErrorBoundary>
  );
}
