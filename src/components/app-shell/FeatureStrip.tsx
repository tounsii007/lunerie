import { motion } from 'framer-motion';
import { tokens } from '@/theme/tokens';

export function FeatureStrip({
  items,
}: {
  items: Array<{ label: string; value: string; accent?: string }>;
}) {
  return (
    <section
      className="mb-6 grid gap-2.5"
      style={{ gridTemplateColumns: `repeat(${items.length}, minmax(0, 1fr))` }}
    >
      {items.map((item, index) => (
        <motion.div
          key={item.label}
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.05 * index, duration: 0.35 }}
          style={{
            padding: '16px 14px',
            borderRadius: 22,
            background: 'var(--app-surface)',
            border: '1px solid var(--app-border)',
            backdropFilter: 'blur(16px)',
            WebkitBackdropFilter: 'blur(16px)',
            boxShadow: tokens.shadow.soft,
          }}
        >
          <div
            style={{
              fontSize: 22,
              fontWeight: 800,
              color: item.accent ?? 'var(--app-text)',
              marginBottom: 4,
              letterSpacing: '-0.012em',
              fontVariantNumeric: 'tabular-nums',
            }}
          >
            {item.value}
          </div>
          <div className="text-[11px] font-semibold uppercase tracking-[0.1em] text-[var(--app-text-muted)]">
            {item.label}
          </div>
        </motion.div>
      ))}
    </section>
  );
}
