import { Suspense, useEffect, useState } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { WifiOff } from 'lucide-react';
import { AppProviders } from '@/app/providers';
import { screenRegistry } from '@/app/screen-registry';
import { BottomNavigation, ScreenContainer } from '@/components/AppShell';
import { SkeletonHero, SkeletonPlaceCard } from '@/components/Skeleton';
import { APP_NAME, SPLASH_DURATION_MS } from '@/constants/app';
import { useOnlineStatus } from '@/hooks/useOnlineStatus';
import { useNavigation } from '@/state/navigation-context';
import { usePreferences } from '@/state/preferences-context';
import { CountryDetailsScreen } from '@/screens/CountryDetailsScreen';
import { OnboardingScreen } from '@/screens/OnboardingScreen';
import { PlaceDetailsScreen } from '@/screens/PlaceDetailsScreen';
import { SplashScreen } from '@/screens/SplashScreen';

function OfflineBanner() {
  const online = useOnlineStatus();
  return (
    <AnimatePresence>
      {!online ? (
        <motion.div
          key="offline"
          initial={{ y: -64, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          exit={{ y: -64, opacity: 0 }}
          transition={{ type: 'spring', damping: 24, stiffness: 320 }}
          role="status"
          aria-live="polite"
          style={{
            position: 'fixed',
            insetInline: 0,
            top: 0,
            zIndex: 90,
            display: 'flex',
            justifyContent: 'center',
            paddingTop: 12,
            pointerEvents: 'none',
          }}
        >
          <div
            style={{
              pointerEvents: 'auto',
              display: 'inline-flex',
              alignItems: 'center',
              gap: 10,
              padding: '10px 16px',
              borderRadius: 999,
              background: 'rgba(2, 6, 23, 0.86)',
              backdropFilter: 'blur(18px) saturate(160%)',
              WebkitBackdropFilter: 'blur(18px) saturate(160%)',
              border: '1px solid rgba(253, 186, 116, 0.35)',
              color: '#fdba74',
              fontSize: 12,
              fontWeight: 700,
              letterSpacing: '0.04em',
              boxShadow: '0 16px 38px rgba(2, 6, 23, 0.5), inset 0 1px 0 rgba(255,255,255,0.08)',
            }}
          >
            <WifiOff size={14} />
            You are offline — changes sync when you reconnect.
          </div>
        </motion.div>
      ) : null}
    </AnimatePresence>
  );
}

function ScreenLoadingFallback() {
  return (
    <ScreenContainer>
      <div aria-busy="true" aria-live="polite" style={{ display: 'grid', gap: 18 }}>
        <SkeletonHero />
        <SkeletonPlaceCard />
        <SkeletonPlaceCard />
      </div>
    </ScreenContainer>
  );
}

function BrandBadge() {
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const main = document.querySelector('main');
    if (!main) return;
    const onScroll = () => setScrolled(main.scrollTop > 24);
    main.addEventListener('scroll', onScroll, { passive: true });
    onScroll();
    return () => main.removeEventListener('scroll', onScroll);
  }, []);

  return (
    <motion.div
      initial={{ opacity: 0, y: -8 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.18, duration: 0.45 }}
      role="presentation"
      aria-hidden
      style={{
        position: 'fixed',
        top: 20,
        insetInlineStart: 20,
        padding: '10px 14px',
        borderRadius: 999,
        background: scrolled ? 'rgba(7,17,31,0.78)' : 'rgba(7,17,31,0.6)',
        border: '1px solid var(--accent-soft)',
        backdropFilter: 'blur(20px) saturate(160%)',
        WebkitBackdropFilter: 'blur(20px) saturate(160%)',
        fontSize: 11,
        fontWeight: 700,
        letterSpacing: '0.16em',
        textTransform: 'uppercase',
        color: 'var(--accent-light)',
        boxShadow: scrolled
          ? '0 18px 48px rgba(2,8,23,0.42), inset 0 1px 0 rgba(255,255,255,0.06)'
          : '0 12px 40px rgba(2,8,23,0.22)',
        display: 'flex',
        alignItems: 'center',
        gap: 8,
        zIndex: 30,
        transition: 'box-shadow 0.32s var(--ease-out), background 0.32s var(--ease-out)',
      }}
    >
      <motion.span
        animate={{
          scale: [1, 1.2, 1],
          boxShadow: ['0 0 12px var(--accent)', '0 0 18px var(--accent)', '0 0 12px var(--accent)'],
        }}
        transition={{ duration: 2.4, repeat: Infinity, ease: 'easeInOut' }}
        style={{
          width: 8,
          height: 8,
          borderRadius: 999,
          background: 'var(--accent)',
        }}
      />
      {APP_NAME}
    </motion.div>
  );
}

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
        position: 'relative',
      }}
    >
      <a
        href="#main-content"
        style={{
          position: 'absolute',
          insetInlineStart: 16,
          insetBlockStart: -100,
          zIndex: 100,
          padding: '10px 16px',
          borderRadius: 12,
          background: 'var(--accent)',
          color: '#0f172a',
          fontWeight: 700,
          fontSize: 13,
        }}
        onFocus={(event) => {
          event.currentTarget.style.insetBlockStart = '16px';
        }}
        onBlur={(event) => {
          event.currentTarget.style.insetBlockStart = '-100px';
        }}
      >
        Skip to content
      </a>

      <div
        aria-hidden
        style={{
          position: 'fixed',
          inset: 0,
          backgroundImage:
            'linear-gradient(rgba(255,255,255,0.025) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.025) 1px, transparent 1px)',
          backgroundSize: '64px 64px',
          maskImage: 'linear-gradient(180deg, rgba(0,0,0,0.4), transparent 85%)',
          WebkitMaskImage: 'linear-gradient(180deg, rgba(0,0,0,0.4), transparent 85%)',
          pointerEvents: 'none',
          opacity: 0.35,
        }}
      />
      <motion.div
        id="main-content"
        key={activeTab}
        initial={{ opacity: 0, y: 8 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.28, ease: [0.22, 1, 0.36, 1] }}
      >
        <Suspense fallback={<ScreenLoadingFallback />}>
          <ActiveScreen />
        </Suspense>
      </motion.div>
      <BottomNavigation />
      {selectedPlace ? <PlaceDetailsScreen place={selectedPlace} /> : null}
      {selectedCountry ? <CountryDetailsScreen country={selectedCountry} /> : null}
      <BrandBadge />
      <OfflineBanner />
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
