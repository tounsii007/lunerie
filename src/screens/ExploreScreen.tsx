import { useMemo } from 'react';
import useEmblaCarousel from 'embla-carousel-react';
import { ChevronLeft, ChevronRight, Wand2 } from 'lucide-react';
import { motion } from 'framer-motion';
import {
  CountryCard,
  EmptyState,
  FeatureStrip,
  HeroPanel,
  PlaceCard,
  ScreenContainer,
  SectionHeading,
  SpotlightPanel,
} from '@/components/AppShell';
import { SkeletonCountryRail, SkeletonPlaceCard } from '@/components/Skeleton';
import { useCountries } from '@/hooks/useCountries';
import { useExplorePlaces } from '@/hooks/useExplorePlaces';
import { useI18n } from '@/i18n/I18nProvider';
import { useFavorites } from '@/state/favorites-context';
import { useNavigation } from '@/state/navigation-context';
import { useCommandPalette } from '@/state/command-palette-context';
import { useAnimatedCounter } from '@/hooks/useAnimatedCounter';
import { useHaptic } from '@/hooks/useHaptic';

export function ExploreScreen() {
  const { t } = useI18n();
  const { data: explore, isLoading } = useExplorePlaces();
  const { data: countries } = useCountries();
  const { isFavorite, toggleFavorite } = useFavorites();
  const { openPlace, openCountry } = useNavigation();
  const { toggle: toggleCommandPalette } = useCommandPalette();
  const haptic = useHaptic();

  const items = useMemo(() => explore?.items ?? [], [explore]);
  const averagePopularity = useMemo(
    () => (items.length ? Math.round(items.reduce((sum, place) => sum + place.popularity, 0) / items.length) : 0),
    [items],
  );
  const regionsCount = useMemo(
    () => new Set((countries ?? []).map((country) => country.region)).size,
    [countries],
  );
  const countriesCount = countries?.length ?? 0;
  const totalPlaces = explore?.total ?? 0;

  const animatedTotal = useAnimatedCounter(totalPlaces);
  const animatedCountries = useAnimatedCounter(countriesCount);
  const animatedScore = useAnimatedCounter(averagePopularity);

  const [emblaRef, emblaApi] = useEmblaCarousel({ loop: false, align: 'start', dragFree: true });

  const scrollPrev = () => emblaApi?.scrollPrev();
  const scrollNext = () => emblaApi?.scrollNext();

  return (
    <ScreenContainer>
      <HeroPanel
        eyebrow="Live discovery"
        title="Hidden places, styled like a premium product."
        description="A sharper, more editorial Lunerie: live highlights, polished cards and a cleaner mobile hierarchy."
        imageUrl="https://images.pexels.com/photos/210243/pexels-photo-210243.jpeg"
        metrics={[
          { label: 'Live places', value: `${animatedTotal}` },
          { label: 'Countries', value: `${animatedCountries}` },
          { label: 'Avg. score', value: `${animatedScore}%` },
        ]}
      />

      <button
        onClick={() => {
          haptic('light');
          toggleCommandPalette();
        }}
        style={{
          width: '100%',
          marginBottom: 22,
          display: 'flex',
          alignItems: 'center',
          gap: 12,
          padding: '14px 18px',
          borderRadius: 18,
          border: '1px solid var(--app-border)',
          background: 'var(--app-surface)',
          backdropFilter: 'blur(14px)',
          textAlign: 'left',
          boxShadow: '0 10px 28px rgba(2, 8, 23, 0.2)',
          color: 'var(--app-text)',
        }}
      >
        <span
          style={{
            width: 32,
            height: 32,
            borderRadius: 10,
            background: 'var(--accent-soft)',
            color: 'var(--accent)',
            display: 'grid',
            placeItems: 'center',
          }}
        >
          <Wand2 size={16} />
        </span>
        <span style={{ display: 'grid', gap: 2, flex: 1 }}>
          <strong style={{ fontSize: 14 }}>Quick actions</strong>
          <span style={{ fontSize: 12, color: 'var(--app-text-muted)' }}>
            Search places, change theme, or jump anywhere
          </span>
        </span>
        <kbd
          style={{
            padding: '5px 9px',
            borderRadius: 8,
            border: '1px solid var(--app-border)',
            fontSize: 11,
            color: 'var(--app-text-muted)',
            fontFamily: 'inherit',
          }}
        >
          Ctrl K
        </kbd>
      </button>

      <FeatureStrip
        items={[
          { label: 'Curated', value: 'Premium', accent: 'var(--accent-light)' },
          { label: 'Feed', value: 'Editorial' },
          { label: 'Nav', value: 'Glass' },
        ]}
      />

      <SpotlightPanel
        title="Powerful discovery modules"
        description="Every section pushes signal first: trending cards with clearer ranking, country rails with better context, and a hero with product metrics."
        items={[
          { label: 'Trending', value: `${totalPlaces}` },
          { label: 'Regions', value: `${regionsCount}` },
          { label: 'Saved-ready', value: '1 tap' },
        ]}
      />

      <section style={{ marginBottom: 28 }}>
        <SectionHeading
          eyebrow="Explore feed"
          title={t('trending')}
          description="High-contrast cards make destination ranking, context and quick-save actions visible immediately."
          value={`${totalPlaces}`}
        />
        {isLoading && !items.length ? (
          <div style={{ display: 'grid', gap: 18 }} aria-busy="true">
            {[0, 1].map((index) => (
              <SkeletonPlaceCard key={index} />
            ))}
          </div>
        ) : (
          <motion.div
            initial="hidden"
            animate="show"
            variants={{
              hidden: {},
              show: { transition: { staggerChildren: 0.05 } },
            }}
            style={{ display: 'grid', gap: 18 }}
          >
            {items.map((place) => (
              <motion.div
                key={place.id}
                variants={{
                  hidden: { opacity: 0, y: 12 },
                  show: { opacity: 1, y: 0 },
                }}
                transition={{ duration: 0.3, ease: 'easeOut' }}
              >
                <PlaceCard
                  place={place}
                  favorite={isFavorite(place.id)}
                  onFavorite={() => toggleFavorite(place.id)}
                  onOpen={() => openPlace(place)}
                />
              </motion.div>
            ))}
          </motion.div>
        )}
      </section>

      <section style={{ marginBottom: 28 }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'end', marginBottom: 16, gap: 12 }}>
          <SectionHeading
            eyebrow="World atlas"
            title={t('countries')}
            description="Swipe through countries presented as a premium horizontal rail."
            value={`${countriesCount}`}
          />
        </div>
        {countries?.length ? (
          <div style={{ position: 'relative' }}>
            <div ref={emblaRef} style={{ overflow: 'hidden' }}>
              <div style={{ display: 'flex', gap: 16 }}>
                {countries.map((country) => (
                  <div key={country.code} style={{ flex: '0 0 auto' }}>
                    <CountryCard country={country} onOpen={() => openCountry(country)} />
                  </div>
                ))}
              </div>
            </div>
            <div
              style={{
                display: 'flex',
                justifyContent: 'flex-end',
                gap: 8,
                marginTop: 12,
              }}
            >
              <CarouselButton onClick={scrollPrev} aria-label="Previous">
                <ChevronLeft size={16} />
              </CarouselButton>
              <CarouselButton onClick={scrollNext} aria-label="Next">
                <ChevronRight size={16} />
              </CarouselButton>
            </div>
          </div>
        ) : isLoading ? (
          <SkeletonCountryRail />
        ) : (
          <EmptyState title="No countries yet" body="The country catalog will appear here." />
        )}
      </section>
    </ScreenContainer>
  );
}

function CarouselButton({
  children,
  onClick,
  ...rest
}: React.ButtonHTMLAttributes<HTMLButtonElement>) {
  return (
    <button
      onClick={onClick}
      {...rest}
      style={{
        width: 38,
        height: 38,
        borderRadius: 12,
        background: 'var(--app-surface)',
        border: '1px solid var(--app-border)',
        color: 'var(--app-text)',
        display: 'grid',
        placeItems: 'center',
      }}
    >
      {children}
    </button>
  );
}
