import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

const ChatWithMe = () => {
  const [themeColor, setThemeColor] = useState<string>("#d4eaf7");
  const [prompt, setPrompt] = useState<string>("");
  const [response, setResponse] = useState<string>("");

  useEffect(() => {
    const color = localStorage.getItem("favcolor") || "#d4eaf7";
    setThemeColor(color);
    document.documentElement.style.setProperty('--theme-color', color);
  }, []);

  const tellStory = () => {
    const name = localStorage.getItem("username") || "friend";
    if (!prompt.trim()) {
      setResponse("Please enter a story prompt to chat!");
      return;
    }
    
    // Placeholder for actual AI chat logic
    const truncatedPrompt = prompt.length > 60 ? prompt.substring(0, 60) + "..." : prompt;
    setResponse(`Here's a story for you, ${name}: ${truncatedPrompt}\n\n(Imagine an AI story response here!)`);
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      tellStory();
    }
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
        <span className="text-4xl">💬</span>
        Chat With Me
      </div>
      
      {/* Main Content */}
      <div className="ml-10 mt-9 p-8">
        <div className="bg-card rounded-xl shadow-sm border border-border p-6">
          <div className="space-y-4">
            <div>
              <Label htmlFor="prompt" className="font-semibold">
                Type your story prompt or question:
              </Label>
              <div className="flex gap-2 mt-2">
                <Input
                  id="prompt"
                  type="text"
                  placeholder="Tell me a story about a clever fox..."
                  value={prompt}
                  onChange={(e) => setPrompt(e.target.value)}
                  onKeyPress={handleKeyPress}
                  className="flex-1"
                />
                <Button onClick={tellStory}>
                  Tell Me a Story
                </Button>
              </div>
            </div>
            
            {response && (
              <div className="mt-6 p-4 bg-blue-50 dark:bg-blue-950/20 rounded-lg border border-blue-200 dark:border-blue-800">
                <div className="whitespace-pre-wrap text-foreground">
                  {response}
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default ChatWithMe;