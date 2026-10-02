/**
 * Location Services
 * Handles geolocation, distance calculations, and location-based queries
 */

interface GeolocationCoords {
  lat: number;
  lng: number;
  accuracy: number;
}

interface GeolocationError {
  code: number;
  message: string;
}

// Default fallback locations for major Indian cities
const FALLBACK_LOCATIONS: Record<string, GeolocationCoords> = {
  bangalore: { lat: 12.9716, lng: 77.5946, accuracy: 10000 },
  mumbai: { lat: 19.076, lng: 72.8777, accuracy: 10000 },
  delhi: { lat: 28.7041, lng: 77.1025, accuracy: 10000 },
  pune: { lat: 18.5204, lng: 73.8567, accuracy: 10000 },
  hyderabad: { lat: 17.3706, lng: 78.4744, accuracy: 10000 },
  kolkata: { lat: 22.5726, lng: 88.3639, accuracy: 10000 },
  chennai: { lat: 13.0827, lng: 80.2707, accuracy: 10000 },
  ahmedabad: { lat: 23.0225, lng: 72.5714, accuracy: 10000 },
};

/**
 * Get user's current location using the Geolocation API.
 * Falls back to a default city if permission is denied or location is unavailable.
 * @param defaultCity - City name to use as fallback (e.g., 'bangalore')
 * @returns Promise with location coordinates
 */
export async function getUserLocation(defaultCity: string = 'bangalore'): Promise<GeolocationCoords> {
  return new Promise((resolve, reject) => {
    if (!navigator.geolocation) {
      // Geolocation not supported, use fallback
      const fallback = FALLBACK_LOCATIONS[defaultCity.toLowerCase()] || FALLBACK_LOCATIONS.bangalore;
      resolve(fallback);
      return;
    }

    navigator.geolocation.getCurrentPosition(
      (position) => {
        resolve({
          lat: position.coords.latitude,
          lng: position.coords.longitude,
          accuracy: position.coords.accuracy,
        });
      },
      (error) => {
        // Permission denied or location unavailable, use fallback
        console.warn('Geolocation error:', error.message);
        const fallback = FALLBACK_LOCATIONS[defaultCity.toLowerCase()] || FALLBACK_LOCATIONS.bangalore;
        resolve(fallback);
      },
      {
        enableHighAccuracy: true,
        timeout: 10000,
        maximumAge: 0,
      }
    );
  });
}

/**
 * Watch user's location in real-time.
 * @param onSuccess - Callback when location is updated
 * @param onError - Callback on error
 * @returns Watch ID for cleanup
 */
export function watchUserLocation(
  onSuccess: (coords: GeolocationCoords) => void,
  onError?: (error: GeolocationError) => void
): number {
  if (!navigator.geolocation) {
    console.warn('Geolocation not supported');
    return 0;
  }

  return navigator.geolocation.watchPosition(
    (position) => {
      onSuccess({
        lat: position.coords.latitude,
        lng: position.coords.longitude,
        accuracy: position.coords.accuracy,
      });
    },
    (error) => {
      if (onError) {
        onError({
          code: error.code,
          message: error.message,
        });
      }
    },
    {
      enableHighAccuracy: true,
      timeout: 10000,
      maximumAge: 5000,
    }
  );
}

/**
 * Stop watching user's location.
 * @param watchId - The watch ID returned from watchUserLocation
 */
export function clearLocationWatch(watchId: number): void {
  if (watchId && navigator.geolocation) {
    navigator.geolocation.clearWatch(watchId);
  }
}

/**
 * Calculate distance between two geographic coordinates using Haversine formula.
 * @param lat1 - Latitude of point 1
 * @param lng1 - Longitude of point 1
 * @param lat2 - Latitude of point 2
 * @param lng2 - Longitude of point 2
 * @returns Distance in kilometers
 */
export function calculateDistance(lat1: number, lng1: number, lat2: number, lng2: number): number {
  const R = 6371; // Earth's radius in km
  const dLat = toRad(lat2 - lat1);
  const dLng = toRad(lng2 - lng1);

  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(toRad(lat1)) * Math.cos(toRad(lat2)) * Math.sin(dLng / 2) * Math.sin(dLng / 2);

  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return R * c;
}

/**
 * Convert degrees to radians.
 */
function toRad(degrees: number): number {
  return (degrees * Math.PI) / 180;
}

/**
 * Format distance for display.
 * @param distanceKm - Distance in kilometers
 * @returns Formatted distance string (e.g., "2.5 km" or "500 m")
 */
export function formatDistance(distanceKm: number): string {
  if (distanceKm < 1) {
    return `${Math.round(distanceKm * 1000)} m`;
  }
  return `${distanceKm.toFixed(1)} km`;
}

/**
 * Reverse geocode: Convert coordinates to address using a free geocoding service.
 * Uses OpenStreetMap Nominatim API (requires attribution).
 */
export async function reverseGeocode(lat: number, lng: number): Promise<string | null> {
  try {
    const response = await fetch(
      `https://nominatim.openstreetmap.org/reverse?format=json&lat=${lat}&lon=${lng}`,
      {
        headers: {
          'Accept': 'application/json',
          'User-Agent': 'Spotgig (hyperlocal marketplace)',
        },
      }
    );
    if (!response.ok) return null;

    const data = await response.json();
    // Return address or area name
    return data.address?.city || data.address?.town || data.address?.county || null;
  } catch (error) {
    console.error('Reverse geocoding failed:', error);
    return null;
  }
}

/**
 * Forward geocode: Convert address to coordinates using OpenStreetMap Nominatim API.
 */
export async function forwardGeocode(address: string): Promise<GeolocationCoords | null> {
  try {
    const response = await fetch(
      `https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(address)}&countrycodes=IN&limit=1`,
      {
        headers: {
          'Accept': 'application/json',
          'User-Agent': 'Spotgig (hyperlocal marketplace)',
        },
      }
    );
    if (!response.ok) return null;

    const data = await response.json();
    if (!data || data.length === 0) return null;

    const result = data[0];
    return {
      lat: parseFloat(result.lat),
      lng: parseFloat(result.lon),
      accuracy: 100, // Approximate
    };
  } catch (error) {
    console.error('Forward geocoding failed:', error);
    return null;
  }
}
