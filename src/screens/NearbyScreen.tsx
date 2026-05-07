import { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { LocateFixed, Navigation } from 'lucide-react';
import { EmptyState, FeatureStrip, PlaceCard, ScreenContainer, SectionHeading, SpotlightPanel } from '@/components/AppShell';
import { PlacesMap } from '@/components/PlacesMap';
import { useNearbyPlaces } from '@/hooks/useNearbyPlaces';
import { useI18n } from '@/i18n/I18nProvider';
import { useFavorites } from '@/state/favorites-context';
import { useNavigation } from '@/state/navigation-context';

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

  useEffect(() => {
    if (!('geolocation' in navigator)) {
      return;
    }

    navigator.geolocation.getCurrentPosition(
      (position) => setCoords({ latitude: position.coords.latitude, longitude: position.coords.longitude }),
      () => setCoords({ latitude: 36.8065, longitude: 10.1815 }),
      { enableHighAccuracy: false, timeout: 5000, maximumAge: 1000 * 60 * 5 },
    );
  }, []);

  const nearbyPlaces = data?.items ?? [];

  return (
    <ScreenContainer>
      <motion.div
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3 }}
        style={{ display: 'grid', gap: 18 }}
      >
        <section
          style={{
            padding: 22,
            borderRadius: 28,
            background:
              'linear-gradient(135deg, rgba(34,197,94,0.14), var(--accent-soft) 52%, rgba(56,189,248,0.1))',
            border: '1px solid var(--app-border)',
            boxShadow: '0 24px 60px rgba(2, 8, 23, 0.32)',
            backdropFilter: 'blur(18px)',
          }}
        >
          <div style={{ display: 'flex', justifyContent: 'space-between', gap: 16 }}>
            <div>
              <span
                style={{
                  display: 'inline-block',
                  marginBottom: 10,
                  fontSize: 11,
                  letterSpacing: '0.18em',
                  textTransform: 'uppercase',
                  color: '#86efac',
                  fontWeight: 700,
                }}
              >
                Hyperlocal mode
              </span>
              <h1
                style={{
                  fontFamily: '"Fraunces", serif',
                  fontSize: 36,
                  lineHeight: 1,
                  marginBottom: 10,
                  letterSpacing: '-0.02em',
                }}
              >
                {t('nearby')}
              </h1>
              <p style={{ color: 'var(--app-text-muted)', lineHeight: 1.6, fontSize: 14 }}>
                {t('locationPermission')}
              </p>
            </div>
            <motion.div
              animate={coords ? { scale: 1 } : { scale: [1, 1.08, 1] }}
              transition={coords ? {} : { duration: 1.5, repeat: Infinity }}
              style={{
                width: 60,
                height: 60,
                borderRadius: 22,
                background: coords ? 'rgba(34,197,94,0.18)' : 'rgba(255,255,255,0.08)',
                border: coords ? '1px solid rgba(34,197,94,0.4)' : '1px solid var(--app-border)',
                display: 'grid',
                placeItems: 'center',
                flexShrink: 0,
                color: coords ? '#86efac' : 'var(--app-text)',
              }}
            >
              {coords ? <Navigation size={24} /> : <LocateFixed size={26} />}
            </motion.div>
          </div>
        </section>

        <FeatureStrip
          items={[
            { label: 'GPS', value: coords ? 'Active' : 'Pending', accent: coords ? '#86efac' : undefined },
            { label: 'Nearby', value: `${nearbyPlaces.length}` },
            { label: 'Fallback', value: coords ? 'No' : 'Yes' },
          ]}
        />

        <section style={{ display: 'grid', gap: 14 }}>
          <SectionHeading
            eyebrow="Geo surface"
            title="Location-first discovery"
            description="The nearby experience opens with a strong operational map and clear state visibility."
          />
          <div
            style={{
              padding: 14,
              borderRadius: 26,
              background: 'var(--app-surface)',
              border: '1px solid var(--app-border)',
              boxShadow: '0 24px 60px rgba(2, 8, 23, 0.28)',
            }}
          >
            {nearbyPlaces.length ? (
              <PlacesMap places={nearbyPlaces} onSelectPlace={openPlace} />
            ) : (
              <div
                className="skeleton"
                style={{
                  height: 260,
                  borderRadius: 20,
                }}
              />
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

        <section style={{ display: 'grid', gap: 18 }}>
          {nearbyPlaces.map((place) => (
            <PlaceCard
              key={place.id}
              place={place}
              favorite={isFavorite(place.id)}
              onFavorite={() => toggleFavorite(place.id)}
              onOpen={() => openPlace(place)}
            />
          ))}
        </section>
      </motion.div>
    </ScreenContainer>
  );
}
