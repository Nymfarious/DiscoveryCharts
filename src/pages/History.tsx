import { useMemo, useState } from "react";
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { MapPin, Search } from "lucide-react";
import HistoryViewer from "@/components/HistoryViewer";
import { HOTSPOTS, Hotspot } from "@/data/hotspots";

const History = () => {
  const [themeColor, setThemeColor] = useState<string>("#d4eaf7");
  const [query, setQuery] = useState("");
  const [selectedHotspot, setSelectedHotspot] = useState<Hotspot | null>(null);

  // Search/filter hotspots
  const results = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return HOTSPOTS;
    return HOTSPOTS.filter(h =>
      h.title.toLowerCase().includes(q) || 
      h.snippet.toLowerCase().includes(q) ||
      h.tags?.join(' ').toLowerCase().includes(q)
    );
  }, [query]);

  return (
    <div className="min-h-screen bg-background">
      {/* Sidebar */}
      <div 
        className="fixed left-0 top-0 bottom-0 w-4 opacity-90 z-10"
        style={{ backgroundColor: themeColor }}
      />
      
      {/* Header */}
      <div 
        className="w-full opacity-92 p-4 pl-12 text-foreground text-xl font-bold ml-4 flex items-center gap-3 border-b border-border"
        style={{ backgroundColor: themeColor }}
      >
        <Button variant="ghost" asChild className="mr-4">
          <Link to="/" className="flex items-center gap-2 text-foreground hover:text-primary">
            ← Dashboard
          </Link>
        </Button>
        <MapPin className="w-6 h-6" />
        History Discovery — Map Viewer
      </div>

      {/* Main Layout */}
      <div className="p-4 md:p-6 ml-4 grid gap-4 md:gap-6 grid-cols-1 lg:grid-cols-[1fr_320px]">
        {/* Left: Viewer */}
        <div className="space-y-4">
          {/* Search Bar */}
          <Card className="p-4">
            <div className="flex items-center gap-3">
              <Search className="w-5 h-5 text-muted-foreground" />
              <Input
                placeholder="Search locations (e.g., Assyria, Babylon)..."
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                className="flex-1"
              />
              {query && (
                <Button 
                  variant="ghost" 
                  size="sm"
                  onClick={() => setQuery('')}
                >
                  Clear
                </Button>
              )}
            </div>
            {query && (
              <p className="text-xs text-muted-foreground mt-2">
                {results.length} match{results.length !== 1 ? 'es' : ''} found
              </p>
            )}
          </Card>

          {/* Viewer */}
          <Card className="p-3">
            <HistoryViewer 
              dziUrl="/tiles/sample.dzi" 
              hotspots={results} 
              focus={results[0]} 
            />
          </Card>

          {/* Instructions */}
          <Card className="p-4 bg-muted/50">
            <h3 className="font-semibold mb-2 text-sm">How to use:</h3>
            <ul className="text-xs text-muted-foreground space-y-1">
              <li>• <strong>Zoom:</strong> Mouse wheel or pinch gesture</li>
              <li>• <strong>Pan:</strong> Click and drag</li>
              <li>• <strong>Pins:</strong> Click red pins to jump to location</li>
              <li>• <strong>Search:</strong> Find locations by name or tag</li>
            </ul>
          </Card>
        </div>

        {/* Right: Hotspots List */}
        <aside className="space-y-4">
          <Card className="p-4">
            <h2 className="text-lg font-semibold mb-3 flex items-center gap-2">
              <MapPin className="w-5 h-5" />
              Locations {query && `(${results.length})`}
            </h2>
            <div className="space-y-2 max-h-[calc(100vh-200px)] overflow-y-auto">
              {results.map(h => (
                <div 
                  key={h.id} 
                  className={`p-3 rounded-lg border transition-colors cursor-pointer ${
                    selectedHotspot?.id === h.id 
                      ? 'bg-primary/10 border-primary' 
                      : 'bg-card hover:bg-accent border-border'
                  }`}
                  onClick={() => setSelectedHotspot(h)}
                >
                  <div className="font-medium text-sm mb-1">{h.title}</div>
                  <div className="text-xs text-muted-foreground mb-2">
                    {h.snippet}
                  </div>
                  {h.tags && (
                    <div className="flex flex-wrap gap-1 mb-2">
                      {h.tags.map(tag => (
                        <span 
                          key={tag} 
                          className="text-xs px-2 py-0.5 rounded-full bg-primary/10 text-primary"
                        >
                          {tag}
                        </span>
                      ))}
                    </div>
                  )}
                  <Button
                    size="sm"
                    variant="outline"
                    className="w-full"
                    onClick={(e) => {
                      e.stopPropagation();
                      const ev = new CustomEvent('jump-to-hotspot', { detail: h });
                      window.dispatchEvent(ev);
                    }}
                  >
                    Jump to Location
                  </Button>
                </div>
              ))}
            </div>
          </Card>

          {/* Phase 1 Notice */}
          <Card className="p-4 bg-muted/50">
            <p className="text-xs text-muted-foreground">
              <strong>Phase 1 MVP:</strong> Deep-zoom viewer with hotspots. 
              Generate tiles with: <code className="text-xs bg-background px-1 rounded">npm run tile</code>
            </p>
          </Card>
        </aside>
      </div>
    </div>
  );
};

export default History;
