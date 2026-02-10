import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { toast } from "@/hooks/use-toast";
import { Link } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { User, ArrowLeft, Save, RotateCcw } from "lucide-react";
import ThemeSettings from "@/components/preferences/ThemeSettings";
import VoiceSettings from "@/components/preferences/VoiceSettings";
import EmailSettings from "@/components/preferences/EmailSettings";
import TrustedSourcesSettings from "@/components/preferences/TrustedSourcesSettings";

const ELEVENLABS_VOICES = [
  { id: '9BWtsMINqrJLrRacOk9x', name: 'Aria' },
  { id: 'CwhRBWXzGAHq8TQ4Fs17', name: 'Roger' },
  { id: 'EXAVITQu4vr4xnSDxMaL', name: 'Sarah' },
  { id: 'FGY2WhTYpPnrIDTdsKH5', name: 'Laura' },
  { id: 'IKne3meq5aSn9XLyUdCD', name: 'Charlie' },
  { id: 'JBFqnCBsd6RMkjVDRZzb', name: 'George' },
];

const Preferences = () => {
  const [themeColor, setThemeColor] = useState("#d4eaf7");
  const [emails, setEmails] = useState<string[]>([]);
  const [selectedEmails, setSelectedEmails] = useState<string[]>([]);
  const [newEmail, setNewEmail] = useState("");
  const [selectedVoiceId, setSelectedVoiceId] = useState("");
  const [voiceProvider, setVoiceProvider] = useState<'browser' | 'elevenlabs'>('browser');
  const [userName, setUserName] = useState("");
  const [browserVoices, setBrowserVoices] = useState<SpeechSynthesisVoice[]>([]);
  const [isPlaying, setIsPlaying] = useState(false);
  const [trustedSources, setTrustedSources] = useState<string[]>(["wikipedia.org", "loc.gov", "britishmuseum.org"]);

  useEffect(() => {
    const loadVoices = () => setBrowserVoices(speechSynthesis.getVoices().filter(v => v.lang.startsWith('en')));
    loadVoices();
    speechSynthesis.onvoiceschanged = loadVoices;

    const savedEmails = JSON.parse(localStorage.getItem("userEmails") || "[]");
    setEmails(savedEmails);
    setSelectedEmails(savedEmails.slice(0, 1));
    setSelectedVoiceId(localStorage.getItem("selectedVoiceId") || "");
    setVoiceProvider(localStorage.getItem("voiceProvider") as 'browser' | 'elevenlabs' || 'browser');
    setUserName(localStorage.getItem("username") || "");
    const savedSources = localStorage.getItem("trustedSources");
    if (savedSources) setTrustedSources(JSON.parse(savedSources));
    const color = localStorage.getItem("favcolor") || "#d4eaf7";
    setThemeColor(color);
    document.documentElement.style.setProperty('--theme-color', color);
  }, []);

  const handleThemeChange = (color: string) => {
    setThemeColor(color);
    document.documentElement.style.setProperty('--theme-color', color);
  };

  const savePreferences = () => {
    localStorage.setItem("favcolor", themeColor);
    localStorage.setItem("selectedVoiceId", selectedVoiceId);
    localStorage.setItem("voiceProvider", voiceProvider);
    localStorage.setItem("userEmails", JSON.stringify(emails));
    localStorage.setItem("selectedEmails", JSON.stringify(selectedEmails));
    localStorage.setItem("trustedSources", JSON.stringify(trustedSources));
    toast({ title: "Preferences saved!", description: "Your preferences have been updated successfully." });
  };

  const resetPreferences = () => {
    if (!confirm("Reset ALL preferences?")) return;
    ["favcolor","selectedVoiceId","voiceProvider","userEmails","selectedEmails"].forEach(k => localStorage.removeItem(k));
    setEmails([]); setSelectedEmails([]); setNewEmail(""); setSelectedVoiceId(""); setVoiceProvider('browser');
    handleThemeChange("#d4eaf7");
    toast({ title: "Preferences reset", description: "All preferences have been cleared." });
  };

  const stopVoice = () => { speechSynthesis.cancel(); setIsPlaying(false); };

  const testVoice = async () => {
    const testText = `Welcome to History Discoveries! I'm your guide through time, ${userName || "explorer"}.`;
    if (voiceProvider === 'browser') {
      if (!('speechSynthesis' in window)) { toast({ title: "Speech not supported", variant: "destructive" }); return; }
      const utterance = new SpeechSynthesisUtterance(testText);
      const voice = browserVoices.find(v => v.name === selectedVoiceId);
      if (voice) utterance.voice = voice;
      utterance.rate = 0.9;
      utterance.onstart = () => setIsPlaying(true);
      utterance.onend = () => setIsPlaying(false);
      utterance.onerror = () => setIsPlaying(false);
      speechSynthesis.speak(utterance);
    } else {
      if (!selectedVoiceId) { toast({ title: "Voice not selected", variant: "destructive" }); return; }
      try {
        setIsPlaying(true);
        const { data, error } = await supabase.functions.invoke('text-to-speech', { body: { text: testText, voiceId: selectedVoiceId, modelId: 'eleven_multilingual_v2' } });
        if (error) throw error;
        const audio = new Audio(URL.createObjectURL(new Blob([data], { type: 'audio/mpeg' })));
        audio.onended = () => setIsPlaying(false);
        await audio.play();
        const voice = ELEVENLABS_VOICES.find(v => v.id === selectedVoiceId);
        toast({ title: "Voice test!", description: `Playing ${voice?.name}'s voice.` });
      } catch { setIsPlaying(false); toast({ title: "Voice test failed", variant: "destructive" }); }
    }
  };

  const addEmail = () => {
    if (newEmail && !emails.includes(newEmail)) {
      setEmails(prev => [...prev, newEmail]);
      setSelectedEmails(prev => [...prev, newEmail]);
      setNewEmail("");
    }
  };

  return (
    <div className="min-h-screen">
      <div className="fixed left-0 top-0 bottom-0 w-1 opacity-80 z-10 bg-primary" />
      <header className="sticky top-0 z-20 backdrop-blur-sm bg-card/80 border-b border-border shadow-sm">
        <div className="container mx-auto px-6 py-4 flex items-center gap-4">
          <Button variant="ghost" size="sm" asChild>
            <Link to="/" className="flex items-center gap-2 hover:text-primary transition-colors">
              <ArrowLeft className="h-4 w-4" /><span>Back to Dashboard</span>
            </Link>
          </Button>
          <Separator orientation="vertical" className="h-6" />
          <div className="flex items-center gap-2">
            <User className="h-5 w-5 text-primary" />
            <h1 className="text-2xl font-bold text-foreground">Preferences & Profile</h1>
          </div>
        </div>
      </header>
      
      <main className="container mx-auto px-6 py-8">
        <div className="max-w-4xl mx-auto space-y-6">
          <ThemeSettings themeColor={themeColor} onThemeChange={handleThemeChange} />
          <VoiceSettings
            voiceProvider={voiceProvider} selectedVoiceId={selectedVoiceId}
            browserVoices={browserVoices} isPlaying={isPlaying}
            onVoiceChange={(p, v) => { setVoiceProvider(p); setSelectedVoiceId(v); }}
            onTestVoice={testVoice} onStopVoice={stopVoice}
          />
          <EmailSettings
            emails={emails} selectedEmails={selectedEmails} newEmail={newEmail}
            onNewEmailChange={setNewEmail} onAddEmail={addEmail}
            onRemoveEmail={(e) => { setEmails(prev => prev.filter(x => x !== e)); setSelectedEmails(prev => prev.filter(x => x !== e)); }}
            onToggleEmail={(e) => setSelectedEmails(prev => prev.includes(e) ? prev.filter(x => x !== e) : [...prev, e])}
          />
          <TrustedSourcesSettings trustedSources={trustedSources} onSourcesChange={setTrustedSources} />
          <div className="flex flex-col sm:flex-row gap-3 pt-4">
            <Button onClick={savePreferences} className="flex items-center gap-2 flex-1" size="lg"><Save className="h-4 w-4" />Save All Preferences</Button>
            <Button onClick={resetPreferences} variant="outline" className="flex items-center gap-2 flex-1" size="lg"><RotateCcw className="h-4 w-4" />Reset to Defaults</Button>
          </div>
        </div>
      </main>
    </div>
  );
};

export default Preferences;
