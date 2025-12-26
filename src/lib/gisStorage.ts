import { openDB, DBSchema, IDBPDatabase } from 'idb';

interface GISLayer {
  id: string;
  name: string;
  type: 'geojson' | 'shapefile' | 'kml' | 'geotiff' | 'image';
  data: any;
  bounds?: [[number, number], [number, number]];
  featureCount?: number;
  projection?: string;
  visible: boolean;
  color?: string;
  opacity: number;
  createdAt: number;
}

interface GISDB extends DBSchema {
  layers: {
    key: string;
    value: GISLayer;
    indexes: { 'by-created': number };
  };
}

let dbPromise: Promise<IDBPDatabase<GISDB>> | null = null;

function getDB() {
  if (!dbPromise) {
    dbPromise = openDB<GISDB>('gis-viewer', 1, {
      upgrade(db) {
        const store = db.createObjectStore('layers', { keyPath: 'id' });
        store.createIndex('by-created', 'createdAt');
      },
    });
  }
  return dbPromise;
}

export async function saveLayers(layers: GISLayer[]): Promise<void> {
  const db = await getDB();
  const tx = db.transaction('layers', 'readwrite');
  await Promise.all([
    ...layers.map(layer => tx.store.put(layer)),
    tx.done
  ]);
}

export async function loadLayers(): Promise<GISLayer[]> {
  const db = await getDB();
  return db.getAllFromIndex('layers', 'by-created');
}

export async function deleteLayer(id: string): Promise<void> {
  const db = await getDB();
  await db.delete('layers', id);
}

export async function clearAllLayers(): Promise<void> {
  const db = await getDB();
  await db.clear('layers');
}

export type { GISLayer };
