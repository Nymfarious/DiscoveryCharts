// ekko-wiring.js
// Example UI wiring for Ekko using safety-helpers
import { createSpeechController, createRecognitionController, safeStorage } from "./safety-helpers.js";

const speech = createSpeechController();
const rec = createRecognitionController({ lang: "en-US", interimResults: false, continuous: false });

// Query helpers
const $ = (sel) => document.querySelector(sel);
const out = () => document.getElementById("ekko-output");

function populateVoices() {
  const voices = speech.getVoices() || [];
  const voiceSel = document.getElementById("ekko-voice");
  if (!voiceSel) return;
  voiceSel.innerHTML = "";
  voices.forEach((v) => {
    const opt = document.createElement("option");
    opt.value = v.name;
    opt.textContent = `${v.name} (${v.lang})`;
    voiceSel.appendChild(opt);
  });
}

// Try after TTS is ready
setTimeout(populateVoices, 250);

// Direct bindings if elements already exist
const startBtn = document.getElementById("ekko-start");
const stopBtn = document.getElementById("ekko-stop");
const sayBtn = document.getElementById("ekko-say");
const inputEl = document.getElementById("ekko-input");

if (sayBtn && inputEl) {
  sayBtn.addEventListener("click", () => {
    const voiceSel = document.getElementById("ekko-voice");
    const voiceName = voiceSel?.value || null;
    const text = inputEl.value || "Hello from Ekko.";
    speech.speak(text, { voiceName, rate: 1, pitch: 1, volume: 1 });
    if (out()) out().textContent = `↳ Speaking: ${text}`;
  });
}

function bindRecognition() {
  if (!rec) return;
  rec.onText((text) => {
    if (out()) out().textContent = text;
    safeStorage.set("ekko:lastTranscript", { text, ts: Date.now() });
  });
  rec.onStart(() => {
    if (out()) out().textContent = "[listening…]";
  });
  rec.onStop(() => {
    if (out()) out().textContent = `${out()?.textContent || ""} [stopped]`;
  });
  rec.onError((err) => {
    console.warn("ekko recognition error", err);
  });
}

// Event delegation so SPA routes work reliably
bindRecognition();

document.addEventListener("click", (ev) => {
  const t = ev.target;
  if (!(t instanceof Element)) return;

  if (t.closest("#ekko-start")) {
    bindRecognition();
    try { rec?.start(); } catch (e) { console.warn("rec.start error", e); }
  }

  if (t.closest("#ekko-stop")) {
    try { rec?.stop(); } catch (e) { console.warn("rec.stop error", e); }
  }

  if (t.closest("#ekko-say")) {
    const voiceSel = document.getElementById("ekko-voice");
    const inputEl2 = document.getElementById("ekko-input");
    const text = (inputEl2 && 'value' in inputEl2) ? (inputEl2).value : "Hello from Ekko.";
    const voiceName = voiceSel?.value || null;
    speech.speak(text, { voiceName, rate: 1, pitch: 1, volume: 1 });
    if (out()) out().textContent = `↳ Speaking: ${text}`;
  }

  // Toolbar actions
  if (t.closest("#btn-export")) {
    showModal(true);
  }
  if (t.closest("#btn-email") || t.closest("#export-email")) {
    const latest = safeStorage.get("ekko:lastTranscript");
    const text = typeof latest === "string" ? latest : latest?.text || "";
    const subject = "Little Sister Ekko Transcript";
    const email = ""; // leave empty to open user's mail client
    window.location.href = `mailto:${email}?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(text)}`;
  }
  if (t.closest("#export-print")) {
    window.print();
  }
  if (t.closest("#export-close") || t.classList.contains("modal")) {
    showModal(false);
  }
});

function showModal(show) {
  const m = document.getElementById("export-modal");
  if (!m) return;
  m.classList.toggle("hidden", !show);
}

// Escape to close modal
document.addEventListener("keydown", (e) => {
  if (e.key === "Escape") showModal(false);
});
