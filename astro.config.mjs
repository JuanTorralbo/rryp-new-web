import { defineConfig } from "astro/config";

export default defineConfig({
  site: "https://rrypglobal.com",
  trailingSlash: "always",
  compressHTML: true,
  prefetch: {
    prefetchAll: false,
    defaultStrategy: "hover",
  },
  i18n: {
    defaultLocale: "en",
    locales: ["es", "en", "de", "pt", "ru", "zh"],
    routing: {
      prefixDefaultLocale: true,
      redirectToDefaultLocale: false,
    },
  },
  build: {
    inlineStylesheets: "auto",
  },
});
