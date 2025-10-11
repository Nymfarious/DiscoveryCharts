// ekko-wiring-v3.js
// Robust init, restart after silence, pretty UI, working Type & Speak and Export
import { createSpeechController, createRecognitionController, safeStorage } from "./safety-helpers.js";

document.addEventListener("DOMContentLoaded", () => {
  const speech = createSpeechController();
  const rec = createRecognitionController({ lang: "en-US", interimResults: false, continuous: true });

  const startBtn = document.getElementById("ekko-start");
  const stopBtn  = document.getElementById("ekko-stop");
  const outEl    = document.getElementById("ekko-output");
  const statusEl = document.getElementById("ekko-status");

  const exportBtn   = document.getElementById("btn-export");
  const exportModal = document.getElementById("export-modal");
  const exportPrint = document.getElementById("export-print");
  const exportEmail = document.getElementById("export-email");
  const exportClose = document.getElementById("export-close");

  const typeBtn   = document.getElementById("ekko-type-speak");
  const speakModal= document.getElementById("speak-modal");
  const speakText = document.getElementById("speak-text") as HTMLTextAreaElement | null;
  const speakPrev = document.getElementById("speak-preview");
  const speakSubmit = document.getElementById("speak-submit");
  const speakCancel = document.getElementById("speak-cancel");

  let shouldListen = false;
  const restartDelay = 400;

  function setListeningUI(on){ if (!statusEl) return; statusEl.classList.toggle("listening", !!on); }

  // Recognition wiring
  if (startBtn && rec) {
    startBtn.addEventListener("click", (e) => {
      e.preventDefault();
      shouldListen = true;
      rec.onText(text => {
        if (outEl) outEl.textContent = text;
        safeStorage.set("ekko:lastTranscript", { text, ts: Date.now() });
      });
      rec.onStart(() => setListeningUI(true));
      rec.onStop(() => {
        if (shouldListen) setTimeout(() => { try{ rec.start(); }catch{} }, restartDelay);
        else setListeningUI(false);
      });
      rec.onError(err => {
        console.warn("ekko recognition error", err);
        if (shouldListen) setTimeout(() => { try{ rec.start(); }catch{} }, restartDelay + 250);
      });
      try { rec.start(); } catch(e) { console.warn("rec.start error", e); }
    });
  }
  if (stopBtn && rec) {
    stopBtn.addEventListener("click", (e) => {
      e.preventDefault();
      shouldListen = false;
      try { rec.stop(); } catch(e) {}
      setListeningUI(false);
    });
  }

  // Export modal
  function openExport(){ if (exportModal) exportModal.classList.remove("hidden"); }
  function closeExport(){ if (exportModal) exportModal.classList.add("hidden"); }
  if (exportBtn)   exportBtn.addEventListener("click", (e)=>{ e.preventDefault(); openExport(); });
  if (exportClose) exportClose.addEventListener("click", (e)=>{ e.preventDefault(); closeExport(); });
  if (exportPrint) exportPrint.addEventListener("click", (e)=>{ e.preventDefault(); window.print(); closeExport(); });
  if (exportEmail) exportEmail.addEventListener("click", (e)=>{
    e.preventDefault();
    const last = safeStorage.get("ekko:lastTranscript", { text: "" });
    const subject = encodeURIComponent("Ekko Transcript");
    const body = encodeURIComponent((last?.text || "").toString());
    window.location.href = `mailto:?subject=${subject}&body=${body}`;
    closeExport();
  });

  // Type & Speak modal
  function openSpeak(){ if (speakModal) speakModal.classList.remove("hidden"); }
  function closeSpeak(){ if (speakModal) speakModal.classList.add("hidden"); }

  if (typeBtn) typeBtn.addEventListener("click", (e)=>{ e.preventDefault(); openSpeak(); });

  if (speakCancel) speakCancel.addEventListener("click", (e)=>{ e.preventDefault(); closeSpeak(); });

  if (speakText && speakPrev) {
    const sync = () => { speakPrev.textContent = speakText.value || ""; };
    speakText.addEventListener("input", sync);
    sync();
  }
  if (speakSubmit && speakText) {
    speakSubmit.addEventListener("click", (e)=>{
      e.preventDefault();
      const text = (speakText.value || "").trim();
      if (!text) return;
      speech.speak(text, { rate: 1, pitch: 1, volume: 1 });
      const history = safeStorage.get("ekko:typedHistory", []) || [];
      history.push({ text, ts: Date.now() });
      safeStorage.set("ekko:typedHistory", history);
      closeSpeak();
    });
  }
});
