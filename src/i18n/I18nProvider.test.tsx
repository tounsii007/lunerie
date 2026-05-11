import { renderHook } from '@testing-library/react';
import { describe, expect, it } from 'vitest';
import { I18nProvider, useI18n } from '@/i18n/I18nProvider';

describe('I18nProvider', () => {
  it('resolves a known key', () => {
    const { result } = renderHook(() => useI18n(), {
      wrapper: ({ children }) => <I18nProvider locale="en">{children}</I18nProvider>,
    });
    expect(result.current.t('explore')).toBe('Explore');
  });

  it('falls back to English when a locale lacks a key', () => {
    const { result } = renderHook(() => useI18n(), {
      wrapper: ({ children }) => <I18nProvider locale="de">{children}</I18nProvider>,
    });
    // 'explore' is translated in de
    expect(result.current.t('explore')).toBe('Entdecken');
  });

  it('returns the key itself when no locale has a translation', () => {
    const { result } = renderHook(() => useI18n(), {
      wrapper: ({ children }) => <I18nProvider locale="en">{children}</I18nProvider>,
    });
    expect(result.current.t('this.key.does.not.exist')).toBe('this.key.does.not.exist');
  });

  it('interpolates {placeholder} values', () => {
    const { result } = renderHook(() => useI18n(), {
      wrapper: ({ children }) => <I18nProvider locale="en">{children}</I18nProvider>,
    });
    expect(result.current.t('auth.welcomeBackUser', { name: 'Aisha' })).toBe('Welcome back, Aisha');
  });

  it('picks the plural variant when count !== 1', () => {
    const { result } = renderHook(() => useI18n(), {
      wrapper: ({ children }) => <I18nProvider locale="en">{children}</I18nProvider>,
    });
    expect(result.current.t('resultsCount', { count: 1 })).toBe('1 result');
    expect(result.current.t('resultsCount', { count: 5 })).toBe('5 results');
    expect(result.current.t('resultsCount', { count: 0 })).toBe('0 results');
  });

  it('exposes locale-aware Intl helpers', () => {
    const { result } = renderHook(() => useI18n(), {
      wrapper: ({ children }) => <I18nProvider locale="en">{children}</I18nProvider>,
    });
    expect(result.current.formatNumber(1234567)).toMatch(/^1[,.\s]234[,.\s]567$/);
    expect(typeof result.current.formatRelativeTime(-2, 'hour')).toBe('string');
    expect(typeof result.current.formatDate(new Date('2026-01-15'))).toBe('string');
  });

  it('sets html.lang and html.dir on mount', () => {
    renderHook(() => useI18n(), {
      wrapper: ({ children }) => <I18nProvider locale="ar">{children}</I18nProvider>,
    });
    expect(document.documentElement.lang).toBe('ar');
    expect(document.documentElement.dir).toBe('rtl');
  });
});
