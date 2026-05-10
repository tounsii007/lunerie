import { act, renderHook } from '@testing-library/react';
import { describe, expect, it, vi } from 'vitest';
import { useInstallPrompt } from '@/hooks/useInstallPrompt';

interface FakeBeforeInstallEvent extends Event {
  platforms: string[];
  userChoice: Promise<{ outcome: 'accepted' | 'dismissed'; platform: string }>;
  prompt: () => Promise<void>;
}

function fireBeforeInstall(outcome: 'accepted' | 'dismissed' = 'accepted') {
  const event = new Event('beforeinstallprompt') as FakeBeforeInstallEvent;
  event.platforms = ['web'];
  event.userChoice = Promise.resolve({ outcome, platform: 'web' });
  event.prompt = vi.fn(() => Promise.resolve());
  window.dispatchEvent(event);
  return event;
}

describe('useInstallPrompt', () => {
  it('starts with canPrompt=false until the browser fires the event', () => {
    const { result } = renderHook(() => useInstallPrompt());
    expect(result.current.canPrompt).toBe(false);
  });

  it('flips canPrompt to true once beforeinstallprompt fires', () => {
    const { result } = renderHook(() => useInstallPrompt());
    act(() => {
      fireBeforeInstall();
    });
    expect(result.current.canPrompt).toBe(true);
  });

  it('returns "accepted" / "dismissed" from prompt() based on userChoice', async () => {
    const { result } = renderHook(() => useInstallPrompt());
    act(() => {
      fireBeforeInstall('accepted');
    });

    let outcome: string | undefined;
    await act(async () => {
      outcome = await result.current.prompt();
    });
    expect(outcome).toBe('accepted');
    // Event consumed, so canPrompt resets
    expect(result.current.canPrompt).toBe(false);
  });

  it('returns "unavailable" when prompt() is called without a captured event', async () => {
    const { result } = renderHook(() => useInstallPrompt());
    let outcome: string | undefined;
    await act(async () => {
      outcome = await result.current.prompt();
    });
    expect(outcome).toBe('unavailable');
  });

  it('flips installed=true on the appinstalled event and clears prompt', () => {
    const { result } = renderHook(() => useInstallPrompt());
    act(() => {
      fireBeforeInstall();
    });
    expect(result.current.canPrompt).toBe(true);
    act(() => {
      window.dispatchEvent(new Event('appinstalled'));
    });
    expect(result.current.installed).toBe(true);
    expect(result.current.canPrompt).toBe(false);
  });
});
