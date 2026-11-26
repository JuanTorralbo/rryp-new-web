import rawPosts from "./blog-posts.json";
import rawTranslations from "./blog-translations.json";
import { WP_ARTICLES, extractSlugFromUrl } from "./wp";
import type { Locale } from "../i18n/config";

export type PillarId = "private-clients" | "private-wealth" | "business-disputes" | "seo-audit";

export interface BlogPost {
  id: number;
  date: string;
  title: string;
  excerpt: string;
  url: string;
  slug: string;
  pillar: PillarId;
  category: string;
}

interface RawPost {
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

const ARTICLE_SLUGS = new Set(WP_ARTICLES.map((a) => a.slug));
const ALL_POSTS = rawPosts as RawPost[];
const TRANSLATIONS = rawTranslations as unknown as Record<string, Record<string, TranslatedEntry>>;

function toLocalPost(post: RawPost, locale: Locale, overrides?: Partial<Pick<BlogPost, "title" | "excerpt" | "category">>): BlogPost {
  const slug = extractSlugFromUrl(post.url);
  const localUrl = slug && ARTICLE_SLUGS.has(slug) ? `/${locale}/legal-intelligence/${slug}/` : post.url;
  return {
    ...post,
    slug,
    url: localUrl,
    ...(overrides || {}),
  };
}

/**
 * Devuelve exclusivamente articulos en el idioma solicitado con rutas locales nativas.
 * En /es/ muestra el archivo completo (429 articulos auditados).
 * En /en/, /de/, /pt/, /ru/ y /zh/ devuelve unicamente los articulos traducidos
 * y revisados en ese idioma, garantizando cero fugas de texto en espanol.
 */
export function getLocalizedPosts(locale: Locale, pillar?: PillarId): BlogPost[] {
  let list: BlogPost[];
  if (locale === "es") {
    list = ALL_POSTS.map((post) => toLocalPost(post, "es"));
  } else {
    const langMap = TRANSLATIONS[locale] || {};
    list = ALL_POSTS.filter((post) => Boolean(langMap[String(post.id)])).map((post) => {
      const tr = langMap[String(post.id)];
      return toLocalPost(post, locale, {
        title: tr.t,
        excerpt: tr.e,
        category: tr.c || getPillarLabel(post.pillar),
      });
    });
  }

  if (pillar) {
    return list.filter((p) => p.pillar === pillar);
  }
  return list;
}

const PILLAR_LABELS: Record<Locale, Record<"private-clients" | "private-wealth" | "business-disputes", string>> = {
  es: {
    "private-clients": "Clientes privados",
    "private-wealth": "Patrimonio",
    "business-disputes": "Empresa y litigios",
  },
  en: {
    "private-clients": "Private Clients",
    "private-wealth": "Private Wealth",
    "business-disputes": "Business Disputes",
  },
  de: {
    "private-clients": "Private Clients",
    "private-wealth": "Private Wealth",
    "business-disputes": "Business Disputes",
  },
  pt: {
    "private-clients": "Clientes privados",
    "private-wealth": "Património",
    "business-disputes": "Empresa e litígios",
  },
  ru: {
    "private-clients": "Частные клиенты",
    "private-wealth": "Частный капитал",
    "business-disputes": "Бизнес и споры",
  },
  zh: {
    "private-clients": "私人客户",
    "private-wealth": "私人财富",
    "business-disputes": "企业与争议",
  },
};

export function getPillarLabel(pillar: PillarId, lang: Locale = "en"): string {
  if (pillar === "private-clients" || pillar === "private-wealth" || pillar === "business-disputes") {
    return PILLAR_LABELS[lang]?.[pillar] ?? PILLAR_LABELS.en[pillar];
  }
  return "SEO 301 / 410";
}
