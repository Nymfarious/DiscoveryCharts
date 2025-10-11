import { useEffect, useState, useRef } from "react";
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { toast } from "@/hooks/use-toast";
// Ekko v2 styles are loaded via index.html link
const Ekko = () => {
  const [themeColor, setThemeColor] = useState<string>("#d4eaf7");
  const [isListening, setIsListening] = useState<boolean>(false);
  const [transcript, setTranscript] = useState<string>("");
  const [selectedVoice, setSelectedVoice] = useState<SpeechSynthesisVoice | null>(null);
  const [voices, setVoices] = useState<SpeechSynthesisVoice[]>([]);
  const recognitionRef = useRef<any>(null);

  useEffect(() => {
    const color = localStorage.getItem("favcolor") || "#d4eaf7";
    setThemeColor(color);
    document.documentElement.style.setProperty('--theme-color', color);
    
    // Load voices
    const loadVoices = () => {
      const availableVoices = speechSynthesis.getVoices().filter(v =>
        v.lang.startsWith('en') && v.voiceURI.toLowerCase().includes('google')
      );
      setVoices(availableVoices);
      setSelectedVoice(availableVoices[0] || null);
    };
    
    if (typeof speechSynthesis !== "undefined") {
      speechSynthesis.onvoiceschanged = loadVoices;
      loadVoices();
    }
  }, []);

  const getVoiceLabel = (voice: SpeechSynthesisVoice) => {
    const name = voice.name.toLowerCase();
    if (name.includes("female") || name.includes("zira")) return "Aunt Violet";
    if (name.includes("male") || name.includes("david") || name.includes("brian")) return "Cody";
    return voice.name;
  };

  const playTestVoice = (voiceType: "female" | "male") => {
    const name = localStorage.getItem("username") || "friend";
    let voice: SpeechSynthesisVoice | undefined;
    let text = "";

    if (voiceType === "female") {
      voice = voices.find(v => getVoiceLabel(v) === "Aunt Violet");
      text = `Hi! My name is Little Sister. It is so very lovely to meet you, ${name}.`;
    } else {
      voice = voices.find(v => getVoiceLabel(v) === "Cody");
      text = `Hey! I'm Little Sister, and I'm happy to help you, ${name}!`;
    }

    if (!voice) {
      toast({
        title: "Voice not found",
        description: "Please check your browser's voice settings.",
        variant: "destructive"
      });
      return;
    }

    const utterance = new SpeechSynthesisUtterance(text);
    utterance.voice = voice;
    utterance.rate = 1;
    speechSynthesis.speak(utterance);
  };

  const toggleMicrophone = () => {
    if (isListening) {
      stopListening();
      return;
    }

    if (!('webkitSpeechRecognition' in window || 'SpeechRecognition' in window)) {
      toast({
        title: "Speech Recognition not supported",
        description: "Your browser doesn't support Speech Recognition. Try Chrome!",
        variant: "destructive"
      });
      return;
    }

    const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
    const recognition = new SpeechRecognition();
    
    recognition.continuous = false;
    recognition.lang = 'en-US';
    recognition.interimResults = false;

    recognition.onstart = () => {
      setIsListening(true);
      setTranscript("Listening...");
    };

    recognition.onresult = (event) => {
      const result = event.results[0][0].transcript;
      setTranscript(result);
      speakTranscript(result);
    };

    recognition.onerror = (event) => {
      setTranscript("Error: " + event.error);
      setIsListening(false);
      toast({
        title: "Recognition error",
        description: "Error: " + event.error,
        variant: "destructive"
      });
    };

    recognition.onend = () => {
      setIsListening(false);
    };

    recognitionRef.current = recognition;
    recognition.start();
  };

  const stopListening = () => {
    if (recognitionRef.current && isListening) {
      recognitionRef.current.stop();
      setIsListening(false);
    }
  };

  const speakTranscript = (text: string) => {
    if (!text) return;
    
    const voice = voices.find(v => getVoiceLabel(v) === "Cody") || voices[0];
    if (!voice) return;

    const utterance = new SpeechSynthesisUtterance(text);
    utterance.voice = voice;
    utterance.rate = 1;
    speechSynthesis.speak(utterance);
  };


  const name = localStorage.getItem("username") || "friend";
  const currentVoiceLabel = selectedVoice ? getVoiceLabel(selectedVoice) : "(no Google voice found)";

  return (
    <div className="min-h-screen bg-background">
      {/* Sidebar */}
      <div 
        className="fixed left-0 top-0 bottom-0 w-4 opacity-90 z-10"
        style={{ backgroundColor: themeColor }}
      />
      
      {/* Header */}
      <div 
        className="w-full opacity-92 p-4 pl-12 text-foreground text-xl font-bold ml-4 flex items-center gap-3"
        style={{ backgroundColor: themeColor }}
      >
        <Button variant="ghost" asChild className="mr-4">
          <Link to="/" className="flex items-center gap-2 text-foreground hover:text-primary">
            ← Dashboard
          </Link>
        </Button>
        <span className="text-4xl">🎤</span>
        Ekko Voice
      </div>
      
      {/* Main Content */}
      <div className="ml-10 mt-9 p-8">
        <div className="text-2xl font-bold mb-6">
          Hi {name}!
        </div>


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

      </div>
    </div>
  );
};

export default Ekko;