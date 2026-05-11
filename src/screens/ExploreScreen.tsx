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
import { useMotionSafe } from '@/hooks/useMotionSafe';

export function ExploreScreen() {
  const { t } = useI18n();
  const { data: explore, isLoading } = useExplorePlaces();
  const { data: countries } = useCountries();
  const { isFavorite, toggleFavorite } = useFavorites();
  const { openPlace, openCountry } = useNavigation();
  const { toggle: toggleCommandPalette } = useCommandPalette();
  const haptic = useHaptic();
  const motionSafe = useMotionSafe();

  const items = useMemo(() => explore?.items ?? [], [explore]);
  const averagePopularity = useMemo(
    () =>
      items.length
        ? Math.round(items.reduce((sum, place) => sum + place.popularity, 0) / items.length)
        : 0,
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
        className="mb-[22px] flex w-full items-center gap-3 rounded-[18px] border border-[var(--app-border)] bg-[var(--app-surface)] px-[18px] py-[14px] text-left text-[var(--app-text)] shadow-[0_10px_28px_rgba(2,8,23,0.2)] backdrop-blur-md"
      >
        <IconBox size="md">
          <Wand2 size={16} />
        </IconBox>
        <span className="grid flex-1 gap-0.5">
          <strong className="text-sm">Quick actions</strong>
          <span className="text-xs text-[var(--app-text-muted)]">
            Search places, change theme, or jump anywhere
          </span>
        </span>
        <kbd className="rounded-lg border border-[var(--app-border)] px-2 py-1 font-[inherit] text-[11px] text-[var(--app-text-muted)]">
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

      <section className="mb-7">
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
          <motion.div {...motionSafe.stagger()} className="grid gap-[18px]">
            {items.map((place) => (
              <motion.div key={place.id} {...motionSafe.staggerChild()}>
                <PlaceCard
                  place={place}
                  favorite={isFavorite(place.id)}
                  onFavorite={() => toggleFavorite(place)}
                  onOpen={() => openPlace(place)}
                />
              </motion.div>
            ))}
          </motion.div>
        )}
      </section>

      <section className="mb-7">
        <div className="mb-4 flex items-end justify-between gap-3">
          <SectionHeading
            eyebrow="World atlas"
            title={t('countries')}
            description="Swipe through countries presented as a premium horizontal rail."
            value={`${countriesCount}`}
          />
        </div>
        {countries?.length ? (
          <div className="relative">
            <div ref={emblaRef} className="overflow-hidden">
              <div className="flex gap-4">
                {countries.map((country) => (
                  <div key={country.code} className="flex-[0_0_auto]">
                    <CountryCard country={country} onOpen={() => openCountry(country)} />
                  </div>
                ))}
              </div>
            </div>
            <div className="mt-3 flex justify-end gap-2">
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
      className="grid h-[38px] w-[38px] place-items-center rounded-xl border border-[var(--app-border)] bg-[var(--app-surface)] text-[var(--app-text)]"
    >
      {children}
    </button>
  );
}
