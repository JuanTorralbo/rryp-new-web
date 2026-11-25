import rawPosts from "./blog-posts.json";
import rawTranslations from "./blog-translations.json";
import type { Locale } from "../i18n/config";

export type PillarId = "private-clients" | "private-wealth" | "business-disputes" | "seo-audit";

export interface BlogPost {
  id: number;
  date: string;
  title: string;
  excerpt: string;
  url: string;
  pillar: PillarId;
  category: string;
}

interface TranslatedEntry {
  t: string;
  e: string;
  c?: string;
}

const ALL_POSTS = rawPosts as BlogPost[];
const TRANSLATIONS = rawTranslations as unknown as Record<string, Record<string, TranslatedEntry>>;

/**
 * Devuelve exclusivamente articulos en el idioma solicitado.
 * En /es/ muestra el archivo completo (429 articulos auditados).
 * En /en/, /de/, /pt/, /ru/ y /zh/ devuelve unicamente los articulos traducidos
 * y revisados en ese idioma, garantizando cero fugas de texto en espanol.
 */
export function getLocalizedPosts(locale: Locale, pillar?: PillarId): BlogPost[] {
  let list: BlogPost[];
  if (locale === "es") {
    list = ALL_POSTS;
  } else {
    const langMap = TRANSLATIONS[locale] || {};
    list = ALL_POSTS.filter((post) => Boolean(langMap[String(post.id)])).map((post) => {
      const tr = langMap[String(post.id)];
      return {
        ...post,
        title: tr.t,
        excerpt: tr.e,
        category: tr.c || getPillarLabel(post.pillar),
      };
    });
  }

  if (pillar) {
    return list.filter((p) => p.pillar === pillar);
  }
  return list;
}

export function getPillarLabel(pillar: PillarId): string {
  switch (pillar) {
    case "private-clients":
      return "Private Clients";
    case "private-wealth":
      return "Private Wealth";
    case "business-disputes":
      return "Business Disputes";
    default:
      return "SEO 301 / 410";
  }
}
