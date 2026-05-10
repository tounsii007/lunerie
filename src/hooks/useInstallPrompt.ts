import { useEffect, useState } from 'react';

/**
 * Captures the {@code beforeinstallprompt} event fired by Chromium-based
 * browsers when the PWA install criteria are met, and exposes a callable
 * {@code prompt()} that triggers the OS-level install dialog.
 *
 * Returns:
 *  - {@code canPrompt}: whether the browser is offering install
 *  - {@code installed}: whether the SPA is already running standalone
 *      (so the UI can suppress the install affordance)
 *  - {@code prompt()}: resolves with `'accepted'`, `'dismissed'`, or
 *      `'unavailable'` if the event was never fired
 */
type InstallChoice = 'accepted' | 'dismissed' | 'unavailable';

interface BeforeInstallPromptEvent extends Event {
  readonly platforms: string[];
  readonly userChoice: Promise<{ outcome: 'accepted' | 'dismissed'; platform: string }>;
  prompt: () => Promise<void>;
}

function detectInstalled(): boolean {
  if (typeof window === 'undefined') return false;
  if (window.matchMedia?.('(display-mode: standalone)').matches) return true;
  // iOS Safari pre-PWA Standard
  // @ts-expect-error — non-standard, but stable on iOS
  if (window.navigator?.standalone === true) return true;
  return false;
}

export function useInstallPrompt() {
  const [event, setEvent] = useState<BeforeInstallPromptEvent | null>(null);
  const [installed, setInstalled] = useState<boolean>(detectInstalled);

  useEffect(() => {
    const onBeforeInstall = (raw: Event) => {
      raw.preventDefault();
      setEvent(raw as BeforeInstallPromptEvent);
    };
    const onInstalled = () => {
      setInstalled(true);
      setEvent(null);
    };
    window.addEventListener('beforeinstallprompt', onBeforeInstall);
    window.addEventListener('appinstalled', onInstalled);
    return () => {
      window.removeEventListener('beforeinstallprompt', onBeforeInstall);
      window.removeEventListener('appinstalled', onInstalled);
    };
  }, []);

  const prompt = async (): Promise<InstallChoice> => {
    if (!event) return 'unavailable';
    await event.prompt();
    const choice = await event.userChoice;
    setEvent(null);
    return choice.outcome;
  };

  return {
    canPrompt: !!event && !installed,
    installed,
    prompt,
  };
}
