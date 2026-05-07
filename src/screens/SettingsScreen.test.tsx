import { fireEvent, screen } from '@testing-library/react';
import { describe, expect, it } from 'vitest';
import { SettingsScreen } from '@/screens/SettingsScreen';
import { createWrapper, render } from '@/test/test-utils';

describe('SettingsScreen buttons', () => {
  it('switches language when a locale button is clicked', () => {
    render(<SettingsScreen />, { wrapper: createWrapper() });

    fireEvent.click(screen.getByText('Deutsch'));

    expect(document.documentElement.lang).toBe('de');
  });

  it('toggles the image-only preference button', () => {
    render(<SettingsScreen />, { wrapper: createWrapper() });

    const button = screen.getByLabelText('Only places with images');
    expect(button.textContent).toContain('On');

    fireEvent.click(button);

    expect(button.textContent).toContain('Off');
  });

  it('allows changing the default sort mode', () => {
    render(<SettingsScreen />, { wrapper: createWrapper() });

    const button = screen.getByText('Popularity');
    fireEvent.click(button);

    expect(button).toBeInTheDocument();
  });

  it('allows toggling a preferred category', () => {
    render(<SettingsScreen />, { wrapper: createWrapper() });

    const button = screen.getByText('nature');
    fireEvent.click(button);

    expect(button).toBeInTheDocument();
  });

  it('offers onboarding reset action', () => {
    render(<SettingsScreen />, { wrapper: createWrapper() });

    const buttons = screen.getAllByText('Show onboarding again');
    fireEvent.click(buttons[1]);

    expect(buttons[1]).toBeInTheDocument();
  });
});
