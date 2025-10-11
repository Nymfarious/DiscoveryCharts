import { useEffect, useState, useRef } from "react";
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Slider } from "@/components/ui/slider";
import { toast } from "@/hooks/use-toast";
import { 
  ZoomIn, 
  ZoomOut, 
  Maximize, 
  Pin, 
  Layers, 
  Clock,
  HelpCircle,
  Eye,
  MapPin
} from "lucide-react";
import OpenSeadragon from "openseadragon";

interface MapPin {
  id: string;
  title: string;
  x: number; // normalized 0-1
  y: number; // normalized 0-1
  blurb: string;
  sources: string[];
  year?: number;
  layer?: string;
}

const History = () => {
  const [themeColor, setThemeColor] = useState<string>("#d4eaf7");
  const viewerRef = useRef<HTMLDivElement>(null);
  const osdViewerRef = useRef<OpenSeadragon.Viewer | null>(null);
  const [selectedPin, setSelectedPin] = useState<MapPin | null>(null);
  const [showTimeline, setShowTimeline] = useState(false);
  const [showLayers, setShowLayers] = useState(true);
  const [timelineValue, setTimelineValue] = useState([0]);
  const [focusMode, setFocusMode] = useState(false);
  
  // Mock data - will be replaced with database
  const [pins] = useState<MapPin[]>([
    {
      id: "1",
      title: "Nineveh",
      x: 0.45,
      y: 0.35,
      blurb: "Ancient Assyrian capital, located near modern Mosul, Iraq. Flourished 705-612 BCE as administrative center of the Neo-Assyrian Empire.",
      sources: ["British Museum Archives", "Perseus Digital Library"],
      year: -700,
      layer: "Assyrian Empire"
    },
    {
      id: "2", 
      title: "Babylon",
      x: 0.42,
      y: 0.48,
      blurb: "Major city in ancient Mesopotamia, capital of Babylonian Empire. Peak influence under Nebuchadnezzar II (605-562 BCE).",
      sources: ["British Museum", "World History Encyclopedia"],
      year: -600,
      layer: "Babylonian Empire"
    }
  ]);

  const [activeLayers, setActiveLayers] = useState<Set<string>>(
    new Set(["Assyrian Empire", "Babylonian Empire", "Trade Routes"])
  );

  useEffect(() => {
    const color = localStorage.getItem("favcolor") || "#d4eaf7";
    setThemeColor(color);
    document.documentElement.style.setProperty('--theme-color', color);

    // Initialize OpenSeadragon
    if (viewerRef.current && !osdViewerRef.current) {
      osdViewerRef.current = OpenSeadragon({
        element: viewerRef.current,
        prefixUrl: "https://cdnjs.cloudflare.com/ajax/libs/openseadragon/4.1.0/images/",
        tileSources: {
          type: "image",
          // Placeholder image - will be replaced with actual tiled map
          url: "https://images.unsplash.com/photo-1524661135-423995f22d0b?w=2400&h=3600&fit=crop"
        },
        showNavigationControl: false,
        defaultZoomLevel: 1,
        minZoomLevel: 0.5,
        maxZoomLevel: 10,
        visibilityRatio: 1,
        constrainDuringPan: true,
        animationTime: 0.5,
      });

      toast({
        title: "Map Viewer Ready",
        description: "Use mouse wheel to zoom, click and drag to pan",
      });
    }

    return () => {
      if (osdViewerRef.current) {
        osdViewerRef.current.destroy();
        osdViewerRef.current = null;
      }
    };
  }, []);

  const handleZoomIn = () => {
    osdViewerRef.current?.viewport.zoomBy(1.5);
  };

  const handleZoomOut = () => {
    osdViewerRef.current?.viewport.zoomBy(0.67);
  };

  const handleReset = () => {
    osdViewerRef.current?.viewport.goHome();
    setFocusMode(false);
    toast({
      title: "View Reset",
      description: "Returned to default view",
    });
  };

  const handlePinClick = (pin: MapPin) => {
    setSelectedPin(pin);
  };

  const toggleLayer = (layer: string) => {
    const newLayers = new Set(activeLayers);
    if (newLayers.has(layer)) {
      newLayers.delete(layer);
    } else {
      newLayers.add(layer);
    }
    setActiveLayers(newLayers);
  };

  const saveToPinboard = () => {
    if (selectedPin) {
      toast({
        title: "Saved to Pinboard",
        description: `"${selectedPin.title}" added to your library`,
      });
      // TODO: Save to database
    }
  };

  const filteredPins = pins.filter(pin => 
    pin.layer ? activeLayers.has(pin.layer) : true
  );

  return (
    <div className="min-h-screen bg-background flex flex-col">
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
        Map Viewer
      </div>
      
      {/* Main Layout */}
      <div className="flex-1 flex ml-4">
        {/* Left Panel - Layers & Timeline */}
        <div className="w-64 border-r border-border bg-card/50 p-4 space-y-4 overflow-y-auto">
          <Card className="p-4">
            <div className="flex items-center gap-2 mb-3">
              <Layers className="w-4 h-4" />
              <h3 className="font-bold">Map Layers</h3>
            </div>
            <div className="space-y-2">
              {["Assyrian Empire", "Babylonian Empire", "Trade Routes", "Geographic Features"].map(layer => (
                <label key={layer} className="flex items-center gap-2 cursor-pointer hover:bg-accent/50 p-2 rounded">
                  <input
                    type="checkbox"
                    checked={activeLayers.has(layer)}
                    onChange={() => toggleLayer(layer)}
                    className="w-4 h-4"
                  />
                  <span className="text-sm">{layer}</span>
                </label>
              ))}
            </div>
          </Card>

          <Card className="p-4">
            <div className="flex items-center gap-2 mb-3">
              <Clock className="w-4 h-4" />
              <h3 className="font-bold">Timeline</h3>
            </div>
            <button
              onClick={() => setShowTimeline(!showTimeline)}
              className="text-sm text-muted-foreground hover:text-foreground"
            >
              {showTimeline ? "Hide" : "Show"} Timeline
            </button>
            {showTimeline && (
              <div className="mt-4">
                <Slider
                  value={timelineValue}
                  onValueChange={setTimelineValue}
                  min={-3000}
                  max={0}
                  step={100}
                  className="mb-2"
                />
                <div className="text-xs text-center text-muted-foreground">
                  {Math.abs(timelineValue[0])} BCE
                </div>
              </div>
            )}
          </Card>

          <div className="text-xs text-muted-foreground p-2">
            <p className="font-semibold mb-1">Active Pins: {filteredPins.length}</p>
            <p>Use layers to filter visible locations</p>
          </div>
        </div>

        {/* Center - Map Canvas */}
        <div className="flex-1 flex flex-col">
          <div 
            ref={viewerRef} 
            className={`flex-1 relative ${focusMode ? 'ring-4 ring-primary' : ''}`}
            style={{ minHeight: '500px' }}
          >
            {/* Pin Overlays */}
            {filteredPins.map(pin => (
              <button
                key={pin.id}
                onClick={() => handlePinClick(pin)}
                className="absolute w-8 h-8 -translate-x-1/2 -translate-y-1/2 bg-destructive hover:bg-destructive/80 rounded-full flex items-center justify-center shadow-lg transition-all hover:scale-110 z-50"
                style={{
                  left: `${pin.x * 100}%`,
                  top: `${pin.y * 100}%`,
                }}
                title={pin.title}
              >
                <Pin className="w-4 h-4 text-destructive-foreground" />
              </button>
            ))}
          </div>

          {/* Bottom Controls */}
          <div className="border-t border-border bg-card/50 p-3 flex items-center justify-between">
            <div className="flex gap-2">
              <Button size="sm" variant="outline" onClick={handleZoomIn} title="Zoom In">
                <ZoomIn className="w-4 h-4" />
              </Button>
              <Button size="sm" variant="outline" onClick={handleZoomOut} title="Zoom Out">
                <ZoomOut className="w-4 h-4" />
              </Button>
              <Button size="sm" variant="outline" onClick={handleReset} title="Reset View">
                <Maximize className="w-4 h-4" />
              </Button>
              <Button 
                size="sm" 
                variant={focusMode ? "default" : "outline"}
                onClick={() => setFocusMode(!focusMode)}
                title="Focus Mode"
              >
                <Eye className="w-4 h-4" />
              </Button>
            </div>
            
            <Button size="sm" variant="ghost" title="Help">
              <HelpCircle className="w-4 h-4" />
            </Button>
          </div>
        </div>

        {/* Right Panel - Context Bubble */}
        {selectedPin && (
          <div className="w-96 border-l border-border bg-card/50 p-4 overflow-y-auto">
            <Card className="p-4">
              <div className="flex items-start justify-between mb-3">
                <h2 className="text-xl font-bold">{selectedPin.title}</h2>
                <Button
                  size="sm"
                  variant="ghost"
                  onClick={() => setSelectedPin(null)}
                >
                  ✕
                </Button>
              </div>
              
              <p className="text-sm mb-4 leading-relaxed">{selectedPin.blurb}</p>
              
              {selectedPin.year && (
                <p className="text-xs text-muted-foreground mb-3">
                  Era: {Math.abs(selectedPin.year)} BCE
                </p>
              )}
              
              <div className="space-y-2 mb-4">
                <p className="text-xs font-semibold">Sources:</p>
                {selectedPin.sources.map((source, idx) => (
                  <p key={idx} className="text-xs text-muted-foreground pl-2">
                    • {source}
                  </p>
                ))}
              </div>
              
              <div className="flex gap-2">
                <Button size="sm" onClick={saveToPinboard} className="flex-1">
                  Save to Pinboard
                </Button>
                <Button size="sm" variant="outline">
                  More Info
                </Button>
              </div>
            </Card>

            <div className="mt-4 p-3 bg-muted/50 rounded-lg">
              <p className="text-xs text-muted-foreground">
                💡 Tip: Click pins on the map to explore historical locations. Use the timeline and layers to filter content.
              </p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default History;
