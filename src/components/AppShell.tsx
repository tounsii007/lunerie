import { memo } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { useInView } from 'react-intersection-observer';
import { ArrowUpRight, Compass, Heart, Map, Search, Settings, Sparkles, Zap } from 'lucide-react';
import type { AppTab } from '@/constants/app';
import { APP_TABS } from '@/constants/app';
import type { Country, Place } from '@/domain/models';
import { useI18n } from '@/i18n/I18nProvider';
import { useNavigation } from '@/state/navigation-context';
import { useHaptic } from '@/hooks/useHaptic';
import { tokens } from '@/theme/tokens';

const tabIcons: Record<AppTab, React.ComponentType<{ size?: number }>> = {
  explore: Sparkles,
  search: Search,
  nearby: Compass,
  favorites: Heart,
  settings: Settings,
};

const tabLabelKeys: Record<AppTab, string> = {
  explore: 'explore',
  search: 'search',
  nearby: 'nearby',
  favorites: 'favorites',
  settings: 'settings',
};

export function ScreenContainer({ children }: { children: React.ReactNode }) {
  return (
    <main
      style={{
        height: '100dvh',
        width: '100%',
        maxWidth: 490,
        margin: '0 auto',
        padding: '24px 20px 132px',
        overflowY: 'auto',
      }}
      className="scrollbar-hidden"
    >
      {children}
    </main>
  );
}

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
      transition={{ duration: 0.45, ease: 'easeOut' }}
      style={{
        position: 'relative',
        minHeight: 360,
        borderRadius: tokens.radius.xl,
        overflow: 'hidden',
        boxShadow: tokens.shadow.glow,
        marginBottom: tokens.space.lg,
        border: '1px solid var(--app-border)',
        background: 'rgba(8, 15, 30, 0.92)',
      }}
    >
      <LazyImage src={imageUrl} alt={title} />
      <div style={{ position: 'absolute', inset: 0, background: 'linear-gradient(180deg, rgba(5,10,20,0.12), rgba(5,10,20,0.54) 40%, rgba(5,10,20,0.95))' }} />
      <div
        style={{
          position: 'absolute',
          inset: 0,
          background:
            'radial-gradient(circle at top right, var(--accent-soft), transparent 32%), radial-gradient(circle at left, rgba(244, 114, 182, 0.18), transparent 28%)',
        }}
      />
      <div
        style={{
          position: 'relative',
          zIndex: 1,
          padding: 24,
          display: 'flex',
          minHeight: 360,
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
              fontWeight: 700,
            }}
          >
            <Sparkles size={14} />
            {eyebrow}
          </span>
          <div
            className="float-animation"
            style={{
              width: 68,
              height: 68,
              borderRadius: 24,
              background: 'linear-gradient(135deg, var(--accent), var(--accent-light))',
              boxShadow: '0 12px 38px var(--accent-glow)',
              display: 'grid',
              placeItems: 'center',
            }}
          >
            <Zap size={26} color="#0f172a" />
          </div>
        </div>
        <div style={{ display: 'grid', gap: 14 }}>
          <h1 style={{ fontFamily: '"Fraunces", serif', fontSize: 44, lineHeight: 0.96, maxWidth: 360, color: '#f8fafc', letterSpacing: '-0.02em' }}>
            {title}
          </h1>
          <p style={{ maxWidth: 360, color: 'rgba(248,250,252,0.84)', lineHeight: 1.65, fontSize: 15 }}>{description}</p>
          {metrics?.length ? (
            <div
              style={{
                display: 'grid',
                gridTemplateColumns: `repeat(${Math.min(metrics.length, 3)}, minmax(0, 1fr))`,
                gap: 10,
                marginTop: 12,
              }}
            >
              {metrics.map((metric) => (
                <div
                  key={metric.label}
                  style={{
                    padding: '14px 12px 16px',
                    borderRadius: 20,
                    background: 'rgba(8, 15, 30, 0.6)',
                    border: '1px solid rgba(255,255,255,0.12)',
                    backdropFilter: 'blur(18px)',
                  }}
                >
                  <div style={{ fontSize: 22, fontWeight: 800, marginBottom: 4, color: '#f8fafc', letterSpacing: '-0.01em' }}>
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
                </div>
              ))}
            </div>
          ) : null}
        </div>
      </div>
    </motion.section>
  );
}

function LazyImage({ src, alt }: { src: string; alt: string }) {
  const { ref, inView } = useInView({ triggerOnce: true, rootMargin: '200px' });
  return (
    <span
      ref={ref}
      style={{
        position: 'absolute',
        inset: 0,
        display: 'block',
        background: 'linear-gradient(135deg, rgba(15,23,42,0.6), rgba(8,15,30,0.95))',
      }}
    >
      {inView ? (
        <img
          src={src}
          alt={alt}
          loading="lazy"
          decoding="async"
          style={{ width: '100%', height: '100%', objectFit: 'cover' }}
        />
      ) : null}
    </span>
  );
}

export const PlaceCard = memo(function PlaceCard({
  place,
  onOpen,
  onFavorite,
  favorite,
}: {
  place: Place;
  onOpen: () => void;
  onFavorite: () => void;
  favorite: boolean;
}) {
  const haptic = useHaptic();

  return (
    <motion.article
      layout
      whileTap={{ scale: 0.985 }}
      style={{
        borderRadius: tokens.radius.lg,
        overflow: 'hidden',
        background: 'linear-gradient(180deg, rgba(14,21,38,0.96), rgba(9,15,28,0.99))',
        border: '1px solid var(--app-border)',
        boxShadow: tokens.shadow.card,
      }}
    >
      <button onClick={onOpen} style={{ width: '100%', textAlign: 'left' }}>
        <div style={{ position: 'relative', height: 248 }}>
          <LazyImage src={place.heroImage.url} alt={place.name} />
          <div
            style={{
              position: 'absolute',
              inset: 0,
              background:
                'linear-gradient(180deg, rgba(8,15,30,0.05), rgba(8,15,30,0.7) 58%, rgba(8,15,30,0.96))',
            }}
          />
          <div
            style={{
              position: 'absolute',
              insetInline: 16,
              insetBlockStart: 16,
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'start',
              gap: 12,
            }}
          >
            <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap', maxWidth: '72%' }}>
              {place.categories.slice(0, 3).map((category) => (
                <span
                  key={category}
                  style={{
                    padding: '6px 10px',
                    borderRadius: 999,
                    background: 'rgba(15,23,42,0.6)',
                    border: '1px solid rgba(255,255,255,0.14)',
                    fontSize: 10,
                    letterSpacing: '0.06em',
                    textTransform: 'capitalize',
                    backdropFilter: 'blur(16px)',
                    color: '#f8fafc',
                    fontWeight: 600,
                  }}
                >
                  {category.replace('_', ' ')}
                </span>
              ))}
            </div>
            <div
              style={{
                padding: '8px 12px',
                borderRadius: 999,
                background: 'var(--accent-soft)',
                border: '1px solid var(--accent-soft)',
                backdropFilter: 'blur(14px)',
                fontSize: 12,
                fontWeight: 700,
                color: 'var(--accent-light)',
                display: 'flex',
                alignItems: 'center',
                gap: 4,
              }}
            >
              <Sparkles size={11} /> {place.popularity}%
            </div>
          </div>
          <div style={{ position: 'absolute', insetInline: 18, insetBlockEnd: 18, display: 'grid', gap: 6 }}>
            <h3 style={{ fontSize: 26, lineHeight: 1.04, color: '#f8fafc', letterSpacing: '-0.01em' }}>
              {place.name}
            </h3>
            <p style={{ color: 'rgba(248,250,252,0.86)', fontSize: 13, fontWeight: 500 }}>
              {place.city}, {place.countryName}
            </p>
          </div>
        </div>
      </button>
      <div style={{ padding: 18, display: 'grid', gap: 14, color: '#f8fafc' }}>
        <p style={{ color: 'rgba(203,213,225,0.86)', lineHeight: 1.6, fontSize: 14 }}>{place.description}</p>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, minmax(0, 1fr))', gap: 8 }}>
          <MetricBadge label="Hot" value={`${place.popularity}%`} />
          <MetricBadge label="Match" value={`${place.relevance}%`} />
          <MetricBadge label="Year" value={new Date(place.updatedAt).getFullYear().toString()} />
        </div>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: 14 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8, color: 'rgba(226,232,240,0.78)', fontSize: 13 }}>
            <ArrowUpRight size={16} />
            <span>Open immersive details</span>
          </div>
          <button
            onClick={(e) => {
              e.stopPropagation();
              onFavorite();
              haptic('light');
            }}
            aria-label="Toggle favorite"
            aria-pressed={favorite}
            style={{
              padding: 12,
              borderRadius: 999,
              background: favorite ? 'var(--accent-soft)' : 'rgba(148,163,184,0.1)',
              border: favorite ? '1px solid var(--accent)' : '1px solid var(--app-border)',
              transition: 'all 0.2s ease',
            }}
          >
            <Heart
              size={18}
              fill={favorite ? 'var(--accent)' : 'transparent'}
              color={favorite ? 'var(--accent)' : 'currentColor'}
            />
          </button>
        </div>
      </div>
    </motion.article>
  );
});

export const CountryCard = memo(function CountryCard({ country, onOpen }: { country: Country; onOpen: () => void }) {
  return (
    <motion.button
      whileTap={{ scale: 0.97 }}
      onClick={onOpen}
      style={{
        width: 220,
        minWidth: 220,
        borderRadius: tokens.radius.lg,
        overflow: 'hidden',
        background: 'linear-gradient(180deg, rgba(14,21,38,0.96), rgba(9,15,28,0.99))',
        border: '1px solid var(--app-border)',
        textAlign: 'left',
        boxShadow: tokens.shadow.card,
      }}
    >
      {country.heroImage ? (
        <div style={{ position: 'relative', width: '100%', height: 180 }}>
          <LazyImage src={country.heroImage.url} alt={country.name} />
          <span
            style={{
              position: 'absolute',
              top: 12,
              left: 12,
              padding: '4px 10px',
              borderRadius: 999,
              fontSize: 10,
              fontWeight: 700,
              letterSpacing: '0.08em',
              textTransform: 'uppercase',
              background: 'rgba(15, 23, 42, 0.7)',
              border: '1px solid rgba(255, 255, 255, 0.14)',
              color: 'var(--accent-light)',
              backdropFilter: 'blur(8px)',
            }}
          >
            {country.flagEmoji} {country.region}
          </span>
        </div>
      ) : null}
      <div style={{ padding: 16, display: 'grid', gap: 8, color: '#f8fafc' }}>
        <strong style={{ fontSize: 19, letterSpacing: '-0.01em' }}>{country.name}</strong>
        <span style={{ color: 'rgba(203,213,225,0.78)', fontSize: 13 }}>{country.subregion}</span>
        <span style={{ color: 'rgba(253,230,138,0.86)', fontSize: 12, fontWeight: 500 }}>
          {country.languages.slice(0, 2).join(' · ')}
        </span>
      </div>
    </motion.button>
  );
});

export function BottomNavigation() {
  const { activeTab, setActiveTab } = useNavigation();
  const { t } = useI18n();
  const haptic = useHaptic();

  return (
    <nav
      style={{
        position: 'fixed',
        insetInline: 0,
        insetBlockEnd: 18,
        display: 'flex',
        justifyContent: 'center',
        paddingInline: 16,
        pointerEvents: 'none',
        zIndex: 40,
      }}
    >
      <div
        style={{
          width: 'min(450px, 100%)',
          display: 'grid',
          gridTemplateColumns: 'repeat(5, 1fr)',
          gap: 4,
          padding: 8,
          borderRadius: 26,
          background: 'rgba(7,17,31,0.78)',
          backdropFilter: 'blur(28px) saturate(180%)',
          border: '1px solid rgba(255,255,255,0.1)',
          boxShadow: '0 28px 60px rgba(2, 8, 23, 0.5)',
          pointerEvents: 'auto',
          position: 'relative',
        }}
      >
        {APP_TABS.map((tab) => {
          const Icon = tabIcons[tab];
          const active = tab === activeTab;
          return (
            <button
              key={tab}
              onClick={() => {
                if (tab !== activeTab) haptic('light');
                setActiveTab(tab);
              }}
              aria-current={active ? 'page' : undefined}
              style={{
                position: 'relative',
                padding: '10px 6px',
                borderRadius: 18,
                color: active ? 'var(--accent-light)' : 'rgba(248,250,252,0.66)',
                display: 'grid',
                gap: 4,
                placeItems: 'center',
                fontWeight: active ? 700 : 500,
                transition: 'color 0.2s ease',
              }}
            >
              {active ? (
                <motion.span
                  layoutId="bottom-nav-active"
                  transition={{ type: 'spring', damping: 22, stiffness: 320 }}
                  style={{
                    position: 'absolute',
                    inset: 0,
                    borderRadius: 18,
                    background: 'var(--accent-soft)',
                    border: '1px solid var(--accent-soft)',
                    boxShadow: 'inset 0 1px 0 rgba(255,255,255,0.14)',
                  }}
                />
              ) : null}
              <span style={{ position: 'relative', zIndex: 1 }}>
                <Icon size={18} />
              </span>
              <span style={{ position: 'relative', zIndex: 1, fontSize: 10, letterSpacing: '0.02em' }}>
                {t(tabLabelKeys[tab])}
              </span>
            </button>
          );
        })}
      </div>
    </nav>
  );
}

export function OverlayFrame({
  title,
  onClose,
  children,
}: {
  title: string;
  onClose: () => void;
  children: React.ReactNode;
}) {
  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        transition={{ duration: 0.22 }}
        onClick={onClose}
        style={{
          position: 'fixed',
          inset: 0,
          background: 'rgba(2,6,23,0.78)',
          backdropFilter: 'blur(14px)',
          display: 'grid',
          placeItems: 'end center',
          padding: 12,
          zIndex: 60,
        }}
      >
        <motion.section
          initial={{ y: 60, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          exit={{ y: 40, opacity: 0 }}
          transition={{ type: 'spring', damping: 24, stiffness: 260 }}
          onClick={(event) => event.stopPropagation()}
          style={{
            width: 'min(460px, 100%)',
            maxHeight: '94dvh',
            overflowY: 'auto',
            borderRadius: 32,
            background: 'var(--app-elevated)',
            border: '1px solid var(--app-border)',
            paddingBottom: 28,
            color: 'var(--app-text)',
          }}
        >
          <div
            style={{
              position: 'sticky',
              top: 0,
              zIndex: 1,
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
              padding: 18,
              background: 'var(--app-elevated)',
              backdropFilter: 'blur(10px)',
              borderBottom: '1px solid var(--app-border)',
            }}
          >
            <div style={{ width: 40, height: 4, borderRadius: 999, background: 'var(--app-border)', position: 'absolute', top: 8, left: '50%', transform: 'translateX(-50%)' }} />
            <h2 style={{ fontSize: 22, fontWeight: 700, marginTop: 6 }}>{title}</h2>
            <button
              onClick={onClose}
              style={{
                padding: '8px 14px',
                borderRadius: 999,
                background: 'var(--app-surface)',
                border: '1px solid var(--app-border)',
                fontSize: 13,
                fontWeight: 600,
              }}
            >
              Close
            </button>
          </div>
          {children}
        </motion.section>
      </motion.div>
    </AnimatePresence>
  );
}

export function EmptyState({ title, body }: { title: string; body: string }) {
  return (
    <div
      style={{
        padding: 28,
        borderRadius: tokens.radius.lg,
        background: 'var(--app-surface)',
        border: '1px solid var(--app-border)',
        textAlign: 'center',
        boxShadow: tokens.shadow.card,
      }}
    >
      <div
        style={{
          width: 60,
          height: 60,
          borderRadius: 20,
          margin: '0 auto 16px',
          background: 'var(--accent-soft)',
          display: 'grid',
          placeItems: 'center',
          color: 'var(--accent)',
        }}
      >
        <Map size={26} />
      </div>
      <h3 style={{ marginBottom: 8, fontSize: 17, fontWeight: 700 }}>{title}</h3>
      <p style={{ color: 'var(--app-text-muted)', lineHeight: 1.55, fontSize: 14 }}>{body}</p>
    </div>
  );
}

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
    <div
      style={{
        display: 'flex',
        justifyContent: 'space-between',
        gap: 16,
        alignItems: 'end',
        marginBottom: 16,
      }}
    >
      <div style={{ display: 'grid', gap: 6 }}>
        <span
          style={{
            fontSize: 11,
            letterSpacing: '0.18em',
            textTransform: 'uppercase',
            color: 'var(--accent-light)',
            fontWeight: 700,
          }}
        >
          {eyebrow}
        </span>
        <h2 style={{ fontSize: 24, lineHeight: 1.06, letterSpacing: '-0.01em' }}>{title}</h2>
        {description ? (
          <p style={{ color: 'var(--app-text-muted)', lineHeight: 1.5, maxWidth: 320, fontSize: 13 }}>{description}</p>
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
          }}
        >
          {value}
        </div>
      ) : null}
    </div>
  );
}

export function FeatureStrip({
  items,
}: {
  items: Array<{ label: string; value: string; accent?: string }>;
}) {
  return (
    <section
      style={{
        display: 'grid',
        gridTemplateColumns: `repeat(${items.length}, minmax(0, 1fr))`,
        gap: 10,
        marginBottom: 24,
      }}
    >
      {items.map((item) => (
        <div
          key={item.label}
          style={{
            padding: '16px 14px',
            borderRadius: 22,
            background: 'var(--app-surface)',
            border: '1px solid var(--app-border)',
            backdropFilter: 'blur(16px)',
            boxShadow: tokens.shadow.soft,
          }}
        >
          <div
            style={{
              fontSize: 22,
              fontWeight: 800,
              color: item.accent ?? 'var(--app-text)',
              marginBottom: 4,
              letterSpacing: '-0.01em',
            }}
          >
            {item.value}
          </div>
          <div
            style={{
              fontSize: 11,
              color: 'var(--app-text-muted)',
              textTransform: 'uppercase',
              letterSpacing: '0.1em',
              fontWeight: 600,
            }}
          >
            {item.label}
          </div>
        </div>
      ))}
    </section>
  );
}

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
        padding: 22,
        borderRadius: 28,
        background:
          'linear-gradient(135deg, var(--accent-soft), rgba(244,114,182,0.1) 55%, rgba(56,189,248,0.08))',
        border: '1px solid var(--app-border)',
        boxShadow: tokens.shadow.card,
        backdropFilter: 'blur(16px)',
      }}
    >
      <div style={{ display: 'grid', gap: 8, marginBottom: 18 }}>
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
        <h3 style={{ fontSize: 22, lineHeight: 1.1, letterSpacing: '-0.01em' }}>{title}</h3>
        <p style={{ color: 'var(--app-text-muted)', lineHeight: 1.55, fontSize: 13 }}>{description}</p>
      </div>
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, minmax(0, 1fr))', gap: 8 }}>
        {items.map((item) => (
          <MetricBadge key={item.label} label={item.label} value={item.value} />
        ))}
      </div>
    </section>
  );
}

function MetricBadge({ label, value }: { label: string; value: string }) {
  return (
    <div
      style={{
        padding: '12px 10px',
        borderRadius: 16,
        background: 'rgba(255,255,255,0.06)',
        border: '1px solid var(--app-border)',
      }}
    >
      <div style={{ fontWeight: 800, marginBottom: 3, fontSize: 14 }}>{value}</div>
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
