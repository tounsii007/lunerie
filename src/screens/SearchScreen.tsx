import { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { Radar, Search, Sparkles, X } from 'lucide-react';
import { EmptyState, FeatureStrip, PlaceCard, ScreenContainer, SectionHeading, SpotlightPanel } from '@/components/AppShell';
import { PlacesMap } from '@/components/PlacesMap';
import { usePlaceSearch } from '@/hooks/usePlaceSearch';
import { useI18n } from '@/i18n/I18nProvider';
import { useFavorites } from '@/state/favorites-context';
import { useNavigation } from '@/state/navigation-context';
import { useHaptic } from '@/hooks/useHaptic';

const SUGGESTIONS = ['Tunisia', 'Patagonia', 'Waterfalls', 'Viewpoints', 'Medina', 'Hidden gems'];

export function SearchScreen() {
  const { t } = useI18n();
  const { searchText, setSearchText, results, isEmpty, isLoading, total, fromCache } = usePlaceSearch();
  const { toggleFavorite, isFavorite } = useFavorites();
  const { openPlace } = useNavigation();
  const haptic = useHaptic();
  const [focused, setFocused] = useState(false);

  useEffect(() => {
    const id = window.setTimeout(() => {
      const input = document.getElementById('lunerie-search-input') as HTMLInputElement | null;
      input?.focus();
    }, 200);
    return () => window.clearTimeout(id);
  }, []);

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
              'linear-gradient(135deg, var(--accent-soft), rgba(244,114,182,0.1) 55%, rgba(56,189,248,0.08))',
            border: '1px solid var(--app-border)',
            boxShadow: '0 24px 60px rgba(2, 8, 23, 0.32)',
            backdropFilter: 'blur(18px)',
          }}
        >
          <div style={{ display: 'flex', justifyContent: 'space-between', gap: 16, marginBottom: 18 }}>
            <div>
              <span
                style={{
                  display: 'inline-block',
                  marginBottom: 10,
                  fontSize: 11,
                  letterSpacing: '0.18em',
                  textTransform: 'uppercase',
                  color: 'var(--accent-light)',
                  fontWeight: 700,
                }}
              >
                Precision search
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
                {t('search')}
              </h1>
              <p style={{ color: 'var(--app-text-muted)', lineHeight: 1.6, fontSize: 14 }}>
                A modern command-bar feel. Strong visibility on search state, map context and result quality.
              </p>
            </div>
            <div
              style={{
                width: 60,
                height: 60,
                borderRadius: 22,
                background: 'rgba(255,255,255,0.08)',
                border: '1px solid var(--app-border)',
                display: 'grid',
                placeItems: 'center',
                flexShrink: 0,
                color: 'var(--accent-light)',
              }}
            >
              <Radar size={26} />
            </div>
          </div>

          <label style={{ display: 'grid', gap: 10 }}>
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
                style={{
                  width: '100%',
                  background: 'transparent',
                  border: 0,
                  color: 'var(--app-text)',
                  outline: 'none',
                  fontSize: 15,
                }}
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
            { label: 'Source', value: fromCache ? 'Cache' : 'Live', accent: fromCache ? 'var(--app-text-muted)' : 'var(--accent-light)' },
            { label: 'Results', value: `${total}` },
            { label: 'Status', value: isLoading ? 'Scanning' : 'Ready' },
          ]}
        />

        {results.length ? (
          <section style={{ display: 'grid', gap: 14 }}>
            <SectionHeading
              eyebrow="Map preview"
              title="Live spatial context"
              description="Results anchored to a visual map panel."
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
              <PlacesMap places={results.slice(0, 8)} onSelectPlace={openPlace} />
            </div>
          </section>
        ) : null}

        {searchText.length > 1 ? (
          <SpotlightPanel
            title={isLoading ? 'Searching across live and cached sources' : 'Results ranked for quality and speed'}
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
        {isEmpty ? <EmptyState title="No matches found" body="Adjust your text, country or category filters." /> : null}

        <section
          aria-label="Search results"
          aria-busy={isLoading}
          aria-live="polite"
          style={{ display: 'grid', gap: 18 }}
        >
          {results.map((place) => (
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
