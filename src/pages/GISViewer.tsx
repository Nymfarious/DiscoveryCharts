import React, { useState, useEffect, useRef, useCallback } from 'react';
import { Link } from 'react-router-dom';
import L from 'leaflet';
import { MapPin, Home, PanelLeft, PanelLeftClose, Trash2, Download } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { toast } from 'sonner';
import { FileDropZone } from '@/components/gis/FileDropZone';
import { LayerPanel } from '@/components/gis/LayerPanel';
import { MapView, useZoomToLayer } from '@/components/gis/MapView';
import { MeasureTools } from '@/components/gis/MeasureTools';
import { saveLayers, loadLayers, deleteLayer as deleteFromDB, clearAllLayers, GISLayer } from '@/lib/gisStorage';

export default function GISViewer() {
  const [layers, setLayers] = useState<GISLayer[]>([]);
  const [isPanelOpen, setIsPanelOpen] = useState(true);
  const [mouseCoords, setMouseCoords] = useState<{ lat: number; lng: number } | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const mapRef = useRef<L.Map | null>(null);
  
  const zoomToLayer = useZoomToLayer(mapRef, layers);

  // Load layers from IndexedDB on mount
  useEffect(() => {
    loadLayers()
      .then(savedLayers => {
        setLayers(savedLayers);
        setIsLoading(false);
      })
      .catch(err => {
        console.error('Error loading layers:', err);
        setIsLoading(false);
      });
  }, []);

  // Save layers to IndexedDB when they change
  useEffect(() => {
    if (!isLoading && layers.length > 0) {
      saveLayers(layers).catch(err => {
        console.error('Error saving layers:', err);
      });
    }
  }, [layers, isLoading]);

  const handleFilesLoaded = useCallback((newLayers: GISLayer[]) => {
    setLayers(prev => [...prev, ...newLayers]);
    toast.success(`Loaded ${newLayers.length} layer(s)`);
    
    // Zoom to first layer with bounds
    const layerWithBounds = newLayers.find(l => l.bounds);
    if (layerWithBounds && mapRef.current) {
      setTimeout(() => {
        mapRef.current?.fitBounds(layerWithBounds.bounds!, { padding: [50, 50] });
      }, 100);
    }
  }, []);

  const handleToggleVisibility = useCallback((id: string) => {
    setLayers(prev => prev.map(l => 
      l.id === id ? { ...l, visible: !l.visible } : l
    ));
  }, []);

  const handleDeleteLayer = useCallback(async (id: string) => {
    setLayers(prev => prev.filter(l => l.id !== id));
    await deleteFromDB(id);
    toast.success('Layer removed');
  }, []);

  const handleOpacityChange = useCallback((id: string, opacity: number) => {
    setLayers(prev => prev.map(l => 
      l.id === id ? { ...l, opacity } : l
    ));
  }, []);

  const handleColorChange = useCallback((id: string, color: string) => {
    setLayers(prev => prev.map(l => 
      l.id === id ? { ...l, color } : l
    ));
  }, []);

  const handleExportGeoJSON = useCallback((id: string) => {
    const layer = layers.find(l => l.id === id);
    if (!layer || !layer.data) return;

    const data = JSON.stringify(layer.data, null, 2);
    const blob = new Blob([data], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    
    const a = document.createElement('a');
    a.href = url;
    a.download = `${layer.name.replace(/\.[^/.]+$/, '')}.geojson`;
    a.click();
    
    URL.revokeObjectURL(url);
    toast.success('GeoJSON exported');
  }, [layers]);

  const handleClearAll = useCallback(async () => {
    setLayers([]);
    await clearAllLayers();
    toast.success('All layers cleared');
  }, []);

  return (
    <div className="h-screen flex flex-col bg-background">
      {/* Header */}
      <header className="h-14 border-b border-border bg-card flex items-center justify-between px-4 shrink-0">
        <div className="flex items-center gap-4">
          <Link to="/" className="flex items-center gap-2 hover:opacity-80 transition-opacity">
            <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center">
              <MapPin className="w-4 h-4 text-primary" />
            </div>
            <span className="font-semibold text-foreground">Discovery Charts</span>
          </Link>
          
          <div className="h-6 w-px bg-border" />
          
          <h1 className="text-sm font-medium text-muted-foreground">GIS Viewer</h1>
        </div>

        <div className="flex items-center gap-2">
          {/* Coordinate Display */}
          {mouseCoords && (
            <div className="text-xs text-muted-foreground font-mono bg-muted px-2 py-1 rounded">
              {mouseCoords.lat.toFixed(5)}, {mouseCoords.lng.toFixed(5)}
            </div>
          )}
          
          <Button variant="ghost" size="sm" asChild>
            <Link to="/">
              <Home className="w-4 h-4 mr-1" />
              Home
            </Link>
          </Button>
        </div>
      </header>

      {/* Main Content */}
      <div className="flex-1 flex overflow-hidden">
        {/* Side Panel */}
        <aside 
          className={`
            border-r border-border bg-card shrink-0 flex flex-col transition-all duration-200
            ${isPanelOpen ? 'w-80' : 'w-0'}
          `}
        >
          {isPanelOpen && (
            <>
              {/* File Drop Zone */}
              <div className="p-3 border-b border-border">
                <FileDropZone onFilesLoaded={handleFilesLoaded} />
              </div>

              {/* Layers */}
              <div className="flex-1 overflow-y-auto">
                <LayerPanel
                  layers={layers}
                  onToggleVisibility={handleToggleVisibility}
                  onDeleteLayer={handleDeleteLayer}
                  onOpacityChange={handleOpacityChange}
                  onColorChange={handleColorChange}
                  onZoomToLayer={zoomToLayer}
                  onExportGeoJSON={handleExportGeoJSON}
                />
              </div>

              {/* Clear All Button */}
              {layers.length > 0 && (
                <div className="p-3 border-t border-border">
                  <Button 
                    variant="outline" 
                    className="w-full" 
                    onClick={handleClearAll}
                  >
                    <Trash2 className="w-4 h-4 mr-2" />
                    Clear All Layers
                  </Button>
                </div>
              )}
            </>
          )}
        </aside>

        {/* Map Container */}
        <main className="flex-1 relative">
          {/* Panel Toggle */}
          <Button
            variant="outline"
            size="icon"
            className="absolute top-3 left-3 z-[1000] bg-card shadow-md"
            onClick={() => setIsPanelOpen(!isPanelOpen)}
          >
            {isPanelOpen ? <PanelLeftClose className="w-4 h-4" /> : <PanelLeft className="w-4 h-4" />}
          </Button>

          {/* Measure Tools */}
          <div className="absolute top-3 left-16 z-[1000]">
            <MeasureTools map={mapRef.current} />
          </div>

          {/* Map */}
          <MapView 
            layers={layers} 
            onMouseMove={setMouseCoords}
            mapRef={mapRef}
          />

          {/* Empty State Overlay */}
          {layers.length === 0 && !isLoading && (
            <div className="absolute inset-0 flex items-center justify-center pointer-events-none z-[500]">
              <div className="bg-card/95 backdrop-blur-sm border border-border rounded-lg p-8 text-center shadow-lg pointer-events-auto max-w-md">
                <MapPin className="w-12 h-12 text-primary mx-auto mb-4" />
                <h2 className="text-xl font-semibold text-foreground mb-2">Welcome to GIS Viewer</h2>
                <p className="text-muted-foreground mb-4">
                  Drop files onto the panel to start exploring geographic data.
                  Supports GeoJSON, Shapefiles, KML/KMZ, GeoTIFF, and images.
                </p>
                <Button onClick={() => setIsPanelOpen(true)}>
                  Open Layer Panel
                </Button>
              </div>
            </div>
          )}
        </main>
      </div>
    </div>
  );
}
