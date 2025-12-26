import * as shp from 'shpjs';
import { kml, gpx } from '@tmcw/togeojson';
import { fromArrayBuffer } from 'geotiff';
import type { GISLayer } from './gisStorage';

function generateId(): string {
  return `layer-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
}

function getRandomColor(): string {
  const colors = [
    '#3388ff', '#ff3333', '#33ff33', '#ff33ff', '#ffff33',
    '#33ffff', '#ff8833', '#8833ff', '#33ff88', '#ff3388'
  ];
  return colors[Math.floor(Math.random() * colors.length)];
}

function calculateBounds(geojson: any): [[number, number], [number, number]] | undefined {
  let minLat = Infinity, maxLat = -Infinity;
  let minLng = Infinity, maxLng = -Infinity;

  function processCoords(coords: any) {
    if (typeof coords[0] === 'number') {
      minLng = Math.min(minLng, coords[0]);
      maxLng = Math.max(maxLng, coords[0]);
      minLat = Math.min(minLat, coords[1]);
      maxLat = Math.max(maxLat, coords[1]);
    } else if (Array.isArray(coords)) {
      coords.forEach(processCoords);
    }
  }

  if (geojson.features) {
    geojson.features.forEach((f: any) => {
      if (f.geometry?.coordinates) {
        processCoords(f.geometry.coordinates);
      }
    });
  } else if (geojson.geometry?.coordinates) {
    processCoords(geojson.geometry.coordinates);
  }

  if (minLat === Infinity) return undefined;
  return [[minLat, minLng], [maxLat, maxLng]];
}

export async function parseGeoJSON(file: File): Promise<GISLayer> {
  const text = await file.text();
  const data = JSON.parse(text);
  const bounds = calculateBounds(data);
  const featureCount = data.features?.length || 1;

  return {
    id: generateId(),
    name: file.name,
    type: 'geojson',
    data,
    bounds,
    featureCount,
    visible: true,
    color: getRandomColor(),
    opacity: 0.8,
    createdAt: Date.now()
  };
}

export async function parseShapefile(files: File[]): Promise<GISLayer> {
  // Find the .shp file
  const shpFile = files.find(f => f.name.toLowerCase().endsWith('.shp'));
  if (!shpFile) throw new Error('No .shp file found');

  // Read all files as ArrayBuffers
  const buffers: { [key: string]: ArrayBuffer } = {};
  for (const file of files) {
    const ext = file.name.split('.').pop()?.toLowerCase();
    if (ext) {
      buffers[ext] = await file.arrayBuffer();
    }
  }

  // Parse shapefile
  const geojson = await shp.parseShp(buffers.shp, buffers.dbf);
  const bounds = calculateBounds({ type: 'FeatureCollection', features: geojson });

  return {
    id: generateId(),
    name: shpFile.name.replace('.shp', ''),
    type: 'shapefile',
    data: { type: 'FeatureCollection', features: geojson },
    bounds,
    featureCount: geojson.length,
    projection: buffers.prj ? new TextDecoder().decode(buffers.prj) : undefined,
    visible: true,
    color: getRandomColor(),
    opacity: 0.8,
    createdAt: Date.now()
  };
}

export async function parseKML(file: File): Promise<GISLayer> {
  const text = await file.text();
  const parser = new DOMParser();
  const doc = parser.parseFromString(text, 'text/xml');
  const data = kml(doc);
  const bounds = calculateBounds(data);

  return {
    id: generateId(),
    name: file.name,
    type: 'kml',
    data,
    bounds,
    featureCount: data.features?.length || 1,
    visible: true,
    color: getRandomColor(),
    opacity: 0.8,
    createdAt: Date.now()
  };
}

export async function parseKMZ(file: File): Promise<GISLayer> {
  const JSZip = (await import('jszip')).default;
  const zip = await JSZip.loadAsync(file);
  
  // Find KML file inside KMZ
  const kmlFile = Object.keys(zip.files).find(name => name.toLowerCase().endsWith('.kml'));
  if (!kmlFile) throw new Error('No KML file found in KMZ');

  const text = await zip.file(kmlFile)?.async('string');
  if (!text) throw new Error('Could not read KML from KMZ');

  const parser = new DOMParser();
  const doc = parser.parseFromString(text, 'text/xml');
  const data = kml(doc);
  const bounds = calculateBounds(data);

  return {
    id: generateId(),
    name: file.name,
    type: 'kml',
    data,
    bounds,
    featureCount: data.features?.length || 1,
    visible: true,
    color: getRandomColor(),
    opacity: 0.8,
    createdAt: Date.now()
  };
}

export async function parseGeoTIFF(file: File): Promise<GISLayer> {
  const arrayBuffer = await file.arrayBuffer();
  const tiff = await fromArrayBuffer(arrayBuffer);
  const image = await tiff.getImage();
  
  const bbox = image.getBoundingBox();
  const width = image.getWidth();
  const height = image.getHeight();
  
  // Read raster data
  const rasters = await image.readRasters();
  
  return {
    id: generateId(),
    name: file.name,
    type: 'geotiff',
    data: {
      rasters: rasters,
      width,
      height,
      bbox,
      origin: image.getOrigin(),
      resolution: image.getResolution()
    },
    bounds: [[bbox[1], bbox[0]], [bbox[3], bbox[2]]],
    projection: image.geoKeys?.ProjectedCSTypeGeoKey?.toString() || 'Unknown',
    visible: true,
    opacity: 0.8,
    createdAt: Date.now()
  };
}

export async function parseImageFile(file: File): Promise<GISLayer> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => {
      resolve({
        id: generateId(),
        name: file.name,
        type: 'image',
        data: {
          dataUrl: reader.result as string
        },
        visible: true,
        opacity: 0.8,
        createdAt: Date.now()
      });
    };
    reader.onerror = reject;
    reader.readAsDataURL(file);
  });
}

export async function parseFile(file: File): Promise<GISLayer> {
  const ext = file.name.split('.').pop()?.toLowerCase();
  
  switch (ext) {
    case 'json':
    case 'geojson':
      return parseGeoJSON(file);
    case 'kml':
      return parseKML(file);
    case 'kmz':
      return parseKMZ(file);
    case 'tif':
    case 'tiff':
      return parseGeoTIFF(file);
    case 'png':
    case 'jpg':
    case 'jpeg':
    case 'gif':
      return parseImageFile(file);
    default:
      throw new Error(`Unsupported file format: ${ext}`);
  }
}

export async function parseFiles(files: File[]): Promise<GISLayer[]> {
  // Group shapefile components
  const shpFiles = files.filter(f => 
    ['shp', 'dbf', 'prj', 'shx'].includes(f.name.split('.').pop()?.toLowerCase() || '')
  );
  const otherFiles = files.filter(f => 
    !['shp', 'dbf', 'prj', 'shx'].includes(f.name.split('.').pop()?.toLowerCase() || '')
  );

  const layers: GISLayer[] = [];

  // Parse shapefile group if present
  if (shpFiles.length > 0) {
    try {
      layers.push(await parseShapefile(shpFiles));
    } catch (err) {
      console.error('Error parsing shapefile:', err);
    }
  }

  // Parse other files individually
  for (const file of otherFiles) {
    try {
      layers.push(await parseFile(file));
    } catch (err) {
      console.error(`Error parsing ${file.name}:`, err);
    }
  }

  return layers;
}
