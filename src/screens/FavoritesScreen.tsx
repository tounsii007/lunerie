import { useMemo } from 'react';
import { motion } from 'framer-motion';
import { Clock, Heart, MapPin } from 'lucide-react';
import { EmptyState, PlaceCard, ScreenContainer, SectionHeading } from '@/components/AppShell';
import { ScreenHeader, StatCard, Stack } from '@/components/primitives';
import type { Place } from '@/domain/models';
import { useI18n } from '@/i18n/I18nProvider';
import { useFavorites } from '@/state/favorites-context';
import { useNavigation } from '@/state/navigation-context';
import { useAnimatedCounter } from '@/hooks/useAnimatedCounter';
import { useMotionSafe } from '@/hooks/useMotionSafe';

export function FavoritesScreen() {
  const { t } = useI18n();
  const { favorites, recentViews, toggleFavorite, isFavorite } = useFavorites();
  const { openPlace } = useNavigation();
  const motionSafe = useMotionSafe();

  /**
   * Resolve favorites to full Place objects. Three sources, in priority order:
   *   1. Snapshot stored on the favorite itself (new entries — see
   *      favorites-context.toggleFavorite).
   *   2. recentViews — if the user viewed the place recently, its full data
   *      is in our local cache.
   *   3. Drop. Legacy entries written before snapshots existed and never
   *      re-viewed are silently skipped rather than rendered with bogus data.
   *      The previous implementation looked these up in `mockPlaces`, which
   *      was an outright correctness bug.
   */
  const favoritePlaces = useMemo<Place[]>(() => {
    const recentById = new Map(recentViews.map((p) => [p.id, p]));
    const resolved: Place[] = [];
    for (const fav of favorites) {
      const place = fav.place ?? recentById.get(fav.placeId);
      if (place) resolved.push(place);
    }
    return resolved;
  }, [favorites, recentViews]);

  const animatedCount = useAnimatedCounter(favoritePlaces.length);
  const recentCount = useAnimatedCounter(recentViews.length);

  return (
    <ScreenContainer>
      <motion.div {...motionSafe.fadeUp()} className="grid gap-[22px]">
        <ScreenHeader
          eyebrow="Your library"
          title={t('favorites')}
        />

        <div className="grid grid-cols-2 gap-3">
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
            <div className="scrollbar-hidden flex gap-3 overflow-x-auto pb-1">
              {recentViews.slice(0, 8).map((place) => (
                <button
                  key={place.id}
                  onClick={() => openPlace(place)}
                  className="grid w-[180px] min-w-[180px] overflow-hidden rounded-[22px] border border-[var(--app-border)] bg-[var(--app-surface)] text-left shadow-[0_10px_30px_rgba(2,8,23,0.18)]"
                >
                  <img
                    src={place.heroImage.url}
                    alt={place.name}
                    loading="lazy"
                    decoding="async"
                    className="h-[110px] w-full object-cover"
                  />
                  <div className="grid gap-1 p-3">
                    <strong className="text-sm leading-tight">{place.name}</strong>
                    <span className="flex items-center gap-1 text-[11px] text-[var(--app-text-muted)]">
                      <MapPin size={11} />
                      {place.city}
                    </span>
                  </div>
                </button>
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
            <Stack gap="lg">
              {favoritePlaces.map((place) => (
                <PlaceCard
                  key={place.id}
                  place={place}
                  favorite={isFavorite(place.id)}
                  onFavorite={() => toggleFavorite(place)}
                  onOpen={() => openPlace(place)}
                />
              ))}
            </Stack>
          )}
        </section>
      </motion.div>
    </ScreenContainer>
  );
}
