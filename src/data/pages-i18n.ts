import es from "./pages-i18n/es.json";
import en from "./pages-i18n/en.json";
import de from "./pages-i18n/de.json";
import pt from "./pages-i18n/pt.json";
import ru from "./pages-i18n/ru.json";
import zh from "./pages-i18n/zh.json";
import type { Locale } from "../i18n";

export type PageContent = typeof es;

const MAP: Record<Locale, PageContent> = {
  es,
  en: en as PageContent,
  de: de as PageContent,
  pt: pt as PageContent,
  ru: ru as PageContent,
  zh: zh as PageContent,
};

export function getPageContent(lang: Locale): PageContent {
  return MAP[lang] ?? es;
}
