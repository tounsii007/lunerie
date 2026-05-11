import { motion } from 'framer-motion';
import { ArrowRight, Compass, Heart, Search, Sparkles } from 'lucide-react';
import { useI18n } from '@/i18n/I18nProvider';
import { useHaptic } from '@/hooks/useHaptic';
import { useMotionSafe } from '@/hooks/useMotionSafe';
import { usePreferences } from '@/state/preferences-context';
import { ACCENT_COLORS } from '@/theme/tokens';

const FEATURES = [
  { icon: Sparkles, label: 'Curated highlights' },
  { icon: Search, label: 'Smart discovery' },
  { icon: Compass, label: 'Map-first explore' },
  { icon: Heart, label: 'Save & sync' },
] as const;

export function OnboardingScreen() {
  const { t } = useI18n();
  const { completeOnboarding, preferences, setLocale, setAccentColor } = usePreferences();
  const haptic = useHaptic();
  const motionSafe = useMotionSafe();

  return (
    <div
      style={{
        minHeight: '100dvh',
        padding: 28,
        display: 'grid',
        alignContent: 'space-between',
        gap: 28,
        position: 'relative',
        overflow: 'hidden',
      }}
    >
      <motion.span
        aria-hidden
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 1.4 }}
        style={{
          position: 'absolute',
          inset: 0,
          backgroundImage:
            'radial-gradient(circle at 20% 0%, var(--accent-glow), transparent 38%), radial-gradient(circle at 100% 100%, rgba(56,189,248,0.16), transparent 42%)',
          pointerEvents: 'none',
          opacity: 0.6,
        }}
      />

      <motion.div
        initial={{ opacity: 0, y: 18 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.55, ease: [0.22, 1, 0.36, 1] }}
        style={{ display: 'grid', gap: 22, position: 'relative' }}
      >
        <motion.div
          animate={motionSafe.reduce ? { y: 0 } : { y: [0, -6, 0] }}
          transition={motionSafe.reduce ? {} : { duration: 4, repeat: Infinity, ease: 'easeInOut' }}
          className="relative grid h-[320px] place-items-center overflow-hidden rounded-[36px] border border-white/[0.18] shadow-[0_32px_70px_var(--accent-glow)]"
          style={{
            background:
              'linear-gradient(135deg, var(--accent) 0%, var(--accent-light) 50%, #38bdf8 100%)',
            border: '1px solid rgba(255,255,255,0.18)',
            boxShadow: '0 32px 70px var(--accent-glow), inset 0 1px 0 rgba(255,255,255,0.36)',
            overflow: 'hidden',
            display: 'grid',
            placeItems: 'center',
          }}
          aria-hidden="true"
        >
          {/* Decorative twinkles */}
          {[
            { top: '18%', left: '14%', size: 6, delay: 0 },
            { top: '32%', left: '78%', size: 5, delay: 0.6 },
            { top: '70%', left: '22%', size: 4, delay: 1.1 },
            { top: '78%', left: '70%', size: 7, delay: 0.4 },
          ].map((spark, i) => (
            <motion.span
              key={i}
              aria-hidden
              animate={{ opacity: [0.2, 1, 0.2], scale: [0.8, 1.2, 0.8] }}
              transition={{ duration: 2.4, repeat: Infinity, delay: spark.delay }}
              style={{
                position: 'absolute',
                top: spark.top,
                left: spark.left,
                width: spark.size,
                height: spark.size,
                borderRadius: 999,
                background: 'rgba(255,255,255,0.85)',
                boxShadow: '0 0 12px rgba(255,255,255,0.6)',
              }}
            />
          ))}
          <span
            aria-hidden
            style={{
              position: 'absolute',
              top: 0,
              left: 0,
              right: 0,
              height: '50%',
              background:
                'linear-gradient(180deg, rgba(255,255,255,0.22), transparent)',
              pointerEvents: 'none',
            }}
          />
          <motion.div
            animate={{ rotate: 360 }}
            transition={{ duration: 24, repeat: Infinity, ease: 'linear' }}
            style={{ position: 'absolute', inset: 'auto' }}
          >
            <Sparkles size={104} color="rgba(15, 23, 42, 0.45)" />
          </motion.div>
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
              WebkitBackdropFilter: 'blur(12px)',
            }}
          >
            Lunerie
          </span>
          <div
            style={{
              position: 'absolute',
              bottom: 16,
              insetInline: 16,
              display: 'flex',
              flexWrap: 'wrap',
              gap: 6,
              justifyContent: 'center',
            }}
          >
            {FEATURES.map((feature, idx) => {
              const Icon = feature.icon;
              return (
                <motion.span
                  key={feature.label}
                  initial={{ opacity: 0, y: 8 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.3 + idx * 0.08, duration: 0.4 }}
                  style={{
                    display: 'inline-flex',
                    alignItems: 'center',
                    gap: 6,
                    padding: '7px 11px',
                    borderRadius: 999,
                    background: 'rgba(15, 23, 42, 0.32)',
                    backdropFilter: 'blur(10px)',
                    WebkitBackdropFilter: 'blur(10px)',
                    color: '#fff',
                    fontSize: 11,
                    fontWeight: 600,
                    border: '1px solid rgba(255,255,255,0.18)',
                  }}
                >
                  <Icon size={12} />
                  {feature.label}
                </motion.span>
              );
            })}
          </div>
        </motion.div>
        <div>
          <motion.p
            initial={{ opacity: 0, y: 6 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.18, duration: 0.4 }}
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
          </motion.p>
          <motion.h1
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.22, duration: 0.45 }}
            style={{
              fontFamily: '"Fraunces", serif',
              fontSize: 42,
              marginBottom: 12,
              lineHeight: 1.02,
              letterSpacing: '-0.022em',
              fontWeight: 600,
            }}
          >
            {t('onboardingTitle')}
          </motion.h1>
          <motion.p
            initial={{ opacity: 0, y: 6 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.28, duration: 0.4 }}
            style={{ lineHeight: 1.62, color: 'var(--app-text-muted)', fontSize: 15 }}
          >
            {t('onboardingBody')}
          </motion.p>
        </div>

        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.34, duration: 0.5 }}
          style={{ display: 'grid', gap: 10 }}
        >
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
          <div style={{ display: 'flex', gap: 10, overflowX: 'auto' }} className="scrollbar-hidden">
            {ACCENT_COLORS.map((color) => {
              const active = preferences.accentColor === color.id;
              return (
                <motion.button
                  key={color.id}
                  whileTap={{ scale: 0.92 }}
                  onClick={() => {
                    setAccentColor(color.id);
                    haptic('light');
                  }}
                  aria-label={color.label}
                  aria-pressed={active}
                  style={{
                    width: 40,
                    minWidth: 40,
                    height: 40,
                    borderRadius: 14,
                    background: `linear-gradient(135deg, ${color.primary}, ${color.light})`,
                    border: active
                      ? '2px solid rgba(255,255,255,0.95)'
                      : '2px solid rgba(255,255,255,0)',
                    boxShadow: active
                      ? `0 0 0 4px var(--app-bg, #07111f), 0 8px 22px ${color.glow}`
                      : `0 6px 16px ${color.glow}`,
                    transform: active ? 'scale(1.06)' : 'scale(1)',
                    transition: 'transform 0.18s var(--ease-spring), box-shadow 0.22s var(--ease-out)',
                    position: 'relative',
                  }}
                >
                  {active ? (
                    <motion.span
                      layoutId="onboarding-accent-dot"
                      style={{
                        position: 'absolute',
                        inset: 0,
                        margin: 'auto',
                        width: 8,
                        height: 8,
                        borderRadius: 999,
                        background: 'rgba(15,23,42,0.6)',
                        backdropFilter: 'blur(2px)',
                      }}
                    />
                  ) : null}
                </motion.button>
              );
            })}
          </div>
        </motion.div>
      </motion.div>

      <motion.div
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.4, duration: 0.45 }}
        style={{ display: 'grid', gap: 16, position: 'relative' }}
      >
        <div style={{ display: 'flex', gap: 8, overflowX: 'auto' }} className="scrollbar-hidden">
          {(['de', 'en', 'fr', 'ar', 'es', 'pt'] as const).map((locale) => {
            const active = preferences.locale === locale;
            return (
              <motion.button
                key={locale}
                whileTap={{ scale: 0.96 }}
                onClick={() => {
                  setLocale(locale);
                  haptic('light');
                }}
                aria-pressed={active}
                style={{
                  padding: '12px 20px',
                  borderRadius: 999,
                  background: active ? 'var(--accent-soft)' : 'var(--app-surface)',
                  border: active ? '1px solid var(--accent)' : '1px solid var(--app-border)',
                  color: active ? 'var(--accent-light)' : 'var(--app-text)',
                  fontWeight: 700,
                  textTransform: 'uppercase',
                  fontSize: 13,
                  letterSpacing: '0.06em',
                  backdropFilter: 'blur(12px)',
                  WebkitBackdropFilter: 'blur(12px)',
                  boxShadow: active ? '0 6px 18px var(--accent-glow)' : 'none',
                  transition: 'all 0.2s var(--ease-out)',
                }}
              >
                {locale}
              </motion.button>
            );
          })}
        </div>
        <motion.button
          whileHover={{ y: -1 }}
          whileTap={{ scale: 0.98 }}
          onClick={() => {
            completeOnboarding();
            haptic('success');
          }}
          className="flex items-center justify-center gap-2.5 rounded-[22px] px-[22px] py-[18px] text-base font-extrabold tracking-[-0.01em] text-[#0f172a] shadow-[0_16px_36px_var(--accent-glow)]"
          style={{
            padding: '20px 22px',
            borderRadius: 24,
            background: 'linear-gradient(135deg, var(--accent), var(--accent-light) 60%, #38bdf8)',
            color: '#0f172a',
            fontWeight: 800,
            fontSize: 16,
            letterSpacing: '-0.012em',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            gap: 12,
            boxShadow: '0 18px 40px var(--accent-glow), inset 0 1px 0 rgba(255,255,255,0.32)',
            position: 'relative',
            overflow: 'hidden',
          }}
        >
          <span style={{ position: 'relative', zIndex: 1 }}>{t('start')}</span>
          <motion.span
            animate={{ x: [0, 4, 0] }}
            transition={{ duration: 1.6, repeat: Infinity, ease: 'easeInOut' }}
            style={{ display: 'inline-flex', position: 'relative', zIndex: 1 }}
          >
            <ArrowRight size={20} strokeWidth={2.5} />
          </motion.span>
        </motion.button>
      </motion.div>
    </div>
  );
}
