import type { ReactElement } from 'react';
import { render, screen } from '@testing-library/react';
import { describe, expect, it } from 'vitest';
import { ErrorBoundary } from '@/components/ErrorBoundary';

function Crasher(): ReactElement {
  throw new Error('boom');
}

describe('ErrorBoundary', () => {
  it('renders fallback UI', () => {
    render(
      <ErrorBoundary>
        <Crasher />
      </ErrorBoundary>,
    );

    expect(screen.getByText(/clean refresh/i)).toBeInTheDocument();
  });
});
