import { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { LocateFixed, Navigation, Radar } from 'lucide-react';
import { EmptyState, FeatureStrip, PlaceCard, ScreenContainer, SectionHeading, SpotlightPanel } from '@/components/AppShell';
import { PlacesMap } from '@/components/PlacesMap';
import { useNearbyPlaces } from '@/hooks/useNearbyPlaces';
import { useI18n } from '@/i18n/I18nProvider';
import { useFavorites } from '@/state/favorites-context';
import { useNavigation } from '@/state/navigation-context';

interface BrowserCoordinates {
  latitude: number;
  longitude: number;
  accuracy?: number;
}

type GeoState = 'pending' | 'live' | 'fallback' | 'denied' | 'unsupported';

export function NearbyScreen() {
  const { t } = useI18n();
  const [coords, setCoords] = useState<BrowserCoordinates | null>(null);
  const [geoState, setGeoState] = useState<GeoState>('pending');
  const { data } = useNearbyPlaces(coords);
  const { toggleFavorite, isFavorite } = useFavorites();
  const { openPlace } = useNavigation();

  useEffect(() => {
    if (!('geolocation' in navigator)) {
      setGeoState('unsupported');
      setCoords({ latitude: 36.8065, longitude: 10.1815 });
      return;
    }

    navigator.geolocation.getCurrentPosition(
      (position) => {
        setCoords({
          latitude: position.coords.latitude,
          longitude: position.coords.longitude,
          accuracy: position.coords.accuracy,
        });
        setGeoState('live');
      },
      (error) => {
        setCoords({ latitude: 36.8065, longitude: 10.1815 });
        setGeoState(error.code === error.PERMISSION_DENIED ? 'denied' : 'fallback');
      },
      { enableHighAccuracy: false, timeout: 5000, maximumAge: 1000 * 60 * 5 },
    );
  }, []);

  const nearbyPlaces = data?.items ?? [];

  const stateColor = geoState === 'live'
    ? '#86efac'
    : geoState === 'denied' || geoState === 'unsupported'
      ? '#fdba74'
      : undefined;
  const stateLabel = geoState === 'live'
    ? 'Active'
    : geoState === 'denied'
      ? 'Denied'
      : geoState === 'unsupported'
        ? 'Unsupported'
        : geoState === 'fallback'
          ? 'Fallback'
          : 'Pending';

  return (
    <ScreenContainer>
      <motion.div
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.32 }}
        style={{ display: 'grid', gap: 18 }}
      >
        <section
          style={{
            padding: 24,
            borderRadius: 28,
            background:
              'linear-gradient(135deg, rgba(34,197,94,0.14), var(--accent-soft) 52%, rgba(56,189,248,0.1))',
            border: '1px solid var(--app-border)',
            boxShadow: '0 24px 60px rgba(2, 8, 23, 0.32)',
            backdropFilter: 'blur(18px)',
            WebkitBackdropFilter: 'blur(18px)',
            position: 'relative',
            overflow: 'hidden',
          }}
        >
          {geoState === 'pending' ? (
            <span
              aria-hidden
              className="breathe-animation"
              style={{
                position: 'absolute',
                top: -80,
                right: -40,
                width: 220,
                height: 220,
                borderRadius: 999,
                background:
                  'radial-gradient(circle at center, rgba(56,189,248,0.32), transparent 70%)',
                pointerEvents: 'none',
              }}
            />
          ) : null}
          <div style={{ display: 'flex', justifyContent: 'space-between', gap: 16, position: 'relative' }}>
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
                  letterSpacing: '-0.022em',
                  fontWeight: 600,
                }}
              >
                {t('nearby')}
              </h1>
              <p style={{ color: 'var(--app-text-muted)', lineHeight: 1.62, fontSize: 14, maxWidth: 280 }}>
                {geoState === 'denied'
                  ? 'Location access is denied — showing a curated default region instead.'
                  : geoState === 'unsupported'
                    ? 'Geolocation is unsupported on this device — showing a curated default region.'
                    : t('locationPermission')}
              </p>
              {geoState === 'live' && coords?.accuracy ? (
                <p
                  style={{
                    fontSize: 11,
                    color: 'var(--app-text-muted)',
                    marginTop: 8,
                    fontVariantNumeric: 'tabular-nums',
                    letterSpacing: '0.04em',
                  }}
                >
                  Accuracy ±{Math.round(coords.accuracy)} m · {coords.latitude.toFixed(3)}, {coords.longitude.toFixed(3)}
                </p>
              ) : null}
            </div>
            <motion.div
              animate={geoState === 'live' ? { scale: 1, rotate: 0 } : { scale: [1, 1.08, 1] }}
              transition={
                geoState === 'live'
                  ? { type: 'spring', damping: 18, stiffness: 280 }
                  : { duration: 1.5, repeat: Infinity }
              }
              style={{
                width: 64,
                height: 64,
                borderRadius: 22,
                background:
                  geoState === 'live'
                    ? 'rgba(34,197,94,0.18)'
                    : geoState === 'denied' || geoState === 'unsupported'
                      ? 'rgba(253,186,116,0.18)'
                      : 'rgba(255,255,255,0.08)',
                border:
                  geoState === 'live'
                    ? '1px solid rgba(34,197,94,0.45)'
                    : geoState === 'denied' || geoState === 'unsupported'
                      ? '1px solid rgba(253,186,116,0.45)'
                      : '1px solid var(--app-border)',
                display: 'grid',
                placeItems: 'center',
                flexShrink: 0,
                color: stateColor ?? 'var(--app-text)',
                boxShadow:
                  geoState === 'live'
                    ? '0 12px 26px rgba(34,197,94,0.3)'
                    : '0 12px 26px rgba(2, 8, 23, 0.22)',
              }}
            >
              {geoState === 'live'
                ? <Navigation size={26} strokeWidth={2.4} />
                : geoState === 'pending'
                  ? <Radar size={26} />
                  : <LocateFixed size={26} />}
            </motion.div>
          </div>
        </section>

        <FeatureStrip
          items={[
            { label: 'GPS', value: stateLabel, accent: stateColor },
            { label: 'Nearby', value: `${nearbyPlaces.length}` },
            { label: 'Map', value: nearbyPlaces.length ? 'Live' : 'Idle' },
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
                aria-busy="true"
                aria-label="Loading map"
                style={{ height: 260, borderRadius: 20 }}
              />
            )}
          </div>
        </section>

        <SpotlightPanel
          title="Nearby is presented as a feature layer"
          description="Geolocation framed as a premium capability with visible system state, live map context and fast-scannable metrics."
          items={[
            { label: 'Coordinates', value: coords ? 'Ready' : 'Waiting' },
            { label: 'Map', value: nearbyPlaces.length ? 'Live' : 'Idle' },
            { label: 'Open', value: 'Tap card' },
          ]}
        />

        {!nearbyPlaces.length ? (
          <EmptyState
            title="Waiting for nearby places"
            body="Location-based results will appear here as soon as coordinates are available."
          />
        ) : null}

        <section style={{ display: 'grid', gap: 18 }} aria-label="Nearby places">
          {nearbyPlaces.map((place, index) => (
            <motion.div
              key={place.id}
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.04 * index, duration: 0.32 }}
            >
              <PlaceCard
                place={place}
                favorite={isFavorite(place.id)}
                onFavorite={() => toggleFavorite(place.id)}
                onOpen={() => openPlace(place)}
              />
            </motion.div>
          ))}
        </section>
      </motion.div>
    </ScreenContainer>
  );
}
