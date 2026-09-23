export function calcDistanceKm(
  lat1: number,
  lon1: number,
  lat2: number,
  lon2: number
): number {
  const R = 6371; // Earth radius in km
  const dLat = ((lat2 - lat1) * Math.PI) / 180;
  const dLon = ((lon2 - lon1) * Math.PI) / 180;
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos((lat1 * Math.PI) / 180) *
      Math.cos((lat2 * Math.PI) / 180) *
      Math.sin(dLon / 2) *
      Math.sin(dLon / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return Number((R * c).toFixed(1));
}

export function formatPrice(price: number): string {
  return `${(Number(price) || 0).toFixed(2)} €`;
}

// Known French and regional cities reference table for instant proximity fallback
const KNOWN_CITIES = [
  { name: 'Aubagne', lat: 43.2925, lng: 5.5708 },
  { name: 'Marseille', lat: 43.2965, lng: 5.3698 },
  { name: 'Gémenos', lat: 43.2964, lng: 5.6267 },
  { name: 'Allauch', lat: 43.3364, lng: 5.4819 },
  { name: 'Cassis', lat: 43.2144, lng: 5.5385 },
  { name: 'La Ciotat', lat: 43.1748, lng: 5.6045 },
  { name: 'Carnoux-en-Provence', lat: 43.2575, lng: 5.5647 },
  { name: 'Aix-en-Provence', lat: 43.5297, lng: 5.4474 },
  { name: 'Toulon', lat: 43.1242, lng: 5.9280 },
  { name: 'Hyères', lat: 43.1205, lng: 6.1286 },
  { name: 'Nice', lat: 43.7102, lng: 7.2620 },
  { name: 'Cannes', lat: 43.5528, lng: 7.0174 },
  { name: 'Avignon', lat: 43.9493, lng: 4.8055 },
  { name: 'Nîmes', lat: 43.8367, lng: 4.3601 },
  { name: 'Montpellier', lat: 43.6108, lng: 3.8767 },
  { name: 'Lyon', lat: 45.7640, lng: 4.8357 },
  { name: 'Paris', lat: 48.8566, lng: 2.3522 },
  { name: 'Bordeaux', lat: 44.8378, lng: -0.5792 },
  { name: 'Toulouse', lat: 43.6047, lng: 1.4442 },
  { name: 'Lille', lat: 50.6292, lng: 3.0573 },
  { name: 'Strasbourg', lat: 48.5734, lng: 7.7521 },
  { name: 'Nantes', lat: 47.2184, lng: -1.5536 },
  { name: 'Rennes', lat: 48.1173, lng: -1.6778 },
];

export function findClosestCity(lat: number, lng: number): string {
  let closest = KNOWN_CITIES[0];
  let minDistance = calcDistanceKm(lat, lng, closest.lat, closest.lng);

  for (let i = 1; i < KNOWN_CITIES.length; i++) {
    const d = calcDistanceKm(lat, lng, KNOWN_CITIES[i].lat, KNOWN_CITIES[i].lng);
    if (d < minDistance) {
      minDistance = d;
      closest = KNOWN_CITIES[i];
    }
  }

  return closest.name;
}

/**
 * Returns the human-readable city name for given coordinates (e.g. "Aubagne", "Marseille", "Paris").
 * Uses OpenStreetMap reverse geocoding with fast fallback to BigDataCloud and distance-based city matching.
 */
export async function getCityNameFromCoords(lat: number, lng: number): Promise<string> {
  // 1. Try reverse geocoding via OpenStreetMap Nominatim
  try {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 2500);

    const res = await fetch(
      `https://nominatim.openstreetmap.org/reverse?format=json&lat=${lat}&lon=${lng}&zoom=12&addressdetails=1`,
      {
        signal: controller.signal,
        headers: {
          'Accept-Language': 'fr',
        },
      }
    );
    clearTimeout(timeoutId);

    if (res.ok) {
      const data = await res.json();
      const addr = data.address;
      if (addr) {
        const city =
          addr.city ||
          addr.town ||
          addr.village ||
          addr.municipality ||
          addr.suburb ||
          addr.county;
        if (city && typeof city === 'string' && city.trim() !== '') {
          return city.trim();
        }
      }
    }
  } catch {
    // Network timeout or offline, fall through to alternatives
  }

  // 2. Try BigDataCloud reverse geocode API as alternative
  try {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 2000);

    const res = await fetch(
      `https://api.bigdatacloud.net/data/reverse-geocode-client?latitude=${lat}&longitude=${lng}&localityLanguage=fr`,
      { signal: controller.signal }
    );
    clearTimeout(timeoutId);

    if (res.ok) {
      const data = await res.json();
      const city = data.city || data.locality || data.principalSubdivision;
      if (city && typeof city === 'string' && city.trim() !== '') {
        return city.trim();
      }
    }
  } catch {
    // Fall through
  }

  // 3. Guaranteed reliable fallback to closest city name
  return findClosestCity(lat, lng);
}
