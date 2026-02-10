import { useState } from "react";
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { ArrowLeft, Search } from "lucide-react";

const ProveIt = () => {
  const [textToCheck, setTextToCheck] = useState<string>("");
  const [factSummary, setFactSummary] = useState<string>("Enter a statement or article to check for facts!");
  const [factSource, setFactSource] = useState<string>("-");
  const [factDate, setFactDate] = useState<string>("-");

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
            <Search className="w-5 h-5 text-[hsl(var(--leather))]" />
          </div>
          <h1 className="text-2xl font-bold text-[hsl(var(--parchment))] tracking-wide"
              style={{ fontFamily: 'Georgia, serif', textShadow: '2px 2px 4px rgba(0,0,0,0.5)' }}>
            Prove It
          </h1>
        </div>
      </div>

      {/* Main Content */}
      <div className="px-8 py-10 max-w-4xl mx-auto">
        <div className="relative p-6 bg-[hsl(var(--card))] border-2 border-[hsl(var(--brass))] rounded-lg shadow-xl">
          <Label htmlFor="toCheck" className="font-semibold text-foreground block mb-2"
                 style={{ fontFamily: 'Georgia, serif' }}>
            Paste statement, quote, or article to check:
          </Label>

          <Textarea
            id="toCheck"
            rows={4}
            className="w-full mb-4 border-[hsl(var(--border))]"
            placeholder="Paste article, claim, or quote here..."
            value={textToCheck}
            onChange={(e) => setTextToCheck(e.target.value)}
          />

          <Button onClick={handleFactCheck} className="mb-4 bg-gradient-to-r from-[hsl(var(--brass))] to-[hsl(var(--gold))] text-[hsl(var(--leather))] font-bold hover:opacity-90 border border-[hsl(var(--leather))]">
            <Search className="w-4 h-4 mr-2" /> Fact Check
          </Button>

          <div className="bg-[hsl(var(--parchment))] rounded-lg p-4 shadow-sm border border-[hsl(var(--border))] mb-4 text-foreground">
            {factSummary}
          </div>

          <div className="text-sm text-muted-foreground mb-4">
            Source: <span className="font-medium">{factSource}</span> | Date: <span>{factDate}</span>
          </div>

          <div>
            <div className="text-sm font-semibold mb-2 text-foreground" style={{ fontFamily: 'Georgia, serif' }}>
              Trusted Sources:
            </div>
            <div className="flex flex-wrap gap-4 text-sm">
              <a href="https://www.factscan.ca/" target="_blank" rel="noopener"
                 className="text-[hsl(var(--brass))] hover:text-[hsl(var(--gold))] hover:underline font-medium">
                FactScan (Canada)
              </a>
              <a href="https://fullfact.org/" target="_blank" rel="noopener"
                 className="text-[hsl(var(--brass))] hover:text-[hsl(var(--gold))] hover:underline font-medium">
                FullFact (UK)
              </a>
              <a href="https://www.poynter.org/ifcn/" target="_blank" rel="noopener"
                 className="text-[hsl(var(--brass))] hover:text-[hsl(var(--gold))] hover:underline font-medium">
                International Fact-Checking Network
              </a>
            </div>
          </div>

          {/* Decorative corners */}
          <div className="absolute top-2 right-2 w-8 h-8 border-t-2 border-r-2 border-[hsl(var(--brass))] opacity-40" />
          <div className="absolute bottom-2 left-2 w-8 h-8 border-b-2 border-l-2 border-[hsl(var(--brass))] opacity-40" />
        </div>
      </div>
    </div>
  );
};

export default ProveIt;
