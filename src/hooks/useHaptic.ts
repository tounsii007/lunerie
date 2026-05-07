import { useCallback } from 'react';
import { usePreferences } from '@/state/preferences-context';

type HapticPattern = 'light' | 'medium' | 'success' | 'warning';

const PATTERNS: Record<HapticPattern, number | number[]> = {
  light: 10,
  medium: 20,
  success: [10, 30, 10],
  warning: [30, 50, 30],
};

export function useHaptic() {
  const { preferences } = usePreferences();

  return useCallback(
    (pattern: HapticPattern = 'light') => {
      if (!preferences.hapticFeedback) return;
      if (typeof navigator === 'undefined' || !navigator.vibrate) return;
      try {
        navigator.vibrate(PATTERNS[pattern]);
      } catch {
        // vibrate not supported
      }
    },
    [preferences.hapticFeedback],
  );
}
