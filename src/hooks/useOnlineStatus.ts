import { useEffect, useState } from 'react';

/**
 * Tracks `navigator.onLine` with `online` / `offline` event listeners.
 * Defaults to {@code true} during SSR / when navigator is unavailable so the
 * UI never renders a misleading "offline" banner before hydration.
 */
export function useOnlineStatus(): boolean {
  const [online, setOnline] = useState(() => {
    if (typeof navigator === 'undefined') return true;
    return navigator.onLine;
  });

  useEffect(() => {
    const sync = () => setOnline(typeof navigator === 'undefined' ? true : navigator.onLine);
    const handleOnline = () => setOnline(true);
    const handleOffline = () => setOnline(false);
    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);
    // Re-sync when the tab regains visibility, in case events were missed in the background.
    document.addEventListener('visibilitychange', sync);
    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
      document.removeEventListener('visibilitychange', sync);
    };
  }, []);

  return online;
}
