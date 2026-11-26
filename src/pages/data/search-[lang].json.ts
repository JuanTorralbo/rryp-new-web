import type { APIRoute } from "astro";
import { FIRM } from "../../data/firm";
import { getPageContent } from "../../data/pages-i18n";
import { WP_CASES, WP_SPECIALTIES } from "../../data/wp";
import { getDictionary, LOCALES, localizedPath, type Locale } from "../../i18n";

export function getStaticPaths() {
  return LOCALES.map((lang) => ({ params: { lang } }));
}

export const GET: APIRoute = ({ params }) => {
  const lang = (params.lang || "es") as Locale;
  const t = getDictionary(lang);
  const contactContent = getPageContent(lang).contacto;

  const pages = [
    { title: t.navClients, desc: t.p1Desc, url: localizedPath(lang, "private-clients") },
    { title: t.navWealth, desc: t.p2Desc, url: localizedPath(lang, "private-wealth") },
    { title: t.navDisputes, desc: t.p3Desc, url: localizedPath(lang, "business-disputes") },
    { title: t.bcPenal, desc: t.penalHeroLead, url: localizedPath(lang, "penal-economico-extradicion") },
    { title: t.navCases, desc: t.casosHeroLead, url: localizedPath(lang, "casos") },
    { title: t.navFirmShort, desc: t.firmHeroLead, url: localizedPath(lang, "la-firma") },
    { title: t.histTitle, desc: t.histLead, url: localizedPath(lang, "historia") },
    { title: t.mediosTitle, desc: t.mediosLead, url: localizedPath(lang, "medios") },
    { title: t.dictTitle, desc: t.dictLead, url: localizedPath(lang, "diccionario-juridico") },
    { title: t.meetTitle, desc: t.meetLead, url: localizedPath(lang, "primera-reunion-juridica") },
    { title: t.r5Eyebrow, desc: t.r5Lead, url: localizedPath(lang, "rryp-en-5") },
    { title: `${t.cvTitle} (${t.cvIcamLabel})`, desc: t.cvLead, url: localizedPath(lang, "equipo/mar-gamez") },
    { title: contactContent.title, desc: contactContent.lead, url: localizedPath(lang, "contacto") },
    { title: "RRYP Legal Intelligence AI", desc: t.liHeroLead, url: localizedPath(lang, "legal-intelligence") },
    { title: "Madrid", desc: t.madridLead, url: localizedPath(lang, "madrid") },
    { title: "Málaga", desc: t.malagaLead, url: localizedPath(lang, "malaga") },
    { title: "Córdoba", desc: t.cordobaLead, url: localizedPath(lang, "cordoba") },
    { title: "Careers", desc: t.careersHeroLead, url: localizedPath(lang, "careers") },
    ...WP_SPECIALTIES.map((sp) => ({
      title: sp.title,
      desc: sp.pillarLabel,
      url: localizedPath(lang, `especialidades/${sp.slug}`),
    })),
    ...WP_CASES.map((cs) => ({
      title: cs.title,
      desc: `${t.bcCases} — ${cs.pillarLabel}`,
      url: localizedPath(lang, `casos/${cs.slug}`),
    })),
    { title: t.legalNotice, desc: FIRM.legalName, url: localizedPath(lang, "legal/aviso-legal") },
    { title: t.legalPrivacy, desc: FIRM.legalName, url: localizedPath(lang, "legal/privacidad") },
    { title: t.legalCookies, desc: FIRM.legalName, url: localizedPath(lang, "legal/cookies") },
    { title: t.legalTerms, desc: FIRM.legalName, url: localizedPath(lang, "legal/condiciones") },
  ];

  return new Response(JSON.stringify(pages), {
    headers: {
      "Content-Type": "application/json; charset=utf-8",
    },
  });
};
