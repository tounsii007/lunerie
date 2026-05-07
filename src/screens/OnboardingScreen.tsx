import { motion } from 'framer-motion';
import { ArrowRight, Sparkles } from 'lucide-react';
import { useI18n } from '@/i18n/I18nProvider';
import { useHaptic } from '@/hooks/useHaptic';
import { usePreferences } from '@/state/preferences-context';
import { ACCENT_COLORS } from '@/theme/tokens';

export function OnboardingScreen() {
  const { t } = useI18n();
  const { completeOnboarding, preferences, setLocale, setAccentColor } = usePreferences();
  const haptic = useHaptic();

  return (
    <div
      style={{
        minHeight: '100dvh',
        padding: 28,
        display: 'grid',
        alignContent: 'space-between',
        gap: 28,
      }}
    >
      <motion.div
        initial={{ opacity: 0, y: 18 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        style={{ display: 'grid', gap: 22 }}
      >
        <motion.div
          animate={{ y: [0, -6, 0] }}
          transition={{ duration: 4, repeat: Infinity, ease: 'easeInOut' }}
          style={{
            position: 'relative',
            height: 320,
            borderRadius: 36,
            background:
              'linear-gradient(135deg, var(--accent) 0%, var(--accent-light) 50%, #38bdf8 100%)',
            border: '1px solid rgba(255,255,255,0.18)',
            boxShadow: '0 32px 70px var(--accent-glow)',
            overflow: 'hidden',
            display: 'grid',
            placeItems: 'center',
          }}
        >
          <Sparkles size={84} color="rgba(15, 23, 42, 0.5)" />
          <span
            style={{
              position: 'absolute',
              top: 18,
              left: 18,
              padding: '6px 12px',
              borderRadius: 999,
              fontSize: 11,
              letterSpacing: '0.16em',
              textTransform: 'uppercase',
              fontWeight: 700,
              background: 'rgba(15,23,42,0.4)',
              color: '#fff',
              backdropFilter: 'blur(12px)',
            }}
          >
            Lunerie
          </span>
        </motion.div>
        <div>
          <p
            style={{
              color: 'var(--accent-light)',
              letterSpacing: '0.22em',
              textTransform: 'uppercase',
              marginBottom: 12,
              fontSize: 12,
              fontWeight: 700,
            }}
          >
            Premium travel UX
          </p>
          <h1
            style={{
              fontFamily: '"Fraunces", serif',
              fontSize: 40,
              marginBottom: 12,
              lineHeight: 1.02,
              letterSpacing: '-0.02em',
            }}
          >
            {t('onboardingTitle')}
          </h1>
          <p style={{ lineHeight: 1.6, color: 'var(--app-text-muted)' }}>{t('onboardingBody')}</p>
        </div>

        <div style={{ display: 'grid', gap: 10 }}>
          <span
            style={{
              fontSize: 11,
              letterSpacing: '0.18em',
              textTransform: 'uppercase',
              color: 'var(--app-text-muted)',
              fontWeight: 600,
            }}
          >
            Pick your color
          </span>
          <div style={{ display: 'flex', gap: 8, overflowX: 'auto' }} className="scrollbar-hidden">
            {ACCENT_COLORS.map((color) => {
              const active = preferences.accentColor === color.id;
              return (
                <button
                  key={color.id}
                  onClick={() => {
                    setAccentColor(color.id);
                    haptic('light');
                  }}
                  aria-label={color.label}
                  style={{
                    width: 38,
                    minWidth: 38,
                    height: 38,
                    borderRadius: 12,
                    background: `linear-gradient(135deg, ${color.primary}, ${color.light})`,
                    border: active ? '2px solid var(--app-text)' : '2px solid transparent',
                    boxShadow: active ? `0 0 0 4px var(--app-bg), 0 6px 18px ${color.glow}` : `0 4px 12px ${color.glow}`,
                    transform: active ? 'scale(1.05)' : 'scale(1)',
                    transition: 'all 0.18s ease',
                  }}
                />
              );
            })}
          </div>
        </div>
      </motion.div>

      <div style={{ display: 'grid', gap: 16 }}>
        <div style={{ display: 'flex', gap: 8, overflowX: 'auto' }} className="scrollbar-hidden">
          {(['de', 'en', 'fr', 'ar', 'es', 'pt'] as const).map((locale) => {
            const active = preferences.locale === locale;
            return (
              <button
                key={locale}
                onClick={() => {
                  setLocale(locale);
                  haptic('light');
                }}
                style={{
                  padding: '12px 18px',
                  borderRadius: 999,
                  background: active ? 'var(--accent-soft)' : 'var(--app-surface)',
                  border: active ? '1px solid var(--accent)' : '1px solid var(--app-border)',
                  color: active ? 'var(--accent-light)' : 'var(--app-text)',
                  fontWeight: 600,
                  textTransform: 'uppercase',
                  fontSize: 13,
                  letterSpacing: '0.04em',
                }}
              >
                {locale}
              </button>
            );
          })}
        </div>
        <motion.button
          whileTap={{ scale: 0.98 }}
          onClick={() => {
            completeOnboarding();
            haptic('success');
          }}
          style={{
            padding: '18px 22px',
            borderRadius: 22,
            background: 'linear-gradient(135deg, var(--accent), var(--accent-light) 60%, #38bdf8)',
            color: '#0f172a',
            fontWeight: 800,
            fontSize: 16,
            letterSpacing: '-0.01em',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            gap: 10,
            boxShadow: '0 16px 36px var(--accent-glow)',
          }}
        >
          {t('start')}
          <ArrowRight size={20} />
        </motion.button>
      </div>
    </div>
  );
}
