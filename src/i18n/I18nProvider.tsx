import { createContext, useContext, useEffect, useMemo } from 'react';
import { DEFAULT_LOCALE, type LocaleCode } from '@/constants/app';
import { messages } from '@/i18n/messages';
import { isRtlLocale } from '@/utils/locale';

interface I18nContextValue {
  locale: LocaleCode;
  rtl: boolean;
  t: (key: string) => string;
}

const I18nContext = createContext<I18nContextValue | null>(null);

interface I18nProviderProps {
  children: React.ReactNode;
  locale: LocaleCode;
}

export function I18nProvider({ children, locale }: I18nProviderProps) {
  const rtl = isRtlLocale(locale);

  useEffect(() => {
    document.documentElement.lang = locale;
    document.documentElement.dir = rtl ? 'rtl' : 'ltr';
  }, [locale, rtl]);

  const value = useMemo<I18nContextValue>(
    () => ({
      locale,
      rtl,
      t: (key) => messages[locale][key] ?? messages[DEFAULT_LOCALE][key] ?? key,
    }),
    [locale, rtl],
  );

  return <I18nContext.Provider value={value}>{children}</I18nContext.Provider>;
}

export function useI18n(): I18nContextValue {
  const context = useContext(I18nContext);
  if (!context) {
    throw new Error('useI18n must be used within I18nProvider');
  }

  return context;
}
