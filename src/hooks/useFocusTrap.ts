import { useEffect, useRef } from 'react';

/**
 * Trap focus inside a container while it is open. Restores focus to the
 * previously-focused element on close, and closes on Escape.
 *
 * Used by modal/overlay surfaces (PlaceDetailsScreen via OverlayFrame).
 *
 * Why this lives in a hook instead of pulling in `focus-trap-react`:
 *   - 30 lines vs a 15 KB dependency
 *   - Co-locates the Escape handler with focus management
 *   - Auto-skips when `enabled` is false (cheap to use)
 */
const FOCUSABLE_SELECTOR = [
  'a[href]',
  'button:not([disabled])',
  'textarea:not([disabled])',
  'input:not([disabled]):not([type="hidden"])',
  'select:not([disabled])',
  '[tabindex]:not([tabindex="-1"])',
].join(',');

export function useFocusTrap<T extends HTMLElement>(enabled: boolean, onEscape?: () => void) {
  const ref = useRef<T | null>(null);

  useEffect(() => {
    if (!enabled || typeof document === 'undefined') return;
    const container = ref.current;
    if (!container) return;

    const previouslyFocused = document.activeElement as HTMLElement | null;

    // Move focus inside on mount.
    const focusables = () =>
      Array.from(container.querySelectorAll<HTMLElement>(FOCUSABLE_SELECTOR)).filter(
        (el) => !el.hasAttribute('aria-hidden') && el.offsetParent !== null,
      );

    const initial = focusables()[0] ?? container;
    initial.focus({ preventScroll: true });

    const handleKey = (event: KeyboardEvent) => {
      if (event.key === 'Escape' && onEscape) {
        event.stopPropagation();
        onEscape();
        return;
      }
      if (event.key !== 'Tab') return;

      const focusList = focusables();
      if (focusList.length === 0) {
        event.preventDefault();
        container.focus();
        return;
      }
      const first = focusList[0];
      const last = focusList[focusList.length - 1];
      const active = document.activeElement as HTMLElement | null;

      if (event.shiftKey) {
        if (active === first || !container.contains(active)) {
          event.preventDefault();
          last.focus();
        }
      } else if (active === last) {
        event.preventDefault();
        first.focus();
      }
    };

    document.addEventListener('keydown', handleKey);
    return () => {
      document.removeEventListener('keydown', handleKey);
      // Restore focus to whatever opened us, if it's still in the DOM.
      if (previouslyFocused && document.contains(previouslyFocused)) {
        previouslyFocused.focus({ preventScroll: true });
      }
    };
  }, [enabled, onEscape]);

  return ref;
}
