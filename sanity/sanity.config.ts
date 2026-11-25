import { defineConfig } from "sanity";
import { structureTool } from "sanity/structure";
import { firmPhotosSchema } from "./schemas/firmPhotos";
import { articleSchema } from "./schemas/article";

/**
 * Configuracion de Sanity Studio para RRYP Global.
 * Panel editorial limpio con:
 * - "Fotos de la firma" (documento singleton con ranuras fijas 16:9, 4:3 y 4:5).
 * - "RRYP Legal Intelligence" (articulos nativos en 6 idiomas por pilar juridico).
 */
export default defineConfig({
  name: "rryp-global",
  title: "RRYP Global Editorial",
  projectId: process.env.SANITY_PROJECT_ID || "REPLACE_WITH_SANITY_PROJECT_ID",
  dataset: process.env.SANITY_DATASET || "production",
  plugins: [
    structureTool({
      structure: (S) =>
        S.list()
          .title("Panel RRYP Global")
          .items([
            S.listItem()
              .title("Fotos de la firma")
              .id("firmPhotos")
              .child(S.document().schemaType("firmPhotos").documentId("firmPhotos")),
            S.divider(),
            S.documentTypeListItem("article").title("Artículos Legal Intelligence (6 idiomas)"),
          ]),
    }),
  ],
  schema: {
    types: [firmPhotosSchema, articleSchema],
  },
});
