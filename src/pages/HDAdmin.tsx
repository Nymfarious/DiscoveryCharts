import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { Upload, Loader2, FileImage, Package } from "lucide-react";
import { Separator } from "@/components/ui/separator";

interface FileWithMetadata {
  file: File;
  width: number;
  height: number;
  format: string;
}

export default function HDAdmin() {
  const { toast } = useToast();
  const [uploading, setUploading] = useState(false);
  const [files, setFiles] = useState<FileWithMetadata[]>([]);
  const [mapType, setMapType] = useState<"base" | "overlay">("base");
  const [region, setRegion] = useState("");
  const [year, setYear] = useState("");
  const [theme, setTheme] = useState("");

  const handleFileSelect = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFiles = Array.from(e.target.files || []);
    await processFiles(selectedFiles);
  };

  const handleDrop = async (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    const droppedFiles = Array.from(e.dataTransfer.files);
    await processFiles(droppedFiles);
  };

  const processFiles = async (rawFiles: File[]) => {
    const processed: FileWithMetadata[] = [];

    for (const file of rawFiles) {
      if (file.name.endsWith('.zip')) {
        toast({
          title: "ZIP Support Coming Soon",
          description: "ZIP extraction will be implemented in the edge function",
          variant: "default",
        });
        continue;
      }

      if (!file.type.startsWith('image/')) {
        continue;
      }

      try {
        const metadata = await extractImageMetadata(file);
        processed.push(metadata);
      } catch (error) {
        console.error('Failed to process:', file.name, error);
      }
    }

    setFiles(prev => [...prev, ...processed]);
    
    toast({
      title: `${processed.length} file(s) ready`,
      description: "Review metadata and upload",
    });
  };

  const extractImageMetadata = (file: File): Promise<FileWithMetadata> => {
    return new Promise((resolve, reject) => {
      const img = new Image();
      const url = URL.createObjectURL(file);

      img.onload = () => {
        URL.revokeObjectURL(url);
        resolve({
          file,
          width: img.width,
          height: img.height,
          format: file.type.split('/')[1].toUpperCase(),
        });
      };

      img.onerror = () => {
        URL.revokeObjectURL(url);
        reject(new Error('Failed to load image'));
      };

      img.src = url;
    });
  };

  const generateNormalizedPath = (fileName: string, index: number): string => {
    const cleanName = fileName.replace(/\.[^/.]+$/, ""); // remove extension
    
    if (mapType === "base") {
      // /base_maps/{Region}_{Year}.png
      const regionPart = region || cleanName.split('_')[0] || 'Unknown';
      const yearPart = year || cleanName.split('_')[1] || '0000';
      return `base_maps/${regionPart}_${yearPart}_${index}.png`;
    } else {
      // /overlays/{Region}/{Theme}/{Year}.png
      const regionPart = region || 'Unknown';
      const themePart = theme || 'General';
      const yearPart = year || '0000';
      return `overlays/${regionPart}/${themePart}/${yearPart}_${index}.png`;
    }
  };

  const handleUpload = async () => {
    if (files.length === 0) {
      toast({ title: "No files selected", variant: "destructive" });
      return;
    }

    if (mapType === "overlay" && !theme) {
      toast({ title: "Theme required for overlays", variant: "destructive" });
      return;
    }

    setUploading(true);

    try {
      const bucket = mapType === "base" ? "base_maps" : "overlays";

      for (let i = 0; i < files.length; i++) {
        const fileData = files[i];
        const normalizedPath = generateNormalizedPath(fileData.file.name, i);

        // Upload to storage
        const { error: uploadError } = await supabase.storage
          .from(bucket)
          .upload(normalizedPath, fileData.file, {
            upsert: true,
            contentType: fileData.file.type,
          });

        if (uploadError) throw uploadError;

        // Insert metadata into database
        if (mapType === "base") {
          const { error: dbError } = await supabase.from("base_maps").insert({
            title: fileData.file.name,
            region: region || "Unknown",
            file_path: normalizedPath,
            attribution: `Uploaded via HD Admin - ${fileData.width}x${fileData.height}px`,
          });
          if (dbError) console.error("DB insert failed:", dbError);
        } else {
          // For overlays, we need a base_map_id - use the first base map or create a placeholder
          const { data: baseMaps } = await supabase
            .from("base_maps")
            .select("id")
            .limit(1)
            .single();

          const { error: dbError } = await supabase.from("overlays").insert({
            base_map_id: baseMaps?.id || "00000000-0000-0000-0000-000000000000", // placeholder if no base maps
            theme: theme || "General",
            year: parseInt(year) || 0,
            file_path: normalizedPath,
            notes: JSON.stringify({
              width: fileData.width,
              height: fileData.height,
              format: fileData.format,
              region: region,
            }),
          });
          if (dbError) console.error("DB insert failed:", dbError);
        }
      }

      toast({
        title: "Upload Complete!",
        description: `${files.length} file(s) uploaded with normalized paths`,
      });

      // Reset
      setFiles([]);
      setRegion("");
      setYear("");
      setTheme("");
    } catch (error: any) {
      toast({
        title: "Upload Failed",
        description: error.message,
        variant: "destructive",
      });
    } finally {
      setUploading(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Upload Type */}
      <div>
        <Label className="text-base font-semibold mb-3 block">Upload Type</Label>
        <RadioGroup value={mapType} onValueChange={(v) => setMapType(v as "base" | "overlay")}>
          <div className="flex items-center space-x-2">
            <RadioGroupItem value="base" id="base" />
            <Label htmlFor="base" className="cursor-pointer">Base Maps (foundational historical maps)</Label>
          </div>
          <div className="flex items-center space-x-2">
            <RadioGroupItem value="overlay" id="overlay" />
            <Label htmlFor="overlay" className="cursor-pointer">Overlays (transparent layers showing changes)</Label>
          </div>
        </RadioGroup>
      </div>

      <Separator />

      {/* Metadata Inputs */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div>
          <Label htmlFor="region">Region</Label>
          <Input
            id="region"
            value={region}
            onChange={(e) => setRegion(e.target.value)}
            placeholder="e.g., France, Europe"
          />
          <p className="text-xs text-muted-foreground mt-1">Used in normalized paths</p>
        </div>
        <div>
          <Label htmlFor="year">Year</Label>
          <Input
            id="year"
            value={year}
            onChange={(e) => setYear(e.target.value)}
            placeholder="e.g., 1805"
          />
          <p className="text-xs text-muted-foreground mt-1">Base year or overlay year</p>
        </div>
        {mapType === "overlay" && (
          <div>
            <Label htmlFor="theme">Theme *</Label>
            <Input
              id="theme"
              value={theme}
              onChange={(e) => setTheme(e.target.value)}
              placeholder="e.g., Boundaries, Trade"
            />
            <p className="text-xs text-muted-foreground mt-1">Required for overlays</p>
          </div>
        )}
      </div>

      <Separator />

      {/* Drag & Drop Zone */}
      <div
        onDrop={handleDrop}
        onDragOver={(e) => e.preventDefault()}
        className="border-2 border-dashed border-[hsl(var(--border))] rounded-lg p-8 text-center 
                   hover:border-[hsl(var(--brass))] hover:bg-[hsl(var(--accent))]/5 transition-colors cursor-pointer"
      >
        <input
          type="file"
          multiple
          accept="image/*,.zip"
          onChange={handleFileSelect}
          className="hidden"
          id="file-upload"
        />
        <label htmlFor="file-upload" className="cursor-pointer">
          <div className="flex flex-col items-center gap-3">
            <div className="p-4 rounded-full bg-[hsl(var(--muted))]">
              <Upload className="w-8 h-8 text-[hsl(var(--brass))]" />
            </div>
            <div>
              <p className="text-lg font-semibold">Drag & drop files or click to browse</p>
              <p className="text-sm text-muted-foreground mt-1">
                Supports images (.jpg, .png, .tif) and .zip archives
              </p>
            </div>
          </div>
        </label>
      </div>

      {/* File Preview */}
      {files.length > 0 && (
        <>
          <Separator />
          <div>
            <Label className="text-base font-semibold mb-3 block">
              Files Ready ({files.length})
            </Label>
            <div className="space-y-2 max-h-64 overflow-y-auto">
              {files.map((f, idx) => (
                <div
                  key={idx}
                  className="flex items-center justify-between p-3 bg-[hsl(var(--muted))] rounded-lg"
                >
                  <div className="flex items-center gap-3">
                    <FileImage className="w-5 h-5 text-[hsl(var(--brass))]" />
                    <div>
                      <p className="text-sm font-medium">{f.file.name}</p>
                      <p className="text-xs text-muted-foreground">
                        {f.width}x{f.height}px • {(f.file.size / 1024).toFixed(1)}KB • {f.format}
                      </p>
                    </div>
                  </div>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => setFiles(files.filter((_, i) => i !== idx))}
                  >
                    Remove
                  </Button>
                </div>
              ))}
            </div>
          </div>
        </>
      )}

      {/* Upload Button */}
      <Button
        onClick={handleUpload}
        disabled={uploading || files.length === 0}
        className="w-full"
        variant="brass"
        size="lg"
      >
        {uploading ? (
          <>
            <Loader2 className="w-5 h-5 mr-2 animate-spin" />
            Uploading {files.length} file(s)...
          </>
        ) : (
          <>
            <Upload className="w-5 h-5 mr-2" />
            Upload {files.length} file(s) with Normalized Paths
          </>
        )}
      </Button>

      {/* Path Preview */}
      {files.length > 0 && (
        <div className="p-4 bg-[hsl(var(--muted))] rounded-lg">
          <Label className="text-sm font-semibold mb-2 block">Storage Path Preview:</Label>
          <code className="text-xs text-muted-foreground">
            {generateNormalizedPath(files[0].file.name, 0)}
          </code>
        </div>
      )}
    </div>
  );
}
