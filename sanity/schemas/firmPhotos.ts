import { defineType, defineField } from "sanity";

/**
 * Panel centralizado "Fotos de la firma" en Sanity Studio.
 * Permite a personal no tecnico cambiar cualquier fotografia en ranuras fijas
 * (Portada 16:9, Editorial 4:3, Direccion y equipo 4:5) con recorte automatico
 * object-fit: cover y entrega WebP desde CDN sin posibilidad de romper el diseno.
 */
export const firmPhotosSchema = defineType({
  name: "firmPhotos",
  title: "Fotos de la firma",
  type: "document",
  fields: [
    defineField({
      name: "heroPhoto",
      title: "Portada principal (ranura fija 16:9)",
      type: "image",
      options: { hotspot: true },
      description: "Recorte automatico 16:9 (object-fit: cover) y conversion automatica a WebP.",
      validation: (Rule) => Rule.required(),
    }),
    defineField({
      name: "editorialPhoto",
      title: "Imagen editorial de la firma (ranura fija 4:3)",
      type: "image",
      options: { hotspot: true },
      validation: (Rule) => Rule.required(),
    }),
    defineField({
      name: "officeMadridPhoto",
      title: "Sede de Madrid (4:3)",
      type: "image",
      options: { hotspot: true },
    }),
    defineField({
      name: "officeMalagaPhoto",
      title: "Sede de Málaga (16:9)",
      type: "image",
      options: { hotspot: true },
    }),
    defineField({
      name: "officeCordobaPhoto",
      title: "Sede de Córdoba (16:9)",
      type: "image",
      options: { hotspot: true },
    }),
    defineField({
      name: "teamMarGamez",
      title: "Mar Gámez, Socia Directora (retrato 4:5)",
      type: "image",
      options: { hotspot: true },
    }),
    defineField({
      name: "teamMarRamirez",
      title: "Mar Ramírez, Socia (retrato 4:5)",
      type: "image",
      options: { hotspot: true },
    }),
    defineField({
      name: "teamAntonioMunoz",
      title: "Antonio Muñoz, Abogado, litigación (retrato 4:5)",
      type: "image",
      options: { hotspot: true },
    }),
    defineField({
      name: "teamGonzaloGarcia",
      title: "Gonzalo García, Clientes y desarrollo (retrato 4:5)",
      type: "image",
      options: { hotspot: true },
    }),
    defineField({
      name: "teamRosaGamez",
      title: "Rosa Gámez, Administración y finanzas (retrato 4:5)",
      type: "image",
      options: { hotspot: true },
    }),
  ],
});
