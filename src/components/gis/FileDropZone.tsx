import React, { useCallback, useState } from 'react';
import { Upload, FileType, Loader2 } from 'lucide-react';
import { parseFiles } from '@/lib/gisParser';
import type { GISLayer } from '@/lib/gisStorage';

interface FileDropZoneProps {
  onFilesLoaded: (layers: GISLayer[]) => void;
}

const SUPPORTED_FORMATS = [
  '.geojson', '.json', '.shp', '.dbf', '.prj', '.shx',
  '.kml', '.kmz', '.tif', '.tiff',
  '.png', '.jpg', '.jpeg', '.gif'
];

export function FileDropZone({ onFilesLoaded }: FileDropZoneProps) {
  const [isDragging, setIsDragging] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleFiles = useCallback(async (files: FileList | File[]) => {
    setIsLoading(true);
    setError(null);
    try {
      const fileArray = Array.from(files);
      const layers = await parseFiles(fileArray);
      if (layers.length === 0) {
        setError('No valid GIS files found');
      } else {
        onFilesLoaded(layers);
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to parse files');
    } finally {
      setIsLoading(false);
    }
  }, [onFilesLoaded]);

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    handleFiles(e.dataTransfer.files);
  }, [handleFiles]);

  const handleDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  }, []);

  const handleDragLeave = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
  }, []);

  const handleInputChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      handleFiles(e.target.files);
    }
  }, [handleFiles]);

  return (
    <div
      onDrop={handleDrop}
      onDragOver={handleDragOver}
      onDragLeave={handleDragLeave}
      className={`
        relative p-8 border-2 border-dashed rounded-lg transition-all duration-200
        ${isDragging 
          ? 'border-primary bg-primary/10 scale-[1.02]' 
          : 'border-border hover:border-primary/50 hover:bg-muted/50'
        }
      `}
    >
      <input
        type="file"
        multiple
        accept={SUPPORTED_FORMATS.join(',')}
        onChange={handleInputChange}
        className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
      />
      
      <div className="flex flex-col items-center gap-4 text-center pointer-events-none">
        {isLoading ? (
          <Loader2 className="w-12 h-12 text-primary animate-spin" />
        ) : (
          <Upload className={`w-12 h-12 ${isDragging ? 'text-primary' : 'text-muted-foreground'}`} />
        )}
        
        <div>
          <p className="text-lg font-medium text-foreground">
            {isLoading ? 'Loading files...' : 'Drop files here or click to upload'}
          </p>
          <p className="text-sm text-muted-foreground mt-1">
            Supports GeoJSON, Shapefiles, KML/KMZ, GeoTIFF, and images
          </p>
        </div>

        {error && (
          <p className="text-sm text-destructive">{error}</p>
        )}

        <div className="flex flex-wrap justify-center gap-2 mt-2">
          {['GeoJSON', 'Shapefile', 'KML', 'GeoTIFF', 'PNG/JPG'].map(format => (
            <span 
              key={format}
              className="px-2 py-1 text-xs bg-muted rounded-full text-muted-foreground"
            >
              {format}
            </span>
          ))}
        </div>
      </div>
    </div>
  );
}
