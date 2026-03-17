/**
 * Geocoding utilities using Nominatim (OpenStreetMap) and coordinate parsing.
 * Inspired by IGO2's icherche + coordinatesreverse search sources.
 */

const NOMINATIM_URL = 'https://nominatim.openstreetmap.org/search';
const NOMINATIM_REVERSE_URL = 'https://nominatim.openstreetmap.org/reverse';

/**
 * Search for addresses/places using Nominatim.
 */
export async function searchAddress(query, options = {}) {
  const params = new URLSearchParams({
    q: query,
    format: 'json',
    addressdetails: '1',
    limit: options.limit || '10',
    'accept-language': options.lang || 'fr',
    countrycodes: options.countries || ''
  });

  const response = await fetch(`${NOMINATIM_URL}?${params}`, {
    headers: { 'User-Agent': 'IGO2-Svelte-Map/1.0' }
  });

  if (!response.ok) throw new Error('Search failed');

  const results = await response.json();
  return results.map((r) => ({
    id: r.place_id,
    name: r.display_name,
    type: r.type,
    category: r.category,
    lon: parseFloat(r.lon),
    lat: parseFloat(r.lat),
    bbox: r.boundingbox
      ? [
          parseFloat(r.boundingbox[2]),
          parseFloat(r.boundingbox[0]),
          parseFloat(r.boundingbox[3]),
          parseFloat(r.boundingbox[1])
        ]
      : null
  }));
}

/**
 * Reverse geocode coordinates.
 */
export async function reverseGeocode(lon, lat) {
  const params = new URLSearchParams({
    lon: String(lon),
    lat: String(lat),
    format: 'json',
    addressdetails: '1',
    'accept-language': 'fr'
  });

  const response = await fetch(`${NOMINATIM_REVERSE_URL}?${params}`, {
    headers: { 'User-Agent': 'IGO2-Svelte-Map/1.0' }
  });

  if (!response.ok) return null;
  const result = await response.json();
  return {
    name: result.display_name,
    lon: parseFloat(result.lon),
    lat: parseFloat(result.lat)
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
