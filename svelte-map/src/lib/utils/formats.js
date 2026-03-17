/**
 * Geospatial format utilities for import/export.
 */
import GeoJSON from 'ol/format/GeoJSON';
import KML from 'ol/format/KML';

const geoJsonFormat = new GeoJSON();
const kmlFormat = new KML({ extractStyles: true });

/**
 * Read features from a file (GeoJSON or KML).
 */
export function readFeaturesFromFile(file) {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = (e) => {
      const text = e.target.result;
      try {
        const ext = file.name.toLowerCase().split('.').pop();
        let features;
        if (ext === 'geojson' || ext === 'json') {
          features = geoJsonFormat.readFeatures(text, {
            dataProjection: 'EPSG:4326',
            featureProjection: 'EPSG:3857'
          });
        } else if (ext === 'kml') {
          features = kmlFormat.readFeatures(text, {
            featureProjection: 'EPSG:3857'
          });
        } else {
          reject(new Error(`Format non supporté: ${ext}`));
          return;
        }
        resolve(features);
      } catch (err) {
        reject(err);
      }
    };
    reader.onerror = () => reject(new Error('Erreur de lecture du fichier'));
    reader.readAsText(file);
  });
}

/**
 * Export features to GeoJSON string.
 */
export function exportToGeoJSON(features) {
  return geoJsonFormat.writeFeatures(features, {
    dataProjection: 'EPSG:4326',
    featureProjection: 'EPSG:3857'
  });
}

/**
 * Export features to KML string.
 */
export function exportToKML(features) {
  return kmlFormat.writeFeatures(features, {
    featureProjection: 'EPSG:3857'
  });
}

/**
 * Download a string as file.
 */
export function downloadFile(content, filename, mimeType = 'application/json') {
  const blob = new Blob([content], { type: mimeType });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = filename;
  a.click();
  URL.revokeObjectURL(url);
}
