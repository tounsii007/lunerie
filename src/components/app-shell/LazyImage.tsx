import { useState } from 'react';
import { useInView } from 'react-intersection-observer';

export function LazyImage({ src, alt }: { src: string; alt: string }) {
  const { ref, inView } = useInView({ triggerOnce: true, rootMargin: '200px' });
  const [loaded, setLoaded] = useState(false);
  return (
    <span
      ref={ref}
      style={{
        position: 'absolute',
        inset: 0,
        display: 'block',
        background:
          'linear-gradient(135deg, rgba(15,23,42,0.6), rgba(8,15,30,0.95))',
        overflow: 'hidden',
      }}
    >
      {inView ? (
        <img
          src={src}
          alt={alt}
          loading="lazy"
          decoding="async"
          onLoad={() => setLoaded(true)}
          style={{
            width: '100%',
            height: '100%',
            objectFit: 'cover',
            opacity: loaded ? 1 : 0,
            transform: loaded ? 'scale(1)' : 'scale(1.04)',
            transition: 'opacity 0.6s ease-out, transform 0.8s cubic-bezier(0.22, 1, 0.36, 1)',
          }}
        />
      ) : null}
    </span>
  );
}
