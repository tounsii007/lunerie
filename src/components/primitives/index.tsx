/**
 * Design-system primitives. Tailwind-only — no inline styles.
 *
 * These are the building blocks every screen should compose from. Adding new
 * inline `style={{}}` to a screen is a code smell; either an existing primitive
 * fits, or a new primitive belongs here.
 */
import { forwardRef, type HTMLAttributes, type ReactNode } from 'react';
import clsx from 'clsx';

/* ------------------------------------------------------------------ */
/* Layout                                                              */
/* ------------------------------------------------------------------ */

type StackGap = 'none' | 'xs' | 'sm' | 'md' | 'lg' | 'xl' | '2xl';
const stackGap: Record<StackGap, string> = {
  none: 'gap-0',
  xs: 'gap-2',
  sm: 'gap-3',
  md: 'gap-[14px]',
  lg: 'gap-[18px]',
  xl: 'gap-[22px]',
  '2xl': 'gap-7',
};

export const Stack = forwardRef<HTMLDivElement, HTMLAttributes<HTMLDivElement> & { gap?: StackGap }>(
  function Stack({ gap = 'md', className, ...rest }, ref) {
    return <div ref={ref} className={clsx('grid', stackGap[gap], className)} {...rest} />;
  },
);

export const Inline = forwardRef<HTMLDivElement, HTMLAttributes<HTMLDivElement> & { gap?: StackGap; wrap?: boolean }>(
  function Inline({ gap = 'sm', wrap = false, className, ...rest }, ref) {
    return (
      <div
        ref={ref}
        className={clsx('flex items-center', wrap && 'flex-wrap', stackGap[gap], className)}
        {...rest}
      />
    );
  },
);

/* ------------------------------------------------------------------ */
/* Surface / Card                                                      */
/* ------------------------------------------------------------------ */

type CardElevation = 'flat' | 'raised' | 'floating';
type CardRadius = 'md' | 'lg' | 'xl';

const cardElevation: Record<CardElevation, string> = {
  flat: '',
  raised: 'shadow-[0_10px_28px_rgba(2,8,23,0.2)]',
  floating: 'shadow-[0_24px_60px_rgba(2,8,23,0.32)] backdrop-blur-xl',
};

const cardRadius: Record<CardRadius, string> = {
  md: 'rounded-[18px]',
  lg: 'rounded-[22px]',
  xl: 'rounded-[28px]',
};

export const Card = forwardRef<
  HTMLDivElement,
  HTMLAttributes<HTMLDivElement> & {
    elevation?: CardElevation;
    radius?: CardRadius;
    padded?: boolean;
  }
>(function Card({ elevation = 'raised', radius = 'lg', padded = true, className, ...rest }, ref) {
  return (
    <div
      ref={ref}
      className={clsx(
        'border border-[var(--app-border)] bg-[var(--app-surface)]',
        cardElevation[elevation],
        cardRadius[radius],
        padded && 'p-[18px]',
        className,
      )}
      {...rest}
    />
  );
});

/* ------------------------------------------------------------------ */
/* Pill / Chip                                                         */
/* ------------------------------------------------------------------ */

type PillTone = 'neutral' | 'accent' | 'inverse';
const pillTone: Record<PillTone, string> = {
  neutral: 'bg-white/[0.06] border-[var(--app-border)] text-[var(--app-text)]',
  accent: 'bg-[var(--accent-soft)] border-[var(--accent-soft)] text-[var(--accent-light)]',
  inverse: 'bg-[rgba(15,23,42,0.6)] border-white/10 text-white backdrop-blur-md',
};

export function Pill({
  tone = 'neutral',
  className,
  children,
  ...rest
}: HTMLAttributes<HTMLSpanElement> & { tone?: PillTone }) {
  return (
    <span
      className={clsx(
        'inline-flex items-center gap-1.5 rounded-full border px-3 py-1.5 text-xs font-semibold',
        pillTone[tone],
        className,
      )}
      {...rest}
    >
      {children}
    </span>
  );
}

/* ------------------------------------------------------------------ */
/* Eyebrow + ScreenHeader                                              */
/* ------------------------------------------------------------------ */

export function Eyebrow({ children, className }: { children: ReactNode; className?: string }) {
  return (
    <span
      className={clsx(
        'text-[11px] font-bold uppercase tracking-[0.22em] text-[var(--accent-light)]',
        className,
      )}
    >
      {children}
    </span>
  );
}

export function ScreenHeader({
  eyebrow,
  title,
  description,
  trailing,
}: {
  eyebrow?: ReactNode;
  title: ReactNode;
  description?: ReactNode;
  trailing?: ReactNode;
}) {
  return (
    <header className="grid gap-2">
      <div className="flex items-start justify-between gap-3">
        <div className="grid gap-2">
          {eyebrow ? <Eyebrow>{eyebrow}</Eyebrow> : null}
          <h1 className="font-display text-[38px] leading-none tracking-[-0.02em]">{title}</h1>
        </div>
        {trailing}
      </div>
      {description ? (
        <p className="max-w-[360px] leading-[1.55] text-[var(--app-text-muted)]">{description}</p>
      ) : null}
    </header>
  );
}

/* ------------------------------------------------------------------ */
/* IconBox                                                             */
/* ------------------------------------------------------------------ */

type IconBoxSize = 'sm' | 'md' | 'lg';
const iconBoxSize: Record<IconBoxSize, string> = {
  sm: 'h-7 w-7 rounded-[9px]',
  md: 'h-9 w-9 rounded-xl',
  lg: 'h-11 w-11 rounded-2xl',
};

export function IconBox({
  size = 'md',
  tone = 'accent',
  children,
  className,
}: {
  size?: IconBoxSize;
  tone?: 'accent' | 'neutral';
  children: ReactNode;
  className?: string;
}) {
  return (
    <span
      className={clsx(
        'grid place-items-center',
        iconBoxSize[size],
        tone === 'accent'
          ? 'bg-[var(--accent-soft)] text-[var(--accent)]'
          : 'bg-white/[0.06] text-[var(--app-text)]',
        className,
      )}
    >
      {children}
    </span>
  );
}

/* ------------------------------------------------------------------ */
/* PlaceCardSkeleton                                                   */
/*                                                                     */
/* Matches the real PlaceCard geometry: hero image (220px), content    */
/* block (padding + 3 text rows + action row).                         */
/* ------------------------------------------------------------------ */

export function PlaceCardSkeleton() {
  return (
    <div className="overflow-hidden rounded-[22px] border border-[var(--app-border)] bg-[var(--app-surface)]">
      <div className="skeleton h-[220px] w-full" />
      <div className="grid gap-3 p-[18px]">
        <div className="skeleton h-3 w-1/3 rounded-md" />
        <div className="skeleton h-5 w-3/4 rounded-md" />
        <div className="skeleton h-3 w-2/3 rounded-md" />
        <div className="mt-2 flex items-center justify-between">
          <div className="skeleton h-8 w-24 rounded-full" />
          <div className="skeleton h-8 w-8 rounded-full" />
        </div>
      </div>
    </div>
  );
}

/* ------------------------------------------------------------------ */
/* StatCard                                                            */
/* ------------------------------------------------------------------ */

export function StatCard({
  icon,
  value,
  label,
}: {
  icon: ReactNode;
  value: ReactNode;
  label: string;
}) {
  return (
    <Card padded={false} className="grid gap-2 p-4 backdrop-blur-md">
      <IconBox size="sm">{icon}</IconBox>
      <strong className="text-[26px] font-extrabold tracking-[-0.02em]">{value}</strong>
      <span className="text-[11px] font-semibold uppercase tracking-[0.1em] text-[var(--app-text-muted)]">
        {label}
      </span>
    </Card>
  );
}

/* ------------------------------------------------------------------ */
/* Button                                                              */
/* ------------------------------------------------------------------ */

type ButtonVariant = 'primary' | 'secondary' | 'ghost' | 'danger';
const buttonVariant: Record<ButtonVariant, string> = {
  primary:
    'bg-[var(--accent)] text-[#0f172a] border border-[var(--accent)] hover:brightness-110',
  secondary:
    'bg-[var(--app-surface)] text-[var(--app-text)] border border-[var(--app-border)] hover:bg-[var(--app-elevated)]',
  ghost:
    'bg-transparent text-[var(--app-text)] border border-transparent hover:bg-white/[0.06]',
  danger:
    'bg-[rgba(239,68,68,0.15)] text-[#fca5a5] border border-[rgba(239,68,68,0.4)] hover:bg-[rgba(239,68,68,0.22)]',
};

export const Button = forwardRef<
  HTMLButtonElement,
  React.ButtonHTMLAttributes<HTMLButtonElement> & { variant?: ButtonVariant; block?: boolean }
>(function Button({ variant = 'secondary', block, className, ...rest }, ref) {
  return (
    <button
      ref={ref}
      className={clsx(
        'inline-flex items-center justify-center gap-2 rounded-[18px] px-[18px] py-4 text-sm font-bold transition active:scale-[0.98] disabled:cursor-not-allowed disabled:opacity-60',
        block && 'w-full',
        buttonVariant[variant],
        className,
      )}
      {...rest}
    />
  );
});
