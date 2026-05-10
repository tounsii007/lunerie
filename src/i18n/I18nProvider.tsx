import { createContext, useContext, useEffect, useMemo } from 'react';
import { DEFAULT_LOCALE, type LocaleCode } from '@/constants/app';
import { messages } from '@/i18n/messages';
import { isRtlLocale } from '@/utils/locale';

type Vars = Record<string, string | number>;

interface I18nContextValue {
  locale: LocaleCode;
  rtl: boolean;
  /**
   * Resolve a translation key. Supports {placeholder} interpolation:
   *   t('resultsCount', { count: 12 })
   *
   * For pluralization, pass a `count` and provide a `<key>__plural` variant —
   * any non-1 count will pick the plural form. ICU MessageFormat is
   * intentionally avoided to keep the bundle tiny.
   */
  t: (key: string, vars?: Vars) => string;
  /** Locale-aware number formatting. Uses Intl.NumberFormat under the hood. */
  formatNumber: (value: number, options?: Intl.NumberFormatOptions) => string;
  /** Locale-aware relative time. Negative values = past, positive = future. */
  formatRelativeTime: (
    value: number,
    unit: Intl.RelativeTimeFormatUnit,
    options?: Intl.RelativeTimeFormatOptions,
  ) => string;
  /** Locale-aware date formatting. */
  formatDate: (value: Date | number | string, options?: Intl.DateTimeFormatOptions) => string;
}

const I18nContext = createContext<I18nContextValue | null>(null);

interface I18nProviderProps {
  children: React.ReactNode;
  locale: LocaleCode;
}

const PLACEHOLDER = /\{(\w+)\}/g;

function format(template: string, vars?: Vars): string {
  if (!vars) return template;
  return template.replace(PLACEHOLDER, (_, key) => {
    const value = vars[key];
    return value === undefined || value === null ? `{${key}}` : String(value);
  });
}

function selectKey(base: string, vars?: Vars): string {
  if (!vars || typeof vars.count !== 'number') return base;
  return vars.count === 1 ? base : `${base}__plural`;
}

export function I18nProvider({ children, locale }: I18nProviderProps) {
  const rtl = isRtlLocale(locale);

  useEffect(() => {
    document.documentElement.lang = locale;
    document.documentElement.dir = rtl ? 'rtl' : 'ltr';
  }, [locale, rtl]);

  const value = useMemo<I18nContextValue>(() => {
    const numberFormatter = new Intl.NumberFormat(locale);
    const relativeFormatter = new Intl.RelativeTimeFormat(locale, { numeric: 'auto' });
    const dateFormatter = new Intl.DateTimeFormat(locale, { dateStyle: 'medium' });

    const t = (key: string, vars?: Vars): string => {
      const tryKey = selectKey(key, vars);
      const localized = messages[locale]?.[tryKey] ?? messages[locale]?.[key];
      const fallback = messages[DEFAULT_LOCALE]?.[tryKey] ?? messages[DEFAULT_LOCALE]?.[key] ?? key;
      return format(localized ?? fallback, vars);
    };

    return {
      locale,
      rtl,
      t,
      formatNumber: (value, options) =>
        options ? new Intl.NumberFormat(locale, options).format(value) : numberFormatter.format(value),
      formatRelativeTime: (value, unit, options) =>
        options
          ? new Intl.RelativeTimeFormat(locale, { numeric: 'auto', ...options }).format(value, unit)
          : relativeFormatter.format(value, unit),
      formatDate: (value, options) => {
        const date = value instanceof Date ? value : new Date(value);
        return options
          ? new Intl.DateTimeFormat(locale, options).format(date)
          : dateFormatter.format(date);
      },
    };
  }, [locale, rtl]);

  return <I18nContext.Provider value={value}>{children}</I18nContext.Provider>;
}

export function useI18n(): I18nContextValue {
  const context = useContext(I18nContext);
  if (!context) {
    throw new Error('useI18n must be used within I18nProvider');
  }

  return context;
}
