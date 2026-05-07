import { fireEvent, screen, waitFor } from '@testing-library/react';
import { describe, expect, it, vi } from 'vitest';
import { mockPlaces } from '@/data/mockPlaces';
import { PlaceDetailsScreen } from '@/screens/PlaceDetailsScreen';
import { createWrapper, render } from '@/test/test-utils';

describe('PlaceDetailsScreen buttons', () => {
  it('toggles save state when the save button is clicked', () => {
    render(<PlaceDetailsScreen place={mockPlaces[0]} />, { wrapper: createWrapper() });

    fireEvent.click(screen.getByRole('button', { name: 'Save' }));

    expect(screen.getByRole('button', { name: 'Saved' })).toBeInTheDocument();
  });

  it('uses native share when available', async () => {
    const shareMock = vi.fn().mockResolvedValue(undefined);
    Object.defineProperty(navigator, 'share', {
      configurable: true,
      value: shareMock,
    });

    render(<PlaceDetailsScreen place={mockPlaces[0]} />, { wrapper: createWrapper() });
    fireEvent.click(screen.getByRole('button', { name: 'Share' }));

    await waitFor(() => {
      expect(shareMock).toHaveBeenCalled();
    });
  });

  it('falls back to clipboard when native share is unavailable', async () => {
    Object.defineProperty(navigator, 'share', {
      configurable: true,
      value: undefined,
    });

    const writeTextMock = vi.fn().mockResolvedValue(undefined);
    Object.defineProperty(navigator, 'clipboard', {
      configurable: true,
      value: { writeText: writeTextMock },
    });

    render(<PlaceDetailsScreen place={mockPlaces[0]} />, { wrapper: createWrapper() });
    fireEvent.click(screen.getByRole('button', { name: 'Share' }));

    await waitFor(() => {
      expect(writeTextMock).toHaveBeenCalled();
      expect(screen.getByText('Link copied')).toBeInTheDocument();
    });
  });
});
