import { useMemo } from 'react';
import { motion } from 'framer-motion';
import { Clock, Heart, MapPin } from 'lucide-react';
import { EmptyState, PlaceCard, ScreenContainer, SectionHeading } from '@/components/AppShell';
import { mockPlaces } from '@/data/mockPlaces';
import { useI18n } from '@/i18n/I18nProvider';
import { useFavorites } from '@/state/favorites-context';
import { useNavigation } from '@/state/navigation-context';
import { useAnimatedCounter } from '@/hooks/useAnimatedCounter';

export function FavoritesScreen() {
  const { t } = useI18n();
  const { favorites, recentViews, toggleFavorite, isFavorite } = useFavorites();
  const { openPlace } = useNavigation();

  const favoritePlaces = useMemo(
    () => mockPlaces.filter((place) => favorites.some((favorite) => favorite.placeId === place.id)),
    [favorites],
  );

  const animatedCount = useAnimatedCounter(favoritePlaces.length);
  const recentCount = useAnimatedCounter(recentViews.length);

  return (
    <ScreenContainer>
      <motion.div
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3 }}
        style={{ display: 'grid', gap: 22 }}
      >
        <header style={{ display: 'grid', gap: 8 }}>
          <span style={{ fontSize: 11, letterSpacing: '0.22em', textTransform: 'uppercase', color: 'var(--accent-light)', fontWeight: 700 }}>
            Your library
          </span>
          <h1
            style={{
              fontFamily: '"Fraunces", serif',
              fontSize: 38,
              lineHeight: 1,
              letterSpacing: '-0.022em',
              fontWeight: 600,
            }}
          >
            {t('favorites')}
          </h1>
        </header>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: 12 }}>
          <StatCard icon={<Heart size={16} />} value={animatedCount} label="Saved" />
          <StatCard icon={<Clock size={16} />} value={recentCount} label="Recently viewed" />
        </div>

        {recentViews.length ? (
          <section>
            <SectionHeading
              eyebrow="Recent"
              title="Continue exploring"
              description="Pick up where you left off."
              value={`${recentViews.length}`}
            />
            <div
              className="scrollbar-hidden"
              style={{ display: 'flex', gap: 12, overflowX: 'auto', paddingBottom: 4 }}
            >
              {recentViews.slice(0, 8).map((place, index) => (
                <motion.button
                  key={place.id}
                  initial={{ opacity: 0, x: 12 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.04 * index, duration: 0.32 }}
                  whileHover={{ y: -2 }}
                  whileTap={{ scale: 0.97 }}
                  onClick={() => openPlace(place)}
                  style={{
                    width: 180,
                    minWidth: 180,
                    borderRadius: 22,
                    overflow: 'hidden',
                    background: 'var(--app-surface)',
                    border: '1px solid var(--app-border)',
                    textAlign: 'left',
                    boxShadow: '0 10px 30px rgba(2, 8, 23, 0.22)',
                  }}
                >
                  <div style={{ position: 'relative' }}>
                    <img
                      src={place.heroImage.url}
                      alt={place.name}
                      loading="lazy"
                      decoding="async"
                      style={{ width: '100%', height: 110, objectFit: 'cover', display: 'block' }}
                    />
                    <div
                      aria-hidden
                      style={{
                        position: 'absolute',
                        inset: 0,
                        background: 'linear-gradient(180deg, transparent 60%, rgba(2,6,23,0.42))',
                      }}
                    />
                  </div>
                  <div style={{ padding: 12, display: 'grid', gap: 4 }}>
                    <strong style={{ fontSize: 14, lineHeight: 1.22, letterSpacing: '-0.008em' }}>{place.name}</strong>
                    <span
                      style={{
                        fontSize: 11,
                        color: 'var(--app-text-muted)',
                        display: 'flex',
                        alignItems: 'center',
                        gap: 4,
                      }}
                    >
                      <MapPin size={11} />
                      {place.city}
                    </span>
                  </div>
                </motion.button>
              ))}
            </div>
          </section>
        ) : null}

        <section>
          <SectionHeading
            eyebrow="Saved"
            title="Your favorite places"
            description="Everything you bookmark is stored locally and stays with you."
            value={`${favoritePlaces.length}`}
          />
          {!favoritePlaces.length ? (
            <EmptyState title="No favorites yet" body={t('emptyFavorites')} />
          ) : (
            <div style={{ display: 'grid', gap: 18 }}>
              {favoritePlaces.map((place) => (
                <PlaceCard
                  key={place.id}
                  place={place}
                  favorite={isFavorite(place.id)}
                  onFavorite={() => toggleFavorite(place.id)}
                  onOpen={() => openPlace(place)}
                />
              ))}
            </div>
          )}
        </section>
      </motion.div>
    </ScreenContainer>
  );
}

function StatCard({ icon, value, label }: { icon: React.ReactNode; value: number; label: string }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4 }}
      style={{
        padding: 16,
        borderRadius: 20,
        background: 'var(--app-surface)',
        border: '1px solid var(--app-border)',
        backdropFilter: 'blur(14px)',
        WebkitBackdropFilter: 'blur(14px)',
        display: 'grid',
        gap: 8,
        boxShadow: 'var(--shadow-soft, 0 10px 30px rgba(2, 8, 23, 0.18))',
      }}
    >
      <span
        style={{
          width: 30,
          height: 30,
          borderRadius: 10,
          background:
            'radial-gradient(circle at 30% 30%, var(--accent-soft), transparent 80%), var(--accent-soft)',
          color: 'var(--accent)',
          display: 'grid',
          placeItems: 'center',
        }}
      >
        {icon}
      </span>
      <strong
        style={{
          fontSize: 26,
          fontWeight: 800,
          letterSpacing: '-0.02em',
          fontVariantNumeric: 'tabular-nums',
        }}
      >
        {value}
      </strong>
      <span
        style={{
          fontSize: 11,
          color: 'var(--app-text-muted)',
          textTransform: 'uppercase',
          letterSpacing: '0.1em',
          fontWeight: 600,
        }}
      >
        {label}
      </span>
    </motion.div>
  );
}
