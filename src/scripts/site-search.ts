/**
 * Buscador global RRYP / SEARCH con atajo Cmd+K / Ctrl+K y normalizacion sin tildes.
 */

interface SearchPageItem {
  title: string;
  desc: string;
  url: string;
}

interface SearchArticleItem {
  title: string;
  excerpt: string;
  category?: string;
  date: string;
  url: string;
}

interface SearchConfig {
  feedUrl: string;
  pages: SearchPageItem[];
  pagesLabel: string;
  articlesLabel: string;
  emptyLabel: string;
}

export {};

declare global {
  interface Window {
    RRYP_OPEN_SEARCH?: () => void;
  }
}

function initSiteSearch() {
  const overlay = document.getElementById("rryp-search-overlay");
  const openBtn = document.getElementById("rryp-search-open");
  const closeBtn = document.getElementById("rryp-search-close");
  const input = document.getElementById("rryp-search-input") as HTMLInputElement | null;
  const resultsEl = document.getElementById("rryp-search-results");
  const cfgEl = document.getElementById("rryp-search-config");
  if (!overlay || !input || !resultsEl || !cfgEl) return;

  const cfg = JSON.parse(cfgEl.textContent || "{}") as SearchConfig;
  let articles: SearchArticleItem[] = [];
  let loaded = false;
  let lastTrigger: HTMLElement | null = null;

  const esc = (s: unknown) =>
    String(s || "")
      .replace(/&/g, "&amp;")
      .replace(/</g, "&lt;")
      .replace(/>/g, "&gt;")
      .replace(/"/g, "&quot;");

  const norm = (s: unknown) =>
    String(s || "")
      .toLowerCase()
      .normalize("NFD")
      .replace(/[\u0300-\u036f]/g, "");

  const render = (query: string) => {
    const q = norm(query.trim());
    const matchedPages = (cfg.pages || [])
      .filter((p) => !q || norm(`${p.title} ${p.desc}`).includes(q))
      .slice(0, q ? 6 : 5);

    const matchedArticles = q
      ? articles
          .filter((a) => norm(`${a.title} ${a.excerpt} ${a.category || ""}`).includes(q))
          .slice(0, 6)
      : articles.slice(0, 4);

    if (!matchedPages.length && !matchedArticles.length) {
      resultsEl.innerHTML = `<p class="search-empty">${esc(cfg.emptyLabel)}</p>`;
      return;
    }

    let html = "";
    if (matchedPages.length) {
      html += `<div class="search-group"><p class="search-group-label">${esc(cfg.pagesLabel)}</p><ul class="search-list">`;
      matchedPages.forEach((p) => {
        html += `<li><a href="${esc(p.url)}"><strong>${esc(p.title)}</strong><span>${esc(p.desc)}</span></a></li>`;
      });
      html += "</ul></div>";
    }
    if (matchedArticles.length) {
      html += `<div class="search-group"><p class="search-group-label">${esc(cfg.articlesLabel)}</p><ul class="search-list">`;
      matchedArticles.forEach((a) => {
        const isExt = String(a.url || "").startsWith("http");
        html += `<li><a href="${esc(a.url)}"${isExt ? ' target="_blank" rel="noopener noreferrer"' : ""}><strong>${esc(a.title)}${isExt ? " ↗" : ""}</strong><span>${esc(a.date)}</span></a></li>`;
      });
      html += "</ul></div>";
    }
    resultsEl.innerHTML = html;
  };

  const ensureArticles = () => {
    if (loaded) return;
    loaded = true;
    fetch(cfg.feedUrl)
      .then((r) => (r.ok ? r.json() : []))
      .then((data) => {
        if (Array.isArray(data)) {
          articles = data as SearchArticleItem[];
          render(input.value);
        }
      })
      .catch(() => {});
  };

  const openSearch = (triggerEl?: HTMLElement | null) => {
    lastTrigger = triggerEl || (document.activeElement as HTMLElement | null);
    overlay.hidden = false;
    document.body.style.overflow = "hidden";
    ensureArticles();
    render(input.value);
    window.setTimeout(() => input.focus(), 30);
  };

  const closeSearch = (restoreFocus: boolean) => {
    overlay.hidden = true;
    document.body.style.overflow = "";
    if (restoreFocus && lastTrigger && typeof lastTrigger.focus === "function") {
      lastTrigger.focus();
    }
  };

  window.RRYP_OPEN_SEARCH = () => openSearch(openBtn);
  openBtn?.addEventListener("click", () => openSearch(openBtn));
  closeBtn?.addEventListener("click", () => closeSearch(true));
  overlay.addEventListener("click", (e) => {
    if (e.target === overlay) closeSearch(true);
  });
  document.addEventListener("keydown", (e) => {
    if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === "k") {
      e.preventDefault();
      if (overlay.hidden) openSearch(openBtn);
      else closeSearch(true);
      return;
    }
    if (e.key === "Escape" && !overlay.hidden) {
      closeSearch(true);
    }
  });
  input.addEventListener("input", () => render(input.value));
}

initSiteSearch();
