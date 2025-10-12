import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { toast } from "@/hooks/use-toast";
import { Link } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { 
  Palette, 
  Volume2, 
  Mail, 
  Shield, 
  Save, 
  RotateCcw, 
  User,
  ArrowLeft,
  Play,
  Square
} from "lucide-react";

// ElevenLabs voices with IDs (free tier: 10k chars/month)
const ELEVENLABS_VOICES = [
  { id: '9BWtsMINqrJLrRacOk9x', name: 'Aria', gender: 'female' },
  { id: 'CwhRBWXzGAHq8TQ4Fs17', name: 'Roger', gender: 'male' },
  { id: 'EXAVITQu4vr4xnSDxMaL', name: 'Sarah', gender: 'female' },
  { id: 'FGY2WhTYpPnrIDTdsKH5', name: 'Laura', gender: 'female' },
  { id: 'IKne3meq5aSn9XLyUdCD', name: 'Charlie', gender: 'male' },
  { id: 'JBFqnCBsd6RMkjVDRZzb', name: 'George', gender: 'male' },
];

// Theme presets with light, medium, and dark variants
const THEME_PRESETS = [
  {
    name: "Vintage Cartographer",
    colors: { light: "#f5e6d3", medium: "#8b7355", dark: "#5c4a3a" },
    description: "Aged parchment and explorer's desk"
  },
  {
    name: "Blue",
    colors: { light: "#e3f2fd", medium: "#2196f3", dark: "#1565c0" }
  },
  {
    name: "Purple", 
    colors: { light: "#f3e5f5", medium: "#9c27b0", dark: "#6a1b9a" }
  },
  {
    name: "Gray",
    colors: { light: "#f5f5f5", medium: "#757575", dark: "#424242" }
  },
  {
    name: "Pink",
    colors: { light: "#fce4ec", medium: "#e91e63", dark: "#ad1457" }
  },
  {
    name: "Orange",
    colors: { light: "#fff3e0", medium: "#ff9800", dark: "#e65100" }
  },
  {
    name: "Green",
    colors: { light: "#e8f5e8", medium: "#4caf50", dark: "#2e7d32" }
  }
];


const Preferences = () => {
  const [themeColor, setThemeColor] = useState<string>("#d4eaf7");
  const [emails, setEmails] = useState<string[]>([]);
  const [selectedEmails, setSelectedEmails] = useState<string[]>([]);
  const [newEmail, setNewEmail] = useState<string>("");
  const [selectedVoiceId, setSelectedVoiceId] = useState<string>("");
  const [voiceProvider, setVoiceProvider] = useState<'browser' | 'elevenlabs'>('browser');
  const [userName, setUserName] = useState<string>("");
  const [browserVoices, setBrowserVoices] = useState<SpeechSynthesisVoice[]>([]);
  const [isPlaying, setIsPlaying] = useState<boolean>(false);
  const [currentUtterance, setCurrentUtterance] = useState<SpeechSynthesisUtterance | null>(null);
  const [trustedSources, setTrustedSources] = useState<string[]>([
    "wikipedia.org",
    "loc.gov",
    "britishmuseum.org"
  ]);

  useEffect(() => {
    // Load browser voices
    const loadVoices = () => {
      const voices = speechSynthesis.getVoices().filter(voice => voice.lang.startsWith('en'));
      setBrowserVoices(voices);
    };
    
    loadVoices();
    speechSynthesis.onvoiceschanged = loadVoices;

    // Load preferences data
    const savedEmails = JSON.parse(localStorage.getItem("userEmails") || "[]");
    setEmails(savedEmails);
    setSelectedEmails(savedEmails.slice(0, 1)); // Default to first email selected
    setSelectedVoiceId(localStorage.getItem("selectedVoiceId") || "");
    setVoiceProvider(localStorage.getItem("voiceProvider") as 'browser' | 'elevenlabs' || 'browser');
    setUserName(localStorage.getItem("username") || "");
    
    const savedSources = localStorage.getItem("trustedSources");
    if (savedSources) {
      setTrustedSources(JSON.parse(savedSources));
    }
    
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
    
    toast({
      title: "Preferences saved!",
      description: "Your preferences have been updated successfully.",
    });
  };

  const resetPreferences = () => {
    if (confirm("Reset ALL preferences?")) {
      localStorage.removeItem("favcolor");
      localStorage.removeItem("selectedVoiceId");
      localStorage.removeItem("voiceProvider");
      localStorage.removeItem("userEmails");
      localStorage.removeItem("selectedEmails");
      
      setEmails([]);
      setSelectedEmails([]);
      setNewEmail("");
      setSelectedVoiceId("");
      setVoiceProvider('browser');
      const defaultColor = "#d4eaf7";
      setThemeColor(defaultColor);
      handleThemeChange(defaultColor);
      
      toast({
        title: "Preferences reset",
        description: "All preferences have been cleared.",
      });
    }
  };

  const stopVoice = () => {
    if ('speechSynthesis' in window) {
      speechSynthesis.cancel();
      setIsPlaying(false);
      setCurrentUtterance(null);
    }
  };

  const testVoice = async () => {
    const testText = `Welcome to History Discoveries! I'm your guide through time, ready to explore fascinating historical moments with you, ${userName || "explorer"}.`;
    
    if (voiceProvider === 'browser') {
      // Use Web Speech API (completely free)
      if ('speechSynthesis' in window) {
        const utterance = new SpeechSynthesisUtterance(testText);
        
        if (selectedVoiceId) {
          const selectedVoice = browserVoices.find(voice => voice.name === selectedVoiceId);
          if (selectedVoice) {
            utterance.voice = selectedVoice;
          }
        }
        
        utterance.rate = 0.9;
        utterance.pitch = 1.0;
        utterance.volume = 1.0;
        
        utterance.onstart = () => setIsPlaying(true);
        utterance.onend = () => setIsPlaying(false);
        utterance.onerror = () => setIsPlaying(false);
        
        setCurrentUtterance(utterance);
        speechSynthesis.speak(utterance);
        
        toast({
          title: "Voice test successful!",
          description: "Playing browser voice - completely free!",
        });
      } else {
        toast({
          title: "Speech not supported",
          description: "Your browser doesn't support speech synthesis.",
          variant: "destructive"
        });
      }
    } else {
      // ElevenLabs voice testing via secure edge function
      if (!selectedVoiceId) {
        toast({
          title: "Voice not selected",
          description: "Please select an ElevenLabs voice first.",
          variant: "destructive"
        });
        return;
      }

      try {
        setIsPlaying(true);
        const { data, error } = await supabase.functions.invoke('text-to-speech', {
          body: { 
            text: testText,
            voiceId: selectedVoiceId,
            modelId: 'eleven_multilingual_v2'
          }
        });

        if (error) throw error;

        const audioBlob = new Blob([data], { type: 'audio/mpeg' });
        const audioUrl = URL.createObjectURL(audioBlob);
        const audio = new Audio(audioUrl);
        
        audio.onended = () => setIsPlaying(false);
        audio.onerror = () => setIsPlaying(false);
        await audio.play();

        const selectedElevenVoice = ELEVENLABS_VOICES.find(v => v.id === selectedVoiceId);
        toast({
          title: "Voice test successful!",
          description: `Playing ${selectedElevenVoice?.name}'s voice.`,
        });
      } catch (error) {
        setIsPlaying(false);
        toast({
          title: "Voice test failed",
          description: "Please ensure the API key is configured in backend settings.",
          variant: "destructive"
        });
      }
    }
  };

  const addEmail = () => {
    if (newEmail && !emails.includes(newEmail)) {
      const updatedEmails = [...emails, newEmail];
      setEmails(updatedEmails);
      setSelectedEmails([...selectedEmails, newEmail]);
      setNewEmail("");
    }
  };

  const removeEmail = (emailToRemove: string) => {
    setEmails(emails.filter(e => e !== emailToRemove));
    setSelectedEmails(selectedEmails.filter(e => e !== emailToRemove));
  };

  const toggleEmailSelection = (email: string) => {
    if (selectedEmails.includes(email)) {
      setSelectedEmails(selectedEmails.filter(e => e !== email));
    } else {
      setSelectedEmails([...selectedEmails, email]);
    }
  };

  return (
    <div className="min-h-screen">
      {/* Sidebar Accent */}
      <div 
        className="fixed left-0 top-0 bottom-0 w-1 opacity-80 z-10 bg-primary"
      />
      
      {/* Header */}
      <header className="sticky top-0 z-20 backdrop-blur-sm bg-card/80 border-b border-border shadow-sm">
        <div className="container mx-auto px-6 py-4">
          <div className="flex items-center gap-4">
            <Button variant="ghost" size="sm" asChild>
              <Link to="/" className="flex items-center gap-2 hover:text-primary transition-colors">
                <ArrowLeft className="h-4 w-4" />
                <span>Back to Dashboard</span>
              </Link>
            </Button>
            <Separator orientation="vertical" className="h-6" />
            <div className="flex items-center gap-2">
              <User className="h-5 w-5 text-primary" />
              <h1 className="text-2xl font-bold text-foreground">Preferences & Profile</h1>
            </div>
          </div>
        </div>
      </header>
      
      {/* Main Content */}
      <main className="container mx-auto px-6 py-8">
        <div className="max-w-4xl mx-auto space-y-6">
          {/* Theme Settings Card */}
          <Card className="border-border shadow-lg">
            <CardHeader>
              <div className="flex items-center gap-3">
                <div className="p-2 rounded-lg bg-primary/10">
                  <Palette className="h-5 w-5 text-primary" />
                </div>
                <div>
                  <CardTitle>Theme Customization</CardTitle>
                  <CardDescription>Personalize your visual experience</CardDescription>
                </div>
              </div>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="space-y-2">
                <Label htmlFor="favcolor" className="text-sm font-medium">Custom Color</Label>
                <div className="flex items-center gap-3">
                  <input 
                    id="favcolor"
                    type="color"
                    value={themeColor}
                    onChange={(e) => handleThemeChange(e.target.value)}
                    className="w-16 h-10 rounded-md border-2 border-border cursor-pointer"
                  />
                  <span className="text-sm text-muted-foreground">Click to choose your accent color</span>
                </div>
              </div>
              
              <Separator />
              
              {/* Theme Presets */}
              <div className="space-y-3">
                <Label className="text-sm font-medium">Quick Themes</Label>
                <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                  {THEME_PRESETS.map((theme) => (
                    <div key={theme.name} className="space-y-2">
                      <div className="flex items-center justify-center gap-1">
                        <h4 className="text-xs font-medium text-center">{theme.name}</h4>
                        {theme.name === "Vintage Cartographer" && <span className="text-sm">🗺️</span>}
                      </div>
                      {'description' in theme && (
                        <p className="text-xs text-muted-foreground text-center italic leading-tight">
                          {theme.description}
                        </p>
                      )}
                      <div className="flex gap-1 justify-center">
                        <button
                          onClick={() => handleThemeChange(theme.colors.light)}
                          className="w-9 h-9 rounded-md border-2 border-border hover:scale-110 hover:border-primary transition-all shadow-sm"
                          style={{ backgroundColor: theme.colors.light }}
                          title={`${theme.name} Light`}
                          aria-label={`${theme.name} Light theme`}
                        />
                        <button
                          onClick={() => handleThemeChange(theme.colors.medium)}
                          className="w-9 h-9 rounded-md border-2 border-border hover:scale-110 hover:border-primary transition-all shadow-sm"
                          style={{ backgroundColor: theme.colors.medium }}
                          title={`${theme.name} Medium`}
                          aria-label={`${theme.name} Medium theme`}
                        />
                        <button
                          onClick={() => handleThemeChange(theme.colors.dark)}
                          className="w-9 h-9 rounded-md border-2 border-border hover:scale-110 hover:border-primary transition-all shadow-sm"
                          style={{ backgroundColor: theme.colors.dark }}
                          title={`${theme.name} Dark`}
                          aria-label={`${theme.name} Dark theme`}
                        />
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Voice Settings Card */}
          <Card className="border-border shadow-lg">
            <CardHeader>
              <div className="flex items-center gap-3">
                <div className="p-2 rounded-lg bg-primary/10">
                  <Volume2 className="h-5 w-5 text-primary" />
                </div>
                <div>
                  <CardTitle>Voice & Audio</CardTitle>
                  <CardDescription>Configure text-to-speech preferences</CardDescription>
                </div>
              </div>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="space-y-2">
                <Label className="text-sm font-medium">Voice Selection</Label>
                <Select 
                  value={`${voiceProvider}:${selectedVoiceId}`} 
                  onValueChange={(value) => {
                    const [provider, voiceId] = value.split(':');
                    setVoiceProvider(provider as 'browser' | 'elevenlabs');
                    setSelectedVoiceId(voiceId);
                  }}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Choose a voice" />
                  </SelectTrigger>
                  <SelectContent className="max-h-[300px] bg-popover z-50">
                    <div className="px-2 py-1.5 text-sm font-semibold text-muted-foreground">Browser Voices (FREE)</div>
                    {browserVoices.map((voice) => (
                      <SelectItem key={`browser:${voice.name}`} value={`browser:${voice.name}`}>
                        {voice.name} (Browser - FREE)
                      </SelectItem>
                    ))}
                    <div className="px-2 py-1.5 text-sm font-semibold text-muted-foreground border-t mt-2 pt-2">ElevenLabs (Premium)</div>
                    {ELEVENLABS_VOICES.map((voice) => (
                      <SelectItem key={`elevenlabs:${voice.id}`} value={`elevenlabs:${voice.id}`}>
                        {voice.name} (ElevenLabs)
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <p className="text-xs text-muted-foreground mt-1">
                  Browser voices are completely free. ElevenLabs voices use secure backend configuration.
                </p>
              </div>

              <Separator />

              {/* Voice Test Controls */}
              <div className="space-y-2">
                <Label className="text-sm font-medium">Test Audio</Label>
                <div className="flex items-center gap-2">
                  <Button 
                    onClick={testVoice} 
                    variant="outline" 
                    disabled={isPlaying}
                    className="flex items-center gap-2"
                  >
                    <Play className="h-4 w-4" />
                    Test Voice
                  </Button>
                  {isPlaying && (
                    <Button 
                      onClick={stopVoice} 
                      variant="outline" 
                      className="flex items-center gap-2 bg-destructive/10 hover:bg-destructive/20"
                    >
                      <Square className="h-4 w-4" />
                      Stop
                    </Button>
                  )}
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Email Settings Card */}
          <Card className="border-border shadow-lg">
            <CardHeader>
              <div className="flex items-center gap-3">
                <div className="p-2 rounded-lg bg-primary/10">
                  <Mail className="h-5 w-5 text-primary" />
                </div>
                <div>
                  <CardTitle>Email Management</CardTitle>
                  <CardDescription>Manage your email addresses</CardDescription>
                </div>
              </div>
            </CardHeader>
            <CardContent className="space-y-6">
              {/* Add Email */}
              <div className="space-y-2">
                <Label className="text-sm font-medium">Add New Email</Label>
                <div className="flex gap-2">
                  <Input 
                    type="email"
                    value={newEmail}
                    onChange={(e) => setNewEmail(e.target.value)}
                    placeholder="Enter email address"
                    className="flex-1"
                  />
                  <Button onClick={addEmail} variant="default" size="sm">
                    Add
                  </Button>
                </div>
              </div>

              {/* Email List */}
              {emails.length > 0 && (
                <>
                  <Separator />
                  <div className="space-y-3">
                    <Label className="text-sm font-medium">Your Emails</Label>
                    <div className="space-y-2">
                      {emails.map((email, index) => (
                        <div key={index} className="flex items-center justify-between p-3 bg-muted/50 rounded-lg border border-border hover:border-primary/50 transition-colors">
                          <div className="flex items-center space-x-3">
                            {emails.length > 1 && (
                              <input
                                type="checkbox"
                                checked={selectedEmails.includes(email)}
                                onChange={() => toggleEmailSelection(email)}
                                className="rounded border-border"
                              />
                            )}
                            <span className="text-sm">{email}</span>
                          </div>
                          <Button 
                            onClick={() => removeEmail(email)} 
                            variant="ghost" 
                            size="sm"
                            className="text-destructive hover:bg-destructive/10 hover:text-destructive"
                          >
                            Remove
                          </Button>
                        </div>
                      ))}
                    </div>
                    {emails.length > 1 && (
                      <p className="text-xs text-muted-foreground">
                        {selectedEmails.length} of {emails.length} email{emails.length > 1 ? 's' : ''} selected
                      </p>
                    )}
                  </div>
                </>
              )}
            </CardContent>
          </Card>

          {/* Trusted Sources Card */}
          <Card className="border-border shadow-lg">
            <CardHeader>
              <div className="flex items-center gap-3">
                <div className="p-2 rounded-lg bg-primary/10">
                  <Shield className="h-5 w-5 text-primary" />
                </div>
                <div>
                  <CardTitle>Trusted Historical Sources</CardTitle>
                  <CardDescription>Configure reliable sources for research agents</CardDescription>
                </div>
              </div>
            </CardHeader>
            <CardContent className="space-y-6">
              <p className="text-sm text-muted-foreground">
                Search agents will prioritize results from these trusted domains when researching historical topics.
              </p>
              
              <div className="space-y-3">
                {trustedSources.map((source, index) => (
                  <div key={index} className="flex items-center gap-2">
                    <Input 
                      value={source}
                      onChange={(e) => {
                        const updated = [...trustedSources];
                        updated[index] = e.target.value;
                        setTrustedSources(updated);
                      }}
                      placeholder="e.g., wikipedia.org"
                      className="flex-1"
                    />
                    <Button 
                      onClick={() => setTrustedSources(trustedSources.filter((_, i) => i !== index))}
                      variant="ghost"
                      size="sm"
                      className="text-destructive hover:bg-destructive/10"
                    >
                      Remove
                    </Button>
                  </div>
                ))}
              </div>
              
              {trustedSources.length < 5 && (
                <Button 
                  onClick={() => setTrustedSources([...trustedSources, ""])}
                  variant="outline"
                  size="sm"
                  className="w-full"
                >
                  + Add Source
                </Button>
              )}
              
              <p className="text-xs text-muted-foreground italic">
                Maximum 5 trusted sources. Enter domain names only (e.g., loc.gov, not https://loc.gov)
              </p>
            </CardContent>
          </Card>

          {/* Action Buttons */}
          <div className="flex flex-col sm:flex-row gap-3 pt-4">
            <Button 
              onClick={savePreferences}
              className="flex items-center gap-2 flex-1"
              size="lg"
            >
              <Save className="h-4 w-4" />
              Save All Preferences
            </Button>
            <Button 
              onClick={resetPreferences} 
              variant="outline"
              className="flex items-center gap-2 flex-1"
              size="lg"
            >
              <RotateCcw className="h-4 w-4" />
              Reset to Defaults
            </Button>
          </div>
        </div>
      </main>
    </div>
  );
};

export default Preferences;