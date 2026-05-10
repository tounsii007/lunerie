import { fireEvent, render, screen } from '@testing-library/react';
import { describe, expect, it, vi } from 'vitest';
import { OverlayFrame } from '@/components/AppShell';
import { I18nProvider } from '@/i18n/I18nProvider';

function wrap(ui: React.ReactNode) {
  return render(<I18nProvider locale="en">{ui}</I18nProvider>);
}

describe('OverlayFrame', () => {
  it('renders with role=dialog, aria-modal=true and aria-labelledby pointing at the title', () => {
    wrap(
      <OverlayFrame title="Test title" onClose={() => {}}>
        <p>Body</p>
      </OverlayFrame>,
    );
    const dialog = screen.getByRole('dialog');
    expect(dialog.getAttribute('aria-modal')).toBe('true');
    const labelId = dialog.getAttribute('aria-labelledby');
    expect(labelId).toBeTruthy();
    expect(document.getElementById(labelId!)?.textContent).toBe('Test title');
  });

  it('calls onClose when Escape is pressed', () => {
    const onClose = vi.fn();
    wrap(
      <OverlayFrame title="x" onClose={onClose}>
        <p>Body</p>
      </OverlayFrame>,
    );
    fireEvent.keyDown(document, { key: 'Escape' });
    expect(onClose).toHaveBeenCalledTimes(1);
  });

  it('locks body scroll while mounted and restores on unmount', () => {
    document.body.style.overflow = 'auto';
    const { unmount } = wrap(
      <OverlayFrame title="x" onClose={() => {}}>
        <p>Body</p>
      </OverlayFrame>,
    );
    expect(document.body.style.overflow).toBe('hidden');
    unmount();
    expect(document.body.style.overflow).toBe('auto');
  });
});
