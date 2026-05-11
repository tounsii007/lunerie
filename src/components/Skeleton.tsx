import type { CSSProperties } from 'react';

interface SkeletonProps {
  width?: number | string;
  height?: number | string;
  radius?: number;
  className?: string;
  style?: CSSProperties;
}

export function Skeleton({ width = '100%', height = 16, radius = 8, className, style }: SkeletonProps) {
  return (
    <span
      aria-hidden
      className={className ? `${className} skeleton` : 'skeleton'}
      style={{
        display: 'inline-block',
        width,
        height,
        borderRadius: radius,
        ...style,
      }}
    />
  );
}

export function SkeletonStack({ rows = 3, gap = 10 }: { rows?: number; gap?: number }) {
  return (
    <div style={{ display: 'grid', gap }}>
      {Array.from({ length: rows }).map((_, index) => (
        <Skeleton key={index} height={index === 0 ? 22 : 16} width={`${100 - index * 8}%`} />
      ))}
    </div>
  );
}

export function SkeletonPlaceCard() {
  return (
    <div
      role="presentation"
      style={{
        borderRadius: 32,
        overflow: 'hidden',
        background: 'var(--app-surface)',
        border: '1px solid var(--app-border)',
        display: 'grid',
        boxShadow: '0 16px 38px rgba(2, 8, 23, 0.28)',
      }}
    >
      <Skeleton height={248} radius={0} />
      <div style={{ padding: 18, display: 'grid', gap: 14 }}>
        <Skeleton width="65%" height={22} />
        <SkeletonStack rows={2} />
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 8 }}>
          <Skeleton height={48} radius={14} />
          <Skeleton height={48} radius={14} />
          <Skeleton height={48} radius={14} />
        </div>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: 14 }}>
          <Skeleton width="55%" height={14} />
          <Skeleton width={40} height={40} radius={999} />
        </div>
      </div>
    </div>
  );
}

export function SkeletonCountryCard() {
  return (
    <div
      role="presentation"
      style={{
        width: 220,
        minWidth: 220,
        borderRadius: 32,
        overflow: 'hidden',
        background: 'var(--app-surface)',
        border: '1px solid var(--app-border)',
        boxShadow: '0 16px 38px rgba(2, 8, 23, 0.28)',
      }}
    >
      <Skeleton height={180} radius={0} />
      <div style={{ padding: 16, display: 'grid', gap: 8 }}>
        <Skeleton width="70%" height={20} />
        <Skeleton width="55%" height={14} />
        <Skeleton width="40%" height={12} />
      </div>
    </div>
  );
}

export function SkeletonCountryRail({ count = 4 }: { count?: number }) {
  return (
    <div
      style={{ display: 'flex', gap: 16, overflowX: 'auto' }}
      className="scrollbar-hidden"
      role="presentation"
      aria-hidden
    >
      {Array.from({ length: count }).map((_, index) => (
        <SkeletonCountryCard key={index} />
      ))}
    </div>
  );
}

export function SkeletonHero() {
  return (
    <div
      role="presentation"
      aria-hidden
      style={{
        position: 'relative',
        minHeight: 380,
        borderRadius: 40,
        overflow: 'hidden',
        marginBottom: 24,
        border: '1px solid var(--app-border)',
        background: 'var(--app-surface)',
        boxShadow: '0 24px 80px rgba(15, 23, 42, 0.45)',
      }}
    >
      <Skeleton height="100%" radius={0} style={{ position: 'absolute', inset: 0 }} />
      <div style={{ position: 'relative', padding: 26, display: 'grid', gap: 14, height: '100%' }}>
        <Skeleton width={140} height={36} radius={999} />
        <div style={{ marginTop: 'auto', display: 'grid', gap: 14 }}>
          <Skeleton width="78%" height={42} />
          <Skeleton width="85%" height={14} />
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 10, marginTop: 12 }}>
            <Skeleton height={68} radius={20} />
            <Skeleton height={68} radius={20} />
            <Skeleton height={68} radius={20} />
          </div>
        </div>
      </div>
    </div>
  );
}
