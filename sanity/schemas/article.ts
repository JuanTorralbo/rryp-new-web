import { defineType, defineField } from "sanity";

/**
 * Articulo multilingue de RRYP Legal Intelligence.
 * Regla de calidad: cada idioma tiene estado de revision (draft / reviewed / published)
 * para que un articulo nunca se mezcle en espanol dentro de /en/, /de/, /pt/, /ru/ o /zh/.
 */
export const articleSchema = defineType({
  name: "legalArticle",
  title: "RRYP Legal Intelligence, Artículos",
  type: "document",
  fields: [
    defineField({
      name: "language",
      title: "Idioma del artículo",
      type: "string",
      options: {
        list: [
          { title: "Español (es)", value: "es" },
          { title: "English (en)", value: "en" },
          { title: "Deutsch (de)", value: "de" },
          { title: "Português (pt)", value: "pt" },
          { title: "Русский (ru)", value: "ru" },
          { title: "中文 (zh)", value: "zh" },
        ],
      },
      validation: (Rule) => Rule.required(),
    }),
    defineField({
      name: "editorialStatus",
      title: "Estado de revisión lingüística",
      type: "string",
      initialValue: "draft",
      options: {
        list: [
          { title: "Borrador IA (no visible en web)", value: "draft" },
          { title: "Revisado con glosario jurídico", value: "reviewed" },
          { title: "Publicado", value: "published" },
        ],
      },
      validation: (Rule) => Rule.required(),
    }),
    defineField({
      name: "pillar",
      title: "Pilar jurídico",
      type: "string",
      options: {
        list: [
          { title: "Private Clients", value: "private-clients" },
          { title: "Private Wealth", value: "private-wealth" },
          { title: "Business Disputes", value: "business-disputes" },
        ],
      },
      validation: (Rule) => Rule.required(),
    }),
    defineField({ name: "title", title: "Titular", type: "string", validation: (Rule) => Rule.required() }),
    defineField({ name: "slug", title: "Slug limpio", type: "slug", options: { source: "title" }, validation: (Rule) => Rule.required() }),
    defineField({ name: "publishedAt", title: "Fecha de publicación", type: "datetime", validation: (Rule) => Rule.required() }),
    defineField({ name: "excerpt", title: "Resumen editorial", type: "text", rows: 3, validation: (Rule) => Rule.required().max(220) }),
    defineField({ name: "body", title: "Contenido", type: "array", of: [{ type: "block" }] }),
  ],
});
