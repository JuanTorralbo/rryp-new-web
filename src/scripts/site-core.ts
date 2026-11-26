/**
 * Modulo principal de UI de RRYP Global (compilado, minificado y cacheado por Vite).
 * Cubre: menu de idioma, desplegable de consulta, menu movil, horario en vivo de Madrid,
 * hilo de progreso GPU sin reflow, revelaciones suaves y validacion del formulario.
 */

function initHeaderMenus() {
  const langToggle = document.getElementById("nav-lang-toggle");
  const langPopover = document.getElementById("nav-lang-popover");
  const consultToggle = document.getElementById("consult-toggle");
  const consultPopover = document.getElementById("consult-popover");

  if (langToggle && langPopover) {
    langToggle.addEventListener("click", (e) => {
      e.stopPropagation();
      const open = !langPopover.classList.contains("is-open");
      if (open && consultPopover && !consultPopover.hidden && consultToggle) {
        consultPopover.hidden = true;
        consultToggle.setAttribute("aria-expanded", "false");
      }
      langPopover.classList.toggle("is-open", open);
      langToggle.setAttribute("aria-expanded", String(open));
    });
    document.addEventListener("click", (e) => {
      const target = e.target as Node | null;
      if (
        langPopover.classList.contains("is-open") &&
        target &&
        !langPopover.contains(target) &&
        !langToggle.contains(target)
      ) {
        langPopover.classList.remove("is-open");
        langToggle.setAttribute("aria-expanded", "false");
      }
    });
    document.addEventListener("keydown", (e) => {
      if (e.key === "Escape" && langPopover.classList.contains("is-open")) {
        langPopover.classList.remove("is-open");
        langToggle.setAttribute("aria-expanded", "false");
        langToggle.focus();
      }
    });
  }

  if (consultToggle && consultPopover) {
    consultToggle.addEventListener("click", (e) => {
      if (consultToggle.getAttribute("data-urgent-direct") === "true") return;
      e.stopPropagation();
      const open = consultPopover.hidden;
      if (open && langPopover && langPopover.classList.contains("is-open") && langToggle) {
        langPopover.classList.remove("is-open");
        langToggle.setAttribute("aria-expanded", "false");
      }
      consultPopover.hidden = !open;
      consultToggle.setAttribute("aria-expanded", String(open));
    });
    document.addEventListener("click", (e) => {
      const target = e.target as Node | null;
      if (
        !consultPopover.hidden &&
        target &&
        !consultPopover.contains(target) &&
        !consultToggle.contains(target)
      ) {
        consultPopover.hidden = true;
        consultToggle.setAttribute("aria-expanded", "false");
      }
    });
    document.addEventListener("keydown", (e) => {
      if (e.key === "Escape" && !consultPopover.hidden) {
        consultPopover.hidden = true;
        consultToggle.setAttribute("aria-expanded", "false");
      }
    });
  }
}

function initLanguagePersistence() {
  document.querySelectorAll<HTMLElement>("[data-set-lang]").forEach((link) => {
    link.addEventListener("click", () => {
      const code = link.getAttribute("data-set-lang");
      if (code) {
        document.cookie = `rryp_lang=${encodeURIComponent(code)}; path=/; max-age=31536000; SameSite=Lax`;
        try {
          localStorage.setItem("rryp_lang", code);
        } catch {
          // Modo privado sin localStorage
        }
      }
    });
  });
}

function initMobileMenu() {
  const toggle = document.getElementById("menu-toggle");
  const nav = document.getElementById("main-nav");
  if (!toggle || !nav) return;

  const closeMobileNav = (restoreFocus: boolean) => {
    toggle.setAttribute("aria-expanded", "false");
    nav.classList.remove("is-open");
    if (restoreFocus) toggle.focus();
  };

  toggle.addEventListener("click", (e) => {
    e.stopPropagation();
    const expanded = toggle.getAttribute("aria-expanded") === "true";
    toggle.setAttribute("aria-expanded", String(!expanded));
    nav.classList.toggle("is-open", !expanded);
  });

  nav.querySelectorAll("a").forEach((a) => {
    a.addEventListener("click", () => {
      if (nav.classList.contains("is-open")) closeMobileNav(false);
    });
  });

  document.addEventListener("click", (e) => {
    const target = e.target as Node | null;
    if (nav.classList.contains("is-open") && target && !nav.contains(target) && target !== toggle) {
      closeMobileNav(false);
    }
  });

  document.addEventListener("keydown", (e) => {
    if (e.key === "Escape" && nav.classList.contains("is-open")) {
      closeMobileNav(true);
    }
  });
}

function initOfficeStatus() {
  const statusEls = document.querySelectorAll<HTMLElement>("[data-office-status]");
  if (!statusEls.length) return;

  const updateOfficeStatus = () => {
    let isOpen = false;
    try {
      const parts = new Intl.DateTimeFormat("en-GB", {
        timeZone: "Europe/Madrid",
        weekday: "short",
        hour: "2-digit",
        minute: "2-digit",
        hour12: false,
      }).formatToParts(new Date());
      const map: Record<string, string> = {};
      parts.forEach((p) => {
        map[p.type] = p.value;
      });
      const day = map.weekday;
      const mins = parseInt(map.hour, 10) * 60 + parseInt(map.minute, 10);
      if (day === "Mon" || day === "Tue" || day === "Wed" || day === "Thu") {
        isOpen = (mins >= 540 && mins < 840) || (mins >= 960 && mins < 1155);
      } else if (day === "Fri") {
        isOpen = mins >= 480 && mins < 900;
      }
    } catch {
      isOpen = false;
    }

    statusEls.forEach((el) => {
      el.classList.toggle("is-open", isOpen);
      el.classList.toggle("is-closed", !isOpen);
      el.textContent = isOpen
        ? el.getAttribute("data-open") || ""
        : el.getAttribute("data-closed") || "";
    });
  };

  updateOfficeStatus();
  window.setInterval(updateOfficeStatus, 60000);
}

function initScrollEffects() {
  const progressBar = document.getElementById("scroll-progress");
  let ticking = false;
  let cachedDocH = 1;
  let lastScrolled = false;

  const measureDoc = () => {
    cachedDocH = Math.max(1, document.documentElement.scrollHeight - window.innerHeight);
  };

  const updateScroll = () => {
    ticking = false;
    const y = window.scrollY || window.pageYOffset || 0;
    const scrolled = y > 24;
    if (scrolled !== lastScrolled) {
      lastScrolled = scrolled;
      document.documentElement.classList.toggle("is-scrolled", scrolled);
    }
    if (progressBar) {
      const pct = Math.min(1, Math.max(0, y / cachedDocH));
      progressBar.style.transform = `scaleX(${pct.toFixed(4)}) translateZ(0)`;
    }
  };

  measureDoc();
  window.addEventListener(
    "load",
    () => {
      measureDoc();
      updateScroll();
    },
    { passive: true }
  );
  window.addEventListener(
    "resize",
    () => {
      measureDoc();
      updateScroll();
    },
    { passive: true }
  );
  window.addEventListener(
    "scroll",
    () => {
      if (!ticking) {
        ticking = true;
        window.requestAnimationFrame(updateScroll);
      }
    },
    { passive: true }
  );
  updateScroll();

  const reduced = window.matchMedia && window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  const reveals = document.querySelectorAll<HTMLElement>("[data-reveal]");

  if (reduced || !("IntersectionObserver" in window)) {
    reveals.forEach((el) => {
      el.classList.add("is-visible", "is-settled");
    });
    return;
  }

  // Revelaciones bidireccionales suaves (al bajar y al volver a subir, sin parpadeos ni lag en hover)
  if (reveals.length) {
    document.documentElement.classList.add("js-enhanced");
    const settleTimers = new WeakMap<Element, number>();

    const io = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          const target = entry.target as HTMLElement;
          const prevTimer = settleTimers.get(target);
          if (prevTimer) {
            window.clearTimeout(prevTimer);
            settleTimers.delete(target);
          }

          if (entry.isIntersecting) {
            target.classList.add("is-visible");
            const delayRaw = target.style.getPropertyValue("--reveal-delay").trim();
            const delayMs = delayRaw.endsWith("ms") ? parseFloat(delayRaw) || 0 : 0;
            const tId = window.setTimeout(() => {
              target.classList.add("is-settled");
              settleTimers.delete(target);
            }, 520 + delayMs);
            settleTimers.set(target, tId);
          } else if (entry.intersectionRatio === 0) {
            // Solo reinicia cuando el bloque esta 100% fuera del viewport real (0 parpadeos)
            const rect = entry.boundingClientRect;
            if (rect.bottom <= 0) {
              target.classList.add("reveal-from-top");
              target.classList.remove("is-visible", "is-settled");
            } else if (rect.top >= window.innerHeight) {
              target.classList.remove("reveal-from-top", "is-visible", "is-settled");
            }
          }
        });
      },
      { threshold: [0, 0.06], rootMargin: "0px 0px -8px 0px" }
    );
    reveals.forEach((el) => io.observe(el));
  }

  // Re-animacion editorial del hero al volver arriba del todo tras haber bajado
  const heroSections = document.querySelectorAll<HTMLElement>(".hero, .subhero");
  if (heroSections.length) {
    const heroIo = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          const hero = entry.target as HTMLElement;
          if (!entry.isIntersecting && entry.boundingClientRect.bottom <= 0) {
            hero.classList.remove("hero-replaying");
            hero.classList.add("hero-ready-replay");
          } else if (entry.isIntersecting && hero.classList.contains("hero-ready-replay")) {
            hero.classList.remove("hero-ready-replay");
            // Forzar reinicio limpio de la animacion CSS solo una vez al entrar
            void hero.offsetWidth;
            hero.classList.add("hero-replaying");
            window.setTimeout(() => {
              hero.classList.remove("hero-replaying");
            }, 950);
          }
        });
      },
      { threshold: [0, 0.08] }
    );
    heroSections.forEach((h) => heroIo.observe(h));
  }
}

function initIntakeForm() {
  const form = document.getElementById("footer-intake-form") as HTMLFormElement | null;
  const fb = document.getElementById("footer-form-feedback");
  const directBox = document.getElementById("footer-form-direct");
  if (!form || !fb) return;

  const emailRe = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  const submitBtn = form.querySelector<HTMLButtonElement>('button[type="submit"]');

  form.addEventListener("submit", async (e) => {
    e.preventDefault();
    const name = document.getElementById("f-name") as HTMLInputElement | null;
    const email = document.getElementById("f-email") as HTMLInputElement | null;
    const phone = document.getElementById("f-phone") as HTMLInputElement | null;
    const country = document.getElementById("f-country") as HTMLInputElement | null;
    const website = document.getElementById("f-website") as HTMLInputElement | null;
    const msg = document.getElementById("f-message") as HTMLTextAreaElement | null;
    const consent = document.getElementById("f-consent") as HTMLInputElement | null;
    if (!name || !email || !msg || !consent) return;

    [name, email, msg, consent].forEach((el) => el.removeAttribute("aria-invalid"));
    if (directBox) directBox.hidden = true;

    if (!name.value.trim() || !email.value.trim() || !msg.value.trim() || !consent.checked) {
      let firstBad: HTMLElement | null = null;
      if (!name.value.trim()) {
        name.setAttribute("aria-invalid", "true");
        firstBad = firstBad || name;
      }
      if (!email.value.trim()) {
        email.setAttribute("aria-invalid", "true");
        firstBad = firstBad || email;
      }
      if (!msg.value.trim()) {
        msg.setAttribute("aria-invalid", "true");
        firstBad = firstBad || msg;
      }
      if (!consent.checked) {
        consent.setAttribute("aria-invalid", "true");
        firstBad = firstBad || consent;
      }
      fb.textContent = form.getAttribute("data-msg-error") || "";
      if (firstBad) firstBad.focus();
      return;
    }

    if (!emailRe.test(email.value.trim())) {
      email.setAttribute("aria-invalid", "true");
      fb.textContent = form.getAttribute("data-msg-email") || form.getAttribute("data-msg-error") || "";
      email.focus();
      return;
    }

    const payload = {
      name: name.value.trim(),
      email: email.value.trim(),
      phone: phone ? phone.value.trim() : "",
      country: country ? country.value.trim() : "",
      message: msg.value.trim(),
      website: website ? website.value.trim() : "",
    };

    const summary = [
      "RRYP Global Inquiry",
      `Name: ${payload.name}`,
      `Email: ${payload.email}`,
      payload.phone ? `Phone: ${payload.phone}` : "",
      payload.country ? `Country: ${payload.country}` : "",
      "",
      payload.message,
    ]
      .filter(Boolean)
      .join("\n");

    let sentViaEdge = false;
    if (submitBtn) submitBtn.disabled = true;
    try {
      const res = await fetch("/api/contact", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      if (res.ok) {
        const data = (await res.json().catch(() => ({}))) as { ok?: boolean };
        sentViaEdge = Boolean(data.ok);
      }
    } catch {
      sentViaEdge = false;
    } finally {
      if (submitBtn) submitBtn.disabled = false;
    }

    fb.textContent = form.getAttribute("data-msg-success") || "";
    if (directBox && !sentViaEdge) {
      const mailHref =
        `mailto:info@rrypglobal.com?subject=${encodeURIComponent(`Consulta jurídica RRYP Global - ${payload.name}`)}` +
        `&body=${encodeURIComponent(summary)}`;
      const waHref = `https://wa.me/34957858952?text=${encodeURIComponent(summary)}`;

      directBox.innerHTML = "";
      const note = document.createElement("p");
      note.className = "footer-form-direct-note";
      note.textContent = form.getAttribute("data-msg-direct") || "";

      const links = document.createElement("div");
      links.className = "footer-form-direct-links";

      const aMail = document.createElement("a");
      aMail.href = mailHref;
      aMail.className = "btn btn--outline-dark btn--compact";
      aMail.textContent = form.getAttribute("data-btn-email") || "Email";

      const aWa = document.createElement("a");
      aWa.href = waHref;
      aWa.target = "_blank";
      aWa.rel = "noopener noreferrer";
      aWa.className = "btn btn--outline-dark btn--compact";
      aWa.textContent = form.getAttribute("data-btn-wa") || "WhatsApp";

      links.appendChild(aMail);
      links.appendChild(aWa);
      directBox.appendChild(note);
      directBox.appendChild(links);
      directBox.hidden = false;
    }
    form.reset();
  });
}

function initNavDropdowns() {
  const navItems = Array.from(document.querySelectorAll<HTMLElement>("[data-nav-item]"));
  if (!navItems.length) return;

  const closeAll = (except?: HTMLElement | null) => {
    navItems.forEach((item) => {
      if (item === except) return;
      item.classList.remove("is-open");
      const btn = item.querySelector<HTMLButtonElement>("[data-nav-toggle]");
      btn?.setAttribute("aria-expanded", "false");
    });
  };

  navItems.forEach((item) => {
    const btn = item.querySelector<HTMLButtonElement>("[data-nav-toggle]");
    if (!btn) return;
    btn.addEventListener("click", (e) => {
      e.preventDefault();
      e.stopPropagation();
      const willOpen = !item.classList.contains("is-open");
      closeAll(item);
      item.classList.toggle("is-open", willOpen);
      btn.setAttribute("aria-expanded", String(willOpen));
    });
  });

  document.addEventListener("click", (e) => {
    const target = e.target as Node | null;
    if (target && navItems.some((item) => item.contains(target))) return;
    closeAll();
  });

  document.addEventListener("keydown", (e) => {
    if (e.key === "Escape") {
      const openItem = navItems.find((item) => item.classList.contains("is-open"));
      if (openItem) {
        const btn = openItem.querySelector<HTMLButtonElement>("[data-nav-toggle]");
        closeAll();
        btn?.focus();
      }
    }
  });
}

function initDocTocScrollspy() {
  const tocLinks = Array.from(document.querySelectorAll<HTMLAnchorElement>(".doc-toc-list a[href^='#']"));
  if (!tocLinks.length || !("IntersectionObserver" in window)) return;

  const pairs = tocLinks
    .map((link) => {
      const id = decodeURIComponent(link.getAttribute("href")?.slice(1) || "");
      const heading = id ? document.getElementById(id) : null;
      return heading ? { link, heading } : null;
    })
    .filter((p): p is { link: HTMLAnchorElement; heading: HTMLElement } => Boolean(p));

  if (!pairs.length) return;

  const setActive = (activeLink: HTMLAnchorElement) => {
    pairs.forEach(({ link }) => {
      const isCurrent = link === activeLink;
      link.classList.toggle("is-active", isCurrent);
      if (isCurrent) link.setAttribute("aria-current", "location");
      else link.removeAttribute("aria-current");
    });
  };

  setActive(pairs[0].link);

  const io = new IntersectionObserver(
    (entries) => {
      const visible = entries
        .filter((e) => e.isIntersecting)
        .sort((a, b) => a.boundingClientRect.top - b.boundingClientRect.top);
      if (visible.length) {
        const match = pairs.find((p) => p.heading === visible[0].target);
        if (match) setActive(match.link);
      }
    },
    { rootMargin: "-96px 0px -65% 0px", threshold: 0 }
  );

  pairs.forEach(({ heading }) => io.observe(heading));
}

function initDocUtilities() {
  document.querySelectorAll<HTMLButtonElement>("[data-copy-url]").forEach((btn) => {
    btn.addEventListener("click", async () => {
      const url = window.location.href;
      const original = btn.textContent || "";
      const copied = btn.getAttribute("data-copied-label") || "Copied";
      try {
        await navigator.clipboard.writeText(url);
        btn.textContent = copied;
        btn.classList.add("is-copied");
        window.setTimeout(() => {
          btn.textContent = original;
          btn.classList.remove("is-copied");
        }, 2000);
      } catch {
        // Fallback silencioso si el navegador bloquea clipboard
      }
    });
  });

  document.querySelectorAll<HTMLButtonElement>("[data-print-doc]").forEach((btn) => {
    btn.addEventListener("click", () => window.print());
  });
}

initHeaderMenus();
initNavDropdowns();
initLanguagePersistence();
initMobileMenu();
initOfficeStatus();
initScrollEffects();
initIntakeForm();
initDocTocScrollspy();
initDocUtilities();
