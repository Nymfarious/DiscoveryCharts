import React from "react";

const EkkoLabsPanel: React.FC = () => {
  return (
    <>
      {/* Ekko Labs: side-by-side, non-conflicting IDs */}
      <header className="toolbar" id="ekko-toolbar-labs">
        <div className="toolbar-left">
          <h2 className="ekko-title">Ekko Labs – Experimental</h2>
        </div>
        <div className="toolbar-right">
          <button id="btn-export-labs" className="btn btn-ghost">Export</button>
        </div>
      </header>

      <section id="ekko-panel-labs" className="ekko-panel">
        <div className="ekko-controls" style={{ gap: ".5rem", flexWrap: "wrap" as const }}>
          <button id="ekko-start-labs" className="btn btn-start" aria-label="Start listening (Labs)" title="Start listening (Labs)">
            <svg width="18" height="18" viewBox="0 0 24 24" aria-hidden="true">
              <path d="M12 14a3 3 0 0 0 3-3V6a3 3 0 1 0-6 0v5a3 3 0 0 0 3 3Zm5-3a5 5 0 0 1-10 0H5a7 7 0 0 0 6 6.92V21h2v-3.08A7 7 0 0 0 19 11h-2Z"/>
            </svg>
            <span>Start</span>
          </button>
          <button id="ekko-stop-labs" className="btn btn-stop" aria-label="Stop listening (Labs)" title="Stop listening (Labs)">
            <svg width="18" height="18" viewBox="0 0 24 24" aria-hidden="true">
              <path d="M4.27 3 3 4.27l4.02 4.02A3 3 0 0 0 9 11H7a5 5 0 0 0 8.87 3.2l3.86 3.86L21 17.8l-3.08-3.08A5 5 0 0 0 17 11h2a7 7 0 0 1-1.21 3.92L19.73 17 21 15.73 4.27 3zM15 6a3 3 0 0 0-5.58-1.33L15 9.25V6z"/>
            </svg>
            <span>Stop</span>
          </button>
          <button id="ekko-type-speak-labs" className="btn btn-type" aria-label="Type and Speak (Labs)" title="Type and Speak (Labs)">Type &amp; Speak</button>

          {/* Voice controls */}
          <label htmlFor="ekko-voice-labs" className="sr-only">Voice</label>
          <select id="ekko-voice-labs" className="btn btn-ghost" aria-label="Select voice"></select>

          <label htmlFor="ekko-readback-labs" className="btn btn-ghost" style={{ display: "inline-flex", alignItems: "center", gap: ".4rem" }}>
            <input id="ekko-readback-labs" type="checkbox" />
            Read back
          </label>
        </div>

        {/* Status + transcript (final + interim) */}
        <div id="ekko-status-labs" className="ekko-status" aria-live="polite"></div>
        <div id="ekko-output-labs" className="ekko-output" aria-live="polite"></div>
        <div id="ekko-interim-labs" className="ekko-output ekko-interim" aria-live="polite" />

        {/* Transcript history */}
        <div id="ekko-history-labs" className="ekko-history"></div>
      </section>

      {/* Export modal (Labs) */}
      <div id="export-modal-labs" className="modal hidden" role="dialog" aria-modal="true" aria-labelledby="export-title-labs">
        <div className="modal-content">
          <h3 id="export-title-labs">Export (Labs)</h3>
          <p>Choose an action for your transcript or history.</p>
          <div className="modal-actions">
            <button id="export-copy-labs" className="btn">Copy to Clipboard</button>
            <button id="export-txt-labs" className="btn">Download .txt</button>
            <button id="export-zip-labs" className="btn">Download .zip</button>
            <button id="export-close-labs" className="btn btn-ghost">Close</button>
          </div>
        </div>
      </div>

      {/* Type & Speak modal (Labs) */}
      <div id="speak-modal-labs" className="modal hidden" role="dialog" aria-modal="true" aria-labelledby="speak-title-labs">
        <div className="modal-content speak-modal">
          <h3 id="speak-title-labs">Type &amp; Speak (Labs)</h3>
          <textarea id="speak-text-labs" rows={6} placeholder="Type something for Ekko to say…"></textarea>
          <div id="speak-preview-labs" className="speak-preview" aria-live="polite"></div>
          <div className="modal-actions">
            <button id="speak-submit-labs" className="btn btn-speak">Speak it</button>
            <button id="speak-cancel-labs" className="btn btn-ghost">Cancel</button>
          </div>
        </div>
      </div>
    </>
  );
};

export default EkkoLabsPanel;
