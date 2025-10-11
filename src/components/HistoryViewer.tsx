import React, { useEffect, useRef } from 'react';
import type OpenSeadragon from 'openseadragon';
import { Hotspot } from '@/data/hotspots';
import * as OSD from 'openseadragon';

interface HistoryViewerProps {
  dziUrl: string;
  hotspots: Hotspot[];
  focus?: Hotspot;
}

export default function HistoryViewer({ dziUrl, hotspots, focus }: HistoryViewerProps) {
  const ref = useRef<HTMLDivElement>(null);
  const viewerRef = useRef<OpenSeadragon.Viewer | null>(null);

  // Initialize OpenSeadragon
  useEffect(() => {
    if (viewerRef.current || !ref.current) return;
    
    viewerRef.current = (OSD as any).default({
      element: ref.current,
      prefixUrl: 'https://cdnjs.cloudflare.com/ajax/libs/openseadragon/4.1.0/images/',
      showNavigationControl: true,
      maxZoomPixelRatio: 2.5,
      preserveImageSizeOnResize: true,
      visibilityRatio: 1,
      constrainDuringPan: true,
      animationTime: 0.8,
      defaultZoomLevel: 1,
      minZoomLevel: 0.5,
      maxZoomLevel: 10,
    });

    viewerRef.current.addTiledImage({ tileSource: dziUrl });

    const onJump = (e: any) => {
      const h: Hotspot = e.detail;
      if (!viewerRef.current) return;
      const vp = viewerRef.current.viewport;
      vp.panTo(new (OSD as any).Point(h.x, h.y));
      if (h.zoom) vp.zoomTo(h.zoom);
    };

    window.addEventListener('jump-to-hotspot', onJump);
    return () => {
      window.removeEventListener('jump-to-hotspot', onJump);
      if (viewerRef.current) {
        viewerRef.current.destroy();
        viewerRef.current = null;
      }
    };
  }, [dziUrl]);

  // Draw hotspots (simple overlay pins)
  useEffect(() => {
    const v = viewerRef.current;
    if (!v) return;
    
    // Remove existing overlays
    v.clearOverlays();
    
    hotspots.forEach(h => {
      const el = document.createElement('div');
      el.className = 'hotspot';
      el.title = h.title;
      el.style.width = '20px';
      el.style.height = '20px';
      el.style.borderRadius = '9999px';
      el.style.background = 'hsl(var(--destructive))';
      el.style.boxShadow = '0 0 0 2px hsl(var(--background)), 0 4px 12px rgba(0,0,0,0.3)';
      el.style.cursor = 'pointer';
      el.style.transition = 'transform 0.2s';
      
      el.onclick = () => {
        const ev = new CustomEvent('jump-to-hotspot', { detail: h });
        window.dispatchEvent(ev);
      };
      
      v.addOverlay({ 
        element: el, 
        location: new (OSD as any).Point(h.x, h.y), 
        placement: (OSD as any).Placement.CENTER 
      });
    });
  }, [hotspots]);

  // Respond to search selection
  useEffect(() => {
    if (!focus) return;
    const ev = new CustomEvent('jump-to-hotspot', { detail: focus });
    window.dispatchEvent(ev);
  }, [focus]);

  return (
    <div className="relative">
      <div ref={ref} className="w-full h-[70vh] rounded-lg overflow-hidden bg-muted" />
      <style>{`
        .hotspot:hover { transform: scale(1.15); }
      `}</style>
    </div>
  );
}
