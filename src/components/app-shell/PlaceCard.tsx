import { memo } from 'react';
import { motion } from 'framer-motion';
import { ArrowUpRight, Heart, Sparkles } from 'lucide-react';
import type { Place } from '@/domain/models';
import { useI18n } from '@/i18n/I18nProvider';
import { useHaptic } from '@/hooks/useHaptic';
import { tokens } from '@/theme/tokens';
import { LazyImage } from './LazyImage';
import { MetricBadge } from './MetricBadge';

export const PlaceCard = memo(function PlaceCard({
  place,
  onOpen,
  onFavorite,
  favorite,
}: {
  place: Place;
  onOpen: () => void;
  onFavorite: () => void;
  favorite: boolean;
}) {
  const { t } = useI18n();
  const haptic = useHaptic();

  return (
    <motion.article
      layout
      whileHover={{ y: -2 }}
      whileTap={{ scale: 0.985 }}
      transition={{ type: 'spring', damping: 24, stiffness: 320 }}
      style={{
        borderRadius: tokens.radius.lg,
        overflow: 'hidden',
        background: 'linear-gradient(180deg, rgba(14,21,38,0.96), rgba(9,15,28,0.99))',
        border: '1px solid var(--app-border)',
        boxShadow: tokens.shadow.card,
      }}
    >
      <button onClick={onOpen} style={{ width: '100%', textAlign: 'left' }}>
        <div style={{ position: 'relative', height: 256 }}>
          <LazyImage src={place.heroImage.url} alt={place.name} />
          <div
            style={{
              position: 'absolute',
              inset: 0,
              background:
                'linear-gradient(180deg, rgba(8,15,30,0.04), rgba(8,15,30,0.62) 56%, rgba(8,15,30,0.96))',
            }}
          />
          <div
            style={{
              position: 'absolute',
              insetInline: 16,
              insetBlockStart: 16,
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'start',
              gap: 12,
            }}
          >
            <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap', maxWidth: '72%' }}>
              {place.categories.slice(0, 3).map((category) => (
                <span
                  key={category}
                  style={{
                    padding: '6px 10px',
                    borderRadius: 999,
                    background: 'rgba(15,23,42,0.62)',
                    border: '1px solid rgba(255,255,255,0.14)',
                    fontSize: 10,
                    letterSpacing: '0.06em',
                    textTransform: 'capitalize',
                    backdropFilter: 'blur(16px)',
                    WebkitBackdropFilter: 'blur(16px)',
                    color: '#f8fafc',
                    fontWeight: 600,
                  }}
                >
                  {category.replace('_', ' ')}
                </span>
              ))}
            </div>
            <div
              style={{
                padding: '8px 12px',
                borderRadius: 999,
                background: 'var(--accent-soft)',
                border: '1px solid var(--accent-soft)',
                backdropFilter: 'blur(14px)',
                WebkitBackdropFilter: 'blur(14px)',
                fontSize: 12,
                fontWeight: 700,
                color: 'var(--accent-light)',
                display: 'flex',
                alignItems: 'center',
                gap: 4,
                fontVariantNumeric: 'tabular-nums',
              }}
            >
              <Sparkles size={11} /> {place.popularity}%
            </div>
          </div>
          <div style={{ position: 'absolute', insetInline: 18, insetBlockEnd: 18, display: 'grid', gap: 6 }}>
            <h3
              style={{
                fontSize: 26,
                lineHeight: 1.04,
                color: '#f8fafc',
                letterSpacing: '-0.012em',
                fontFamily: '"Fraunces", serif',
                fontWeight: 600,
              }}
            >
              {place.name}
            </h3>
            <p style={{ color: 'rgba(248,250,252,0.86)', fontSize: 13, fontWeight: 500 }}>
              {place.city}, {place.countryName}
            </p>
          </div>
        </div>
      </button>
      <div style={{ padding: 18, display: 'grid', gap: 14, color: '#f8fafc' }}>
        <p style={{ color: 'rgba(203,213,225,0.86)', lineHeight: 1.6, fontSize: 14 }}>{place.description}</p>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, minmax(0, 1fr))', gap: 8 }}>
          <MetricBadge label={t('placeHot')} value={`${place.popularity}%`} />
          <MetricBadge label={t('placeMatch')} value={`${place.relevance}%`} />
          <MetricBadge label={t('placeYear')} value={new Date(place.updatedAt).getFullYear().toString()} />
        </div>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: 14 }}>
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: 8,
              color: 'rgba(226,232,240,0.78)',
              fontSize: 13,
              fontWeight: 500,
            }}
          >
            <ArrowUpRight size={16} aria-hidden />
            <span>{t('openImmersive')}</span>
          </div>
          <motion.button
            whileTap={{ scale: 0.88 }}
            onClick={(e) => {
              e.stopPropagation();
              onFavorite();
              haptic('light');
            }}
            aria-label={t('save')}
            aria-pressed={favorite}
            style={{
              padding: 12,
              borderRadius: 999,
              background: favorite ? 'var(--accent-soft)' : 'rgba(148,163,184,0.1)',
              border: favorite ? '1px solid var(--accent)' : '1px solid var(--app-border)',
              transition: 'all 0.22s var(--ease-out)',
            }}
          >
            <motion.span
              animate={favorite ? { scale: [1, 1.25, 1] } : { scale: 1 }}
              transition={{ duration: 0.36 }}
              style={{ display: 'inline-flex' }}
            >
              <Heart
                size={18}
                fill={favorite ? 'var(--accent)' : 'transparent'}
                color={favorite ? 'var(--accent)' : 'currentColor'}
              />
            </motion.span>
          </motion.button>
        </div>
      </div>
    </motion.article>
  );
});
