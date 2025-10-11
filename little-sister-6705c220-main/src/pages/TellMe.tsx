import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";

const TellMe = () => {
  const [themeColor, setThemeColor] = useState<string>("#d4eaf7");
  const [factCheckerEnabled, setFactCheckerEnabled] = useState<boolean>(false);
  
  const storyPrompts = [
    "Tell me a story about a brave animal.",
    "Share a happy memory from your childhood.",
    "Invent a bedtime story with a dragon.",
    "What's a true story from your family history?",
    "Make up a story using the word 'rainbow'."
  ];

  useEffect(() => {
    const color = localStorage.getItem("favcolor") || "#d4eaf7";
    const enabled = localStorage.getItem("factCheckerEnabled") === "1";
    
    setThemeColor(color);
    setFactCheckerEnabled(enabled);
    
    document.documentElement.style.setProperty('--theme-color', color);
  }, []);

  const handleFactCheckerToggle = (checked: boolean) => {
    setFactCheckerEnabled(checked);
    localStorage.setItem("factCheckerEnabled", checked ? "1" : "");
  };

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
        <span className="text-4xl">🗣️</span>
        Tell Me
      </div>
      
      {/* Main Content */}
      <div className="ml-10 mt-9 p-8">
        <div className="flex items-center space-x-2 mb-6">
          <Checkbox 
            id="enableFactChecker"
            checked={factCheckerEnabled}
            onCheckedChange={handleFactCheckerToggle}
          />
          <label htmlFor="enableFactChecker" className="font-semibold">
            Enable Fact Checker
          </label>
        </div>
        
        <div className="story-prompts mb-6">
          {storyPrompts.map((prompt, index) => (
            <div key={index} className="my-2 p-3 bg-card rounded-lg border border-border hover:bg-accent/50 cursor-pointer transition-colors">
              {prompt}
            </div>
          ))}
        </div>
        
        {factCheckerEnabled && (
          <div className="bg-green-50 border-2 border-dashed border-green-200 dark:bg-green-950/20 dark:border-green-800 rounded-xl p-4">
            <div className="font-bold text-green-700 dark:text-green-400 mb-2">
              Fact Checker Result
            </div>
            <div className="mb-2 text-foreground">
              "This is a placeholder summary of the fact-checked article or statement, written by AI."
            </div>
            <div className="text-sm text-muted-foreground">
              Source: <span>FactCheck.org</span> | Date: <span>{new Date().toLocaleDateString()}</span>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default TellMe;