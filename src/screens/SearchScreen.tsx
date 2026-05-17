import { useEffect, useState } from 'react';
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
  const { searchText, setSearchText, results, isEmpty, isLoading, isPending, total, fromCache } = usePlaceSearch();
  const { toggleFavorite, isFavorite } = useFavorites();
  const { openPlace } = useNavigation();
  const haptic = useHaptic();
  const [focused, setFocused] = useState(false);

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
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: 12,
                padding: '14px 16px',
                borderRadius: 20,
                border: focused
                  ? '1px solid var(--accent)'
                  : '1px solid var(--app-border)',
                background: 'rgba(7,17,31,0.58)',
                backdropFilter: 'blur(18px)',
                WebkitBackdropFilter: 'blur(18px)',
                boxShadow: focused ? '0 0 0 4px var(--accent-soft)' : 'none',
                transition: 'border-color 0.2s var(--ease-out), box-shadow 0.2s var(--ease-out)',
              }}
            >
              <motion.span
                animate={focused ? { rotate: [0, -8, 8, 0] } : { rotate: 0 }}
                transition={{ duration: 0.5 }}
                style={{ display: 'inline-flex', color: 'var(--accent-light)' }}
              >
                <Search size={18} />
              </motion.span>
              <input
                id="lunerie-search-input"
                type="search"
                inputMode="search"
                autoComplete="off"
                spellCheck={false}
                aria-label={t('search')}
                value={searchText}
                onFocus={() => setFocused(true)}
                onBlur={() => setFocused(false)}
                onChange={(event) => setSearchText(event.target.value)}
                placeholder={t('searchPlaceholder')}
                className="w-full border-0 bg-transparent text-[15px] text-[var(--app-text)] outline-none"
              />
              {searchText.length ? (
                <motion.button
                  initial={{ opacity: 0, scale: 0.7 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.7 }}
                  whileTap={{ scale: 0.85 }}
                  onClick={() => {
                    setSearchText('');
                    haptic('light');
                  }}
                  aria-label="Clear search"
                  style={{
                    padding: 6,
                    borderRadius: 10,
                    color: 'var(--app-text-muted)',
                    background: 'rgba(255,255,255,0.06)',
                  }}
                >
                  <X size={16} />
                </motion.button>
              ) : null}
            </div>
          </label>

          {!searchText.length ? (
            <div
              role="list"
              aria-label="Suggested searches"
              style={{ display: 'flex', gap: 6, flexWrap: 'wrap', marginTop: 14 }}
            >
              {SUGGESTIONS.map((suggestion, index) => (
                <motion.button
                  role="listitem"
                  key={suggestion}
                  initial={{ opacity: 0, y: 6 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.04 * index, duration: 0.3 }}
                  whileHover={{ y: -1 }}
                  whileTap={{ scale: 0.96 }}
                  onClick={() => {
                    setSearchText(suggestion);
                    haptic('light');
                  }}
                  style={{
                    padding: '8px 14px',
                    borderRadius: 999,
                    fontSize: 12,
                    fontWeight: 600,
                    background: 'rgba(255,255,255,0.06)',
                    border: '1px solid var(--app-border)',
                    color: 'var(--app-text)',
                    display: 'flex',
                    alignItems: 'center',
                    gap: 6,
                    backdropFilter: 'blur(10px)',
                    WebkitBackdropFilter: 'blur(10px)',
                  }}
                >
                  <Sparkles size={11} color="var(--accent-light)" />
                  {suggestion}
                </motion.button>
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
            {
              label: 'Status',
              value: isPending ? 'Typing' : isLoading ? 'Scanning' : 'Ready',
              accent: isPending || isLoading ? 'var(--accent-light)' : undefined,
            },
          ]}
        />

        {searchText.length > 1 && !isLoading ? (
          <motion.div
            key={`summary-${total}-${searchText}`}
            initial={{ opacity: 0, y: 6 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.32 }}
            role="status"
            aria-live="polite"
            style={{
              display: 'inline-flex',
              alignSelf: 'start',
              alignItems: 'center',
              gap: 8,
              padding: '8px 14px',
              borderRadius: 999,
              background: 'var(--app-surface)',
              border: '1px solid var(--app-border)',
              fontSize: 13,
              color: 'var(--app-text-muted)',
              backdropFilter: 'blur(12px)',
              WebkitBackdropFilter: 'blur(12px)',
            }}
          >
            <span style={{ color: 'var(--accent-light)', fontWeight: 700, fontVariantNumeric: 'tabular-nums' }}>
              {total}
            </span>
            {total === 1 ? 'result' : 'results'} for
            <span
              style={{
                fontWeight: 700,
                color: 'var(--app-text)',
                background: 'var(--accent-soft)',
                padding: '2px 8px',
                borderRadius: 8,
              }}
            >
              {searchText.trim().slice(0, 32)}
            </span>
          </motion.div>
        ) : null}

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

        <section
          aria-label="Search results"
          aria-busy={isLoading}
          aria-live="polite"
          style={{ display: 'grid', gap: 18 }}
        >
          {results.map((place, index) => (
            <motion.div
              key={place.id}
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.04 * Math.min(index, 5), duration: 0.32 }}
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
