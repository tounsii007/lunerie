import { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { LocateFixed, Navigation } from 'lucide-react';
import {
  EmptyState,
  FeatureStrip,
  PlaceCard,
  ScreenContainer,
  SectionHeading,
  SpotlightPanel,
} from '@/components/AppShell';
import { Stack } from '@/components/primitives';
import { PlacesMap } from '@/components/PlacesMap';
import { useNearbyPlaces } from '@/hooks/useNearbyPlaces';
import { useI18n } from '@/i18n/I18nProvider';
import { useFavorites } from '@/state/favorites-context';
import { useNavigation } from '@/state/navigation-context';
import { useMotionSafe } from '@/hooks/useMotionSafe';

interface BrowserCoordinates {
  latitude: number;
  longitude: number;
}

export function NearbyScreen() {
  const { t } = useI18n();
  const [coords, setCoords] = useState<BrowserCoordinates | null>(null);
  const { data } = useNearbyPlaces(coords);
  const { toggleFavorite, isFavorite } = useFavorites();
  const { openPlace } = useNavigation();
  const motionSafe = useMotionSafe();

  useEffect(() => {
    if (!('geolocation' in navigator)) {
      return;
    }
    navigator.geolocation.getCurrentPosition(
      (position) =>
        setCoords({
          latitude: position.coords.latitude,
          longitude: position.coords.longitude,
        }),
      () => setCoords({ latitude: 36.8065, longitude: 10.1815 }),
      { enableHighAccuracy: false, timeout: 5000, maximumAge: 1000 * 60 * 5 },
    );
  }, []);

  const nearbyPlaces = data?.items ?? [];

  return (
    <ScreenContainer>
      <motion.div {...motionSafe.fadeUp()} className="grid gap-[18px]">
        <section
          className="rounded-[28px] border border-[var(--app-border)] p-[22px] shadow-[0_24px_60px_rgba(2,8,23,0.32)] backdrop-blur-xl"
          style={{
            background:
              'linear-gradient(135deg, rgba(34,197,94,0.14), var(--accent-soft) 52%, rgba(56,189,248,0.1))',
          }}
        >
          <div className="flex justify-between gap-4">
            <div>
              <span className="mb-2.5 inline-block text-[11px] font-bold uppercase tracking-[0.18em] text-[#86efac]">
                Hyperlocal mode
              </span>
              <h1 className="mb-2.5 font-display text-[36px] leading-none tracking-[-0.02em]">
                {t('nearby')}
              </h1>
              <p className="text-sm leading-[1.6] text-[var(--app-text-muted)]">
                {t('locationPermission')}
              </p>
            </div>
            <motion.div
              animate={coords || motionSafe.reduce ? { scale: 1 } : { scale: [1, 1.08, 1] }}
              transition={coords || motionSafe.reduce ? {} : { duration: 1.5, repeat: Infinity }}
              className={`grid h-[60px] w-[60px] flex-shrink-0 place-items-center rounded-[22px] border ${
                coords
                  ? 'border-[rgba(34,197,94,0.4)] bg-[rgba(34,197,94,0.18)] text-[#86efac]'
                  : 'border-[var(--app-border)] bg-white/[0.08] text-[var(--app-text)]'
              }`}
            >
              {coords ? <Navigation size={24} /> : <LocateFixed size={26} />}
            </motion.div>
          </div>
        </section>

        <FeatureStrip
          items={[
            {
              label: 'GPS',
              value: coords ? 'Active' : 'Pending',
              accent: coords ? '#86efac' : undefined,
            },
            { label: 'Nearby', value: `${nearbyPlaces.length}` },
            { label: 'Fallback', value: coords ? 'No' : 'Yes' },
          ]}
        />

        <section className="grid gap-3.5">
          <SectionHeading
            eyebrow="Geo surface"
            title="Location-first discovery"
            description="The nearby experience opens with a strong operational map and clear state visibility."
          />
          <div className="rounded-[26px] border border-[var(--app-border)] bg-[var(--app-surface)] p-3.5 shadow-[0_24px_60px_rgba(2,8,23,0.28)]">
            {nearbyPlaces.length ? (
              <PlacesMap places={nearbyPlaces} onSelectPlace={openPlace} />
            ) : (
              <div className="skeleton h-[260px] rounded-[20px]" />
            )}
          </div>
        </section>

        <SpotlightPanel
          title="Nearby is presented as a feature layer"
          description="Geolocation framed as a premium capability with visible system state, live map context and fast-scannable metrics."
          items={[
            { label: 'Coordinates', value: coords ? 'Ready' : 'Waiting' },
            { label: 'Map', value: 'Live' },
            { label: 'Open', value: 'Tap card' },
          ]}
        />

        {!nearbyPlaces.length ? (
          <EmptyState
            title="Waiting for nearby places"
            body="Location-based results will appear here as soon as coordinates are available."
          />
        ) : null}

        <Stack gap="lg">
          {nearbyPlaces.map((place) => (
            <PlaceCard
              key={place.id}
              place={place}
              favorite={isFavorite(place.id)}
              onFavorite={() => toggleFavorite(place)}
              onOpen={() => openPlace(place)}
            />
          ))}
        </Stack>
      </motion.div>
    </ScreenContainer>
  );
}
