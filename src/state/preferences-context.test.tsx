import { act } from '@testing-library/react';
import { describe, expect, it } from 'vitest';
import { createWrapper, renderHook } from '@/test/test-utils';
import { usePreferences } from '@/state/preferences-context';

describe('preferences persistence', () => {
  it('updates locale and theme', () => {
    const { result } = renderHook(() => usePreferences(), { wrapper: createWrapper() });

    act(() => {
      result.current.setLocale('ar');
      result.current.setTheme('light');
    });

    expect(result.current.preferences.locale).toBe('ar');
    expect(result.current.preferences.theme).toBe('light');
  });
});
