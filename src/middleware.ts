import { defineMiddleware } from "astro:middleware";
import { DEFAULT_LOCALE, isLocale, LOCALES, type Locale } from "./i18n/config";

const BOT_PATTERN =
  /bot|crawl|spider|slurp|mediapartners|facebookexternalhit|linkedinbot|whatsapp|telegrambot|gptbot|claudebot|perplexitybot|oai-searchbot|google-extended|bingpreview/i;

function negotiateLocale(acceptLanguage: string | null): Locale {
  if (!acceptLanguage) return DEFAULT_LOCALE;
  const candidates = acceptLanguage
    .split(",")
    .map((part) => {
      const [tag, qPart] = part.trim().split(";q=");
      const q = qPart ? Number.parseFloat(qPart) : 1;
      const primary = (tag || "").toLowerCase().split("-")[0];
      return { primary, q: Number.isFinite(q) ? q : 0 };
    })
    .sort((a, b) => b.q - a.q);

  for (const item of candidates) {
    if ((LOCALES as readonly string[]).includes(item.primary)) {
      return item.primary as Locale;
    }
  }
  return DEFAULT_LOCALE;
}

/**
 * Middleware SEO-safe para deteccion de idioma en la raiz "/".
 * - Solo actua cuando Astro corre en modo SSR/Edge (Cloudflare Pages / Vercel / Node).
 * - Nunca redirige a rastreadores de buscadores ni a bots de IA (GEO).
 * - Respeta la cookie "rryp_lang" cuando el visitante ya eligio idioma.
 * - Usa redireccion temporal 302 con cabecera Vary: Accept-Language, Cookie.
 */
export const onRequest = defineMiddleware((context, next) => {
  if (context.isPrerendered || context.url.pathname !== "/") {
    return next();
  }

  const ua = context.request.headers.get("user-agent") || "";
  if (BOT_PATTERN.test(ua)) {
    return next();
  }

  const cookieLang = context.cookies.get("rryp_lang")?.value;
  const target: Locale = isLocale(cookieLang)
    ? cookieLang
    : negotiateLocale(context.request.headers.get("accept-language"));

  return new Response(null, {
    status: 302,
    headers: {
      Location: `/${target}/`,
      Vary: "Accept-Language, Cookie",
      "Cache-Control": "private, max-age=0, must-revalidate",
    },
  });
});
