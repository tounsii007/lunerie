import { useMemo } from 'react';
import { useReducedMotion } from '@/hooks/useReducedMotion';

/**
 * Returns Framer-Motion-compatible animation props that collapse to zero
 * duration / zero displacement when the user has requested reduced motion.
 *
 * Usage:
 *   const motionSafe = useMotionSafe();
 *   <motion.div {...motionSafe.fadeUp(12)}>
 *
 * Keeps the call sites declarative and ensures every motion.* in the app
 * honors `useReducedMotion()` automatically — instead of each screen having
 * to remember to wire it up.
 */
export function useMotionSafe() {
  const reduce = useReducedMotion();

  return useMemo(
    () => ({
      reduce,

      /** Fade-in with optional Y offset; collapses to instant when reduced. */
      fadeUp(offset = 12, duration = 0.3) {
        return {
          initial: reduce ? { opacity: 1, y: 0 } : { opacity: 0, y: offset },
          animate: { opacity: 1, y: 0 },
          transition: { duration: reduce ? 0 : duration, ease: 'easeOut' as const },
        };
      },

      /** Stagger-children variant pair. Stagger collapses to 0 when reduced. */
      stagger(stagger = 0.05) {
        return {
          variants: {
            hidden: {},
            show: { transition: { staggerChildren: reduce ? 0 : stagger } },
          },
          initial: 'hidden' as const,
          animate: 'show' as const,
        };
      },

      /** Single staggered child. Pair with `stagger()` on the parent. */
      staggerChild(offset = 12, duration = 0.3) {
        return {
          variants: {
            hidden: reduce ? { opacity: 1, y: 0 } : { opacity: 0, y: offset },
            show: { opacity: 1, y: 0 },
          },
          transition: { duration: reduce ? 0 : duration, ease: 'easeOut' as const },
        };
      },
    }),
    [reduce],
  );
}
