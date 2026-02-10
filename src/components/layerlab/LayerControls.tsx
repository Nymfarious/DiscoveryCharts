import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Slider } from "@/components/ui/slider";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Eye, EyeOff, Lock, Unlock, GripVertical, Download, Save, Calendar, Crosshair, Plus } from "lucide-react";
import { DragDropContext, Droppable, Draggable, DropResult } from "react-beautiful-dnd";

export type Layer = {
  id: string;
  theme: string;
  year: number;
  file_path: string;
  z_index: number;
  width_px: number | null;
  height_px: number | null;
  format: string;
  notes: string | null;
  visible: boolean;
  opacity: number;
  locked: boolean;
  url?: string;
};

interface LayerControlsProps {
  layers: Layer[];
  yearRange: [number, number];
  selectedTheme: string;
  availableThemes: string[];
  showRegistrationMarks: boolean;
  onToggleVisibility: (id: string) => void;
  onToggleLock: (id: string) => void;
  onUpdateOpacity: (id: string, opacity: number) => void;
  onDragEnd: (result: DropResult) => void;
  onTimeSliderChange: (value: number[]) => void;
  onThemeChange: (theme: string) => void;
  onToggleRegistration: () => void;
  onSaveGroup: () => void;
  onDownload: () => void;
  onCreateOverlay: () => void;
  isLayerInRange: (layer: Layer) => boolean;
}

export default function LayerControls({
  layers, yearRange, selectedTheme, availableThemes, showRegistrationMarks,
  onToggleVisibility, onToggleLock, onUpdateOpacity, onDragEnd, onTimeSliderChange,
  onThemeChange, onToggleRegistration, onSaveGroup, onDownload, onCreateOverlay, isLayerInRange
}: LayerControlsProps) {
  return (
    <Card className="border-2 border-[hsl(var(--brass))] bg-[hsl(var(--card))]">
      <CardHeader className="border-b border-[hsl(var(--border))]">
        <CardTitle className="text-lg flex items-center justify-between">
          <span>Layers</span>
          <div className="flex gap-2">
            <Button size="sm" variant="ghost" onClick={onToggleRegistration} title="Toggle registration marks">
              <Crosshair className={`w-4 h-4 ${showRegistrationMarks ? 'text-[hsl(var(--brass))]' : ''}`} />
            </Button>
            <Button size="sm" variant="ghost" onClick={onCreateOverlay} title="Create overlay"><Plus className="w-4 h-4" /></Button>
            <Button size="sm" variant="ghost" onClick={onSaveGroup} title="Save stack"><Save className="w-4 h-4" /></Button>
            <Button size="sm" variant="ghost" onClick={onDownload} title="Download"><Download className="w-4 h-4" /></Button>
          </div>
        </CardTitle>
      </CardHeader>
      <CardContent className="pt-4">
        {layers.length > 0 && (
          <div className="mb-4 p-4 rounded-lg border border-[hsl(var(--border))] bg-[hsl(var(--muted))]">
            <div className="flex items-center gap-2 mb-3">
              <Calendar className="w-4 h-4 text-[hsl(var(--brass))]" />
              <span className="text-sm font-medium">Timeline Filter</span>
            </div>
            <div className="space-y-3">
              <div>
                <label className="text-xs text-muted-foreground mb-2 block">Theme</label>
                <Select value={selectedTheme} onValueChange={onThemeChange}>
                  <SelectTrigger className="w-full"><SelectValue placeholder="All themes" /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All themes</SelectItem>
                    {availableThemes.map(t => <SelectItem key={t} value={t}>{t}</SelectItem>)}
                  </SelectContent>
                </Select>
              </div>
              <div>
                <label className="text-xs text-muted-foreground mb-2 block">Year Range: {yearRange[0]} - {yearRange[1]}</label>
                <Slider value={yearRange} onValueChange={onTimeSliderChange} min={Math.min(...layers.map(l => l.year))} max={Math.max(...layers.map(l => l.year))} step={1} className="w-full" />
              </div>
            </div>
          </div>
        )}

        <div className="space-y-1 max-h-[calc(100vh-500px)] overflow-y-auto">
          <DragDropContext onDragEnd={onDragEnd}>
            <Droppable droppableId="layers">
              {(provided) => (
                <div {...provided.droppableProps} ref={provided.innerRef}>
                  {layers.map((layer, index) => {
                    const inRange = isLayerInRange(layer);
                    return (
                      <Draggable key={layer.id} draggableId={layer.id} index={index} isDragDisabled={layer.locked}>
                        {(provided, snapshot) => (
                          <div ref={provided.innerRef} {...provided.draggableProps}
                            className={`flex flex-col gap-2 p-3 rounded-lg border bg-[hsl(var(--card))] mb-2 ${snapshot.isDragging ? 'shadow-lg' : ''} ${!inRange ? 'opacity-40' : ''}`}
                            style={{ ...provided.draggableProps.style, borderColor: layer.visible && inRange ? 'hsl(var(--brass))' : 'hsl(var(--border))' }}>
                            <div className="flex items-center gap-2">
                              <div {...provided.dragHandleProps}><GripVertical className="w-4 h-4 text-muted-foreground cursor-grab" /></div>
                              <Button size="sm" variant="ghost" onClick={() => onToggleVisibility(layer.id)} className="p-1">
                                {layer.visible ? <Eye className="w-4 h-4" /> : <EyeOff className="w-4 h-4 text-muted-foreground" />}
                              </Button>
                              <Button size="sm" variant="ghost" onClick={() => onToggleLock(layer.id)} className="p-1">
                                {layer.locked ? <Lock className="w-4 h-4" /> : <Unlock className="w-4 h-4 text-muted-foreground" />}
                              </Button>
                              <div className="flex-1 min-w-0">
                                <div className="font-medium text-sm truncate">{layer.theme}</div>
                                <div className="text-xs text-muted-foreground">{layer.year}</div>
                              </div>
                              <div className="text-xs text-muted-foreground">z:{layer.z_index}</div>
                            </div>
                            <div className="flex items-center gap-2 ml-8">
                              <span className="text-xs text-muted-foreground w-12">{Math.round(layer.opacity * 100)}%</span>
                              <Slider value={[layer.opacity * 100]} onValueChange={(val) => onUpdateOpacity(layer.id, val[0] / 100)} max={100} step={1} className="flex-1" disabled={layer.locked} />
                            </div>
                          </div>
                        )}
                      </Draggable>
                    );
                  })}
                  {provided.placeholder}
                </div>
              )}
            </Droppable>
          </DragDropContext>

          {layers.length === 0 && (
            <p className="text-sm text-muted-foreground text-center py-8">No overlay layers found for this base map</p>
          )}
        </div>
      </CardContent>
    </Card>
  );
}
