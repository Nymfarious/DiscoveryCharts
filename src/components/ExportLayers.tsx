import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Download, Loader2, FileText, Image as ImageIcon, Presentation } from "lucide-react";
import { toast } from "sonner";
import PptxGenJS from "pptxgenjs";
import { PDFDocument, rgb } from "pdf-lib";

type Layer = {
  id: string;
  theme: string;
  year: number;
  url?: string;
  visible: boolean;
};

type BaseMap = {
  title: string;
  url?: string;
};

interface ExportLayersProps {
  baseMap: BaseMap | null;
  layers: Layer[];
}

export default function ExportLayers({ baseMap, layers }: ExportLayersProps) {
  const [isExporting, setIsExporting] = useState(false);
  const [exportType, setExportType] = useState<string>("");

  async function loadImageAsDataUrl(url: string): Promise<string> {
    return new Promise((resolve, reject) => {
      const img = new Image();
      img.crossOrigin = 'anonymous';
      img.onload = () => {
        const canvas = document.createElement('canvas');
        canvas.width = img.width;
        canvas.height = img.height;
        const ctx = canvas.getContext('2d');
        if (!ctx) {
          reject(new Error('Failed to get canvas context'));
          return;
        }
        ctx.drawImage(img, 0, 0);
        resolve(canvas.toDataURL('image/png'));
      };
      img.onerror = reject;
      img.src = url;
    });
  }

  async function exportAsPDF() {
    if (!baseMap?.url) {
      toast.error('Base map not loaded');
      return;
    }

    setIsExporting(true);
    setExportType("PDF");
    toast.info('Generating PDF... This may take a moment.');

    try {
      const pdfDoc = await PDFDocument.create();
      const visibleLayers = layers.filter(l => l.visible);

      // Add base map page
      const baseImageUrl = await loadImageAsDataUrl(baseMap.url);
      const baseImage = await pdfDoc.embedPng(baseImageUrl);
      const baseDims = baseImage.scale(1);
      
      const page = pdfDoc.addPage([baseDims.width, baseDims.height]);
      page.drawImage(baseImage, {
        x: 0,
        y: 0,
        width: baseDims.width,
        height: baseDims.height,
      });

      // Add title
      page.drawText(baseMap.title, {
        x: 50,
        y: baseDims.height - 50,
        size: 20,
        color: rgb(0, 0, 0),
      });

      // Add each visible layer as a separate page
      for (const layer of visibleLayers) {
        if (!layer.url) continue;

        const layerImageUrl = await loadImageAsDataUrl(layer.url);
        const layerImage = await pdfDoc.embedPng(layerImageUrl);
        const layerPage = pdfDoc.addPage([baseDims.width, baseDims.height]);
        
        layerPage.drawImage(layerImage, {
          x: 0,
          y: 0,
          width: baseDims.width,
          height: baseDims.height,
        });

        layerPage.drawText(`${layer.theme} (${layer.year})`, {
          x: 50,
          y: baseDims.height - 50,
          size: 16,
          color: rgb(0, 0, 0),
        });
      }

      const pdfBytes = await pdfDoc.save();
      const blob = new Blob([new Uint8Array(pdfBytes)], { type: 'application/pdf' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `${baseMap.title}_layers.pdf`;
      a.click();
      URL.revokeObjectURL(url);

      toast.success('PDF exported successfully!');
    } catch (error: any) {
      console.error('Error exporting PDF:', error);
      toast.error(error.message || 'Failed to export PDF');
    } finally {
      setIsExporting(false);
      setExportType("");
    }
  }

  async function exportAsPNG() {
    if (!baseMap?.url) {
      toast.error('Base map not loaded');
      return;
    }

    setIsExporting(true);
    setExportType("PNG");
    toast.info('Generating PNG files...');

    try {
      const visibleLayers = layers.filter(l => l.visible);
      
      // Export base map
      const baseImageUrl = await loadImageAsDataUrl(baseMap.url);
      downloadDataUrl(baseImageUrl, `${baseMap.title}_base.png`);

      // Export each layer
      for (const layer of visibleLayers) {
        if (!layer.url) continue;
        const layerImageUrl = await loadImageAsDataUrl(layer.url);
        downloadDataUrl(layerImageUrl, `${layer.theme}_${layer.year}.png`);
      }

      toast.success(`Exported ${visibleLayers.length + 1} PNG files!`);
    } catch (error: any) {
      console.error('Error exporting PNG:', error);
      toast.error(error.message || 'Failed to export PNG files');
    } finally {
      setIsExporting(false);
      setExportType("");
    }
  }

  async function exportAsPPTX() {
    if (!baseMap?.url) {
      toast.error('Base map not loaded');
      return;
    }

    setIsExporting(true);
    setExportType("PPTX");
    toast.info('Generating PowerPoint... This may take a moment.');

    try {
      const pptx = new PptxGenJS();
      pptx.layout = 'LAYOUT_WIDE';
      const visibleLayers = layers.filter(l => l.visible);

      // Title slide
      const titleSlide = pptx.addSlide();
      titleSlide.addText(baseMap.title, {
        x: 1,
        y: 2,
        w: 8,
        h: 1,
        fontSize: 36,
        bold: true,
        align: 'center',
        color: '363636',
      });
      titleSlide.addText(`${visibleLayers.length} Overlay Layers`, {
        x: 1,
        y: 3.5,
        w: 8,
        h: 0.5,
        fontSize: 20,
        align: 'center',
        color: '666666',
      });

      // Base map slide
      const baseSlide = pptx.addSlide();
      baseSlide.addText('Base Map', {
        x: 0.5,
        y: 0.3,
        w: 9,
        h: 0.5,
        fontSize: 24,
        bold: true,
        color: '363636',
      });
      const baseImageUrl = await loadImageAsDataUrl(baseMap.url);
      baseSlide.addImage({
        data: baseImageUrl,
        x: 0.5,
        y: 1,
        w: 9,
        h: 4.5,
      });

      // Layer slides
      for (const layer of visibleLayers) {
        if (!layer.url) continue;

        const slide = pptx.addSlide();
        slide.addText(`${layer.theme} (${layer.year})`, {
          x: 0.5,
          y: 0.3,
          w: 9,
          h: 0.5,
          fontSize: 24,
          bold: true,
          color: '363636',
        });

        const layerImageUrl = await loadImageAsDataUrl(layer.url);
        slide.addImage({
          data: layerImageUrl,
          x: 0.5,
          y: 1,
          w: 9,
          h: 4.5,
        });
      }

      await pptx.writeFile({ fileName: `${baseMap.title}_layers.pptx` });
      toast.success('PowerPoint exported successfully!');
    } catch (error: any) {
      console.error('Error exporting PPTX:', error);
      toast.error(error.message || 'Failed to export PowerPoint');
    } finally {
      setIsExporting(false);
      setExportType("");
    }
  }

  function downloadDataUrl(dataUrl: string, filename: string) {
    const a = document.createElement('a');
    a.href = dataUrl;
    a.download = filename;
    a.click();
  }

  const visibleLayerCount = layers.filter(l => l.visible).length;

  return (
    <Card className="border-2 border-[hsl(var(--brass))] bg-[hsl(var(--card))]">
      <CardHeader className="border-b border-[hsl(var(--border))]">
        <CardTitle className="flex items-center gap-2">
          <Download className="w-5 h-5 text-[hsl(var(--brass))]" />
          Export for Classroom
        </CardTitle>
        <CardDescription>
          Export layer stacks for projector presentations and printed transparencies
        </CardDescription>
      </CardHeader>
      <CardContent className="pt-6">
        <div className="grid gap-4 md:grid-cols-3">
          <Card className="border border-[hsl(var(--border))]">
            <CardContent className="pt-6">
              <FileText className="w-8 h-8 mb-3 text-[hsl(var(--brass))]" />
              <h3 className="font-semibold mb-2">PDF Projector Pack</h3>
              <p className="text-sm text-muted-foreground mb-4">
                Each layer on its own page, perfect for printing transparencies
              </p>
              <Button
                onClick={exportAsPDF}
                disabled={isExporting || !baseMap || visibleLayerCount === 0}
                className="w-full"
              >
                {isExporting && exportType === "PDF" ? (
                  <>
                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                    Exporting...
                  </>
                ) : (
                  <>
                    <FileText className="w-4 h-4 mr-2" />
                    Export PDF
                  </>
                )}
              </Button>
            </CardContent>
          </Card>

          <Card className="border border-[hsl(var(--border))]">
            <CardContent className="pt-6">
              <ImageIcon className="w-8 h-8 mb-3 text-[hsl(var(--brass))]" />
              <h3 className="font-semibold mb-2">PNG Transparency Set</h3>
              <p className="text-sm text-muted-foreground mb-4">
                Individual transparent PNGs for each layer
              </p>
              <Button
                onClick={exportAsPNG}
                disabled={isExporting || !baseMap || visibleLayerCount === 0}
                variant="outline"
                className="w-full"
              >
                {isExporting && exportType === "PNG" ? (
                  <>
                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                    Exporting...
                  </>
                ) : (
                  <>
                    <ImageIcon className="w-4 h-4 mr-2" />
                    Export PNGs
                  </>
                )}
              </Button>
            </CardContent>
          </Card>

          <Card className="border border-[hsl(var(--border))]">
            <CardContent className="pt-6">
              <Presentation className="w-8 h-8 mb-3 text-[hsl(var(--brass))]" />
              <h3 className="font-semibold mb-2">PowerPoint Deck</h3>
              <p className="text-sm text-muted-foreground mb-4">
                One layer per slide for classroom pacing
              </p>
              <Button
                onClick={exportAsPPTX}
                disabled={isExporting || !baseMap || visibleLayerCount === 0}
                variant="outline"
                className="w-full"
              >
                {isExporting && exportType === "PPTX" ? (
                  <>
                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                    Exporting...
                  </>
                ) : (
                  <>
                    <Presentation className="w-4 h-4 mr-2" />
                    Export PPTX
                  </>
                )}
              </Button>
            </CardContent>
          </Card>
        </div>

        {visibleLayerCount === 0 && (
          <p className="text-sm text-muted-foreground text-center mt-4">
            No visible layers to export. Make sure at least one layer is visible.
          </p>
        )}
      </CardContent>
    </Card>
  );
}