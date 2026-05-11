import { motion } from 'framer-motion';
import { Sparkles } from 'lucide-react';
import { APP_NAME, APP_TAGLINE } from '@/constants/app';
import { useReducedMotion } from '@/hooks/useReducedMotion';

export function SplashScreen() {
  const reduce = useReducedMotion();

  return (
    <div className="grid min-h-[100dvh] place-items-center p-6" role="status" aria-live="polite">
      <motion.div
        initial={reduce ? { opacity: 1, scale: 1 } : { opacity: 0, scale: 0.92 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: reduce ? 0 : 0.6, ease: 'easeOut' }}
        className="w-full max-w-[420px] text-center"
      >
        <motion.div
          animate={reduce ? { rotate: 0 } : { rotate: [0, 10, 0, -10, 0] }}
          transition={reduce ? {} : { duration: 4, repeat: Infinity, ease: 'easeInOut' }}
          className="mx-auto mb-6 grid h-[124px] w-[124px] place-items-center rounded-[36px] shadow-[0_24px_60px_var(--accent-glow)]"
          style={{
            background:
              'linear-gradient(135deg, var(--accent), var(--accent-light) 60%, #38bdf8)',
          }}
          aria-hidden="true"
        >
          <Sparkles size={52} color="#0f172a" />
        </motion.div>
        <p className="mb-3 text-xs font-bold uppercase tracking-[0.26em] text-[var(--accent-light)]">
          Global hidden places
        </p>
        <h1 className="mb-3 font-display text-[52px] tracking-[-0.02em]">{APP_NAME}</h1>
        <p className="text-[15px] leading-[1.6] text-white/[0.84]">{APP_TAGLINE}</p>
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: reduce ? 0 : 0.4 }}
          className="mt-8 flex justify-center gap-1.5"
          aria-hidden="true"
        >
          {[0, 1, 2].map((index) => (
            <motion.span
              key={index}
              animate={
                reduce ? { scale: 1, opacity: 1 } : { scale: [1, 1.4, 1], opacity: [0.4, 1, 0.4] }
              }
              transition={
                reduce ? {} : { duration: 1.2, repeat: Infinity, delay: index * 0.18 }
              }
              className="h-2 w-2 rounded-full bg-[var(--accent)]"
            />
          ))}
        </motion.div>
      </motion.div>
    </div>
  );
}
