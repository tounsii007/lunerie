import { tokens } from '@/theme/tokens';
import { MetricBadge } from './MetricBadge';

export function SpotlightPanel({
  title,
  description,
  items,
}: {
  title: string;
  description: string;
  items: Array<{ label: string; value: string }>;
}) {
  return (
    <section
      style={{
        marginBottom: 24,
        padding: 24,
        borderRadius: 28,
        background:
          'linear-gradient(135deg, var(--accent-soft), rgba(244,114,182,0.1) 55%, rgba(56,189,248,0.08))',
        border: '1px solid var(--app-border)',
        boxShadow: tokens.shadow.card,
        backdropFilter: 'blur(16px)',
        WebkitBackdropFilter: 'blur(16px)',
        position: 'relative',
        overflow: 'hidden',
      }}
    >
      <span
        aria-hidden
        className="breathe-animation"
        style={{
          position: 'absolute',
          top: -60,
          right: -40,
          width: 180,
          height: 180,
          borderRadius: 999,
          background:
            'radial-gradient(circle at center, var(--accent-glow), transparent 70%)',
          pointerEvents: 'none',
        }}
      />
      <div style={{ display: 'grid', gap: 8, marginBottom: 18, position: 'relative' }}>
        <span
          style={{
            fontSize: 11,
            letterSpacing: '0.18em',
            textTransform: 'uppercase',
            color: 'var(--accent-light)',
            fontWeight: 700,
          }}
        >
          Smart Discovery
        </span>
        <h3
          style={{
            fontSize: 22,
            lineHeight: 1.1,
            letterSpacing: '-0.014em',
            fontFamily: '"Fraunces", serif',
            fontWeight: 600,
          }}
        >
          {title}
        </h3>
        <p style={{ color: 'var(--app-text-muted)', lineHeight: 1.55, fontSize: 13 }}>{description}</p>
      </div>
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, minmax(0, 1fr))', gap: 8, position: 'relative' }}>
        {items.map((item) => (
          <MetricBadge key={item.label} label={item.label} value={item.value} />
        ))}
      </div>
    </section>
  );
}
