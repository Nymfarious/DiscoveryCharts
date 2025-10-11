// safety-helpers.js
// Hardened helpers for storage, fetch, and speech APIs

export const safeStorage = {
  get(key, fallback = null) {
    try {
      const v = localStorage.getItem(key);
      return v !== null ? JSON.parse(v) : fallback;
    } catch (e) {
      console.warn("safeStorage.get error", e);
      return fallback;
    }
  },
  set(key, value) {
    try {
      localStorage.setItem(key, JSON.stringify(value));
      return true;
    } catch (e) {
      console.warn("safeStorage.set error", e);
      return false;
    }
  },
  remove(key) {
    try {
      localStorage.removeItem(key);
      return true;
    } catch (e) {
      console.warn("safeStorage.remove error", e);
      return false;
    }
  }
};

export async function safeFetch(input, init = {}) {
  try {
    const res = await fetch(input, init);
    if (!res.ok) {
      const text = await res.text().catch(() => "");
      throw new Error(`HTTP ${res.status} ${res.statusText} – ${text.slice(0,200)}`);
    }
    const ct = (res.headers.get("content-type") || "").toLowerCase();
    if (ct.includes("application/json")) return await res.json();
    return await res.text();
  } catch (e) {
    console.error("safeFetch error:", e);
    throw e;
  }
}

// Speech helpers
export function createSpeechController() {
  const synth = window.speechSynthesis;
  let voices = [];
  let ready = false;
  let pendingUtterance = null;

  function loadVoices() {
    voices = synth ? synth.getVoices() : [];
    ready = voices && voices.length > 0;
    if (ready && pendingUtterance) {
      speak(pendingUtterance.text, pendingUtterance.options);
      pendingUtterance = null;
    }
    return voices;
  }

  if (synth && typeof synth.onvoiceschanged !== "undefined") {
    synth.onvoiceschanged = loadVoices;
  }
  setTimeout(loadVoices, 0);

  function speak(text, { voiceName=null, rate=1, pitch=1, volume=1 } = {}) {
    if (!synth) return console.warn("speechSynthesis not supported.");
    const u = new SpeechSynthesisUtterance(text);
    if (voiceName) {
      const v = voices.find(v => v.name === voiceName);
      if (v) u.voice = v;
    }
    u.rate = rate; u.pitch = pitch; u.volume = volume;
    if (!ready) {
      pendingUtterance = { text, options: { voiceName, rate, pitch, volume } };
      loadVoices();
      return;
    }
    synth.cancel();
    synth.speak(u);
  }

  function stop() { if (synth) synth.cancel(); }

  return { getVoices: () => voices, speak, stop, loadVoices };
}

export function createRecognitionController({ lang="en-US", interimResults=false, continuous=false } = {}) {
  const Rec = window.SpeechRecognition || window.webkitSpeechRecognition;
  if (!Rec) { console.warn("SpeechRecognition not supported."); return null; }
  const rec = new Rec();
  rec.lang = lang;
  rec.interimResults = interimResults;
  rec.continuous = continuous;

  let onText = () => {};
  let onStart = () => {};
  let onStop = () => {};
  let onError = () => {};

  rec.onresult = (e) => {
    let finalTranscript = "";
    for (let i = e.resultIndex; i < e.results.length; i++) {
      const res = e.results[i];
      if (res.isFinal) finalTranscript += res[0].transcript;
    }
    if (finalTranscript) onText(finalTranscript);
  };
  rec.onstart = () => onStart();
  rec.onend = () => onStop();
  rec.onerror = (e) => onError(e);

  return {
    start() { try { rec.start(); } catch(e) { console.warn("rec.start error", e); } },
    stop()  { try { rec.stop();  } catch(e) { console.warn("rec.stop error", e); } },
    onText(cb)  { onText  = cb; },
    onStart(cb) { onStart = cb; },
    onStop(cb)  { onStop  = cb; },
    onError(cb) { onError = cb; },
    instance: rec
  };
}
