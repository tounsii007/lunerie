import { Suspense, useEffect, useState } from 'react';
import { AppProviders } from '@/app/providers';
import { screenRegistry } from '@/app/screen-registry';
import { BottomNavigation } from '@/components/AppShell';
import { ScreenFallback } from '@/components/ScreenFallback';
import { APP_NAME, SPLASH_DURATION_MS } from '@/constants/app';
import { useNavigation } from '@/state/navigation-context';
import { usePreferences } from '@/state/preferences-context';
import { CountryDetailsScreen } from '@/screens/CountryDetailsScreen';
import { OnboardingScreen } from '@/screens/OnboardingScreen';
import { PlaceDetailsScreen } from '@/screens/PlaceDetailsScreen';
import { SplashScreen } from '@/screens/SplashScreen';

function AppRuntime() {
  const { preferences } = usePreferences();
  const { activeTab, selectedCountry, selectedPlace } = useNavigation();
  const [showSplash, setShowSplash] = useState(true);

  useEffect(() => {
    const timeout = window.setTimeout(() => setShowSplash(false), SPLASH_DURATION_MS);
    return () => window.clearTimeout(timeout);
  }, []);

  if (showSplash) {
    return <SplashScreen />;
  }

  if (!preferences.onboardingCompleted) {
    return <OnboardingScreen />;
  }

  const ActiveScreen = screenRegistry[activeTab];

  return (
    <div
      className="min-h-[100dvh] text-[var(--app-text)] transition-[background] duration-[450ms]"
      style={{ background: 'var(--app-bg-image)' }}
    >
      <div
        aria-hidden
        className="pointer-events-none fixed inset-0 opacity-[0.35]"
        style={{
          backgroundImage:
            'linear-gradient(rgba(255,255,255,0.025) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.025) 1px, transparent 1px)',
          backgroundSize: '64px 64px',
          maskImage: 'linear-gradient(180deg, rgba(0,0,0,0.4), transparent 85%)',
        }}
      />
      <Suspense fallback={<ScreenFallback />}>
        <ActiveScreen key={activeTab} />
      </Suspense>
      <BottomNavigation />
      {selectedPlace ? <PlaceDetailsScreen place={selectedPlace} /> : null}
      {selectedCountry ? <CountryDetailsScreen country={selectedCountry} /> : null}
      <div
        aria-label={APP_NAME}
        className="fixed start-5 top-5 z-[30] flex items-center gap-2 rounded-full border border-[var(--accent-soft)] bg-[rgba(7,17,31,0.6)] px-[14px] py-2.5 text-[11px] font-bold uppercase tracking-[0.16em] text-[var(--accent-light)] shadow-[0_12px_40px_rgba(2,8,23,0.22)] backdrop-blur-xl"
      >
        <span
          className="h-2 w-2 rounded-full bg-[var(--accent)]"
          style={{ boxShadow: '0 0 12px var(--accent)' }}
        />
        {APP_NAME}
      </div>
    </div>
  );
}

export function App() {
  return (
    <AppProviders>
      <AppRuntime />
    </AppProviders>
  );
}
