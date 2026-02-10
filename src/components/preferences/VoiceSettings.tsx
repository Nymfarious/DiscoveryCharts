import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Separator } from "@/components/ui/separator";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Volume2, Play, Square } from "lucide-react";

const ELEVENLABS_VOICES = [
  { id: '9BWtsMINqrJLrRacOk9x', name: 'Aria', gender: 'female' },
  { id: 'CwhRBWXzGAHq8TQ4Fs17', name: 'Roger', gender: 'male' },
  { id: 'EXAVITQu4vr4xnSDxMaL', name: 'Sarah', gender: 'female' },
  { id: 'FGY2WhTYpPnrIDTdsKH5', name: 'Laura', gender: 'female' },
  { id: 'IKne3meq5aSn9XLyUdCD', name: 'Charlie', gender: 'male' },
  { id: 'JBFqnCBsd6RMkjVDRZzb', name: 'George', gender: 'male' },
];

interface VoiceSettingsProps {
  voiceProvider: 'browser' | 'elevenlabs';
  selectedVoiceId: string;
  browserVoices: SpeechSynthesisVoice[];
  isPlaying: boolean;
  onVoiceChange: (provider: 'browser' | 'elevenlabs', voiceId: string) => void;
  onTestVoice: () => void;
  onStopVoice: () => void;
}

export default function VoiceSettings({
  voiceProvider, selectedVoiceId, browserVoices, isPlaying,
  onVoiceChange, onTestVoice, onStopVoice
}: VoiceSettingsProps) {
  return (
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
              onVoiceChange(provider as 'browser' | 'elevenlabs', voiceId);
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

        <div className="space-y-2">
          <Label className="text-sm font-medium">Test Audio</Label>
          <div className="flex items-center gap-2">
            <Button onClick={onTestVoice} variant="outline" disabled={isPlaying} className="flex items-center gap-2">
              <Play className="h-4 w-4" />
              Test Voice
            </Button>
            {isPlaying && (
              <Button onClick={onStopVoice} variant="outline" className="flex items-center gap-2 bg-destructive/10 hover:bg-destructive/20">
                <Square className="h-4 w-4" />
                Stop
              </Button>
            )}
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
