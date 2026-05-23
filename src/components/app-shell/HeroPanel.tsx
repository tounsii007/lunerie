import { motion } from 'framer-motion';
import { Sparkles, Zap } from 'lucide-react';
import { tokens } from '@/theme/tokens';
import { LazyImage } from './LazyImage';

export function HeroPanel({
  title,
  eyebrow,
  description,
  imageUrl,
  metrics,
}: {
  title: string;
  eyebrow: string;
  description: string;
  imageUrl: string;
  metrics?: Array<{ label: string; value: string }>;
}) {
  return (
    <motion.section
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
      style={{
        position: 'relative',
        minHeight: 380,
        borderRadius: tokens.radius.xl,
        overflow: 'hidden',
        boxShadow: tokens.shadow.glow,
        marginBottom: tokens.space.lg,
        border: '1px solid var(--app-border-strong, var(--app-border))',
        background: 'rgba(8, 15, 30, 0.92)',
      }}
    >
      <LazyImage src={imageUrl} alt={title} />
      <div
        style={{
          position: 'absolute',
          inset: 0,
          background:
            'linear-gradient(180deg, rgba(5,10,20,0.08) 0%, rgba(5,10,20,0.5) 42%, rgba(5,10,20,0.96) 100%)',
        }}
      />
      <div
        style={{
          position: 'absolute',
          inset: 0,
          background:
            'radial-gradient(circle at top right, var(--accent-soft), transparent 32%), radial-gradient(circle at left, rgba(244, 114, 182, 0.18), transparent 28%)',
        }}
      />
      <motion.span
        aria-hidden
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.2, duration: 0.6 }}
        style={{
          position: 'absolute',
          inset: 0,
          backgroundImage:
            'radial-gradient(circle at 78% 28%, rgba(255,255,255,0.06), transparent 38%)',
          mixBlendMode: 'screen',
          pointerEvents: 'none',
        }}
      />
      <div
        style={{
          position: 'relative',
          zIndex: 1,
          padding: 26,
          display: 'flex',
          minHeight: 380,
          flexDirection: 'column',
          justifyContent: 'space-between',
          gap: 16,
        }}
      >
        <div style={{ display: 'flex', justifyContent: 'space-between', gap: 12, alignItems: 'start' }}>
          <span
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: 8,
              alignSelf: 'start',
              padding: '10px 14px',
              borderRadius: 999,
              fontSize: 11,
              letterSpacing: '0.24em',
              textTransform: 'uppercase',
              color: 'var(--accent-light)',
              background: 'rgba(15, 23, 42, 0.52)',
              border: '1px solid var(--accent-soft)',
              backdropFilter: 'blur(16px)',
              WebkitBackdropFilter: 'blur(16px)',
              fontWeight: 700,
            }}
          >
            <Sparkles size={14} />
            {eyebrow}
          </span>
          <motion.div
            className="float-animation"
            whileHover={{ scale: 1.05, rotate: -4 }}
            transition={{ type: 'spring', damping: 14, stiffness: 280 }}
            style={{
              width: 70,
              height: 70,
              borderRadius: 24,
              background: 'linear-gradient(135deg, var(--accent), var(--accent-light))',
              boxShadow: '0 16px 40px var(--accent-glow), inset 0 1px 0 rgba(255,255,255,0.32)',
              display: 'grid',
              placeItems: 'center',
            }}
          >
            <Zap size={26} color="#0f172a" strokeWidth={2.5} />
          </motion.div>
        </div>
        <div style={{ display: 'grid', gap: 14 }}>
          <h1
            style={{
              fontFamily: '"Fraunces", serif',
              fontSize: 44,
              lineHeight: 0.96,
              maxWidth: 360,
              color: '#f8fafc',
              letterSpacing: '-0.022em',
              fontWeight: 600,
            }}
          >
            {title}
          </h1>
          <p
            style={{
              maxWidth: 360,
              color: 'rgba(248,250,252,0.86)',
              lineHeight: 1.62,
              fontSize: 15,
            }}
          >
            {description}
          </p>
          {metrics?.length ? (
            <div
              style={{
                display: 'grid',
                gridTemplateColumns: `repeat(${Math.min(metrics.length, 3)}, minmax(0, 1fr))`,
                gap: 10,
                marginTop: 12,
              }}
            >
              {metrics.map((metric, index) => (
                <motion.div
                  key={metric.label}
                  initial={{ opacity: 0, y: 12 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.18 + index * 0.06, duration: 0.4 }}
                  style={{
                    padding: '14px 12px 16px',
                    borderRadius: 20,
                    background: 'rgba(8, 15, 30, 0.62)',
                    border: '1px solid rgba(255,255,255,0.12)',
                    backdropFilter: 'blur(18px) saturate(160%)',
                    WebkitBackdropFilter: 'blur(18px) saturate(160%)',
                    boxShadow: 'inset 0 1px 0 rgba(255,255,255,0.06)',
                  }}
                >
                  <div
                    style={{
                      fontSize: 22,
                      fontWeight: 800,
                      marginBottom: 4,
                      color: '#f8fafc',
                      letterSpacing: '-0.012em',
                      fontVariantNumeric: 'tabular-nums',
                    }}
                  >
                    {metric.value}
                  </div>
                  <div
                    style={{
                      fontSize: 11,
                      color: 'rgba(226,232,240,0.78)',
                      textTransform: 'uppercase',
                      letterSpacing: '0.1em',
                      fontWeight: 600,
                    }}
                  >
                    {metric.label}
                  </div>
                </motion.div>
              ))}
            </div>
          ) : null}
        </div>
      </div>
    </motion.section>
  );
}
