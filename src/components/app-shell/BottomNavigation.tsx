import { motion } from 'framer-motion';
import { Compass, Heart, Search, Settings, Sparkles } from 'lucide-react';
import type { AppTab } from '@/constants/app';
import { APP_TABS } from '@/constants/app';
import { useI18n } from '@/i18n/I18nProvider';
import { useNavigation } from '@/state/navigation-context';
import { useHaptic } from '@/hooks/useHaptic';

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

export function BottomNavigation() {
  const { activeTab, setActiveTab } = useNavigation();
  const { t } = useI18n();
  const haptic = useHaptic();

  return (
    <nav
      aria-label="Primary"
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
          borderRadius: 28,
          background: 'var(--app-chip-bg-strong)',
          backdropFilter: 'blur(28px) saturate(180%)',
          WebkitBackdropFilter: 'blur(28px) saturate(180%)',
          border: '1px solid var(--app-border-strong)',
          boxShadow: 'var(--app-chip-shadow)',
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
              aria-label={t(tabLabelKeys[tab])}
              style={{
                position: 'relative',
                padding: '10px 6px',
                borderRadius: 20,
                color: active ? 'var(--accent-light)' : 'rgba(248,250,252,0.66)',
                display: 'grid',
                gap: 4,
                placeItems: 'center',
                fontWeight: active ? 700 : 500,
                transition: 'color 0.2s var(--ease-out)',
              }}
            >
              {active ? (
                <motion.span
                  layoutId="bottom-nav-active"
                  transition={{ type: 'spring', damping: 26, stiffness: 360 }}
                  style={{
                    position: 'absolute',
                    inset: 0,
                    borderRadius: 20,
                    background: 'var(--accent-soft)',
                    border: '1px solid var(--accent-soft)',
                    boxShadow:
                      'inset 0 1px 0 rgba(255,255,255,0.14), 0 4px 14px var(--accent-glow)',
                  }}
                />
              ) : null}
              <motion.span
                animate={active ? { y: -1, scale: 1.08 } : { y: 0, scale: 1 }}
                transition={{ type: 'spring', damping: 18, stiffness: 320 }}
                style={{ position: 'relative', zIndex: 1 }}
              >
                <Icon size={18} />
              </motion.span>
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
