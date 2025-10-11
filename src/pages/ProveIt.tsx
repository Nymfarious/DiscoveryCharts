import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";

const ProveIt = () => {
  const [themeColor, setThemeColor] = useState<string>("#d4eaf7");
  const [textToCheck, setTextToCheck] = useState<string>("");
  const [factSummary, setFactSummary] = useState<string>("Enter a statement or article to check for facts!");
  const [factSource, setFactSource] = useState<string>("-");
  const [factDate, setFactDate] = useState<string>("-");

  useEffect(() => {
    const color = localStorage.getItem("favcolor") || "#d4eaf7";
    setThemeColor(color);
    document.documentElement.style.setProperty('--theme-color', color);
  }, []);

  const handleFactCheck = () => {
    const text = textToCheck.trim();
    if (text) {
      setFactSummary(`This is an AI-written summary of: "${text.substring(0, 100)}..."`);
      setFactSource("FactCheck Canada (demo)");
      setFactDate(new Date().toLocaleDateString());
    } else {
      setFactSummary("Enter a statement or article to check for facts!");
      setFactSource("-");
      setFactDate("-");
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
        <span className="text-4xl">🔎</span>
        Prove It
      </div>
      
      {/* Main Content */}
      <div className="ml-10 mt-9 p-8">
        <div className="bg-blue-50 dark:bg-blue-950/20 rounded-xl p-6 border border-blue-200 dark:border-blue-800">
          <Label htmlFor="toCheck" className="font-semibold block mb-2">
            Paste statement, quote, or article to check:
          </Label>
          
          <Textarea
            id="toCheck"
            rows={4}
            className="w-full mb-4"
            placeholder="Paste article, claim, or quote here..."
            value={textToCheck}
            onChange={(e) => setTextToCheck(e.target.value)}
          />
          
          <Button onClick={handleFactCheck} className="mb-4">
            Fact Check
          </Button>
          
          <div className="bg-card rounded-lg p-4 shadow-sm border border-border mb-4">
            {factSummary}
          </div>
          
          <div className="text-sm text-muted-foreground mb-4">
            Source: <span>{factSource}</span> | Date: <span>{factDate}</span>
          </div>
          
          <div className="sources">
            <div className="text-sm font-medium mb-2">Example sources:</div>
            <div className="flex flex-wrap gap-4 text-sm">
              <a 
                href="https://www.factscan.ca/" 
                target="_blank" 
                rel="noopener"
                className="text-primary hover:underline"
              >
                FactScan (Canada)
              </a>
              <a 
                href="https://fullfact.org/" 
                target="_blank" 
                rel="noopener"
                className="text-primary hover:underline"
              >
                FullFact (UK)
              </a>
              <a 
                href="https://www.poynter.org/ifcn/" 
                target="_blank" 
                rel="noopener"
                className="text-primary hover:underline"
              >
                International Fact-Checking Network
              </a>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ProveIt;