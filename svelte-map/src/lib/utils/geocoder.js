const ICHERCHE_URL = 'https://geoegl.msp.gouv.qc.ca/apis/icherche';
const TERRAPI_URL = 'https://geoegl.msp.gouv.qc.ca/apis/terrapi';

/**
 * Search for addresses/places using ICherche (Adresses Québec).
 * API returns GeoJSON FeatureCollection.
 * geometry=true is required to get coordinates in the response.
 */
export async function searchAddress(query, options = {}) {
  const params = new URLSearchParams({
    q: query,
    limit: options.limit || '10',
    type: options.type || 'adresses,lieux,municipalites,mrc,regadmin',
    geometry: 'true',
    bbox: 'true'
  });

  const response = await fetch(`${ICHERCHE_URL}/geocode?${params}`);

  if (!response.ok) throw new Error('Search failed');

  const data = await response.json();
  const features = data.features || [];

  return features
    .map((f) => {
      const props = f.properties || {};
      const geom = f.geometry;
      const coords = geom?.coordinates;

      // Skip features without geometry (no coordinates to show on map)
      if (!coords || coords.length < 2) return null;

      // ICherche returns [lon, lat] in EPSG:4326
      const lon = coords[0];
      const lat = coords[1];
      const bbox = f.bbox;

      // Build display name: nom + municipalite context
      let name = props.nom;
      if (props.municipalite && !name?.includes(props.municipalite)) {
        name = `${name}, ${props.municipalite}`;
      }

      return {
        id: props.code,
        name,
        type: props.typeEntite || f.index,
        category: f.index,
        lon,
        lat,
        bbox: bbox
          ? [
              parseFloat(bbox[0]),
              parseFloat(bbox[1]),
              parseFloat(bbox[2]),
              parseFloat(bbox[3])
            ]
          : null
      };
    })
    .filter(Boolean);
}

/**
 * Reverse geocode coordinates using TerrAPI.
 */
export async function reverseGeocode(lon, lat) {
  const params = new URLSearchParams({
    loc: `${lon},${lat}`,
    limit: '1'
  });

  const response = await fetch(`${TERRAPI_URL}/locate?${params}`);

  if (!response.ok) return null;
  const data = await response.json();
  const features = data.features || [];
  if (features.length === 0) return null;

  const f = features[0];
  const props = f.properties || {};
  const coords = f.geometry?.coordinates || [lon, lat];

  return {
    name: props.nom || props.title || `${coords[1].toFixed(6)}, ${coords[0].toFixed(6)}`,
    lon: coords[0],
    lat: coords[1]
  };
}

/**
 * Try to parse a coordinate string (e.g. "48.4469, -71.9380" or "-71.9380 48.4469").
 */
export function parseCoordinates(text) {
  const cleaned = text.trim();

  // Try "lat, lon" or "lat lon"
  const match = cleaned.match(/^(-?\d+\.?\d*)[,\s]+(-?\d+\.?\d*)$/);
  if (match) {
    const a = parseFloat(match[1]);
    const b = parseFloat(match[2]);
    // Heuristic: if first number looks like latitude (-90 to 90)
    if (Math.abs(a) <= 90 && Math.abs(b) <= 180) {
      return { lat: a, lon: b };
    }
    if (Math.abs(b) <= 90 && Math.abs(a) <= 180) {
      return { lat: b, lon: a };
    }
  }

  // DMS format: 48°26'49.1"N 71°56'17.1"W
  const dmsMatch = cleaned.match(
    /(\d+)[°]\s*(\d+)['\u2032]\s*(\d+\.?\d*)["\u2033]\s*([NS])\s+(\d+)[°]\s*(\d+)['\u2032]\s*(\d+\.?\d*)["\u2033]\s*([EWO])/i
  );
  if (dmsMatch) {
    let lat =
      parseInt(dmsMatch[1]) + parseInt(dmsMatch[2]) / 60 + parseFloat(dmsMatch[3]) / 3600;
    let lon =
      parseInt(dmsMatch[5]) + parseInt(dmsMatch[6]) / 60 + parseFloat(dmsMatch[7]) / 3600;
    if (dmsMatch[4].toUpperCase() === 'S') lat = -lat;
    if (dmsMatch[8].toUpperCase() === 'W' || dmsMatch[8].toUpperCase() === 'O') lon = -lon;
    return { lat, lon };
  }

  return null;
}
