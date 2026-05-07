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
      style={{
        borderRadius: 32,
        overflow: 'hidden',
        background: 'var(--app-surface)',
        border: '1px solid var(--app-border)',
        display: 'grid',
      }}
    >
      <Skeleton height={240} radius={0} />
      <div style={{ padding: 18, display: 'grid', gap: 12 }}>
        <Skeleton width="65%" height={22} />
        <SkeletonStack rows={2} />
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 8 }}>
          <Skeleton height={48} radius={14} />
          <Skeleton height={48} radius={14} />
          <Skeleton height={48} radius={14} />
        </div>
      </div>
    </div>
  );
}
