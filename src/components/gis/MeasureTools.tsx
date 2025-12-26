import React, { useState, useEffect, useRef } from 'react';
import L from 'leaflet';
import { Ruler, Square, X, Trash2 } from 'lucide-react';
import { Button } from '@/components/ui/button';

interface MeasureToolsProps {
  map: L.Map | null;
}

type MeasureMode = 'none' | 'distance' | 'area';

export function MeasureTools({ map }: MeasureToolsProps) {
  const [mode, setMode] = useState<MeasureMode>('none');
  const [result, setResult] = useState<string>('');
  const pointsRef = useRef<L.LatLng[]>([]);
  const layersRef = useRef<L.Layer[]>([]);

  const clearMeasurements = () => {
    layersRef.current.forEach(layer => {
      if (map) map.removeLayer(layer);
    });
    layersRef.current = [];
    pointsRef.current = [];
    setResult('');
  };

  const handleModeChange = (newMode: MeasureMode) => {
    if (mode === newMode) {
      setMode('none');
      clearMeasurements();
    } else {
      clearMeasurements();
      setMode(newMode);
    }
  };

  useEffect(() => {
    if (!map || mode === 'none') return;

    const onClick = (e: L.LeafletMouseEvent) => {
      pointsRef.current.push(e.latlng);
      
      // Add marker
      const marker = L.circleMarker(e.latlng, {
        radius: 5,
        color: '#ff0000',
        fillColor: '#ff0000',
        fillOpacity: 1,
      }).addTo(map);
      layersRef.current.push(marker);

      if (pointsRef.current.length > 1) {
        // Draw line
        const line = L.polyline(pointsRef.current, {
          color: '#ff0000',
          weight: 2,
          dashArray: '5, 5'
        }).addTo(map);
        layersRef.current.push(line);
      }

      // Calculate measurements
      if (mode === 'distance') {
        let totalDistance = 0;
        for (let i = 1; i < pointsRef.current.length; i++) {
          totalDistance += pointsRef.current[i - 1].distanceTo(pointsRef.current[i]);
        }
        
        if (totalDistance > 1000) {
          setResult(`Distance: ${(totalDistance / 1000).toFixed(2)} km`);
        } else {
          setResult(`Distance: ${totalDistance.toFixed(0)} m`);
        }
      } else if (mode === 'area' && pointsRef.current.length >= 3) {
        // Calculate area
        const area = calculateArea(pointsRef.current);
        
        if (area > 1000000) {
          setResult(`Area: ${(area / 1000000).toFixed(2)} km²`);
        } else {
          setResult(`Area: ${area.toFixed(0)} m²`);
        }
      }
    };

    const onDblClick = (e: L.LeafletMouseEvent) => {
      if (mode === 'area' && pointsRef.current.length >= 3) {
        // Draw final polygon
        const polygon = L.polygon(pointsRef.current, {
          color: '#ff0000',
          weight: 2,
          fillOpacity: 0.2
        }).addTo(map);
        layersRef.current.push(polygon);
      }
      
      // Disable drawing on double click
      L.DomEvent.stopPropagation(e);
    };

    map.on('click', onClick);
    map.on('dblclick', onDblClick);
    map.getContainer().style.cursor = 'crosshair';

    return () => {
      map.off('click', onClick);
      map.off('dblclick', onDblClick);
      map.getContainer().style.cursor = '';
    };
  }, [map, mode]);

  // Simple area calculation using shoelace formula
  function calculateArea(points: L.LatLng[]): number {
    if (points.length < 3) return 0;
    
    // Convert to meters using Web Mercator approximation
    const R = 6371000; // Earth radius in meters
    let area = 0;
    
    for (let i = 0; i < points.length; i++) {
      const j = (i + 1) % points.length;
      const lat1 = points[i].lat * Math.PI / 180;
      const lat2 = points[j].lat * Math.PI / 180;
      const lng1 = points[i].lng * Math.PI / 180;
      const lng2 = points[j].lng * Math.PI / 180;
      
      area += (lng2 - lng1) * (2 + Math.sin(lat1) + Math.sin(lat2));
    }
    
    area = Math.abs(area * R * R / 2);
    return area;
  }

  return (
    <div className="flex items-center gap-2 p-2 bg-card border border-border rounded-lg shadow-sm">
      <Button
        variant={mode === 'distance' ? 'default' : 'outline'}
        size="sm"
        onClick={() => handleModeChange('distance')}
        title="Measure distance"
      >
        <Ruler className="w-4 h-4 mr-1" />
        Distance
      </Button>
      
      <Button
        variant={mode === 'area' ? 'default' : 'outline'}
        size="sm"
        onClick={() => handleModeChange('area')}
        title="Measure area"
      >
        <Square className="w-4 h-4 mr-1" />
        Area
      </Button>
      
      {(result || mode !== 'none') && (
        <>
          <div className="h-6 w-px bg-border" />
          
          {result && (
            <span className="text-sm font-medium text-foreground px-2">
              {result}
            </span>
          )}
          
          <Button
            variant="ghost"
            size="sm"
            onClick={clearMeasurements}
            title="Clear measurements"
          >
            <Trash2 className="w-4 h-4" />
          </Button>
        </>
      )}
    </div>
  );
}
