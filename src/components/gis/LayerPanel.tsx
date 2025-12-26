import React from 'react';
import { Eye, EyeOff, Trash2, Download, Layers, ChevronDown, ChevronRight, Info } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Slider } from '@/components/ui/slider';
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from '@/components/ui/collapsible';
import type { GISLayer } from '@/lib/gisStorage';

interface LayerPanelProps {
  layers: GISLayer[];
  onToggleVisibility: (id: string) => void;
  onDeleteLayer: (id: string) => void;
  onOpacityChange: (id: string, opacity: number) => void;
  onColorChange: (id: string, color: string) => void;
  onZoomToLayer: (id: string) => void;
  onExportGeoJSON: (id: string) => void;
}

const TYPE_ICONS: Record<string, string> = {
  geojson: '📍',
  shapefile: '🗺️',
  kml: '📌',
  geotiff: '🖼️',
  image: '🏞️'
};

export function LayerPanel({
  layers,
  onToggleVisibility,
  onDeleteLayer,
  onOpacityChange,
  onColorChange,
  onZoomToLayer,
  onExportGeoJSON
}: LayerPanelProps) {
  const [expandedLayers, setExpandedLayers] = React.useState<Set<string>>(new Set());

  const toggleExpanded = (id: string) => {
    setExpandedLayers(prev => {
      const next = new Set(prev);
      if (next.has(id)) {
        next.delete(id);
      } else {
        next.add(id);
      }
      return next;
    });
  };

  if (layers.length === 0) {
    return (
      <div className="p-4 text-center text-muted-foreground">
        <Layers className="w-8 h-8 mx-auto mb-2 opacity-50" />
        <p className="text-sm">No layers loaded</p>
        <p className="text-xs mt-1">Drop files to add layers</p>
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-1 p-2">
      <div className="flex items-center gap-2 px-2 py-1 text-sm font-medium text-foreground border-b border-border mb-2">
        <Layers className="w-4 h-4" />
        <span>Layers ({layers.length})</span>
      </div>

      {layers.map(layer => {
        const isExpanded = expandedLayers.has(layer.id);
        
        return (
          <Collapsible key={layer.id} open={isExpanded} onOpenChange={() => toggleExpanded(layer.id)}>
            <div className="bg-card rounded-lg border border-border overflow-hidden">
              {/* Layer Header */}
              <div className="flex items-center gap-2 p-2">
                <CollapsibleTrigger asChild>
                  <Button variant="ghost" size="icon" className="h-6 w-6 shrink-0">
                    {isExpanded ? <ChevronDown className="w-4 h-4" /> : <ChevronRight className="w-4 h-4" />}
                  </Button>
                </CollapsibleTrigger>

                <span className="text-lg">{TYPE_ICONS[layer.type] || '📄'}</span>

                <button
                  onClick={() => onZoomToLayer(layer.id)}
                  className="flex-1 text-left text-sm font-medium text-foreground truncate hover:text-primary transition-colors"
                  title={layer.name}
                >
                  {layer.name}
                </button>

                <Button
                  variant="ghost"
                  size="icon"
                  className="h-6 w-6 shrink-0"
                  onClick={() => onToggleVisibility(layer.id)}
                >
                  {layer.visible ? (
                    <Eye className="w-4 h-4 text-primary" />
                  ) : (
                    <EyeOff className="w-4 h-4 text-muted-foreground" />
                  )}
                </Button>
              </div>

              {/* Expanded Content */}
              <CollapsibleContent>
                <div className="px-3 pb-3 space-y-3 border-t border-border pt-3">
                  {/* Metadata */}
                  <div className="text-xs text-muted-foreground space-y-1">
                    <div className="flex items-center gap-2">
                      <Info className="w-3 h-3" />
                      <span>Type: {layer.type.toUpperCase()}</span>
                    </div>
                    {layer.featureCount !== undefined && (
                      <div className="pl-5">Features: {layer.featureCount}</div>
                    )}
                    {layer.projection && (
                      <div className="pl-5 truncate" title={layer.projection}>
                        Projection: {layer.projection.substring(0, 30)}...
                      </div>
                    )}
                    {layer.bounds && (
                      <div className="pl-5">
                        Bounds: [{layer.bounds[0][0].toFixed(2)}, {layer.bounds[0][1].toFixed(2)}] to [{layer.bounds[1][0].toFixed(2)}, {layer.bounds[1][1].toFixed(2)}]
                      </div>
                    )}
                  </div>

                  {/* Color Picker (for vector layers) */}
                  {layer.color && ['geojson', 'shapefile', 'kml'].includes(layer.type) && (
                    <div className="flex items-center gap-2">
                      <span className="text-xs text-muted-foreground">Color:</span>
                      <input
                        type="color"
                        value={layer.color}
                        onChange={(e) => onColorChange(layer.id, e.target.value)}
                        className="w-8 h-6 rounded cursor-pointer border border-border"
                      />
                    </div>
                  )}

                  {/* Opacity Slider */}
                  <div className="space-y-1">
                    <span className="text-xs text-muted-foreground">Opacity: {Math.round(layer.opacity * 100)}%</span>
                    <Slider
                      value={[layer.opacity * 100]}
                      onValueChange={([val]) => onOpacityChange(layer.id, val / 100)}
                      min={0}
                      max={100}
                      step={5}
                      className="w-full"
                    />
                  </div>

                  {/* Actions */}
                  <div className="flex gap-2">
                    {['geojson', 'shapefile', 'kml'].includes(layer.type) && (
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => onExportGeoJSON(layer.id)}
                        className="flex-1"
                      >
                        <Download className="w-3 h-3 mr-1" />
                        Export
                      </Button>
                    )}
                    <Button
                      variant="destructive"
                      size="sm"
                      onClick={() => onDeleteLayer(layer.id)}
                      className="flex-1"
                    >
                      <Trash2 className="w-3 h-3 mr-1" />
                      Remove
                    </Button>
                  </div>
                </div>
              </CollapsibleContent>
            </div>
          </Collapsible>
        );
      })}
    </div>
  );
}
