// ekko-wiring-v2.js
// Ekko v2 wiring: auto-restart recognition, green pill status, Type & Speak modal
import { createSpeechController, createRecognitionController, safeStorage } from "./safety-helpers.js";

const speech = createSpeechController();
const rec = createRecognitionController({ lang: "en-US", interimResults: false, continuous: false });

// Helpers
const $ = (sel) => document.querySelector(sel);
const getEl = (id) => document.getElementById(id);

function showModal(id, show) {
  const m = getEl(id);
  if (!m) return;
  m.classList.toggle("hidden", !show);
}

function setStatus(text) {
  const pill = getEl("ekko-status");
  if (!pill) return;
  pill.textContent = text;
  pill.classList.remove("hidden");
}

function hideStatus() {
  const pill = getEl("ekko-status");
  if (!pill) return;
  pill.classList.add("hidden");
}

// Auto-restart flags
let autoRestart = false;
let manualStop = false;

// Bind recognition events
rec.onText((text) => {
  setStatus(text);
  safeStorage.set("ekko:lastTranscript", { text, ts: Date.now() });
});

rec.onStart(() => {
  setStatus("[listening…]");
});

rec.onStop(() => {
  // Do NOT append "[stopped]"; optionally auto-restart
  if (manualStop) {
    autoRestart = false;
    manualStop = false;
    hideStatus();
    return;
  }
  if (autoRestart) {
    setTimeout(() => {
      try {
        rec.start();
        setStatus("[listening…]");
      } catch (e) {
        console.warn("rec.start error", e);
      }
    }, 250);
  }
});

rec.onError((err) => {
  console.warn("ekko v2 recognition error", err);
});

// Event delegation so SPA routes work reliably
function bind() {
  document.addEventListener("click", (ev) => {
    const t = ev.target;
    if (!(t instanceof Element)) return;

    if (t.closest("#ekko-start")) {
      autoRestart = true;
      manualStop = false;
      try { rec.start(); } catch (e) { console.warn("rec.start error", e); }
    }

    if (t.closest("#ekko-stop")) {
      manualStop = true;
      try { rec.stop(); } catch (e) { console.warn("rec.stop error", e); }
    }

    if (t.closest("#btn-export")) {
      showModal("export-modal", true);
    }

    if (t.closest("#export-close") || t.classList.contains("modal")) {
      showModal("export-modal", false);
      showModal("type-speak-modal", false);
    }

    if (t.closest("#export-print")) {
      window.print();
    }

    if (t.closest("#btn-email") || t.closest("#export-email")) {
      const latest = safeStorage.get("ekko:lastTranscript");
      const text = typeof latest === "string" ? latest : latest?.text || "";
      const subject = "Little Sister Ekko Transcript";
      const email = ""; // open user's mail client
      window.location.href = `mailto:${email}?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(text)}`;
    }

    // Type & Speak modal
    if (t.closest("#btn-type-speak")) {
      showModal("type-speak-modal", true);
      const input = getEl("type-speak-input");
      const preview = getEl("type-speak-preview");
      if (input && preview) {
        preview.textContent = input.value || "";
      }
    }

    if (t.closest("#ts-close")) {
      showModal("type-speak-modal", false);
    }

    if (t.closest("#type-speak-say")) {
      const input = getEl("type-speak-input");
      const text = input && 'value' in input ? input.value : "";
      if (text) {
        speech.speak(text, { rate: 1, pitch: 1, volume: 1 });
        // Save to typed history
        try {
          const history = safeStorage.get("ekko:typedHistory") || [];
          const arr = Array.isArray(history) ? history : [];
          arr.push({ text, ts: Date.now() });
          safeStorage.set("ekko:typedHistory", arr);
        } catch (e) {
          console.warn("typedHistory save error", e);
        }
      }
    }
  });

  // Live preview typing
  document.addEventListener("input", (ev) => {
    const t = ev.target;
    if (!(t instanceof Element)) return;
    if (t.id === "type-speak-input") {
      const preview = getEl("type-speak-preview");
      if (preview) preview.textContent = (t).value || "";
    }
  });

  // Escape to close any open modal
  document.addEventListener("keydown", (e) => {
    if (e.key === "Escape") {
      showModal("export-modal", false);
      showModal("type-speak-modal", false);
    }
  });
}

bind();
