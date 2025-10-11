import React from "react";

const EkkoClassicPanel: React.FC = () => {
  return (
    <>
      {/* EKKO v3: Toolbar (Export only) */}
      <header className="toolbar" id="ekko-toolbar">
        <div className="toolbar-left">
          <h2 className="ekko-title">Ekko – Voice Capture</h2>
        </div>
        <div className="toolbar-right">
          <button id="btn-export" className="btn btn-ghost">Export</button>
        </div>
      </header>

      <section id="ekko-panel" className="ekko-panel">
        <div className="ekko-controls">
          <button id="ekko-start" className="btn btn-start" aria-label="Start listening" title="Start listening">
            <svg width="18" height="18" viewBox="0 0 24 24" aria-hidden="true">
              <path d="M12 14a3 3 0 0 0 3-3V6a3 3 0 1 0-6 0v5a3 3 0 0 0 3 3Zm5-3a5 5 0 0 1-10 0H5a7 7 0 0 0 6 6.92V21h2v-3.08A7 7 0 0 0 19 11h-2Z"/>
            </svg>
            <span>Start</span>
          </button>
          <button id="ekko-stop" className="btn btn-stop" aria-label="Stop listening" title="Stop listening">
            <svg width="18" height="18" viewBox="0 0 24 24" aria-hidden="true">
              <path d="M4.27 3 3 4.27l4.02 4.02A3 3 0 0 0 9 11H7a5 5 0 0 0 8.87 3.2l3.86 3.86L21 17.8l-3.08-3.08A5 5 0 0 0 17 11h2a7 7 0 0 1-1.21 3.92L19.73 17 21 15.73 4.27 3zM15 6a3 3 0 0 0-5.58-1.33L15 9.25V6z"/>
            </svg>
            <span>Stop</span>
          </button>
          <button id="ekko-type-speak" className="btn btn-type" aria-label="Type and Speak" title="Type and Speak">Type &amp; Speak</button>
        </div>

        {/* Status + transcript */}
        <div id="ekko-status" className="ekko-status" aria-live="polite"></div>
        <div id="ekko-output" className="ekko-output" aria-live="polite"></div>
      </section>

      {/* Export modal */}
      <div id="export-modal" className="modal hidden" role="dialog" aria-modal="true" aria-labelledby="export-title">
        <div className="modal-content">
          <h3 id="export-title">Export</h3>
          <p>Choose an action for your current transcript.</p>
          <div className="modal-actions">
            <button id="export-print" className="btn">Print / Save as PDF</button>
            <button id="export-email" className="btn">Email Transcript</button>
            <button id="export-close" className="btn btn-ghost">Close</button>
          </div>
        </div>
      </div>

      {/* Type & Speak modal */}
      <div id="speak-modal" className="modal hidden" role="dialog" aria-modal="true" aria-labelledby="speak-title">
        <div className="modal-content speak-modal">
          <h3 id="speak-title">Type &amp; Speak</h3>
          <textarea id="speak-text" rows={6} placeholder="Type something for Ekko to say…"></textarea>
          <div id="speak-preview" className="speak-preview" aria-live="polite"></div>
          <div className="modal-actions">
            <button id="speak-submit" className="btn btn-speak">Speak it</button>
            <button id="speak-cancel" className="btn btn-ghost">Cancel</button>
          </div>
        </div>
      </div>
    </>
  );
};

export default EkkoClassicPanel;
