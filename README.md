# RRYP Global — Web oficial (Astro 5 + TypeScript + Sanity)

Arquitectura de producción de **RRYP Global** (*International Legal Boutique*) orientada a los 3 pilares (**Private Clients**, **Private Wealth**, **Business Disputes**), con 6 árboles de idioma estáticos, asistente **RRYP Legal Intelligence AI** (Groq), fotografía Retina HD, gestor de cookies RGPD / LSSI y widgets fieles a la web original.

## Qué incluye este repositorio

1. **6 idiomas completos en rutas estáticas reales (73 páginas en `< 1 s`):**
   - `/es/`, `/en/`, `/de/`, `/pt/`, `/ru/`, `/zh/` con `hreflang` recíproco y `x-default` en `/en/`.
   - Paridad blindada en compilación: `629` claves por idioma (`src/i18n/locales/*.json`), TypeScript estricto (`SiteDictionary = typeof es`) y puerta de calidad `npm run check:i18n` (`scripts/verify-i18n.mjs`).
2. **RRYP Legal Intelligence (Blog + IA Groq):**
   - `/es/` sirve el histórico completo (429 análisis); `/en/`, `/de/`, `/pt/`, `/ru/` y `/zh/` sirven únicamente artículos traducidos en ese idioma (0 fugas al español).
   - Consola IA conectada a Groq (`openai/gpt-oss-120b`) vía `POST /api/legal-intelligence` con escalado automático a Atención urgente (`500 €`).
3. **Cookies RGPD / LSSI y widgets:**
   - Gestor de consentimiento tipo Complianz (`src/components/CookieConsent.astro`) con 4 categorías, bloqueo RGPD del vídeo de YouTube y pestaña flotante post-consentimiento.
   - Pastilla flotante de WhatsApp, rail vertical de redes sociales, desplegable de 3 vías Calendly en cabecera y buscador global `RRYP / SEARCH` insensible a tildes (`src/components/SiteWidgets.astro`).
4. **Sanity CMS listo (`sanity/sanity.config.ts`):**
   - Esquemas para fotos de la firma (con ranuras fijas y `hotspot: true`) y artículos multilingües de Legal Intelligence.

## Cómo continuar trabajando desde otro ordenador (por ejemplo, en casa)

Requisitos previos: **Git**, **Node.js 20+** (recomendado 22 LTS) y **Python 3** (opcional, para previsualizar el build estático junto con la IA de Groq).

```bash
# 1. Clonar el repositorio
git clone <URL_DEL_REPOSITORIO>
cd rryp-astro

# 2. Instalar dependencias
npm install

# 3. Configurar la clave de Groq en local (opcional, solo para probar la IA en vivo)
cp .env.example .env
# Edita .env y añade tu GROQ_API_KEY real (este archivo está ignorado por git)

# 4. Verificar traducciones, marca y TypeScript + compilar producción
npm run check
npm run build

# 5. Levantar la previsualización completa (redirección 302 + IA Groq) en http://127.0.0.1:4321/
python3 scripts/serve-preview.py
```

Para desarrollo rápido con recarga en caliente (sin proxy de IA):

```bash
npm run dev
```

## Despliegue en producción

- **Hosting recomendado:** Cloudflare Pages o Vercel conectando este repositorio (`Build command: npm run build`, `Output directory: dist`).
- **Variable de entorno secreta:** configura `GROQ_API_KEY` únicamente en el panel del hosting (nunca en código cliente ni en git).
- **Redirecciones SEO:** `public/_redirects` listo para consolidación `301` y retirada `410 Gone`.
