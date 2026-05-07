import { useEffect, useState } from 'react';
import { usePreferences } from '@/state/preferences-context';

/**
 * Returns true when motion should be reduced.
 * Combines the user's stored preference with the OS-level prefers-reduced-motion media query.
 */
export function useReducedMotion(): boolean {
  const { preferences } = usePreferences();
  const [systemReduced, setSystemReduced] = useState(false);

  useEffect(() => {
    if (typeof window === 'undefined' || !window.matchMedia) return;
    const mq = window.matchMedia('(prefers-reduced-motion: reduce)');
    setSystemReduced(mq.matches);
    const handler = (event: MediaQueryListEvent) => setSystemReduced(event.matches);
    mq.addEventListener('change', handler);
    return () => mq.removeEventListener('change', handler);
  }, []);

  return preferences.reducedMotion || systemReduced;
}
