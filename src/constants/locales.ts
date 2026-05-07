import type { LocaleCode } from '@/constants/app';

export const localeOptions: Array<{ code: LocaleCode; flag: string; label: string; nativeLabel: string }> = [
  { code: 'de', flag: 'de', label: 'German', nativeLabel: 'Deutsch' },
  { code: 'en', flag: 'gb', label: 'English', nativeLabel: 'English' },
  { code: 'fr', flag: 'fr', label: 'French', nativeLabel: 'Francais' },
  { code: 'ar', flag: 'sa', label: 'Arabic', nativeLabel: 'العربية' },
  { code: 'es', flag: 'es', label: 'Spanish', nativeLabel: 'Espanol' },
  { code: 'pt', flag: 'br', label: 'Portuguese', nativeLabel: 'Portugues' },
];
