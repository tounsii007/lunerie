export function SectionHeading({
  eyebrow,
  title,
  description,
  value,
}: {
  eyebrow: string;
  title: string;
  description?: string;
  value?: string;
}) {
  return (
    <div className="mb-4 flex items-end justify-between gap-4">
      <div className="grid gap-1.5">
        <span className="text-[11px] font-bold uppercase tracking-[0.18em] text-[var(--accent-light)]">
          {eyebrow}
        </span>
        <h2
          style={{
            fontSize: 24,
            lineHeight: 1.06,
            letterSpacing: '-0.014em',
            fontFamily: '"Fraunces", serif',
            fontWeight: 600,
          }}
        >
          {title}
        </h2>
        {description ? (
          <p style={{ color: 'var(--app-text-muted)', lineHeight: 1.55, maxWidth: 320, fontSize: 13 }}>{description}</p>
        ) : null}
      </div>
      {value ? (
        <div
          style={{
            padding: '10px 14px',
            borderRadius: 999,
            background: 'var(--accent-soft)',
            border: '1px solid var(--app-border)',
            fontWeight: 700,
            color: 'var(--accent-light)',
            fontSize: 14,
            fontVariantNumeric: 'tabular-nums',
          }}
        >
          {value}
        </div>
      ) : null}
    </div>
  );
}
