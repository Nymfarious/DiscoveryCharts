// ekko-wiring-labs.js
// Experimental panel with interim results, history, enhanced export, voice selection, and shortcuts
import JSZip from "jszip";
import { createSpeechController, createRecognitionController, safeStorage } from "./safety-helpers.js";

document.addEventListener("DOMContentLoaded", () => {
  const speech = createSpeechController();
  let rec = createRecognitionController({ lang: "en-US", interimResults: true, continuous: true });

  // Elements
  const startBtn = document.getElementById("ekko-start-labs");
  const stopBtn = document.getElementById("ekko-stop-labs");
  const outEl = document.getElementById("ekko-output-labs");
  const interimEl = document.getElementById("ekko-interim-labs");
  const statusEl = document.getElementById("ekko-status-labs");
  const historyEl = document.getElementById("ekko-history-labs");

  const exportBtn = document.getElementById("btn-export-labs");
  const exportModal = document.getElementById("export-modal-labs");
  const exportCopy = document.getElementById("export-copy-labs");
  const exportTxt = document.getElementById("export-txt-labs");
  const exportZip = document.getElementById("export-zip-labs");
  const exportClose = document.getElementById("export-close-labs");

  const typeBtn = document.getElementById("ekko-type-speak-labs");
  const speakModal = document.getElementById("speak-modal-labs");
  const speakText = document.getElementById("speak-text-labs");
  const speakPrev = document.getElementById("speak-preview-labs");
  const speakSubmit = document.getElementById("speak-submit-labs");
  const speakCancel = document.getElementById("speak-cancel-labs");

  const voiceSelect = document.getElementById("ekko-voice-labs");
  const readbackToggle = document.getElementById("ekko-readback-labs");

  if (!startBtn || !stopBtn || !outEl || !statusEl) return; // Only wire if Labs panel exists

  // UI helpers
  function setListeningUI(on) { statusEl.classList.toggle("listening", !!on); }
  function openExport(){ exportModal?.classList.remove("hidden"); }
  function closeExport(){ exportModal?.classList.add("hidden"); }
  function openSpeak(){ speakModal?.classList.remove("hidden"); }
  function closeSpeak(){ speakModal?.classList.add("hidden"); }

  // Load voices into picker
  function refreshVoices(){
    if (!voiceSelect) return;
    const vs = speech.getVoices();
    voiceSelect.innerHTML = "";
    vs.forEach(v => {
      const opt = document.createElement("option");
      opt.value = v.name; opt.textContent = v.name;
      voiceSelect.appendChild(opt);
    });
    // select persisted
    const saved = safeStorage.get("ekko:labsVoiceName", null);
    if (saved) voiceSelect.value = saved;
  }
  speech.loadVoices();
  setTimeout(refreshVoices, 100);
  if (typeof speechSynthesis !== "undefined") speechSynthesis.onvoiceschanged = () => setTimeout(refreshVoices, 0);

  if (voiceSelect) voiceSelect.addEventListener("change", () => {
    safeStorage.set("ekko:labsVoiceName", voiceSelect.value);
  });

  if (readbackToggle) {
    const persisted = !!safeStorage.get("ekko:labsReadback", false);
    readbackToggle.checked = persisted;
    readbackToggle.addEventListener("change", () => safeStorage.set("ekko:labsReadback", !!readbackToggle.checked));
  }

  // History management
  function getHistory(){ return safeStorage.get("ekko:labsHistory", []) || []; }
  function setHistory(arr){ safeStorage.set("ekko:labsHistory", arr); renderHistory(); }
  function pushHistory(text){ const h = getHistory(); h.push({ text, ts: Date.now() }); setHistory(h); }
  function renderHistory(){
    if (!historyEl) return;
    const h = getHistory();
    historyEl.innerHTML = h.map(item => `
      <div class="history-item">
        <span class="history-time">${new Date(item.ts).toLocaleString()}</span>
        <div>${(item.text || "").toString().replace(/</g, "&lt;")}</div>
      </div>`
    ).join("");
  }
  renderHistory();

  // Recognition wiring with interim
  let shouldListen = false;
  const restartDelay = 350;

  function startRec(){
    if (!rec) return;
    shouldListen = true;
    // Override onresult to include interim
    const native = rec.instance;
    if (!native) return;
    native.onresult = (e) => {
      let finalText = "";
      let interimText = "";
      for (let i = e.resultIndex; i < e.results.length; i++) {
        const res = e.results[i];
        if (res.isFinal) finalText += res[0].transcript;
        else interimText += res[0].transcript;
      }
      if (interimEl) interimEl.textContent = interimText;
      if (finalText) {
        outEl.textContent = finalText;
        safeStorage.set("ekko:labsLastTranscript", { text: finalText, ts: Date.now() });
        pushHistory(finalText);
        // optional readback
        const readback = !!safeStorage.get("ekko:labsReadback", false);
        const voiceName = safeStorage.get("ekko:labsVoiceName", null);
        if (readback) speech.speak(finalText, { voiceName, rate: 1 });
      }
    };
    rec.onStart(() => setListeningUI(true));
    rec.onStop(() => {
      if (shouldListen) setTimeout(() => { try{ rec.start(); } catch {} }, restartDelay);
      else setListeningUI(false);
    });
    rec.onError(() => {
      if (shouldListen) setTimeout(() => { try{ rec.start(); } catch {} }, restartDelay + 200);
    });
    try { rec.start(); } catch(e) {}
  }
  function stopRec(){ shouldListen = false; try { rec?.stop(); } catch(e) {} setListeningUI(false); }

  startBtn.addEventListener("click", (e)=>{ e.preventDefault(); startRec(); });
  stopBtn.addEventListener("click", (e)=>{ e.preventDefault(); stopRec(); });

  // Type & Speak
  if (typeBtn) typeBtn.addEventListener("click", (e)=>{ e.preventDefault(); openSpeak(); });
  if (speakCancel) speakCancel.addEventListener("click", (e)=>{ e.preventDefault(); closeSpeak(); });
  if (speakText && speakPrev) {
    const sync = () => { speakPrev.textContent = speakText.value || ""; };
    speakText.addEventListener("input", sync); sync();
  }
  if (speakSubmit && speakText) {
    speakSubmit.addEventListener("click", (e)=>{
      e.preventDefault();
      const text = (speakText.value || "").trim(); if (!text) return;
      const voiceName = safeStorage.get("ekko:labsVoiceName", null);
      speech.speak(text, { voiceName, rate: 1 });
      const history = getHistory(); history.push({ text, ts: Date.now() }); setHistory(history);
      closeSpeak();
    });
  }

  // Export actions
  function collectText(){
    const h = getHistory();
    const lines = h.map(item => `[${new Date(item.ts).toLocaleString()}] ${item.text}`);
    const current = (safeStorage.get("ekko:labsLastTranscript", { text: "" })?.text || "").toString();
    return { current, history: lines.join("\n") };
  }

  if (exportBtn) exportBtn.addEventListener("click", (e)=>{ e.preventDefault(); openExport(); });
  if (exportClose) exportClose.addEventListener("click", (e)=>{ e.preventDefault(); closeExport(); });
  if (exportCopy) exportCopy.addEventListener("click", async (e)=>{
    e.preventDefault();
    const { history } = collectText();
    try { await navigator.clipboard.writeText(history); } catch {}
    closeExport();
  });
  if (exportTxt) exportTxt.addEventListener("click", (e)=>{
    e.preventDefault();
    const { history } = collectText();
    const blob = new Blob([history], { type: "text/plain;charset=utf-8" });
    const a = document.createElement("a"); a.href = URL.createObjectURL(blob); a.download = "ekko-history.txt"; a.click();
    closeExport();
  });
  if (exportZip) exportZip.addEventListener("click", async (e)=>{
    e.preventDefault();
    const { current, history } = collectText();
    const zip = new JSZip();
    zip.file("current.txt", current);
    zip.file("history.txt", history);
    const content = await zip.generateAsync({ type: "blob" });
    const a = document.createElement("a"); a.href = URL.createObjectURL(content); a.download = "ekko-export.zip"; a.click();
    closeExport();
  });

  // Shortcuts (shift+S start, shift+X stop, shift+E export, shift+T type)
  document.addEventListener("keydown", (e) => {
    if (!e.shiftKey) return;
    const k = e.key.toLowerCase();
    if (k === "s") { e.preventDefault(); startRec(); }
    else if (k === "x") { e.preventDefault(); stopRec(); }
    else if (k === "e") { e.preventDefault(); openExport(); }
    else if (k === "t") { e.preventDefault(); openSpeak(); }
  });
});
