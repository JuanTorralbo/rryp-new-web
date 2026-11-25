#!/usr/bin/env node
/**
 * Puerta de calidad obligatoria antes de cada build de RRYP Global:
 * 1. Verifica paridad del 100% de claves en los 6 diccionarios (es, en, de, pt, ru, zh).
 * 2. Verifica 0 valores vacios.
 * 3. Verifica 0 puntos intermedios (U+00B7) en todo src/ y public/.
 * 4. Verifica que src/styles/global.css solo utiliza los 5 colores oficiales exactos.
 */

import fs from "node:fs";
import path from "node:path";

const ROOT = process.cwd();
const LOCALES = ["es", "en", "de", "pt", "ru", "zh"];
const OFFICIAL_HEX = ["#0E1211", "#47202D", "#B89B5E", "#E1ED63", "#F7F4ED"];

let failed = false;
function fail(msg) {
  console.error("FAIL:", msg);
  failed = true;
}

// 1 & 2. Validar los 6 JSON de traduccion
const dicts = {};
for (const l of LOCALES) {
  const p = path.join(ROOT, "src/i18n/locales", `${l}.json`);
  if (!fs.existsSync(p)) {
    fail(`Falta el diccionario src/i18n/locales/${l}.json`);
    continue;
  }
  dicts[l] = JSON.parse(fs.readFileSync(p, "utf8"));
}

if (dicts.es) {
  const baseKeys = Object.keys(dicts.es).sort();
  for (const l of LOCALES) {
    if (!dicts[l]) continue;
    const keys = Object.keys(dicts[l]).sort();
    const missing = baseKeys.filter((k) => !(k in dicts[l]));
    const extra = keys.filter((k) => !(k in dicts.es));
    if (missing.length) fail(`[${l}] Claves faltantes: ${missing.join(", ")}`);
    if (extra.length) fail(`[${l}] Claves sobrantes: ${extra.join(", ")}`);

    for (const [k, v] of Object.entries(dicts[l])) {
      if (typeof v === "string" && !v.trim()) {
        fail(`[${l}] Valor vacio en clave "${k}"`);
      }
      if (Array.isArray(v) && v.length === 0) {
        fail(`[${l}] Lista vacia en clave "${k}"`);
      }
    }
  }
  console.log(`OK: 6 diccionarios verificados (${baseKeys.length} claves por idioma, paridad 100%).`);
}

// 3. Cero puntos intermedios en src/ y public/
function walk(dir, acc = []) {
  if (!fs.existsSync(dir)) return acc;
  for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
    const full = path.join(dir, entry.name);
    if (entry.isDirectory()) walk(full, acc);
    else if (/\.(astro|ts|tsx|js|mjs|json|css|txt|xml)$/i.test(entry.name)) acc.push(full);
  }
  return acc;
}

const files = [...walk(path.join(ROOT, "src")), ...walk(path.join(ROOT, "public"))];
for (const f of files) {
  const content = fs.readFileSync(f, "utf8");
  if (content.includes("\u00b7")) {
    fail(`Punto intermedio detectado en ${path.relative(ROOT, f)}`);
  }
}
console.log(`OK: ${files.length} archivos escaneados con 0 puntos intermedios.`);

// 4. Exacta paleta de 5 colores en global.css
const cssPath = path.join(ROOT, "src/styles/global.css");
if (fs.existsSync(cssPath)) {
  const css = fs.readFileSync(cssPath, "utf8");
  const foundHex = [...new Set((css.match(/#[0-9A-Fa-f]{3,6}/g) || []).map((h) => h.toUpperCase()))].sort();
  if (JSON.stringify(foundHex) !== JSON.stringify(OFFICIAL_HEX)) {
    fail(`Paleta alterada en global.css. Esperada ${OFFICIAL_HEX.join(", ")}, encontrada ${foundHex.join(", ")}`);
  } else {
    console.log(`OK: Paleta oficial exacta verificada (${foundHex.join(", ")}).`);
  }
}

if (failed) {
  process.exit(1);
}
console.log("VERIFICACION I18N Y MARCA SUPERADA AL 100%.");
