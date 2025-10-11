export type Hotspot = {
  id: string;
  title: string;
  snippet: string;
  x: number;   // image space 0..1
  y: number;   // image space 0..1
  zoom?: number; // viewport zoom target (smaller = further out). Try 0.8..4
  tags?: string[];
};

export const HOTSPOTS: Hotspot[] = [
  { 
    id: 'ex-1', 
    title: 'Nineveh', 
    snippet: 'Ancient Assyrian capital, located near modern Mosul, Iraq.', 
    x: 0.45, 
    y: 0.35, 
    zoom: 2.0, 
    tags: ['Assyria', 'Empire', 'Capital'] 
  },
  { 
    id: 'ex-2', 
    title: 'Babylon', 
    snippet: 'Major city in ancient Mesopotamia, capital of Babylonian Empire.', 
    x: 0.42, 
    y: 0.48, 
    zoom: 2.0, 
    tags: ['Babylon', 'Empire', 'Mesopotamia'] 
  },
  { 
    id: 'ex-3', 
    title: 'Persepolis', 
    snippet: 'Ceremonial capital of the Achaemenid Persian Empire.', 
    x: 0.58, 
    y: 0.52, 
    zoom: 2.2, 
    tags: ['Persia', 'Empire', 'Capital'] 
  },
];
