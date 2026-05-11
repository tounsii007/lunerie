import { useEffect, useMemo, useRef } from 'react';
import { Command } from 'cmdk';
import { AnimatePresence, motion } from 'framer-motion';
import { Compass, Heart, MapPin, Moon, Palette, Search, Settings, Sparkles, Sun, Wand2 } from 'lucide-react';
import type { AppTab } from '@/constants/app';
import { useExplorePlaces } from '@/hooks/useExplorePlaces';
import { useI18n } from '@/i18n/I18nProvider';
import { useNavigation } from '@/state/navigation-context';
import { usePreferences } from '@/state/preferences-context';
import { ACCENT_COLORS, BACKGROUND_STYLES } from '@/theme/tokens';

interface CommandPaletteProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

const tabIcons: Record<AppTab, React.ComponentType<{ size?: number }>> = {
  explore: Sparkles,
  search: Search,
  nearby: Compass,
  favorites: Heart,
  settings: Settings,
};

export function CommandPalette({ open, onOpenChange }: CommandPaletteProps) {
  const { t } = useI18n();
  const { setActiveTab, openPlace } = useNavigation();
  const { setTheme, setAccentColor, setBackgroundStyle, preferences } = usePreferences();
  const { data: explore } = useExplorePlaces();
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (open) {
      const id = window.setTimeout(() => inputRef.current?.focus(), 50);
      return () => window.clearTimeout(id);
    }
  }, [open]);

  const places = useMemo(() => (explore?.items ?? []).slice(0, 8), [explore]);

  if (!open && typeof document === 'undefined') {
    return null;
  }

  const close = () => onOpenChange(false);

  return (
    <AnimatePresence>
      {open ? (
        <motion.div
          key="command-palette"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.18 }}
          onClick={close}
          style={{
            position: 'fixed',
            inset: 0,
            zIndex: 80,
            background: 'var(--app-overlay-scrim)',
            backdropFilter: 'blur(14px)',
            WebkitBackdropFilter: 'blur(14px)',
            display: 'grid',
            placeItems: 'start center',
            paddingTop: '14vh',
            padding: '14vh 16px 16px',
          }}
        >
          <motion.div
            initial={{ y: 20, scale: 0.96, opacity: 0 }}
            animate={{ y: 0, scale: 1, opacity: 1 }}
            exit={{ y: 16, scale: 0.97, opacity: 0 }}
            transition={{ type: 'spring', damping: 26, stiffness: 320 }}
            onClick={(event) => event.stopPropagation()}
            style={{
              width: 'min(560px, 100%)',
              borderRadius: 24,
              overflow: 'hidden',
              border: '1px solid var(--app-border)',
              background: 'var(--app-elevated)',
              boxShadow: '0 32px 90px rgba(2, 8, 23, 0.55)',
            }}
          >
            <Command label="Command palette" shouldFilter>
              <div
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: 12,
                  padding: '16px 18px',
                  borderBottom: '1px solid var(--app-border)',
                }}
              >
                <Wand2 size={18} color="var(--accent)" />
                <Command.Input
                  ref={inputRef}
                  placeholder="Type a command, place, or color..."
                  style={{
                    flex: 1,
                    background: 'transparent',
                    border: 0,
                    outline: 'none',
                    color: 'var(--app-text)',
                    fontSize: 15,
                  }}
                />
                <kbd
                  style={{
                    fontSize: 11,
                    padding: '4px 8px',
                    borderRadius: 8,
                    border: '1px solid var(--app-border)',
                    color: 'var(--app-text-muted)',
                    fontFamily: 'inherit',
                  }}
                >
                  Esc
                </kbd>
              </div>

              <Command.List
                style={{
                  maxHeight: '50vh',
                  overflowY: 'auto',
                  padding: 8,
                }}
              >
                <Command.Empty
                  style={{
                    padding: 24,
                    textAlign: 'center',
                    color: 'var(--app-text-muted)',
                  }}
                >
                  No results found.
                </Command.Empty>

                <Command.Group heading="Navigate" className="cmdk-group">
                  {(['explore', 'search', 'nearby', 'favorites', 'settings'] as AppTab[]).map((tab) => {
                    const Icon = tabIcons[tab];
                    return (
                      <Command.Item
                        key={tab}
                        value={`go ${tab} ${t(tab)}`}
                        onSelect={() => {
                          setActiveTab(tab);
                          close();
                        }}
                      >
                        <Icon size={16} />
                        <span>Go to {t(tab)}</span>
                      </Command.Item>
                    );
                  })}
                </Command.Group>

                <Command.Group heading="Theme">
                  <Command.Item
                    value="theme dark"
                    onSelect={() => {
                      setTheme('dark');
                      close();
                    }}
                  >
                    <Moon size={16} />
                    <span>Switch to dark mode</span>
                    {preferences.theme === 'dark' ? <Badge>Active</Badge> : null}
                  </Command.Item>
                  <Command.Item
                    value="theme light"
                    onSelect={() => {
                      setTheme('light');
                      close();
                    }}
                  >
                    <Sun size={16} />
                    <span>Switch to light mode</span>
                    {preferences.theme === 'light' ? <Badge>Active</Badge> : null}
                  </Command.Item>
                  <Command.Item
                    value="theme system"
                    onSelect={() => {
                      setTheme('system');
                      close();
                    }}
                  >
                    <Settings size={16} />
                    <span>Match system theme</span>
                    {preferences.theme === 'system' ? <Badge>Active</Badge> : null}
                  </Command.Item>
                </Command.Group>

                <Command.Group heading="Accent color">
                  {ACCENT_COLORS.map((color) => (
                    <Command.Item
                      key={color.id}
                      value={`accent ${color.label}`}
                      onSelect={() => {
                        setAccentColor(color.id);
                        close();
                      }}
                    >
                      <span
                        style={{
                          width: 16,
                          height: 16,
                          borderRadius: 8,
                          background: color.primary,
                          boxShadow: `0 0 0 2px ${color.soft}`,
                          flexShrink: 0,
                        }}
                      />
                      <span>{color.label}</span>
                      {preferences.accentColor === color.id ? <Badge>Active</Badge> : null}
                    </Command.Item>
                  ))}
                </Command.Group>

                <Command.Group heading="Background style">
                  {BACKGROUND_STYLES.map((style) => (
                    <Command.Item
                      key={style.id}
                      value={`background ${style.label}`}
                      onSelect={() => {
                        setBackgroundStyle(style.id);
                        close();
                      }}
                    >
                      <Palette size={16} />
                      <span>{style.label} background</span>
                      {preferences.backgroundStyle === style.id ? <Badge>Active</Badge> : null}
                    </Command.Item>
                  ))}
                </Command.Group>

                {places.length ? (
                  <Command.Group heading="Places">
                    {places.map((place) => (
                      <Command.Item
                        key={place.id}
                        value={`place ${place.name} ${place.city} ${place.countryName}`}
                        onSelect={() => {
                          openPlace(place);
                          close();
                        }}
                      >
                        <MapPin size={16} />
                        <span>{place.name}</span>
                        <span style={{ marginLeft: 'auto', color: 'var(--app-text-muted)', fontSize: 12 }}>
                          {place.city}, {place.countryName}
                        </span>
                      </Command.Item>
                    ))}
                  </Command.Group>
                ) : null}
              </Command.List>

              <div
                style={{
                  display: 'flex',
                  gap: 14,
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  padding: '10px 16px',
                  borderTop: '1px solid var(--app-border)',
                  fontSize: 11,
                  color: 'var(--app-text-muted)',
                }}
              >
                <span>
                  <kbd style={kbdStyle}>↑</kbd>
                  <kbd style={kbdStyle}>↓</kbd> navigate
                </span>
                <span>
                  <kbd style={kbdStyle}>↵</kbd> select
                </span>
                <span>
                  <kbd style={kbdStyle}>Ctrl</kbd>
                  <kbd style={kbdStyle}>K</kbd> open
                </span>
              </div>
            </Command>
          </motion.div>
        </motion.div>
      ) : null}
    </AnimatePresence>
  );
}

const kbdStyle: React.CSSProperties = {
  fontSize: 10,
  padding: '2px 6px',
  marginInline: 2,
  borderRadius: 6,
  border: '1px solid var(--app-border)',
  fontFamily: 'inherit',
};

function Badge({ children }: { children: React.ReactNode }) {
  return (
    <span
      style={{
        marginLeft: 'auto',
        fontSize: 10,
        padding: '3px 8px',
        borderRadius: 999,
        background: 'var(--accent-soft)',
        color: 'var(--accent-light)',
        textTransform: 'uppercase',
        letterSpacing: '0.08em',
        fontWeight: 700,
      }}
    >
      {children}
    </span>
  );
}
