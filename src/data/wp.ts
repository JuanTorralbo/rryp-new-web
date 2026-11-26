import legalRaw from "./wp/legal-pages.json";
import casesRaw from "./wp/cases.json";
import specialtiesRaw from "./wp/specialties.json";
import articlesRaw from "./wp/articles.json";
import dictionaryRaw from "./wp/dictionary.json";

export interface TocItem {
  id: string;
  text: string;
}

export interface WpLegalPage {
  slug: string;
  wpSlug: string;
  title: string;
  date: string;
  lead: string;
  readingMin: number;
  toc: TocItem[];
  html: string;
}

export interface WpCaseStudy {
  slug: string;
  pillar: "private-clients" | "private-wealth" | "business-disputes" | "penal";
  pillarLabel: string;
  title: string;
  date: string;
  lead: string;
  readingMin: number;
  toc: TocItem[];
  html: string;
}

export interface WpSpecialty {
  slug: string;
  wpSlug: string;
  pillar: "private-clients" | "private-wealth" | "business-disputes" | "penal" | "malaga";
  pillarLabel: string;
  urgent: boolean;
  title: string;
  date: string;
  lead: string;
  readingMin: number;
  toc: TocItem[];
  html: string;
}

export interface WpArticle {
  slug: string;
  title: string;
  date: string;
  author: string;
  pillar: string;
  category: string;
  categories?: string[];
  excerpt: string;
  readingMin: number;
  toc: TocItem[];
  html: string;
}

export interface WpDictionaryTerm {
  slug: string;
  term: string;
  letter: string;
  title: string;
  date: string;
  author: string;
  pillar: string;
  excerpt: string;
  readingMin: number;
}

export const WP_LEGAL_PAGES = legalRaw as WpLegalPage[];
export const WP_CASES = casesRaw as WpCaseStudy[];
export const WP_SPECIALTIES = specialtiesRaw as WpSpecialty[];
export const WP_ARTICLES = articlesRaw as WpArticle[];
export const WP_DICTIONARY = dictionaryRaw as WpDictionaryTerm[];

export function getLegalPageBySlug(slug: string): WpLegalPage | undefined {
  return WP_LEGAL_PAGES.find((p) => p.slug === slug);
}

export function getCaseBySlug(slug: string): WpCaseStudy | undefined {
  return WP_CASES.find((c) => c.slug === slug);
}

export function getSpecialtyBySlug(slug: string): WpSpecialty | undefined {
  return WP_SPECIALTIES.find((s) => s.slug === slug);
}

export function getSpecialtiesByPillar(pillar: WpSpecialty["pillar"]): WpSpecialty[] {
  return WP_SPECIALTIES.filter((s) => s.pillar === pillar);
}

export function getArticleBySlug(slug: string): WpArticle | undefined {
  return WP_ARTICLES.find((a) => a.slug === slug);
}

export function getArticlesByAuthor(author: string, limit = 12): WpArticle[] {
  return WP_ARTICLES.filter((a) => a.author === author).slice(0, limit);
}

export function getRelatedCases(currentSlug: string, pillar: string, limit = 3): WpCaseStudy[] {
  const mappedPillar = pillar === "malaga" ? "private-clients" : pillar;
  const same = WP_CASES.filter((c) => c.slug !== currentSlug && c.pillar === mappedPillar);
  const others = WP_CASES.filter((c) => c.slug !== currentSlug && c.pillar !== mappedPillar);
  return [...same, ...others].slice(0, limit);
}

export function getRelatedArticles(currentSlug: string, pillar: string, limit = 3): WpArticle[] {
  const mappedPillar = pillar === "malaga" ? "private-clients" : pillar;
  const same = WP_ARTICLES.filter((a) => a.slug !== currentSlug && a.pillar === mappedPillar);
  return same.slice(0, limit);
}

export function extractSlugFromUrl(url: string): string {
  const m = String(url || "").match(/\/([^/?#]+)\/?(?:[?#].*)?$/);
  return m ? m[1] : "";
}
