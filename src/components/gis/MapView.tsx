import React, { useEffect, useRef, useState } from 'react';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import type { GISLayer } from '@/lib/gisStorage';

interface MapViewProps {
  layers: GISLayer[];
  onMouseMove?: (coords: { lat: number; lng: number } | null) => void;
  mapRef?: React.MutableRefObject<L.Map | null>;
}

// Fix Leaflet default icon issue
delete (L.Icon.Default.prototype as any)._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-icon-2x.png',
  iconUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-icon.png',
  shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-shadow.png',
});

export function MapView({ layers, onMouseMove, mapRef }: MapViewProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const internalMapRef = useRef<L.Map | null>(null);
  const layerGroupsRef = useRef<Map<string, L.Layer>>(new Map());

  // Initialize map
  useEffect(() => {
    if (!containerRef.current || internalMapRef.current) return;

    const map = L.map(containerRef.current, {
      center: [20, 0],
      zoom: 2,
      zoomControl: true,
    });

    // Add base layer
    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
      attribution: '© OpenStreetMap contributors'
    }).addTo(map);

    // Add scale control
    L.control.scale({ position: 'bottomleft' }).addTo(map);

    // Track mouse position
    map.on('mousemove', (e) => {
      onMouseMove?.({ lat: e.latlng.lat, lng: e.latlng.lng });
    });

    map.on('mouseout', () => {
      onMouseMove?.(null);
    });

    internalMapRef.current = map;
    if (mapRef) mapRef.current = map;

    return () => {
      map.remove();
      internalMapRef.current = null;
      if (mapRef) mapRef.current = null;
    };
  }, [onMouseMove, mapRef]);

  // Update layers
  useEffect(() => {
    const map = internalMapRef.current;
    if (!map) return;

    const currentLayerIds = new Set(layers.map(l => l.id));
    
    // Remove layers that no longer exist
    layerGroupsRef.current.forEach((layer, id) => {
      if (!currentLayerIds.has(id)) {
        map.removeLayer(layer);
        layerGroupsRef.current.delete(id);
      }
    });

    // Add or update layers
    layers.forEach(layer => {
      const existingLayer = layerGroupsRef.current.get(layer.id);
      
      // Handle visibility
      if (existingLayer) {
        if (!layer.visible) {
          map.removeLayer(existingLayer);
        } else if (!map.hasLayer(existingLayer)) {
          existingLayer.addTo(map);
        }
        
        // Update opacity
        if ('setStyle' in existingLayer && typeof (existingLayer as any).setStyle === 'function') {
          (existingLayer as any).setStyle({ 
            opacity: layer.opacity, 
            fillOpacity: layer.opacity * 0.5,
            color: layer.color 
          });
        } else if ('setOpacity' in existingLayer && typeof (existingLayer as any).setOpacity === 'function') {
          (existingLayer as any).setOpacity(layer.opacity);
        }
        return;
      }

      // Create new layer
      let newLayer: L.Layer | null = null;

      if (layer.type === 'geojson' || layer.type === 'shapefile' || layer.type === 'kml') {
        newLayer = L.geoJSON(layer.data, {
          style: () => ({
            color: layer.color || '#3388ff',
            weight: 2,
            opacity: layer.opacity,
            fillOpacity: layer.opacity * 0.5,
          }),
          pointToLayer: (feature, latlng) => {
            return L.circleMarker(latlng, {
              radius: 8,
              fillColor: layer.color || '#3388ff',
              color: '#fff',
              weight: 2,
              opacity: layer.opacity,
              fillOpacity: layer.opacity * 0.7,
            });
          },
          onEachFeature: (feature, featureLayer) => {
            if (feature.properties) {
              const props = Object.entries(feature.properties)
                .filter(([_, v]) => v !== null && v !== undefined)
                .map(([k, v]) => `<strong>${k}:</strong> ${v}`)
                .join('<br>');
              if (props) {
                featureLayer.bindPopup(props);
              }
            }
          }
        });
      } else if (layer.type === 'image' && layer.data.dataUrl) {
        // For images without georeference, create an overlay at default bounds
        const bounds: L.LatLngBoundsExpression = layer.bounds || [[-45, -90], [45, 90]];
        newLayer = L.imageOverlay(layer.data.dataUrl, bounds, {
          opacity: layer.opacity,
        });
      } else if (layer.type === 'geotiff' && layer.data.rasters && layer.bounds) {
        // Create a canvas-based raster display
        const canvas = document.createElement('canvas');
        canvas.width = layer.data.width;
        canvas.height = layer.data.height;
        const ctx = canvas.getContext('2d');
        
        if (ctx && layer.data.rasters[0]) {
          const imageData = ctx.createImageData(layer.data.width, layer.data.height);
          const raster = layer.data.rasters[0];
          
          // Simple grayscale visualization
          let min = Infinity, max = -Infinity;
          for (let i = 0; i < raster.length; i++) {
            if (raster[i] !== null && isFinite(raster[i])) {
              min = Math.min(min, raster[i]);
              max = Math.max(max, raster[i]);
            }
          }
          
          for (let i = 0; i < raster.length; i++) {
            const val = ((raster[i] - min) / (max - min)) * 255;
            const idx = i * 4;
            imageData.data[idx] = val;
            imageData.data[idx + 1] = val;
            imageData.data[idx + 2] = val;
            imageData.data[idx + 3] = 255;
          }
          
          ctx.putImageData(imageData, 0, 0);
          newLayer = L.imageOverlay(canvas.toDataURL(), layer.bounds, {
            opacity: layer.opacity,
          });
        }
      }

      if (newLayer && layer.visible) {
        newLayer.addTo(map);
        layerGroupsRef.current.set(layer.id, newLayer);
      }
    });
  }, [layers]);

  return (
    <div ref={containerRef} className="w-full h-full" />
  );
}

export function useZoomToLayer(mapRef: React.MutableRefObject<L.Map | null>, layers: GISLayer[]) {
  return (layerId: string) => {
    const map = mapRef.current;
    const layer = layers.find(l => l.id === layerId);
    
    if (map && layer?.bounds) {
      map.fitBounds(layer.bounds, { padding: [50, 50] });
    }
  };
}
