import { localizedPath, type Locale } from "../i18n";

export type NavActiveKey = "home" | "clients" | "wealth" | "disputes" | "cases" | "firm" | "intel" | "contact";

export interface NavSubLink {
  label: string;
  href: string;
  overview?: boolean;
}

export interface NavGroup {
  id: string;
  activeKey: NavActiveKey;
  label: string;
  href: string;
  items?: NavSubLink[];
  footerLinks?: NavSubLink[];
}

interface NavCopy {
  patrimonio: string;
  patrimonioAll: string;
  insolvencia: string;
  liquidacion: string;
  sucesiones: string;
  penal: string;
  extradicion: string;
  empresa: string;
  empresaAll: string;
  litigios: string;
  competencia: string;
  contratos: string;
  contratosTech: string;
  clientes: string;
  clientesAll: string;
  divorcio: string;
  custodia: string;
  sustraccion: string;
  experiencia: string;
  casos: string;
  prensa: string;
  intel: string;
  intelAll: string;
  diccionario: string;
  firma: string;
  firmaAll: string;
  mar: string;
  historia: string;
  rryp5: string;
  reunion: string;
  contacto: string;
}

const NAV_COPY: Record<Locale, NavCopy> = {
  es: {
    patrimonio: "Patrimonio",
    patrimonioAll: "Ver Patrimonio Internacional",
    insolvencia: "Insolvencia y crisis patrimonial",
    liquidacion: "Liquidación de bienes conyugales",
    sucesiones: "Sucesiones internacionales",
    penal: "Delitos económicos internacionales",
    extradicion: "Extradición internacional y OEDE",
    empresa: "Empresa y litigios",
    empresaAll: "Ver Empresa y Litigios",
    litigios: "Litigios internacionales",
    competencia: "Competencia desleal internacional",
    contratos: "Contratos internacionales",
    contratosTech: "Contratos tecnológicos",
    clientes: "Clientes privados",
    clientesAll: "Ver Clientes Privados y Familia",
    divorcio: "Divorcio internacional",
    custodia: "Custodia internacional",
    sustraccion: "Sustracción internacional de menores",
    experiencia: "Experiencia",
    casos: "Asuntos destacados (28 casos)",
    prensa: "Prensa y medios",
    intel: "Legal Intelligence",
    intelAll: "Biblioteca jurídica e IA Legal",
    diccionario: "Diccionario jurídico (A–Z)",
    firma: "La firma",
    firmaAll: "Equipo y firma",
    mar: "Mar Gámez Ramírez (Dirección)",
    historia: "Historia (2020–2026)",
    rryp5: "RRYP Global en 5 minutos",
    reunion: "Primera reunión jurídica (350 €)",
    contacto: "Contacto",
  },
  en: {
    patrimonio: "Private Wealth",
    patrimonioAll: "View Private Wealth",
    insolvencia: "Cross-border insolvency",
    liquidacion: "Marital asset division",
    sucesiones: "International inheritance",
    penal: "Economic crime defense",
    extradicion: "International extradition & EAW",
    empresa: "Business Disputes",
    empresaAll: "View Business Disputes",
    litigios: "International litigation",
    competencia: "Unfair competition",
    contratos: "International contracts",
    contratosTech: "Technology contracts",
    clientes: "Private Clients",
    clientesAll: "View Private Clients & Family",
    divorcio: "International divorce",
    custodia: "International child custody",
    sustraccion: "International child abduction",
    experiencia: "Track Record",
    casos: "Representative matters (28 cases)",
    prensa: "Press and media",
    intel: "Legal Intelligence",
    intelAll: "Legal library & AI Assistant",
    diccionario: "Legal dictionary (A–Z)",
    firma: "The Firm",
    firmaAll: "Team and practice",
    mar: "Mar Gámez Ramírez (Managing Partner)",
    historia: "History (2020–2026)",
    rryp5: "RRYP Global in 5 minutes",
    reunion: "First legal consultation (350 €)",
    contacto: "Contact",
  },
  de: {
    patrimonio: "Private Wealth",
    patrimonioAll: "Internationales Vermögensrecht",
    insolvencia: "Grenzüberschreitende Insolvenz",
    liquidacion: "Eheliche Vermögensauseinandersetzung",
    sucesiones: "Internationales Erbrecht",
    penal: "Wirtschaftsstrafrecht",
    extradicion: "Auslieferung und EuHb",
    empresa: "Business Disputes",
    empresaAll: "Unternehmen und Prozesse",
    litigios: "Internationale Prozesse",
    competencia: "Unlauterer Wettbewerb",
    contratos: "Internationale Verträge",
    contratosTech: "Technologieverträge",
    clientes: "Private Clients",
    clientesAll: "Privatmandanten und Familie",
    divorcio: "Internationale Scheidung",
    custodia: "Internationales Sorgerecht",
    sustraccion: "Internationale Kindesentführung",
    experiencia: "Erfahrung",
    casos: "Mandate und Fälle (28 Fälle)",
    prensa: "Presse und Medien",
    intel: "Legal Intelligence",
    intelAll: "Rechtsbibliothek und Legal KI",
    diccionario: "Rechtswörterbuch (A–Z)",
    firma: "Kanzlei",
    firmaAll: "Team und Kanzlei",
    mar: "Mar Gámez Ramírez (Leitung)",
    historia: "Geschichte (2020–2026)",
    rryp5: "RRYP Global in 5 Minuten",
    reunion: "Juristische Erstberatung (350 €)",
    contacto: "Kontakt",
  },
  pt: {
    patrimonio: "Património",
    patrimonioAll: "Ver Património Internacional",
    insolvencia: "Insolvência e crise patrimonial",
    liquidacion: "Partilha internacional de bens",
    sucesiones: "Sucessões internacionais",
    penal: "Crimes económicos internacionais",
    extradicion: "Extradição internacional e MDE",
    empresa: "Empresa e litígios",
    empresaAll: "Ver Empresa e Litígios",
    litigios: "Litígios internacionais",
    competencia: "Concorrência desleal internacional",
    contratos: "Contratos internacionais",
    contratosTech: "Contratos tecnológicos",
    clientes: "Clientes privados",
    clientesAll: "Ver Clientes Privados e Família",
    divorcio: "Divórcio internacional",
    custodia: "Guarda internacional de menores",
    sustraccion: "Subtração internacional de menores",
    experiencia: "Experiência",
    casos: "Casos de sucesso (28 casos)",
    prensa: "Imprensa e media",
    intel: "Legal Intelligence",
    intelAll: "Biblioteca jurídica e IA Legal",
    diccionario: "Dicionário jurídico (A–Z)",
    firma: "A firma",
    firmaAll: "Equipa e firma",
    mar: "Mar Gámez Ramírez (Direção)",
    historia: "História (2020–2026)",
    rryp5: "RRYP Global em 5 minutos",
    reunion: "Primeira reunião jurídica (350 €)",
    contacto: "Contacto",
  },
  ru: {
    patrimonio: "Частный капитал",
    patrimonioAll: "Международные активы",
    insolvencia: "Трансграничная несостоятельность",
    liquidacion: "Раздел имущества супругов",
    sucesiones: "Международное наследство",
    penal: "Экономические преступления",
    extradicion: "Экстрадиция и ЕОА",
    empresa: "Бизнес и споры",
    empresaAll: "Международный бизнес и суды",
    litigios: "Международные суды",
    competencia: "Недобросовестная конкуренция",
    contratos: "Международные контракты",
    contratosTech: "Технологические контракты",
    clientes: "Частные клиенты",
    clientesAll: "Частные клиенты и семья",
    divorcio: "Международный развод",
    custodia: "Международная опека над детьми",
    sustraccion: "Международное похищение детей",
    experiencia: "Опыт",
    casos: "Знаковые дела (28 кейсов)",
    prensa: "Пресса и СМИ",
    intel: "Legal Intelligence",
    intelAll: "Правовая библиотека и Legal AI",
    diccionario: "Юридический словарь (A–Z)",
    firma: "О фирме",
    firmaAll: "Команда и практика",
    mar: "Мар Гамес Рамирес (Руководство)",
    historia: "История (2020–2026)",
    rryp5: "RRYP Global за 5 минут",
    reunion: "Первая юридическая встреча (350 €)",
    contacto: "Контакты",
  },
  zh: {
    patrimonio: "私人财富",
    patrimonioAll: "国际资产与财富总览",
    insolvencia: "跨境破产与债务危机",
    liquidacion: "跨国夫妻财产分割",
    sucesiones: "国际遗产继承",
    penal: "国际经济刑事辩护",
    extradicion: "国际引渡与欧洲逮捕令",
    empresa: "企业与争议",
    empresaAll: "国际企业与商事争议",
    litigios: "国际商事诉讼",
    competencia: "国际不正当竞争",
    contratos: "国际商事合同",
    contratosTech: "科技与软件合同",
    clientes: "私人客户",
    clientesAll: "私人客户与国际家庭法",
    divorcio: "跨国离婚",
    custodia: "跨境子女抚养权",
    sustraccion: "国际儿童诱拐应对",
    experiencia: "案例",
    casos: "代表性实务案例 (28例)",
    prensa: "媒体与报道",
    intel: "Legal Intelligence",
    intelAll: "法律智库与 AI 法律助手",
    diccionario: "国际法律词典 (A–Z)",
    firma: "律所",
    firmaAll: "团队与律所介绍",
    mar: "Mar Gámez Ramírez（管理合伙人）",
    historia: "发展历程 (2020–2026)",
    rryp5: "5 分钟了解 RRYP Global",
    reunion: "首次法律战略咨询 (350 €)",
    contacto: "联系",
  },
};

export function getPrimaryNav(lang: Locale): NavGroup[] {
  const c = NAV_COPY[lang];
  return [
    {
      id: "nav-menu-patrimonio",
      activeKey: "wealth",
      label: c.patrimonio,
      href: localizedPath(lang, "private-wealth"),
      items: [
        { label: c.patrimonioAll, href: localizedPath(lang, "private-wealth"), overview: true },
        { label: c.insolvencia, href: localizedPath(lang, "especialidades/insolvencia-internacional") },
        { label: c.liquidacion, href: localizedPath(lang, "especialidades/liquidacion-bienes-conyugales") },
        { label: c.sucesiones, href: localizedPath(lang, "especialidades/sucesiones-internacionales") },
        { label: c.penal, href: localizedPath(lang, "penal-economico-extradicion") },
        { label: c.extradicion, href: localizedPath(lang, "especialidades/extradicion-internacional") },
      ],
    },
    {
      id: "nav-menu-empresa",
      activeKey: "disputes",
      label: c.empresa,
      href: localizedPath(lang, "business-disputes"),
      items: [
        { label: c.empresaAll, href: localizedPath(lang, "business-disputes"), overview: true },
        { label: c.litigios, href: localizedPath(lang, "especialidades/litigios-internacionales") },
        { label: c.competencia, href: localizedPath(lang, "especialidades/competencia-desleal-internacional") },
        { label: c.contratos, href: localizedPath(lang, "especialidades/contratos-internacionales") },
        { label: c.contratosTech, href: localizedPath(lang, "especialidades/contratos-tecnologicos") },
      ],
    },
    {
      id: "nav-menu-clientes",
      activeKey: "clients",
      label: c.clientes,
      href: localizedPath(lang, "private-clients"),
      items: [
        { label: c.clientesAll, href: localizedPath(lang, "private-clients"), overview: true },
        { label: c.divorcio, href: localizedPath(lang, "especialidades/divorcio-internacional") },
        { label: c.custodia, href: localizedPath(lang, "especialidades/custodia-internacional") },
        { label: c.sustraccion, href: localizedPath(lang, "especialidades/sustraccion-menores") },
      ],
    },
    {
      id: "nav-menu-experiencia",
      activeKey: "cases",
      label: c.experiencia,
      href: localizedPath(lang, "casos"),
      items: [
        { label: c.casos, href: localizedPath(lang, "casos"), overview: true },
        { label: c.prensa, href: localizedPath(lang, "medios") },
      ],
    },
    {
      id: "nav-menu-intel",
      activeKey: "intel",
      label: c.intel,
      href: localizedPath(lang, "legal-intelligence"),
      items: [
        { label: c.intelAll, href: localizedPath(lang, "legal-intelligence"), overview: true },
        { label: c.diccionario, href: localizedPath(lang, "diccionario-juridico") },
      ],
    },
    {
      id: "nav-menu-firma",
      activeKey: "firm",
      label: c.firma,
      href: localizedPath(lang, "la-firma"),
      items: [
        { label: c.firmaAll, href: localizedPath(lang, "la-firma"), overview: true },
        { label: c.mar, href: localizedPath(lang, "equipo/mar-gamez") },
        { label: c.historia, href: localizedPath(lang, "historia") },
        { label: c.rryp5, href: localizedPath(lang, "rryp-en-5") },
        { label: c.reunion, href: localizedPath(lang, "primera-reunion-juridica") },
      ],
      footerLinks: [
        { label: "Madrid", href: localizedPath(lang, "madrid") },
        { label: "Málaga", href: localizedPath(lang, "malaga") },
        { label: "Córdoba", href: localizedPath(lang, "cordoba") },
      ],
    },
    {
      id: "nav-menu-contacto",
      activeKey: "contact",
      label: c.contacto,
      href: localizedPath(lang, "contacto"),
    },
  ];
}
