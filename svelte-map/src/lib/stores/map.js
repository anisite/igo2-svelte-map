import { writable, derived } from 'svelte/store';

/** Active tool in the sidebar: 'search' | 'layers' | 'draw' | 'measure' | 'import' | 'print' | null */
export const activeTool = writable(null);

/** Currently active base layer ID */
export const activeBaseLayer = writable('osm');

/** User-added overlay layers: [{ id, name, visible, opacity, source, olLayer }] */
export const overlayLayers = writable([]);

/** Drawing features as GeoJSON FeatureCollection */
export const drawnFeatures = writable({ type: 'FeatureCollection', features: [] });

/** Active drawing mode: 'Point' | 'LineString' | 'Polygon' | 'Circle' | null */
export const drawingMode = writable(null);

/** Active measurement mode: 'distance' | 'area' | null */
export const measureMode = writable(null);

/** Search results */
export const searchResults = writable([]);

/** Search query text */
export const searchQuery = writable('');

/** Map view state */
export const mapView = writable({
  center: [-71.938087, 48.446975],
  zoom: 6,
  projection: 'EPSG:3857'
});

/** Notification messages */
export const notification = writable(null);

export function notify(message, type = 'info', duration = 3000) {
  notification.set({ message, type });
  setTimeout(() => notification.set(null), duration);
}
