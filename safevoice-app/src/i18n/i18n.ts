// src/i18n/i18n.ts
// Lightweight i18n module using Expo Localization.
// Usage: import { t } from '../i18n/i18n';  then  t('home.title')

import * as ExpoLocalization from 'expo-localization';

import en from './en/translation.json';
import si from './si/translation.json';

type TranslationDict = typeof en;

const translations: Record<string, TranslationDict> = { en, si };

/**
 * Returns the best available locale key ('en' | 'si').
 * expo-localization returns locales like 'si-LK' or 'en-US'.
 */
function getLocaleKey(): string {
  const locales = ExpoLocalization.getLocales?.() ?? [];
  const primaryCode = locales[0]?.languageCode ?? 'en';
  return translations[primaryCode] ? primaryCode : 'en';
}

const currentLocale = getLocaleKey();
const dict: TranslationDict = translations[currentLocale] ?? en;

/**
 * Translate a dot-notation key, optionally substituting {{variable}} placeholders.
 *
 * @example
 *   t('home.title')              // "SafeVoice"
 *   t('topic.views', { count: 42 }) // "42 views"
 */
export function t(key: string, vars?: Record<string, string | number>): string {
  const parts = key.split('.');
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  let value: any = dict;
  for (const part of parts) {
    if (value == null || typeof value !== 'object') break;
    value = value[part];
  }

  if (typeof value !== 'string') {
    // Fallback to key itself if translation is missing
    return key;
  }

  if (vars) {
    return value.replace(/\{\{(\w+)\}\}/g, (_, k) => String(vars[k] ?? `{{${k}}}`));
  }
  return value;
}

export { currentLocale };
