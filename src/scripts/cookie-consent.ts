/**
 * Gestor de consentimiento RGPD / LSSI (replica fiel de Complianz) compilado por Vite.
 */

export interface ConsentState {
  functional: boolean;
  preferences: boolean;
  statistics: boolean;
  marketing: boolean;
  ts?: number;
}

declare global {
  interface Window {
    RRYP_CONSENT?: ConsentState;
    RRYP_SET_CONSENT?: (partial: Partial<ConsentState>) => void;
  }
}

const STORAGE_KEY = "rryp_cookie_consent_v1";

function initCookieConsent() {
  const dialog = document.getElementById("rryp-cookie-dialog");
  const manageBtn = document.getElementById("rryp-cookie-manage-btn");
  const prefsPanel = document.getElementById("cookie-prefs-panel");
  const acceptBtn = document.getElementById("cookie-accept-btn");
  const denyBtn = document.getElementById("cookie-deny-btn");
  const prefsBtn = document.getElementById("cookie-prefs-btn");
  const saveBtn = document.getElementById("cookie-save-btn");
  const closeBtn = document.getElementById("cookie-close-btn");
  const optPref = document.getElementById("cookie-opt-preferences") as HTMLInputElement | null;
  const optStat = document.getElementById("cookie-opt-statistics") as HTMLInputElement | null;
  const optMkt = document.getElementById("cookie-opt-marketing") as HTMLInputElement | null;

  if (!dialog || !manageBtn) return;

  const readConsent = (): ConsentState | null => {
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      if (raw) return JSON.parse(raw) as ConsentState;
    } catch {
      // ignore storage errors
    }
    const m = document.cookie.match(/(?:^|;\s*)rryp_consent=([^;]+)/);
    if (m) {
      try {
        return JSON.parse(decodeURIComponent(m[1])) as ConsentState;
      } catch {
        // ignore cookie parse error
      }
    }
    return null;
  };

  const applyConsent = (state: ConsentState) => {
    window.RRYP_CONSENT = state;
    if (optPref) optPref.checked = Boolean(state.preferences);
    if (optStat) optStat.checked = Boolean(state.statistics);
    if (optMkt) optMkt.checked = Boolean(state.marketing);
    window.dispatchEvent(new CustomEvent<ConsentState>("rryp:consent", { detail: state }));
  };

  const persistConsent = (state: Partial<ConsentState>) => {
    const payload: ConsentState = {
      functional: true,
      preferences: Boolean(state.preferences),
      statistics: Boolean(state.statistics),
      marketing: Boolean(state.marketing),
      ts: Date.now(),
    };
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(payload));
    } catch {
      // ignore storage errors
    }
    document.cookie = `rryp_consent=${encodeURIComponent(JSON.stringify(payload))}; path=/; max-age=15552000; SameSite=Lax`;
    applyConsent(payload);
    dialog.hidden = true;
    manageBtn.hidden = false;
  };

  const openDialog = (showPrefs: boolean) => {
    const current = readConsent() || {
      functional: true,
      preferences: false,
      statistics: false,
      marketing: false,
    };
    if (optPref) optPref.checked = Boolean(current.preferences);
    if (optStat) optStat.checked = Boolean(current.statistics);
    if (optMkt) optMkt.checked = Boolean(current.marketing);
    if (prefsPanel && prefsBtn && saveBtn) {
      prefsPanel.hidden = !showPrefs;
      prefsBtn.hidden = showPrefs;
      saveBtn.hidden = !showPrefs;
    }
    dialog.hidden = false;
    manageBtn.hidden = true;
  };

  window.RRYP_SET_CONSENT = (partial) => {
    const prev = readConsent() || {
      functional: true,
      preferences: false,
      statistics: false,
      marketing: false,
    };
    persistConsent({
      preferences: "preferences" in partial ? partial.preferences : prev.preferences,
      statistics: "statistics" in partial ? partial.statistics : prev.statistics,
      marketing: "marketing" in partial ? partial.marketing : prev.marketing,
    });
  };

  const saved = readConsent();
  if (saved) {
    applyConsent(saved);
    dialog.hidden = true;
    manageBtn.hidden = false;
  } else {
    applyConsent({ functional: true, preferences: false, statistics: false, marketing: false });
    dialog.hidden = false;
    manageBtn.hidden = true;
  }

  acceptBtn?.addEventListener("click", () => {
    persistConsent({ preferences: true, statistics: true, marketing: true });
  });
  denyBtn?.addEventListener("click", () => {
    persistConsent({ preferences: false, statistics: false, marketing: false });
  });
  if (prefsBtn && prefsPanel && saveBtn) {
    prefsBtn.addEventListener("click", () => {
      prefsPanel.hidden = false;
      prefsBtn.hidden = true;
      saveBtn.hidden = false;
    });
  }
  saveBtn?.addEventListener("click", () => {
    persistConsent({
      preferences: optPref ? optPref.checked : false,
      statistics: optStat ? optStat.checked : false,
      marketing: optMkt ? optMkt.checked : false,
    });
  });
  closeBtn?.addEventListener("click", () => {
    dialog.hidden = true;
    manageBtn.hidden = false;
  });
  dialog.querySelectorAll(".cookie-switch").forEach((sw) => {
    sw.addEventListener("click", (ev) => ev.stopPropagation());
  });
  manageBtn.addEventListener("click", () => openDialog(true));
}

initCookieConsent();
