export const LOCALES = ["es", "en", "de", "pt", "ru", "zh"] as const;
export type Locale = (typeof LOCALES)[number];

export const DEFAULT_LOCALE: Locale = "en";

export const LOCALE_LABELS: Record<Locale, { code: string; native: string; og: string }> = {
  es: { code: "ES", native: "Español", og: "es_ES" },
  en: { code: "EN", native: "English", og: "en_GB" },
  de: { code: "DE", native: "Deutsch", og: "de_DE" },
  pt: { code: "PT", native: "Português", og: "pt_PT" },
  ru: { code: "RU", native: "Русский", og: "ru_RU" },
  zh: { code: "ZH", native: "中文", og: "zh_CN" },
};

export function isLocale(value: string | undefined): value is Locale {
  return Boolean(value && (LOCALES as readonly string[]).includes(value));
}

export function localizedPath(locale: Locale, slug = ""): string {
  const clean = slug.replace(/^\/+|\/+$/g, "");
  return clean ? `/${locale}/${clean}/` : `/${locale}/`;
}
