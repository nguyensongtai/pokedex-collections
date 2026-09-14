/** Public API of the i18n layer. */
export { HtmlLang } from './HtmlLang';
export { LanguageToggle } from './LanguageToggle';
export {
  DEFAULT_LANGUAGE,
  DICTIONARIES,
  LANGUAGES,
  LANGUAGE_LABELS,
} from './dictionary';
export type { Dictionary, Language } from './dictionary';
export {
  LANGUAGE_STORAGE_KEY,
  useLanguage,
  useLanguageHydrated,
  useLanguageStore,
  useTranslation,
} from './store';
