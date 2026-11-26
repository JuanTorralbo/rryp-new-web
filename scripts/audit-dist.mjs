#!/usr/bin/env node
/**
 * Post-build technical perfection gate for dist/.
 * Verifies every built HTML page across all 6 locales for:
 *  - 0 broken internal links & 0 broken local assets
 *  - 0 broken hreflang targets
 *  - 0 invalid JSON-LD blocks
 *  - 0 middle dots (U+00B7)
 *  - 0 duplicate HTML id attributes
 *  - 0 <img> missing alt or missing width/height (CLS guard)
 *  - 0 heading hierarchy skips (WCAG 2.2 AA outline)
 *  - 0 search-index JSON files missing
 */

import fs from "node:fs";
import path from "node:path";

const DIST = path.resolve(process.cwd(), "dist");
const SITE_ORIGIN = "https://rrypglobal.com";

if (!fs.existsSync(DIST)) {
  console.error("ERROR: dist/ does not exist. Run `npm run build` first.");
  process.exit(1);
}

function walkHtml(dir, out = []) {
  for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
    const full = path.join(dir, entry.name);
    if (entry.isDirectory()) walkHtml(full, out);
    else if (entry.name.endsWith(".html")) out.push(full);
  }
  return out;
}

function targetExists(rawUrl) {
  let u = rawUrl.split("#")[0].split("?")[0];
  if (!u || u === "/") return fs.existsSync(path.join(DIST, "index.html"));
  if (u.startsWith(SITE_ORIGIN)) u = u.slice(SITE_ORIGIN.length);
  if (!u.startsWith("/")) return true;
  try {
    u = decodeURIComponent(u);
  } catch {
    // keep raw
  }
  const rel = u.replace(/^\/+/, "");
  const exact = path.join(DIST, rel);
  if (fs.existsSync(exact) && fs.statSync(exact).isFile()) return true;
  const idx = path.join(DIST, rel, "index.html");
  if (fs.existsSync(idx)) return true;
  return false;
}

const htmlFiles = walkHtml(DIST).sort();
let totalBytes = 0;
let brokenLinks = [];
let brokenAssets = [];
let brokenHreflangs = [];
let invalidJsonLd = [];
let middleDots = [];
let duplicateIds = [];
let imgsNoAlt = [];
let imgsNoDim = [];
let headingSkips = [];

for (const file of htmlFiles) {
  const rel = path.relative(DIST, file);
  const html = fs.readFileSync(file, "utf8");
  totalBytes += Buffer.byteLength(html, "utf8");

  if (html.includes("\u00B7")) {
    middleDots.push(rel);
  }

  // Strip <script> and <style> bodies for structural HTML checks
  const cleanHtml = html
    .replace(/<script\b[^>]*>[\s\S]*?<\/script>/gi, "")
    .replace(/<style\b[^>]*>[\s\S]*?<\/style>/gi, "");

  // Duplicate IDs
  const seenIds = new Set();
  for (const m of cleanHtml.matchAll(/\bid="([^"]+)"/g)) {
    const id = m[1];
    if (seenIds.has(id)) {
      duplicateIds.push(`${rel}#${id}`);
    }
    seenIds.add(id);
  }

  // <img> alt + width/height checks
  for (const m of cleanHtml.matchAll(/<img\b([^>]*)>/gi)) {
    const attrs = m[1];
    const srcM = attrs.match(/\bsrc="([^"]+)"/i);
    const src = srcM ? srcM[1] : "(no-src)";
    if (!/\balt="/i.test(attrs)) {
      imgsNoAlt.push(`${rel}: ${src}`);
    }
    if (!/\bwidth="/i.test(attrs) || !/\bheight="/i.test(attrs)) {
      imgsNoDim.push(`${rel}: ${src}`);
    }
    if (src.startsWith("/") && !targetExists(src)) {
      brokenAssets.push(`${rel}: ${src}`);
    }
  }

  // Heading hierarchy skips
  const levels = [];
  for (const m of cleanHtml.matchAll(/<h([1-6])\b/gi)) {
    levels.push(parseInt(m[1], 10));
  }
  for (let i = 1; i < levels.length; i++) {
    if (levels[i] > levels[i - 1] + 1) {
      headingSkips.push(`${rel}: h${levels[i - 1]}->h${levels[i]}`);
      break;
    }
  }

  // Internal <a href> checks
  for (const m of cleanHtml.matchAll(/<a\b[^>]*\bhref="(\/[^"]*)"/gi)) {
    const href = m[1];
    if (!href.startsWith("//") && !targetExists(href)) {
      brokenLinks.push(`${rel} -> ${href}`);
    }
  }

  // hreflang checks
  for (const m of html.matchAll(/<link\b[^>]*rel="alternate"[^>]*hreflang="[^"]+"[^>]*href="([^"]+)"/gi)) {
    const href = m[1];
    if (!targetExists(href)) {
      brokenHreflangs.push(`${rel} -> ${href}`);
    }
  }

  // JSON-LD validity
  for (const m of html.matchAll(/<script\b[^>]*type="application\/ld\+json"[^>]*>([\s\S]*?)<\/script>/gi)) {
    try {
      JSON.parse(m[1]);
    } catch (err) {
      invalidJsonLd.push(`${rel}: ${err.message}`);
    }
  }
}

// Verify static search indexes for all 6 locales
const missingSearchJson = ["es", "en", "de", "pt", "ru", "zh"].filter(
  (loc) => !fs.existsSync(path.join(DIST, "data", `search-${loc}.json`))
);

const report = [
  ["HTML files audited", htmlFiles.length],
  ["Total HTML payload", `${(totalBytes / 1024 / 1024).toFixed(2)} MB (avg ${(totalBytes / htmlFiles.length / 1024).toFixed(1)} KB/page)`],
  ["Broken internal links", brokenLinks.length],
  ["Broken local assets", brokenAssets.length],
  ["Broken hreflang links", brokenHreflangs.length],
  ["Invalid JSON-LD blocks", invalidJsonLd.length],
  ["Middle dot (U+00B7) leaks", middleDots.length],
  ["Duplicate HTML IDs", duplicateIds.length],
  ["<img> missing alt", imgsNoAlt.length],
  ["<img> missing width/height", imgsNoDim.length],
  ["Heading hierarchy skips", headingSkips.length],
  ["Missing search JSON indexes", missingSearchJson.length],
];

console.log("\n=== RRYP GLOBAL POST-BUILD AUDIT ===");
for (const [label, val] of report) {
  console.log(`  ${label.padEnd(30)} ${val}`);
}

const failures = [
  ["brokenLinks", brokenLinks],
  ["brokenAssets", brokenAssets],
  ["brokenHreflangs", brokenHreflangs],
  ["invalidJsonLd", invalidJsonLd],
  ["middleDots", middleDots],
  ["duplicateIds", duplicateIds],
  ["imgsNoAlt", imgsNoAlt],
  ["imgsNoDim", imgsNoDim],
  ["headingSkips", headingSkips],
  ["missingSearchJson", missingSearchJson],
].filter(([, list]) => list.length > 0);

if (failures.length > 0) {
  console.error("\nAUDIT FAILED:");
  for (const [name, list] of failures) {
    console.error(`  [${name}] (${list.length}) sample:`, list.slice(0, 5));
  }
  process.exit(1);
}

console.log("\nALL TECHNICAL QUALITY GATES PASSED (0 defects across all pages).");
