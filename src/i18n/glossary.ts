import type { Locale } from "./config";

/**
 * Glosario juridico oficial cerrado de RRYP Global en los 6 idiomas.
 * Garantiza coherencia terminologica absoluta en paginas, blogs y traducciones asistidas por IA.
 */
export interface GlossaryEntry {
  term: string;
  translations: Record<Locale, string>;
}

export const LEGAL_GLOSSARY: GlossaryEntry[] = [
  {
    term: "Private Clients",
    translations: { es: "Private Clients", en: "Private Clients", de: "Private Clients", pt: "Private Clients", ru: "Private Clients", zh: "Private Clients" },
  },
  {
    term: "Private Wealth",
    translations: { es: "Private Wealth", en: "Private Wealth", de: "Private Wealth", pt: "Private Wealth", ru: "Private Wealth", zh: "Private Wealth" },
  },
  {
    term: "Business Disputes",
    translations: { es: "Business Disputes", en: "Business Disputes", de: "Business Disputes", pt: "Business Disputes", ru: "Business Disputes", zh: "Business Disputes" },
  },
  {
    term: "Liquidación internacional de gananciales",
    translations: {
      es: "Liquidación internacional de gananciales",
      en: "International marital estate liquidation",
      de: "Internationale Güterrechtsauseinandersetzung",
      pt: "Partilha internacional de bens conjugais",
      ru: "Международный раздел супружеского имущества",
      zh: "高净值跨国夫妻财产清算",
    },
  },
  {
    term: "Exequátur",
    translations: {
      es: "Exequátur de resoluciones extranjeras",
      en: "Exequatur of foreign judgments",
      de: "Exequatur ausländischer Urteile",
      pt: "Exequátur de decisões estrangeiras",
      ru: "Экзекватура иностранных судебных решений",
      zh: "外国判决承认与执行（Exequatur）",
    },
  },
  {
    term: "Sustracción internacional de menores",
    translations: {
      es: "Sustracción internacional de menores",
      en: "International child abduction",
      de: "Internationale Kindesentführung",
      pt: "Rapto internacional de menores",
      ru: "Международное похищение детей",
      zh: "国际儿童带离争议",
    },
  },
  {
    term: "Orden Europea de Detención y Entrega (OEDE)",
    translations: {
      es: "Orden Europea de Detención y Entrega (OEDE)",
      en: "European Arrest Warrant (EAW)",
      de: "Europäischer Haftbefehl (EuHb)",
      pt: "Mandado de Detenção Europeu (MDE)",
      ru: "Европейский ордер на арест (OEDE)",
      zh: "欧洲逮捕令（OEDE）",
    },
  },
  {
    term: "Construcción estratégica del caso",
    translations: {
      es: "Construcción estratégica del caso",
      en: "Strategic Case Construction",
      de: "Strategischer Fallaufbau",
      pt: "Construção estratégica do caso",
      ru: "Стратегическое построение дела",
      zh: "战略性案件构建",
    },
  },
];
