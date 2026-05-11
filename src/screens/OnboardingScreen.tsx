import { motion } from 'framer-motion';
import { ArrowRight, Sparkles } from 'lucide-react';
import { useI18n } from '@/i18n/I18nProvider';
import { useHaptic } from '@/hooks/useHaptic';
import { useMotionSafe } from '@/hooks/useMotionSafe';
import { usePreferences } from '@/state/preferences-context';
import { ACCENT_COLORS } from '@/theme/tokens';

export function OnboardingScreen() {
  const { t } = useI18n();
  const { completeOnboarding, preferences, setLocale, setAccentColor } = usePreferences();
  const haptic = useHaptic();
  const motionSafe = useMotionSafe();

  return (
    <div className="grid min-h-[100dvh] gap-7 p-7 [align-content:space-between]">
      <motion.div {...motionSafe.fadeUp(18, 0.5)} className="grid gap-[22px]">
        <motion.div
          animate={motionSafe.reduce ? { y: 0 } : { y: [0, -6, 0] }}
          transition={motionSafe.reduce ? {} : { duration: 4, repeat: Infinity, ease: 'easeInOut' }}
          className="relative grid h-[320px] place-items-center overflow-hidden rounded-[36px] border border-white/[0.18] shadow-[0_32px_70px_var(--accent-glow)]"
          style={{
            background:
              'linear-gradient(135deg, var(--accent) 0%, var(--accent-light) 50%, #38bdf8 100%)',
          }}
          aria-hidden="true"
        >
          <Sparkles size={84} color="rgba(15, 23, 42, 0.5)" />
          <span className="absolute left-[18px] top-[18px] rounded-full bg-[rgba(15,23,42,0.4)] px-3 py-1.5 text-[11px] font-bold uppercase tracking-[0.16em] text-white backdrop-blur-md">
            Lunerie
          </span>
        </motion.div>
        <div>
          <p className="mb-3 text-xs font-bold uppercase tracking-[0.22em] text-[var(--accent-light)]">
            Premium travel UX
          </p>
          <h1 className="mb-3 font-display text-[40px] leading-[1.02] tracking-[-0.02em]">
            {t('onboardingTitle')}
          </h1>
          <p className="leading-[1.6] text-[var(--app-text-muted)]">{t('onboardingBody')}</p>
        </div>

        <div className="grid gap-2.5">
          <span className="text-[11px] font-semibold uppercase tracking-[0.18em] text-[var(--app-text-muted)]">
            Pick your color
          </span>
          <div className="scrollbar-hidden flex gap-2 overflow-x-auto" role="radiogroup" aria-label="Accent color">
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
                  aria-pressed={active}
                  className={`h-[38px] w-[38px] min-w-[38px] rounded-xl border-2 transition ${
                    active ? 'border-[var(--app-text)] scale-105' : 'border-transparent'
                  }`}
                  style={{
                    background: `linear-gradient(135deg, ${color.primary}, ${color.light})`,
                    boxShadow: active
                      ? `0 0 0 4px var(--app-bg), 0 6px 18px ${color.glow}`
                      : `0 4px 12px ${color.glow}`,
                  }}
                />
              );
            })}
          </div>
        </div>
      </motion.div>

      <div className="grid gap-4">
        <div className="scrollbar-hidden flex gap-2 overflow-x-auto" role="radiogroup" aria-label="Language">
          {(['de', 'en', 'fr', 'ar', 'es', 'pt'] as const).map((locale) => {
            const active = preferences.locale === locale;
            return (
              <button
                key={locale}
                onClick={() => {
                  setLocale(locale);
                  haptic('light');
                }}
                aria-pressed={active}
                className={`rounded-full border px-[18px] py-3 text-[13px] font-semibold uppercase tracking-[0.04em] ${
                  active
                    ? 'border-[var(--accent)] bg-[var(--accent-soft)] text-[var(--accent-light)]'
                    : 'border-[var(--app-border)] bg-[var(--app-surface)] text-[var(--app-text)]'
                }`}
              >
                {locale}
              </button>
            );
          })}
        </div>
        <motion.button
          whileTap={motionSafe.reduce ? undefined : { scale: 0.98 }}
          onClick={() => {
            completeOnboarding();
            haptic('success');
          }}
          className="flex items-center justify-center gap-2.5 rounded-[22px] px-[22px] py-[18px] text-base font-extrabold tracking-[-0.01em] text-[#0f172a] shadow-[0_16px_36px_var(--accent-glow)]"
          style={{
            background:
              'linear-gradient(135deg, var(--accent), var(--accent-light) 60%, #38bdf8)',
          }}
        >
          {t('start')}
          <ArrowRight size={20} />
        </motion.button>
      </div>
    </div>
  );
}
