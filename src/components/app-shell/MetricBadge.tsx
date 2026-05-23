export function MetricBadge({ label, value }: { label: string; value: string }) {
  return (
    <div
      style={{
        padding: '12px 10px',
        borderRadius: 16,
        background: 'rgba(255,255,255,0.06)',
        border: '1px solid var(--app-border)',
        backdropFilter: 'blur(10px)',
        WebkitBackdropFilter: 'blur(10px)',
      }}
    >
      <div
        style={{
          fontWeight: 800,
          marginBottom: 3,
          fontSize: 14,
          fontVariantNumeric: 'tabular-nums',
          letterSpacing: '-0.008em',
        }}
      >
        {value}
      </div>
      <div
        style={{
          fontSize: 10,
          color: 'var(--app-text-muted)',
          textTransform: 'uppercase',
          letterSpacing: '0.1em',
          fontWeight: 600,
        }}
      >
        {label}
      </div>
    </div>
  );
}
