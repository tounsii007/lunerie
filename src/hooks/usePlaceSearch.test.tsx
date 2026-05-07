import { act, waitFor } from '@testing-library/react';
import { describe, expect, it } from 'vitest';
import { usePlaceSearch } from '@/hooks/usePlaceSearch';
import { createWrapper, renderHook } from '@/test/test-utils';

describe('usePlaceSearch', () => {
  it('returns search results after debouncing', async () => {
    const { result } = renderHook(() => usePlaceSearch(), { wrapper: createWrapper() });

    act(() => {
      result.current.setSearchText('Morocco');
    });

    await waitFor(() => {
      expect(result.current.results.length).toBeGreaterThan(0);
    });
  });
});
