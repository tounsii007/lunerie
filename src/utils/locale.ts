import { DEFAULT_LOCALE, RTL_LOCALES, type LocaleCode } from '@/constants/app';

export function normalizeLocale(input: string | undefined): LocaleCode {
  if (!input) {
    return DEFAULT_LOCALE;
  }

  const primary = input.toLowerCase().split('-')[0];
  const supported = ['de', 'en', 'fr', 'ar', 'es', 'pt'] as const;
  const match = supported.find((locale) => locale === primary);
  return match ?? DEFAULT_LOCALE;
}

export function isRtlLocale(locale: LocaleCode): boolean {
  return locale === 'ar';
}
