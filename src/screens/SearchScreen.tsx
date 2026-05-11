import { useEffect, useRef } from 'react';
import { motion } from 'framer-motion';
import { Radar, Search, Sparkles, X } from 'lucide-react';
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
import { usePlaceSearch } from '@/hooks/usePlaceSearch';
import { useI18n } from '@/i18n/I18nProvider';
import { useFavorites } from '@/state/favorites-context';
import { useNavigation } from '@/state/navigation-context';
import { useHaptic } from '@/hooks/useHaptic';
import { useMotionSafe } from '@/hooks/useMotionSafe';

const SUGGESTIONS = ['Tunisia', 'Patagonia', 'Waterfalls', 'Viewpoints', 'Medina', 'Hidden gems'];

export function SearchScreen() {
  const { t } = useI18n();
  const { searchText, setSearchText, results, isEmpty, isLoading, total, fromCache } =
    usePlaceSearch();
  const { toggleFavorite, isFavorite } = useFavorites();
  const { openPlace } = useNavigation();
  const haptic = useHaptic();
  const motionSafe = useMotionSafe();
  const inputRef = useRef<HTMLInputElement | null>(null);

  // Auto-focus the search field when the screen mounts. useRef + useEffect
  // is the React idiom — replaces the previous getElementById + setTimeout
  // hack which was fragile DOM coupling.
  useEffect(() => {
    inputRef.current?.focus({ preventScroll: true });
  }, []);

  return (
    <ScreenContainer>
      <motion.div {...motionSafe.fadeUp()} className="grid gap-[18px]">
        <section
          className="rounded-[28px] border border-[var(--app-border)] p-[22px] shadow-[0_24px_60px_rgba(2,8,23,0.32)] backdrop-blur-xl"
          style={{
            background:
              'linear-gradient(135deg, var(--accent-soft), rgba(244,114,182,0.1) 55%, rgba(56,189,248,0.08))',
          }}
        >
          <div className="mb-[18px] flex justify-between gap-4">
            <div>
              <span className="mb-2.5 inline-block text-[11px] font-bold uppercase tracking-[0.18em] text-[var(--accent-light)]">
                Precision search
              </span>
              <h1 className="mb-2.5 font-display text-[36px] leading-none tracking-[-0.02em]">
                {t('search')}
              </h1>
              <p className="text-sm leading-[1.6] text-[var(--app-text-muted)]">
                A modern command-bar feel. Strong visibility on search state, map context and
                result quality.
              </p>
            </div>
            <div className="grid h-[60px] w-[60px] flex-shrink-0 place-items-center rounded-[22px] border border-[var(--app-border)] bg-white/[0.08] text-[var(--accent-light)]">
              <Radar size={26} />
            </div>
          </div>

          <label className="grid gap-2.5">
            <span className="sr-only">{t('search')}</span>
            <div
              className="flex items-center gap-3 rounded-[20px] border border-[var(--app-border)] px-4 py-3.5 backdrop-blur-xl"
              style={{ background: 'rgba(7,17,31,0.58)' }}
            >
              <Search size={18} color="var(--accent-light)" />
              <input
                ref={inputRef}
                value={searchText}
                onChange={(event) => setSearchText(event.target.value)}
                placeholder={t('searchPlaceholder')}
                className="w-full border-0 bg-transparent text-[15px] text-[var(--app-text)] outline-none"
              />
              {searchText.length ? (
                <button
                  onClick={() => {
                    setSearchText('');
                    haptic('light');
                  }}
                  aria-label="Clear search"
                  className="rounded-lg p-1.5 text-[var(--app-text-muted)]"
                >
                  <X size={16} />
                </button>
              ) : null}
            </div>
          </label>

          {!searchText.length ? (
            <div className="mt-3.5 flex flex-wrap gap-1.5">
              {SUGGESTIONS.map((suggestion) => (
                <button
                  key={suggestion}
                  onClick={() => {
                    setSearchText(suggestion);
                    haptic('light');
                  }}
                  className="flex items-center gap-1.5 rounded-full border border-[var(--app-border)] bg-white/[0.06] px-3 py-1.5 text-xs font-semibold text-[var(--app-text)]"
                >
                  <Sparkles size={11} color="var(--accent-light)" />
                  {suggestion}
                </button>
              ))}
            </div>
          ) : null}
        </section>

        <FeatureStrip
          items={[
            {
              label: 'Source',
              value: fromCache ? 'Cache' : 'Live',
              accent: fromCache ? 'var(--app-text-muted)' : 'var(--accent-light)',
            },
            { label: 'Results', value: `${total}` },
            { label: 'Status', value: isLoading ? 'Scanning' : 'Ready' },
          ]}
        />

        {results.length ? (
          <section className="grid gap-3.5">
            <SectionHeading
              eyebrow="Map preview"
              title="Live spatial context"
              description="Results anchored to a visual map panel."
            />
            <div className="rounded-[26px] border border-[var(--app-border)] bg-[var(--app-surface)] p-3.5 shadow-[0_24px_60px_rgba(2,8,23,0.28)]">
              <PlacesMap places={results.slice(0, 8)} onSelectPlace={openPlace} />
            </div>
          </section>
        ) : null}

        {searchText.length > 1 ? (
          <SpotlightPanel
            title={
              isLoading
                ? 'Searching across live and cached sources'
                : 'Results ranked for quality and speed'
            }
            description="The search area behaves like a product dashboard: clear status, map-first context and strong system feedback."
            items={[
              { label: 'Matches', value: `${total}` },
              { label: 'Mode', value: fromCache ? 'Offline' : 'Live' },
              { label: 'Intent', value: 'Geo + text' },
            ]}
          />
        ) : null}

        {searchText.length <= 1 ? (
          <EmptyState
            title="Search the planet"
            body="Try Tunisia, Canada, waterfalls, viewpoints, medina, Patagonia or exact coordinates."
          />
        ) : null}
        {isEmpty ? (
          <EmptyState title="No matches found" body="Adjust your text, country or category filters." />
        ) : null}

        <Stack gap="lg">
          {results.map((place) => (
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
