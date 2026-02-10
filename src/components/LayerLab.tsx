import { useEffect, useState, useRef } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { toast } from "sonner";
import { DropResult } from "react-beautiful-dnd";
import ExportLayers from "@/components/ExportLayers";
import { useNavigate } from "react-router-dom";
import LayerControls, { type Layer } from "@/components/layerlab/LayerControls";

type BaseMap = {
  id: string;
  title: string;
  canonical_width: number | null;
  canonical_height: number | null;
  file_path: string;
  registration?: { tl: { x: number; y: number }; tr: { x: number; y: number }; bl: { x: number; y: number } } | null;
  url?: string;
};

interface LayerLabProps { baseMapId: string; }

export default function LayerLab({ baseMapId }: LayerLabProps) {
  const navigate = useNavigate();
  const [baseMap, setBaseMap] = useState<BaseMap | null>(null);
  const [layers, setLayers] = useState<Layer[]>([]);
  const [loading, setLoading] = useState(true);
  const [yearRange, setYearRange] = useState<[number, number]>([0, 3000]);
  const [selectedTheme, setSelectedTheme] = useState("all");
  const [availableThemes, setAvailableThemes] = useState<string[]>([]);
  const [showRegistrationMarks, setShowRegistrationMarks] = useState(false);
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => { loadBaseAndLayers(); }, [baseMapId]);
  useEffect(() => { if (baseMap && layers.length > 0) renderComposite(); }, [baseMap, layers, showRegistrationMarks, yearRange, selectedTheme]);

  async function loadBaseAndLayers() {
    setLoading(true);
    try {
      const { data: baseData, error: baseError } = await supabase.from('base_maps').select('*').eq('id', baseMapId).maybeSingle();
      if (baseError) throw baseError;
      if (!baseData) { toast.error('Base map not found'); return; }
      const { data: baseUrl } = supabase.storage.from('tiles').getPublicUrl(baseData.file_path);
      setBaseMap({ ...baseData, url: baseUrl.publicUrl, registration: baseData.registration as any });

      const { data: overlaysData, error: overlaysError } = await supabase.from('overlays').select('*').eq('base_map_id', baseMapId).order('z_index', { ascending: true });
      if (overlaysError) throw overlaysError;
      const layersWithUrls = (overlaysData || []).map(overlay => {
        const { data: url } = supabase.storage.from('tiles').getPublicUrl(overlay.file_path);
        return { ...overlay, url: url.publicUrl, visible: true, opacity: 1, locked: false };
      });
      setLayers(layersWithUrls);
      if (layersWithUrls.length > 0) {
        const years = layersWithUrls.map(l => l.year);
        setYearRange([Math.min(...years), Math.max(...years)]);
        setAvailableThemes([...new Set(layersWithUrls.map(l => l.theme))]);
      }
    } catch (error: any) { toast.error(error.message || 'Failed to load'); }
    finally { setLoading(false); }
  }

  function isLayerInRange(layer: Layer): boolean {
    return layer.year >= yearRange[0] && layer.year <= yearRange[1] && (selectedTheme === "all" || layer.theme === selectedTheme);
  }

  async function renderComposite() {
    const canvas = canvasRef.current;
    if (!canvas || !baseMap?.url) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;
    const width = baseMap.canonical_width || 2560;
    const height = baseMap.canonical_height || 1440;
    canvas.width = width; canvas.height = height;
    ctx.clearRect(0, 0, width, height);

    const baseImg = new Image(); baseImg.crossOrigin = 'anonymous'; baseImg.src = baseMap.url;
    await new Promise((resolve, reject) => { baseImg.onload = resolve; baseImg.onerror = reject; });
    ctx.drawImage(baseImg, 0, 0, width, height);

    for (const layer of layers.filter(l => l.visible && isLayerInRange(l)).sort((a, b) => a.z_index - b.z_index)) {
      if (!layer.url) continue;
      const img = new Image(); img.crossOrigin = 'anonymous'; img.src = layer.url;
      try {
        await new Promise((resolve, reject) => { img.onload = resolve; img.onerror = reject; });
        ctx.globalAlpha = layer.opacity; ctx.drawImage(img, 0, 0, width, height); ctx.globalAlpha = 1;
      } catch { console.error(`Failed to load layer ${layer.theme}`); }
    }

    if (showRegistrationMarks && baseMap.registration) {
      const reg = baseMap.registration;
      if (reg.tl && reg.tr && reg.bl) {
        ctx.strokeStyle = 'rgba(255,0,0,0.5)'; ctx.lineWidth = 2; ctx.fillStyle = 'rgba(255,0,0,0.7)'; ctx.font = '14px Arial';
        [{ p: reg.tl, l: '1' }, { p: reg.tr, l: '2' }, { p: reg.bl, l: '3' }].forEach(({ p, l }) => {
          ctx.beginPath(); ctx.moveTo(p.x - 30, p.y); ctx.lineTo(p.x + 30, p.y); ctx.stroke();
          ctx.beginPath(); ctx.moveTo(p.x, p.y - 30); ctx.lineTo(p.x, p.y + 30); ctx.stroke();
          ctx.beginPath(); ctx.arc(p.x, p.y, 15, 0, Math.PI * 2); ctx.stroke();
          ctx.fillText(l, p.x + 35, p.y + 5);
        });
      }
    }
  }

  async function handleDragEnd(result: DropResult) {
    if (!result.destination) return;
    const items = Array.from(layers);
    const [reordered] = items.splice(result.source.index, 1);
    items.splice(result.destination.index, 0, reordered);
    const updated = items.map((item, i) => ({ ...item, z_index: i }));
    setLayers(updated);
    try {
      await Promise.all(updated.map(l => supabase.from('overlays').update({ z_index: l.z_index }).eq('id', l.id)));
      toast.success('Layer order saved');
    } catch { toast.error('Failed to save order'); }
  }

  async function downloadComposite() {
    canvasRef.current?.toBlob(blob => {
      if (!blob) return;
      const a = document.createElement('a'); a.href = URL.createObjectURL(blob);
      a.download = `${baseMap?.title || 'composite'}_layers.png`; a.click();
      toast.success('Image downloaded');
    });
  }

  async function saveAsGroup() {
    const title = prompt('Enter a name for this layer stack:');
    if (!title) return;
    try {
      const { error } = await supabase.from('overlay_groups').insert({ base_map_id: baseMapId, title, overlay_ids: layers.filter(l => l.visible).map(l => l.id) });
      if (error) throw error;
      toast.success('Layer stack saved');
    } catch (error: any) { toast.error(error.message || 'Failed to save'); }
  }

  if (loading) return <div className="flex items-center justify-center p-8"><p className="text-muted-foreground">Loading layers...</p></div>;

  return (
    <div className="space-y-4">
      <div className="grid gap-4 lg:grid-cols-[320px_1fr]">
        <LayerControls
          layers={layers} yearRange={yearRange} selectedTheme={selectedTheme}
          availableThemes={availableThemes} showRegistrationMarks={showRegistrationMarks}
          onToggleVisibility={(id) => setLayers(prev => prev.map(l => l.id === id ? { ...l, visible: !l.visible } : l))}
          onToggleLock={(id) => setLayers(prev => prev.map(l => l.id === id ? { ...l, locked: !l.locked } : l))}
          onUpdateOpacity={(id, opacity) => setLayers(prev => prev.map(l => l.id === id ? { ...l, opacity } : l))}
          onDragEnd={handleDragEnd}
          onTimeSliderChange={(v) => setYearRange([v[0], v[1]])}
          onThemeChange={setSelectedTheme}
          onToggleRegistration={() => setShowRegistrationMarks(!showRegistrationMarks)}
          onSaveGroup={saveAsGroup} onDownload={downloadComposite}
          onCreateOverlay={() => navigate(`/overlay-creator?baseMapId=${baseMapId}`)}
          isLayerInRange={isLayerInRange}
        />

        <Card className="border-2 border-[hsl(var(--brass))] bg-[hsl(var(--card))]">
          <CardHeader className="border-b border-[hsl(var(--border))]">
            <CardTitle className="flex items-center gap-2">{baseMap?.title || 'Layer Composite'}</CardTitle>
          </CardHeader>
          <CardContent className="pt-4">
            <div className="rounded-lg overflow-hidden border border-[hsl(var(--border))] bg-[hsl(var(--muted))]">
              <canvas ref={canvasRef} className="w-full h-auto" style={{ maxHeight: '70vh', objectFit: 'contain' }} />
            </div>
          </CardContent>
        </Card>
      </div>

      <ExportLayers baseMap={baseMap ? { title: baseMap.title, url: baseMap.url } : null} layers={layers} />
    </div>
  );
}
