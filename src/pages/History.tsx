import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";
import { toast } from "@/hooks/use-toast";
import JSZip from "jszip";

interface HistoryEntry {
  text: string;
  filetype?: string;
  mins?: number;
  size?: number;
  date?: string;
  summary?: string;
  archived?: boolean;
}

const History = () => {
  const [themeColor, setThemeColor] = useState<string>("#d4eaf7");
  const [history, setHistory] = useState<HistoryEntry[]>([]);
  const [showArchived, setShowArchived] = useState<boolean>(false);
  const [selectedEntries, setSelectedEntries] = useState<Set<number>>(new Set());

  useEffect(() => {
    const color = localStorage.getItem("favcolor") || "#d4eaf7";
    setThemeColor(color);
    document.documentElement.style.setProperty('--theme-color', color);

    // Load history from localStorage
    const savedHistory = JSON.parse(localStorage.getItem("promptHistory") || "[]");
    setHistory(savedHistory);
  }, []);

  const formatSize = (bytes: number) => {
    if (bytes > 1000000) return (bytes / 1000000).toFixed(2) + " MB";
    if (bytes > 1000) return (bytes / 1000).toFixed(1) + " KB";
    return bytes + " B";
  };

  const saveHistory = (newHistory: HistoryEntry[]) => {
    setHistory(newHistory);
    localStorage.setItem("promptHistory", JSON.stringify(newHistory));
  };

  const archiveEntry = (index: number) => {
    const newHistory = [...history];
    newHistory[index].archived = !newHistory[index].archived;
    saveHistory(newHistory);
  };

  const purgeEntry = (index: number) => {
    if (confirm("Permanently delete this entry? (Cannot be undone)")) {
      const newHistory = history.filter((_, i) => i !== index);
      saveHistory(newHistory);
      setSelectedEntries(new Set());
    }
  };

  const downloadEntry = (index: number) => {
    const entry = history[index];
    const blob = new Blob([entry.text], { 
      type: entry.filetype === 'Audio' ? 'audio/wav' : 'text/plain' 
    });
    const link = document.createElement("a");
    link.href = URL.createObjectURL(blob);
    link.download = `Little_Sister_${entry.filetype || 'Text'}_${index}.${entry.filetype === 'Audio' ? 'wav' : 'txt'}`;
    link.click();
  };

  const emailEntry = (index: number) => {
    const entry = history[index];
    const email = localStorage.getItem("userEmail") || "";
    const subject = "Little Sister Entry";
    const body = encodeURIComponent(entry.text || '');
    window.location.href = `mailto:${email}?subject=${subject}&body=${body}`;
  };

  const exportZip = async () => {
    if (selectedEntries.size === 0) {
      toast({
        title: "No entries selected",
        description: "Select at least one entry to export.",
        variant: "destructive"
      });
      return;
    }

    const zip = new JSZip();
    Array.from(selectedEntries).forEach(index => {
      const entry = history[index];
      const ext = entry.filetype === 'Audio' ? 'wav' : 'txt';
      zip.file(`Little_Sister_${entry.filetype || 'Text'}_${index}.${ext}`, entry.text);
    });

    try {
      const content = await zip.generateAsync({ type: "blob" });
      const link = document.createElement("a");
      link.href = URL.createObjectURL(content);
      link.download = "Little_Sister_History.zip";
      link.click();
      
      toast({
        title: "Export successful",
        description: "Your history has been exported as a ZIP file.",
      });
    } catch (error) {
      toast({
        title: "Export failed",
        description: "There was an error creating the ZIP file.",
        variant: "destructive"
      });
    }
  };

  const selectAll = () => {
    const filteredHistory = history.filter(entry => showArchived ? entry.archived : !entry.archived);
    const allIndices = new Set(filteredHistory.map((_, index) => index));
    setSelectedEntries(allIndices);
  };

  const purgeSelected = () => {
    if (confirm("Permanently purge all selected entries?")) {
      const indicesToRemove = Array.from(selectedEntries).sort((a, b) => b - a);
      let newHistory = [...history];
      indicesToRemove.forEach(index => {
        newHistory.splice(index, 1);
      });
      saveHistory(newHistory);
      setSelectedEntries(new Set());
    }
  };

  const toggleEntrySelection = (index: number) => {
    const newSelected = new Set(selectedEntries);
    if (newSelected.has(index)) {
      newSelected.delete(index);
    } else {
      newSelected.add(index);
    }
    setSelectedEntries(newSelected);
  };

  const filteredHistory = history.filter(entry => showArchived ? entry.archived : !entry.archived);

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
        <span className="text-4xl">📜</span>
        History
      </div>
      
      {/* Main Content */}
      <div className="ml-10 mt-9 p-8">
        <div className="flex flex-wrap gap-4 items-center mb-6">
          <Button onClick={selectAll} variant="outline">
            Select All
          </Button>
          <Button onClick={exportZip} variant="outline">
            Export as ZIP
          </Button>
          <Button onClick={purgeSelected} variant="destructive">
            Purge Selected
          </Button>
          
          <div className="flex items-center space-x-2">
            <Checkbox
              id="showArchived"
              checked={showArchived}
              onCheckedChange={(checked) => setShowArchived(checked === true)}
            />
            <Label htmlFor="showArchived">Show Archived</Label>
          </div>
        </div>

        <div className="space-y-4">
          {filteredHistory.map((entry, index) => {
            const actualIndex = history.indexOf(entry);
            const meta = `${entry.filetype || 'Text'} • ${entry.mins || ''}min • ${formatSize(entry.size || entry.text.length)} • ${entry.date ? new Date(entry.date).toLocaleDateString() : ''}`;
            const summary = entry.summary || "(Short AI summary here)";
            
            return (
              <div 
                key={actualIndex}
                className={`bg-card p-4 rounded-xl border border-border shadow-sm ${
                  entry.archived ? 'opacity-50 bg-muted' : ''
                }`}
              >
                <div className="flex items-center justify-between mb-2">
                  <div className="flex items-center gap-3">
                    <Checkbox
                      checked={selectedEntries.has(actualIndex)}
                      onCheckedChange={() => toggleEntrySelection(actualIndex)}
                    />
                    <div>
                      <span className="font-bold mr-3">{entry.filetype || 'Text'}</span>
                      <span className="text-sm text-muted-foreground">{meta}</span>
                    </div>
                  </div>
                  
                  <div className="flex gap-2">
                    <Button onClick={() => downloadEntry(actualIndex)} size="sm" variant="outline">
                      ⬇️ Export
                    </Button>
                    <Button onClick={() => emailEntry(actualIndex)} size="sm" variant="outline">
                      ✉️ Email
                    </Button>
                    <Button 
                      onClick={() => archiveEntry(actualIndex)} 
                      size="sm" 
                      variant="outline"
                      className="bg-yellow-50 dark:bg-yellow-950/20"
                    >
                      {entry.archived ? 'Restore' : 'Archive'}
                    </Button>
                    <Button 
                      onClick={() => purgeEntry(actualIndex)} 
                      size="sm" 
                      variant="destructive"
                    >
                      Purge
                    </Button>
                  </div>
                </div>
                
                <div className="text-sm italic text-green-600 dark:text-green-400">
                  {summary}
                </div>
              </div>
            );
          })}
          
          {filteredHistory.length === 0 && (
            <div className="text-center py-12 text-muted-foreground">
              <p className="text-lg">No {showArchived ? 'archived' : 'active'} entries found.</p>
              <p className="text-sm mt-2">
                {showArchived 
                  ? "Archive some entries to see them here." 
                  : "Start using Little Sister features to build your history."
                }
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default History;