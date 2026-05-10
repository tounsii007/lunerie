import { useState } from 'react';
import { motion } from 'framer-motion';
import { toast } from 'sonner';
import { Check, Globe, Image as ImageIcon, LogIn, LogOut, Moon, Palette, RefreshCw, Sliders, Sparkles, Sun, User, Vibrate, Wand2, Zap } from 'lucide-react';
import { ScreenContainer, SectionHeading } from '@/components/AppShell';
import { useAuth } from '@/state/auth-context';
import { AuthScreen } from '@/screens/AuthScreen';
import { PLACE_CATEGORIES } from '@/constants/categories';
import { localeOptions } from '@/constants/locales';
import { THEMES } from '@/constants/app';
import { useI18n } from '@/i18n/I18nProvider';
import { useCommandPalette } from '@/state/command-palette-context';
import { usePreferences } from '@/state/preferences-context';
import { ACCENT_COLORS, BACKGROUND_STYLES, type AccentColorId, type BackgroundStyleId } from '@/theme/tokens';
import { useHaptic } from '@/hooks/useHaptic';

const themeIcons = {
  light: Sun,
  dark: Moon,
  system: Sliders,
} as const;

export function SettingsScreen() {
  const { t } = useI18n();
  const {
    preferences,
    setLocale,
    setTheme,
    setAccentColor,
    setBackgroundStyle,
    setReducedMotion,
    setHapticFeedback,
    setFilters,
    toggleCategory,
    resetOnboarding,
  } = usePreferences();
  const { toggle: toggleCommandPalette } = useCommandPalette();
  const { user: authUser, logout: authLogout } = useAuth();
  const haptic = useHaptic();
  const [showAllLanguages, setShowAllLanguages] = useState(false);
  const [showAuth, setShowAuth] = useState(false);

  const visibleLocales = showAllLanguages ? localeOptions : localeOptions.slice(0, 4);

  const handleAccentChange = (id: AccentColorId, label: string) => {
    setAccentColor(id);
    haptic('light');
    toast.success(`Accent: ${label}`, { duration: 1400 });
  };

  const handleBackgroundChange = (id: BackgroundStyleId, label: string) => {
    setBackgroundStyle(id);
    haptic('light');
    toast.success(`Background: ${label}`, { duration: 1400 });
  };

  return (
    <ScreenContainer>
      <motion.div
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3 }}
        style={{ display: 'grid', gap: 22 }}
      >
        <header style={{ display: 'grid', gap: 8 }}>
          <span
            style={{
              fontSize: 11,
              letterSpacing: '0.22em',
              textTransform: 'uppercase',
              color: 'var(--accent-light)',
              fontWeight: 700,
            }}
          >
            Personalize
          </span>
          <h1
            style={{
              fontFamily: '"Fraunces", serif',
              fontSize: 38,
              lineHeight: 1,
              letterSpacing: '-0.022em',
              fontWeight: 600,
            }}
          >
            {t('settings')}
          </h1>
          <p style={{ color: 'var(--app-text-muted)', lineHeight: 1.6, maxWidth: 360, fontSize: 14 }}>
            Make Lunerie feel yours. Pick a color, a vibe, and your favorite categories.
          </p>
        </header>

        <button
          onClick={() => {
            haptic('light');
            toggleCommandPalette();
          }}
          style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            gap: 12,
            padding: '14px 18px',
            borderRadius: 18,
            border: '1px solid var(--app-border)',
            background: 'linear-gradient(135deg, var(--accent-soft), transparent 70%), var(--app-surface)',
            textAlign: 'left',
            transition: 'transform 0.15s ease, box-shadow 0.15s ease',
          }}
          onMouseDown={(e) => (e.currentTarget.style.transform = 'scale(0.98)')}
          onMouseUp={(e) => (e.currentTarget.style.transform = 'scale(1)')}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
            <span
              style={{
                width: 38,
                height: 38,
                borderRadius: 12,
                background: 'var(--accent-soft)',
                display: 'grid',
                placeItems: 'center',
                color: 'var(--accent)',
              }}
            >
              <Wand2 size={18} />
            </span>
            <span style={{ display: 'grid', gap: 2 }}>
              <strong style={{ fontSize: 14 }}>Open command palette</strong>
              <span style={{ fontSize: 12, color: 'var(--app-text-muted)' }}>Quick actions, themes, places</span>
            </span>
          </div>
          <kbd
            style={{
              padding: '6px 10px',
              borderRadius: 8,
              border: '1px solid var(--app-border)',
              fontSize: 11,
              color: 'var(--app-text-muted)',
              fontFamily: 'inherit',
            }}
          >
            Ctrl K
          </kbd>
        </button>

        <Card icon={<User size={16} />} title="Account" description={authUser ? `Signed in as ${authUser.email}` : 'Sign in to sync your favorites and recent views across devices.'}>
          {authUser ? (
            <button
              onClick={async () => {
                await authLogout();
                haptic('light');
                toast.success('Signed out');
              }}
              style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                gap: 12,
                padding: '12px 14px',
                borderRadius: 14,
                border: '1px solid var(--app-border)',
                background: 'var(--app-surface)',
                color: 'var(--app-text)',
                width: '100%',
                fontWeight: 600,
                textAlign: 'left',
              }}
            >
              <span style={{ display: 'grid', gap: 2 }}>
                <strong style={{ fontSize: 14 }}>Sign out</strong>
                <span style={{ fontSize: 12, color: 'var(--app-text-muted)' }}>End the current session</span>
              </span>
              <LogOut size={16} />
            </button>
          ) : (
            <button
              onClick={() => {
                haptic('light');
                setShowAuth(true);
              }}
              style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                gap: 12,
                padding: '14px 16px',
                borderRadius: 14,
                background: 'linear-gradient(135deg, var(--accent-soft), transparent 70%)',
                border: '1px solid var(--accent-soft)',
                color: 'var(--accent-light)',
                fontWeight: 700,
                width: '100%',
              }}
            >
              <span>Sign in / create account</span>
              <LogIn size={16} />
            </button>
          )}
        </Card>

        {showAuth && !authUser ? (
          <div
            style={{
              position: 'fixed',
              inset: 0,
              zIndex: 70,
              background: 'var(--app-bg-image)',
              overflowY: 'auto',
            }}
          >
            <button
              onClick={() => setShowAuth(false)}
              style={{
                position: 'absolute',
                top: 16,
                right: 16,
                padding: '8px 14px',
                borderRadius: 999,
                background: 'var(--app-surface)',
                border: '1px solid var(--app-border)',
                fontSize: 13,
                fontWeight: 600,
                zIndex: 80,
              }}
            >
              Close
            </button>
            <AuthScreen onAuthenticated={() => setShowAuth(false)} onBack={() => setShowAuth(false)} />
          </div>
        ) : null}

        <Card icon={<Palette size={16} />} title="Accent color" description="Used across buttons, highlights and the active tab.">
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, minmax(0, 1fr))', gap: 12 }}>
            {ACCENT_COLORS.map((color) => {
              const active = preferences.accentColor === color.id;
              return (
                <button
                  key={color.id}
                  onClick={() => handleAccentChange(color.id, color.label)}
                  aria-pressed={active}
                  aria-label={color.label}
                  style={{
                    position: 'relative',
                    aspectRatio: '1 / 1',
                    borderRadius: 18,
                    background: `linear-gradient(135deg, ${color.primary}, ${color.light})`,
                    border: active ? `2px solid var(--app-text)` : '2px solid transparent',
                    boxShadow: active
                      ? `0 0 0 4px var(--app-bg), 0 8px 24px ${color.glow}`
                      : `0 6px 18px ${color.glow}`,
                    transition: 'transform 0.15s ease, box-shadow 0.2s ease',
                    transform: active ? 'scale(1.04)' : 'scale(1)',
                  }}
                >
                  {active ? (
                    <span
                      style={{
                        position: 'absolute',
                        inset: 0,
                        display: 'grid',
                        placeItems: 'center',
                        color: '#0f172a',
                      }}
                    >
                      <Check size={18} strokeWidth={3} />
                    </span>
                  ) : null}
                  <span
                    style={{
                      position: 'absolute',
                      bottom: -22,
                      left: 0,
                      right: 0,
                      fontSize: 11,
                      color: 'var(--app-text-muted)',
                      textAlign: 'center',
                      fontWeight: active ? 700 : 500,
                    }}
                  >
                    {color.label}
                  </span>
                </button>
              );
            })}
          </div>
          <div style={{ height: 22 }} />
        </Card>

        <Card icon={<ImageIcon size={16} />} title="Background style" description="Pick the ambient background gradient.">
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, minmax(0, 1fr))', gap: 12 }}>
            {BACKGROUND_STYLES.map((style) => {
              const active = preferences.backgroundStyle === style.id;
              const resolvedTheme = preferences.theme === 'light' ? 'light' : 'dark';
              return (
                <button
                  key={style.id}
                  onClick={() => handleBackgroundChange(style.id, style.label)}
                  aria-pressed={active}
                  style={{
                    position: 'relative',
                    height: 76,
                    borderRadius: 16,
                    background: style[resolvedTheme],
                    border: active ? '2px solid var(--accent)' : '1px solid var(--app-border)',
                    boxShadow: active ? `0 6px 24px var(--accent-glow)` : 'none',
                    overflow: 'hidden',
                    transition: 'all 0.2s ease',
                  }}
                >
                  <span
                    style={{
                      position: 'absolute',
                      inset: 0,
                      display: 'flex',
                      alignItems: 'flex-end',
                      padding: '8px 10px',
                      fontSize: 12,
                      fontWeight: 600,
                      color: '#fff',
                      textShadow: '0 1px 4px rgba(0,0,0,0.6)',
                    }}
                  >
                    {style.label}
                  </span>
                  {active ? (
                    <span
                      style={{
                        position: 'absolute',
                        top: 8,
                        right: 8,
                        width: 20,
                        height: 20,
                        borderRadius: 999,
                        background: 'var(--accent)',
                        display: 'grid',
                        placeItems: 'center',
                        color: '#0f172a',
                      }}
                    >
                      <Check size={12} strokeWidth={3} />
                    </span>
                  ) : null}
                </button>
              );
            })}
          </div>
        </Card>

        <Card icon={<Sparkles size={16} />} title={t('theme')} description="Light, dark or follow your system.">
          <div
            style={{
              display: 'grid',
              gridTemplateColumns: `repeat(${THEMES.length}, minmax(0, 1fr))`,
              gap: 8,
              padding: 4,
              borderRadius: 14,
              border: '1px solid var(--app-border)',
              background: 'var(--app-surface)',
            }}
          >
            {THEMES.map((theme) => {
              const Icon = themeIcons[theme];
              const active = preferences.theme === theme;
              return (
                <button
                  key={theme}
                  onClick={() => {
                    setTheme(theme);
                    haptic('light');
                  }}
                  aria-pressed={active}
                  style={{
                    position: 'relative',
                    padding: '12px 8px',
                    borderRadius: 11,
                    background: active ? 'var(--accent)' : 'transparent',
                    color: active ? '#0f172a' : 'var(--app-text)',
                    fontWeight: active ? 700 : 500,
                    fontSize: 13,
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    gap: 8,
                    transition: 'all 0.18s ease',
                  }}
                >
                  <Icon size={14} />
                  {t(theme)}
                </button>
              );
            })}
          </div>
        </Card>

        <Card icon={<Globe size={16} />} title={t('language')} description="Select your preferred language.">
          <div style={{ display: 'grid', gap: 8 }}>
            {visibleLocales.map((locale) => {
              const active = preferences.locale === locale.code;
              return (
                <button
                  key={locale.code}
                  onClick={() => {
                    setLocale(locale.code);
                    haptic('light');
                  }}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: 12,
                    padding: '12px 14px',
                    borderRadius: 14,
                    border: active ? '1px solid var(--accent)' : '1px solid var(--app-border)',
                    background: active ? 'var(--accent-soft)' : 'transparent',
                    transition: 'all 0.18s ease',
                  }}
                >
                  <img
                    src={`https://flagcdn.com/w40/${locale.flag}.png`}
                    alt={locale.label}
                    width={26}
                    height={20}
                    style={{ borderRadius: 4 }}
                    loading="lazy"
                  />
                  <span style={{ display: 'grid', gap: 2, textAlign: 'left' }}>
                    <strong style={{ fontSize: 14 }}>{locale.nativeLabel}</strong>
                    <span style={{ fontSize: 11, color: 'var(--app-text-muted)' }}>{locale.label}</span>
                  </span>
                  {active ? (
                    <span style={{ marginLeft: 'auto', color: 'var(--accent)' }}>
                      <Check size={16} strokeWidth={3} />
                    </span>
                  ) : null}
                </button>
              );
            })}
            {localeOptions.length > 4 ? (
              <button
                onClick={() => setShowAllLanguages((value) => !value)}
                style={{
                  marginTop: 4,
                  padding: '10px 12px',
                  borderRadius: 12,
                  fontSize: 13,
                  color: 'var(--accent-light)',
                  fontWeight: 600,
                }}
              >
                {showAllLanguages ? 'Show less' : `Show ${localeOptions.length - 4} more`}
              </button>
            ) : null}
          </div>
        </Card>

        <Card icon={<Zap size={16} />} title="Motion & feedback" description="Tune animations and tactile feedback.">
          <ToggleRow
            label="Reduce motion"
            description="Disables decorative animations"
            checked={preferences.reducedMotion}
            onChange={(value) => {
              setReducedMotion(value);
              haptic('light');
            }}
          />
          <ToggleRow
            label="Haptic feedback"
            description="Subtle vibrations on actions"
            icon={<Vibrate size={14} />}
            checked={preferences.hapticFeedback}
            onChange={(value) => {
              setHapticFeedback(value);
              if (value) navigator.vibrate?.(20);
            }}
          />
        </Card>

        <Card icon={<Sliders size={16} />} title={t('discoverySettings')} description="Tune what shows up in your feed.">
          <div style={{ display: 'grid', gap: 14 }}>
            <div style={{ display: 'grid', gap: 8 }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline' }}>
                <span style={{ fontSize: 13 }}>{t('radiusSettings')}</span>
                <span style={{ fontSize: 13, fontWeight: 700, color: 'var(--accent-light)' }}>
                  {preferences.filters.radiusKm} km
                </span>
              </div>
              <input
                type="range"
                min={10}
                max={200}
                step={10}
                value={preferences.filters.radiusKm}
                onChange={(event) =>
                  setFilters({
                    ...preferences.filters,
                    radiusKm: Number(event.target.value),
                  })
                }
                style={{
                  width: '100%',
                  accentColor: 'var(--accent)',
                }}
              />
            </div>

            <SegmentedControl
              options={[
                { value: 'relevance', label: t('relevanceSort') },
                { value: 'popularity', label: t('popularitySort') },
                { value: 'distance', label: t('distanceSort') },
              ]}
              value={preferences.filters.sortBy}
              onChange={(sortBy) => setFilters({ ...preferences.filters, sortBy: sortBy as 'relevance' | 'popularity' | 'distance' })}
            />

            <ToggleRow
              label={t('imageOnlySettings')}
              description="Hide places without photos"
              checked={preferences.filters.withImageOnly}
              onChange={(value) => setFilters({ ...preferences.filters, withImageOnly: value })}
            />
          </div>
        </Card>

        <Card icon={<Sparkles size={16} />} title={t('categorySettings')} description="Pick the topics you love.">
          <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
            {PLACE_CATEGORIES.map((category) => {
              const selected = preferences.selectedCategories.includes(category);
              return (
                <button
                  key={category}
                  onClick={() => {
                    toggleCategory(category);
                    haptic('light');
                  }}
                  style={{
                    padding: '8px 14px',
                    borderRadius: 999,
                    fontSize: 13,
                    fontWeight: 600,
                    border: selected ? '1px solid var(--accent)' : '1px solid var(--app-border)',
                    background: selected ? 'var(--accent-soft)' : 'transparent',
                    color: selected ? 'var(--accent-light)' : 'var(--app-text-muted)',
                    transition: 'all 0.18s ease',
                    textTransform: 'capitalize',
                  }}
                >
                  {category.replace(/_/g, ' ')}
                </button>
              );
            })}
          </div>
        </Card>

        <Card icon={<RefreshCw size={16} />} title={t('onboardingReset')}>
          <button
            onClick={() => {
              resetOnboarding();
              toast.info('Onboarding will appear next time.');
              haptic('medium');
            }}
            style={{
              padding: '14px 16px',
              borderRadius: 14,
              border: '1px solid var(--app-border)',
              background: 'var(--app-surface)',
              fontWeight: 600,
              fontSize: 14,
              color: 'var(--app-text)',
              textAlign: 'left',
            }}
          >
            {t('onboardingReset')}
          </button>
        </Card>

        <p style={{ textAlign: 'center', color: 'var(--app-text-muted)', fontSize: 12, padding: '8px 0 4px' }}>
          Lunerie · v1.0 · Made with care
        </p>
      </motion.div>
    </ScreenContainer>
  );
}

function Card({
  icon,
  title,
  description,
  children,
}: {
  icon?: React.ReactNode;
  title: string;
  description?: string;
  children: React.ReactNode;
}) {
  return (
    <section
      style={{
        padding: 20,
        borderRadius: 24,
        background: 'var(--app-surface)',
        border: '1px solid var(--app-border)',
        backdropFilter: 'blur(18px)',
        boxShadow: '0 8px 26px rgba(2, 8, 23, 0.18)',
        display: 'grid',
        gap: 14,
      }}
    >
      <header style={{ display: 'grid', gap: 4 }}>
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
          <h2 style={{ fontSize: 17, fontWeight: 700 }}>{title}</h2>
        </div>
        {description ? (
          <p style={{ fontSize: 13, color: 'var(--app-text-muted)' }}>{description}</p>
        ) : null}
      </header>
      {children}
    </section>
  );
}

function ToggleRow({
  label,
  description,
  checked,
  onChange,
  icon,
}: {
  label: string;
  description?: string;
  checked: boolean;
  onChange: (value: boolean) => void;
  icon?: React.ReactNode;
}) {
  return (
    <button
      onClick={() => onChange(!checked)}
      role="switch"
      aria-checked={checked}
      style={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        gap: 12,
        padding: '12px 14px',
        borderRadius: 14,
        border: '1px solid var(--app-border)',
        background: 'var(--app-surface)',
        textAlign: 'left',
      }}
    >
      <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
        {icon ? (
          <span
            style={{
              width: 28,
              height: 28,
              borderRadius: 9,
              background: 'var(--accent-soft)',
              color: 'var(--accent)',
              display: 'grid',
              placeItems: 'center',
            }}
          >
            {icon}
          </span>
        ) : null}
        <div style={{ display: 'grid', gap: 2 }}>
          <strong style={{ fontSize: 14 }}>{label}</strong>
          {description ? <span style={{ fontSize: 12, color: 'var(--app-text-muted)' }}>{description}</span> : null}
        </div>
      </div>
      <span
        aria-hidden
        style={{
          position: 'relative',
          width: 46,
          height: 28,
          padding: 3,
          borderRadius: 999,
          background: checked ? 'var(--accent)' : 'rgba(148, 163, 184, 0.32)',
          transition: 'background 0.22s var(--ease-out)',
          boxShadow: checked
            ? 'inset 0 1px 0 rgba(255,255,255,0.32), 0 4px 14px var(--accent-glow)'
            : 'inset 0 1px 0 rgba(255,255,255,0.06)',
        }}
      >
        <motion.span
          animate={{ x: checked ? 18 : 0 }}
          transition={{ type: 'spring', damping: 26, stiffness: 380 }}
          style={{
            display: 'block',
            width: 22,
            height: 22,
            borderRadius: 999,
            background: '#fff',
            boxShadow: '0 3px 8px rgba(0,0,0,0.22)',
          }}
        />
      </span>
    </button>
  );
}

function SegmentedControl({
  options,
  value,
  onChange,
}: {
  options: Array<{ value: string; label: string }>;
  value: string;
  onChange: (value: string) => void;
}) {
  return (
    <div
      style={{
        position: 'relative',
        display: 'grid',
        gridTemplateColumns: `repeat(${options.length}, minmax(0, 1fr))`,
        gap: 4,
        padding: 4,
        borderRadius: 12,
        border: '1px solid var(--app-border)',
        background: 'var(--app-surface)',
      }}
    >
      {options.map((option) => {
        const active = option.value === value;
        return (
          <button
            key={option.value}
            onClick={() => onChange(option.value)}
            aria-pressed={active}
            style={{
              position: 'relative',
              padding: '9px 6px',
              borderRadius: 9,
              fontSize: 12,
              fontWeight: active ? 700 : 500,
              background: 'transparent',
              color: active ? '#0f172a' : 'var(--app-text-muted)',
              transition: 'color 0.22s var(--ease-out)',
              zIndex: 1,
            }}
          >
            {active ? (
              <motion.span
                layoutId="segmented-active"
                transition={{ type: 'spring', damping: 26, stiffness: 360 }}
                style={{
                  position: 'absolute',
                  inset: 0,
                  borderRadius: 9,
                  background: 'var(--accent)',
                  boxShadow: 'inset 0 1px 0 rgba(255,255,255,0.32), 0 4px 14px var(--accent-glow)',
                  zIndex: -1,
                }}
              />
            ) : null}
            {option.label}
          </button>
        );
      })}
    </div>
  );
}
