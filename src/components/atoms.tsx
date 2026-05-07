import type { CSSProperties, ReactNode } from 'react';

/**
 * Tiny, themable building blocks. Replaces 12+ inline-styled "card / row / stack"
 * blocks across screens. All blocks pull from CSS variables defined in ThemeProvider.
 */

interface StackProps {
  gap?: number;
  children: ReactNode;
  style?: CSSProperties;
}

export function Stack({ gap = 12, children, style }: StackProps) {
  return <div style={{ display: 'grid', gap, ...style }}>{children}</div>;
}

interface CardProps {
  icon?: ReactNode;
  title?: string;
  description?: string;
  padding?: number;
  children?: ReactNode;
  style?: CSSProperties;
}

export function Card({ icon, title, description, padding = 18, children, style }: CardProps) {
  return (
    <section
      style={{
        padding,
        borderRadius: 22,
        background: 'var(--app-surface)',
        border: '1px solid var(--app-border)',
        backdropFilter: 'blur(16px)',
        display: 'grid',
        gap: 12,
        ...style,
      }}
    >
      {(icon || title || description) ? (
        <header style={{ display: 'grid', gap: 4 }}>
          {(icon || title) ? (
            <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
              {icon ? (
                <span
                  style={{
                    width: 26,
                    height: 26,
                    borderRadius: 8,
                    background: 'var(--accent-soft)',
                    color: 'var(--accent)',
                    display: 'grid',
                    placeItems: 'center',
                  }}
                >
                  {icon}
                </span>
              ) : null}
              {title ? <h2 style={{ fontSize: 16, fontWeight: 700 }}>{title}</h2> : null}
            </div>
          ) : null}
          {description ? (
            <p style={{ fontSize: 13, color: 'var(--app-text-muted)' }}>{description}</p>
          ) : null}
        </header>
      ) : null}
      {children}
    </section>
  );
}

interface RowProps {
  title: string;
  description?: string;
  iconRight?: ReactNode;
  onClick?: () => void;
  disabled?: boolean;
  danger?: boolean;
}

/** Tappable list row — used in Settings/Account screens. */
export function Row({ title, description, iconRight, onClick, disabled, danger }: RowProps) {
  const isDanger = !!danger;
  return (
    <button
      onClick={onClick}
      disabled={disabled}
      style={{
        textAlign: 'left',
        padding: '14px 16px',
        borderRadius: 14,
        border: isDanger ? '1px solid rgba(239, 68, 68, 0.45)' : '1px solid var(--app-border)',
        background: isDanger ? 'rgba(239, 68, 68, 0.08)' : 'transparent',
        color: isDanger ? '#fca5a5' : 'var(--app-text)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        gap: 12,
        opacity: disabled ? 0.55 : 1,
        cursor: disabled ? 'wait' : 'pointer',
        width: '100%',
      }}
    >
      <span style={{ display: 'grid', gap: 2 }}>
        <strong style={{ fontSize: 14 }}>{title}</strong>
        {description ? (
          <span
            style={{
              fontSize: 12,
              color: isDanger ? 'rgba(252, 165, 165, 0.78)' : 'var(--app-text-muted)',
            }}
          >
            {description}
          </span>
        ) : null}
      </span>
      {iconRight ? <span style={{ color: 'inherit' }}>{iconRight}</span> : null}
    </button>
  );
}

interface SectionTitleProps {
  eyebrow?: string;
  title: string;
  description?: string;
}

export function SectionTitle({ eyebrow, title, description }: SectionTitleProps) {
  return (
    <header style={{ display: 'grid', gap: 8 }}>
      {eyebrow ? (
        <span
          style={{
            fontSize: 11,
            letterSpacing: '0.22em',
            textTransform: 'uppercase',
            color: 'var(--accent-light)',
            fontWeight: 700,
          }}
        >
          {eyebrow}
        </span>
      ) : null}
      <h1
        style={{
          fontFamily: '"Fraunces", serif',
          fontSize: 38,
          lineHeight: 1,
          letterSpacing: '-0.02em',
        }}
      >
        {title}
      </h1>
      {description ? (
        <p style={{ color: 'var(--app-text-muted)', lineHeight: 1.55, maxWidth: 380 }}>{description}</p>
      ) : null}
    </header>
  );
}
