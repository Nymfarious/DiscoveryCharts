import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { ArrowLeft, BookOpen } from "lucide-react";

const TellMe = () => {
  const [factCheckerEnabled, setFactCheckerEnabled] = useState<boolean>(false);

  const storyPrompts = [
    "Tell me a story about a brave animal.",
    "Share a happy memory from your childhood.",
    "Invent a bedtime story with a dragon.",
    "What's a true story from your family history?",
    "Make up a story using the word 'rainbow'."
  ];

  useEffect(() => {
    const enabled = localStorage.getItem("factCheckerEnabled") === "1";
    setFactCheckerEnabled(enabled);
  }, []);

  const handleFactCheckerToggle = (checked: boolean) => {
    setFactCheckerEnabled(checked);
    localStorage.setItem("factCheckerEnabled", checked ? "1" : "");
  };

  return (
    <div className="min-h-screen" style={{
      background: 'linear-gradient(135deg, hsl(var(--parchment)) 0%, hsl(var(--parchment-dark)) 100%)',
      backgroundAttachment: 'fixed'
    }}>
      {/* Decorative border */}
      <div className="fixed inset-0 pointer-events-none border-8 border-double opacity-40 z-50"
           style={{ borderColor: 'hsl(var(--brass))' }} />

      {/* Leather Header */}
      <div className="relative border-b-2 border-[hsl(var(--brass))] shadow-lg"
           style={{
             background: 'linear-gradient(to bottom, hsl(var(--leather)), hsl(var(--brass)/0.3))',
             boxShadow: '0 4px 12px rgba(0,0,0,0.3)'
           }}>
        <div className="px-8 py-6 flex items-center gap-4">
          <Button variant="ghost" asChild className="text-[hsl(var(--parchment))] hover:bg-white/10">
            <Link to="/" className="flex items-center gap-2">
              <ArrowLeft className="w-5 h-5" /> Dashboard
            </Link>
          </Button>
          <div className="w-10 h-10 rounded-full bg-gradient-to-br from-[hsl(var(--gold))] to-[hsl(var(--brass))]
                          flex items-center justify-center shadow-lg">
            <BookOpen className="w-5 h-5 text-[hsl(var(--leather))]" />
          </div>
          <h1 className="text-2xl font-bold text-[hsl(var(--parchment))] tracking-wide"
              style={{ fontFamily: 'Georgia, serif', textShadow: '2px 2px 4px rgba(0,0,0,0.5)' }}>
            Tell Me
          </h1>
        </div>
      </div>

      {/* Main Content */}
      <div className="px-8 py-10 max-w-4xl mx-auto">
        <div className="flex items-center space-x-2 mb-6">
          <Checkbox
            id="enableFactChecker"
            checked={factCheckerEnabled}
            onCheckedChange={handleFactCheckerToggle}
          />
          <label htmlFor="enableFactChecker" className="font-semibold text-foreground">
            Enable Fact Checker
          </label>
        </div>

        <div className="space-y-3 mb-8">
          {storyPrompts.map((prompt, index) => (
            <div key={index}
                 className="relative p-4 bg-[hsl(var(--card))] rounded-lg border-2 border-[hsl(var(--border))]
                            hover:border-[hsl(var(--gold))] cursor-pointer transition-all duration-300
                            hover:shadow-lg hover:scale-[1.01]"
                 style={{ boxShadow: '0 2px 8px rgba(0,0,0,0.1)' }}>
              <span className="text-foreground" style={{ fontFamily: 'Georgia, serif' }}>{prompt}</span>
              {/* Decorative corners */}
              <div className="absolute top-1 right-1 w-5 h-5 border-t-2 border-r-2 border-[hsl(var(--brass))] opacity-30" />
              <div className="absolute bottom-1 left-1 w-5 h-5 border-b-2 border-l-2 border-[hsl(var(--brass))] opacity-30" />
            </div>
          ))}
        </div>

        {factCheckerEnabled && (
          <div className="relative p-6 bg-[hsl(var(--card))] border-2 border-[hsl(var(--brass))] rounded-lg shadow-xl">
            <div className="font-bold text-[hsl(var(--brass))] mb-2 text-lg"
                 style={{ fontFamily: 'Georgia, serif' }}>
              Fact Checker Result
            </div>
            <div className="mb-2 text-foreground">
              "This is a placeholder summary of the fact-checked article or statement, written by AI."
            </div>
            <div className="text-sm text-muted-foreground">
              Source: <span>FactCheck.org</span> | Date: <span>{new Date().toLocaleDateString()}</span>
            </div>
            <div className="absolute top-2 right-2 w-6 h-6 border-t-2 border-r-2 border-[hsl(var(--brass))] opacity-40" />
            <div className="absolute bottom-2 left-2 w-6 h-6 border-b-2 border-l-2 border-[hsl(var(--brass))] opacity-40" />
          </div>
        )}
      </div>
    </div>
  );
};

export default TellMe;
