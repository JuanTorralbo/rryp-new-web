import { DEFAULT_LOCALE, isLocale, type Locale } from "./config";
import es from "./locales/es.json";
import en from "./locales/en.json";
import de from "./locales/de.json";
import pt from "./locales/pt.json";
import ru from "./locales/ru.json";
import zh from "./locales/zh.json";

/**
 * Contrato estricto de traduccion:
 * TypeScript impide compilar si falta una sola clave en cualquiera de los 6 idiomas.
 */
export type SiteDictionary = typeof es;

const DICTIONARIES: Record<Locale, SiteDictionary> = {
  es,
  en,
  de,
  pt,
  ru,
  zh,
};

export function getDictionary(locale: string | undefined): SiteDictionary {
  if (isLocale(locale)) {
    return DICTIONARIES[locale];
  }
  return DICTIONARIES[DEFAULT_LOCALE];
}

export { LOCALES, DEFAULT_LOCALE, LOCALE_LABELS, isLocale, localizedPath, type Locale } from "./config";
