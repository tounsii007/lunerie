import { useEffect, useState } from 'react';
import { AppProviders } from '@/app/providers';
import { screenRegistry } from '@/app/screen-registry';
import { BottomNavigation } from '@/components/AppShell';
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
      style={{
        minHeight: '100dvh',
        background: 'var(--app-bg-image)',
        color: 'var(--app-text)',
        transition: 'background 0.45s ease',
      }}
    >
      <div
        aria-hidden
        style={{
          position: 'fixed',
          inset: 0,
          backgroundImage:
            'linear-gradient(rgba(255,255,255,0.025) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.025) 1px, transparent 1px)',
          backgroundSize: '64px 64px',
          maskImage: 'linear-gradient(180deg, rgba(0,0,0,0.4), transparent 85%)',
          pointerEvents: 'none',
          opacity: 0.35,
        }}
      />
      <ActiveScreen key={activeTab} />
      <BottomNavigation />
      {selectedPlace ? <PlaceDetailsScreen place={selectedPlace} /> : null}
      {selectedCountry ? <CountryDetailsScreen country={selectedCountry} /> : null}
      <div
        style={{
          position: 'fixed',
          top: 20,
          insetInlineStart: 20,
          padding: '10px 14px',
          borderRadius: 999,
          background: 'rgba(7,17,31,0.6)',
          border: '1px solid var(--accent-soft)',
          backdropFilter: 'blur(16px)',
          fontSize: 11,
          fontWeight: 700,
          letterSpacing: '0.16em',
          textTransform: 'uppercase',
          color: 'var(--accent-light)',
          boxShadow: '0 12px 40px rgba(2,8,23,0.22)',
          display: 'flex',
          alignItems: 'center',
          gap: 8,
          zIndex: 30,
        }}
      >
        <span
          style={{
            width: 8,
            height: 8,
            borderRadius: 999,
            background: 'var(--accent)',
            boxShadow: '0 0 12px var(--accent)',
          }}
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
