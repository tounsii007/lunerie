import { Suspense, useEffect, useState } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { Download, RefreshCw, WifiOff, X } from 'lucide-react';
import { AppProviders } from '@/app/providers';
import { screenRegistry } from '@/app/screen-registry';
import { BottomNavigation, ScreenContainer } from '@/components/AppShell';
import { SkeletonHero, SkeletonPlaceCard } from '@/components/Skeleton';
import { APP_NAME, SPLASH_DURATION_MS } from '@/constants/app';
import { useI18n } from '@/i18n/I18nProvider';
import { useInstallPrompt } from '@/hooks/useInstallPrompt';
import { useOnlineStatus } from '@/hooks/useOnlineStatus';
import { useNavigation } from '@/state/navigation-context';
import { usePreferences } from '@/state/preferences-context';
import { CountryDetailsScreen } from '@/screens/CountryDetailsScreen';
import { OnboardingScreen } from '@/screens/OnboardingScreen';
import { PlaceDetailsScreen } from '@/screens/PlaceDetailsScreen';
import { SplashScreen } from '@/screens/SplashScreen';
import { applyServiceWorkerUpdate, onServiceWorkerUpdate } from '@/services/serviceWorker';

const INSTALL_DISMISSED_KEY = 'lunerie/install-dismissed-at';
const INSTALL_REMIND_AFTER_MS = 7 * 24 * 60 * 60 * 1000;

function InstallChip() {
  const { t } = useI18n();
  const { canPrompt, prompt } = useInstallPrompt();
  const [hidden, setHidden] = useState(() => {
    try {
      const value = localStorage.getItem(INSTALL_DISMISSED_KEY);
      if (!value) return false;
      const dismissed = Number.parseInt(value, 10);
      return Number.isFinite(dismissed) && Date.now() - dismissed < INSTALL_REMIND_AFTER_MS;
    } catch {
      return false;
    }
  });

  if (!canPrompt || hidden) return null;

  const handleInstall = async () => {
    const outcome = await prompt();
    if (outcome === 'accepted' || outcome === 'unavailable') {
      setHidden(true);
    } else {
      localStorage.setItem(INSTALL_DISMISSED_KEY, Date.now().toString());
      setHidden(true);
    }
  };

  const handleDismiss = () => {
    localStorage.setItem(INSTALL_DISMISSED_KEY, Date.now().toString());
    setHidden(true);
  };

  return (
    <motion.div
      initial={{ y: 80, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      exit={{ y: 80, opacity: 0 }}
      transition={{ type: 'spring', damping: 24, stiffness: 320 }}
      role="region"
      aria-label={t('pwa.installTitle')}
      style={{
        position: 'fixed',
        insetInline: 16,
        insetBlockEnd: 96,
        zIndex: 38,
        display: 'flex',
        justifyContent: 'center',
        pointerEvents: 'none',
      }}
    >
      <div
        style={{
          pointerEvents: 'auto',
          display: 'flex',
          alignItems: 'center',
          gap: 10,
          padding: '10px 12px 10px 14px',
          borderRadius: 999,
          background: 'var(--app-chip-bg-strong)',
          backdropFilter: 'blur(24px) saturate(160%)',
          WebkitBackdropFilter: 'blur(24px) saturate(160%)',
          border: '1px solid var(--accent-soft)',
          boxShadow: 'var(--app-chip-shadow)',
          color: 'var(--app-text)',
          maxWidth: 'min(420px, 100%)',
        }}
      >
        <span
          aria-hidden
          style={{
            width: 32,
            height: 32,
            borderRadius: 12,
            background: 'linear-gradient(135deg, var(--accent), var(--accent-light))',
            display: 'grid',
            placeItems: 'center',
            color: '#0f172a',
            flexShrink: 0,
            boxShadow: '0 8px 20px var(--accent-glow)',
          }}
        >
          <Download size={16} strokeWidth={2.4} aria-hidden />
        </span>
        <span style={{ display: 'grid', gap: 1, minWidth: 0, flex: 1 }}>
          <strong style={{ fontSize: 13, lineHeight: 1.2 }}>{t('pwa.installTitle')}</strong>
          <span style={{ fontSize: 11, color: 'var(--app-text-muted)' }}>
            {t('pwa.installBody')}
          </span>
        </span>
        <motion.button
          whileTap={{ scale: 0.95 }}
          onClick={handleInstall}
          style={{
            padding: '8px 14px',
            borderRadius: 999,
            background: 'linear-gradient(135deg, var(--accent), var(--accent-light))',
            color: '#0f172a',
            fontWeight: 800,
            fontSize: 12,
            letterSpacing: '0.02em',
            boxShadow: '0 6px 18px var(--accent-glow)',
          }}
        >
          {t('pwa.installCta')}
        </motion.button>
        <button
          onClick={handleDismiss}
          aria-label={t('pwa.installDismiss')}
          style={{
            padding: 6,
            borderRadius: 999,
            color: 'var(--app-text-muted)',
            background: 'rgba(148,163,184,0.12)',
          }}
        >
          <X size={14} />
        </button>
      </div>
    </motion.div>
  );
}

function UpdateBanner() {
  const { t } = useI18n();
  const [updateReady, setUpdateReady] = useState(false);

  useEffect(() => {
    return onServiceWorkerUpdate(() => setUpdateReady(true));
  }, []);

  if (!updateReady) return null;

  return (
    <motion.div
      initial={{ y: -64, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      transition={{ type: 'spring', damping: 24, stiffness: 320 }}
      role="status"
      aria-live="polite"
      style={{
        position: 'fixed',
        insetInline: 0,
        top: 60,
        zIndex: 95,
        display: 'flex',
        justifyContent: 'center',
        paddingInline: 16,
        pointerEvents: 'none',
      }}
    >
      <div
        style={{
          pointerEvents: 'auto',
          display: 'inline-flex',
          alignItems: 'center',
          gap: 10,
          padding: '10px 14px 10px 16px',
          borderRadius: 999,
          background: 'var(--app-chip-bg-strong)',
          backdropFilter: 'blur(24px) saturate(160%)',
          WebkitBackdropFilter: 'blur(24px) saturate(160%)',
          border: '1px solid var(--accent-soft)',
          boxShadow: 'var(--app-chip-shadow)',
          color: 'var(--accent-light)',
          fontSize: 12,
          fontWeight: 700,
          letterSpacing: '0.04em',
        }}
      >
        <RefreshCw size={14} aria-hidden />
        {t('pwa.updateReady')}
        <button
          onClick={applyServiceWorkerUpdate}
          style={{
            padding: '6px 12px',
            borderRadius: 999,
            background: 'linear-gradient(135deg, var(--accent), var(--accent-light))',
            color: '#0f172a',
            fontWeight: 800,
            fontSize: 11,
            letterSpacing: '0.04em',
            marginInlineStart: 4,
          }}
        >
          {t('pwa.updateCta')}
        </button>
      </div>
    </motion.div>
  );
}

function OfflineBanner() {
  const { t } = useI18n();
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
              background: 'var(--app-chip-bg-strong)',
              backdropFilter: 'blur(18px) saturate(160%)',
              WebkitBackdropFilter: 'blur(18px) saturate(160%)',
              border: '1px solid rgba(253, 186, 116, 0.35)',
              color: '#fdba74',
              fontSize: 12,
              fontWeight: 700,
              letterSpacing: '0.04em',
              boxShadow: 'var(--app-chip-shadow)',
            }}
          >
            <WifiOff size={14} aria-hidden />
            {t('pwa.offline')}
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
        background: scrolled ? 'var(--app-chip-bg-strong)' : 'var(--app-chip-bg)',
        border: '1px solid var(--accent-soft)',
        backdropFilter: 'blur(20px) saturate(160%)',
        WebkitBackdropFilter: 'blur(20px) saturate(160%)',
        fontSize: 11,
        fontWeight: 700,
        letterSpacing: '0.16em',
        textTransform: 'uppercase',
        color: 'var(--accent-light)',
        boxShadow: scrolled ? 'var(--app-chip-shadow)' : 'var(--shadow-soft)',
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
  const { t } = useI18n();
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
        {t('skipToContent')}
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
      <UpdateBanner />
      <AnimatePresence>
        <InstallChip />
      </AnimatePresence>
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
