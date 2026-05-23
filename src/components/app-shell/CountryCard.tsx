import { memo } from 'react';
import { motion } from 'framer-motion';
import type { Country } from '@/domain/models';
import { tokens } from '@/theme/tokens';
import { LazyImage } from './LazyImage';

export const CountryCard = memo(function CountryCard({ country, onOpen }: { country: Country; onOpen: () => void }) {
  return (
    <motion.button
      whileHover={{ y: -3 }}
      whileTap={{ scale: 0.97 }}
      transition={{ type: 'spring', damping: 22, stiffness: 320 }}
      onClick={onOpen}
      style={{
        width: 220,
        minWidth: 220,
        borderRadius: tokens.radius.lg,
        overflow: 'hidden',
        background: 'linear-gradient(180deg, rgba(14,21,38,0.96), rgba(9,15,28,0.99))',
        border: '1px solid var(--app-border)',
        textAlign: 'left',
        boxShadow: tokens.shadow.card,
      }}
    >
      {country.heroImage ? (
        <div style={{ position: 'relative', width: '100%', height: 180 }}>
          <LazyImage src={country.heroImage.url} alt={country.name} />
          <div
            aria-hidden
            style={{
              position: 'absolute',
              inset: 0,
              background: 'linear-gradient(180deg, rgba(0,0,0,0.0), rgba(0,0,0,0.42))',
            }}
          />
          <span
            style={{
              position: 'absolute',
              top: 12,
              left: 12,
              padding: '4px 10px',
              borderRadius: 999,
              fontSize: 10,
              fontWeight: 700,
              letterSpacing: '0.08em',
              textTransform: 'uppercase',
              background: 'rgba(15, 23, 42, 0.72)',
              border: '1px solid rgba(255, 255, 255, 0.14)',
              color: 'var(--accent-light)',
              backdropFilter: 'blur(10px)',
              WebkitBackdropFilter: 'blur(10px)',
            }}
          >
            {country.flagEmoji} {country.region}
          </span>
        </div>
      ) : null}
      <div style={{ padding: 16, display: 'grid', gap: 8, color: '#f8fafc' }}>
        <strong style={{ fontSize: 19, letterSpacing: '-0.012em', fontFamily: '"Fraunces", serif', fontWeight: 600 }}>
          {country.name}
        </strong>
        <span style={{ color: 'rgba(203,213,225,0.78)', fontSize: 13 }}>{country.subregion}</span>
        <span style={{ color: 'rgba(253,230,138,0.86)', fontSize: 12, fontWeight: 500 }}>
          {country.languages.slice(0, 2).join(' · ')}
        </span>
      </div>
    </motion.button>
  );
});
