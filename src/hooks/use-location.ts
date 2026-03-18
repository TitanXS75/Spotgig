import { useEffect, useState, useCallback } from 'react';
import {
  getUserLocation,
  watchUserLocation,
  clearLocationWatch,
  calculateDistance,
  reverseGeocode,
} from '@/lib/api/location';

interface GeolocationCoords {
  lat: number;
  lng: number;
  accuracy: number;
}

/**
 * Hook to get user's current location once.
 */
export function useUserLocation(defaultCity?: string) {
  const [location, setLocation] = useState<GeolocationCoords | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const getLocation = async () => {
      try {
        const coords = await getUserLocation(defaultCity);
        setLocation(coords);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to get location');
      } finally {
        setLoading(false);
      }
    };

    getLocation();
  }, [defaultCity]);

  return { location, loading, error };
}

/**
 * Hook to watch user's location in real-time.
 */
export function useWatchLocation() {
  const [location, setLocation] = useState<GeolocationCoords | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [watching, setWatching] = useState(false);

  const startWatch = useCallback(() => {
    const watchId = watchUserLocation(
      (coords) => {
        setLocation(coords);
        setError(null);
      },
      (err) => {
        setError(err.message);
      }
    );
    setWatching(true);

    return () => {
      clearLocationWatch(watchId);
      setWatching(false);
    };
  }, []);

  const stopWatch = useCallback(() => {
    setWatching(false);
  }, []);

  return { location, error, watching, startWatch, stopWatch };
}

/**
 * Hook to calculate distance from user to a point.
 */
export function useDistance(targetLat: number, targetLng: number) {
  const [distance, setDistance] = useState<number | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const getDistance = async () => {
      try {
        const { lat, lng } = await getUserLocation();
        const dist = calculateDistance(lat, lng, targetLat, targetLng);
        setDistance(dist);
        setError(null);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to calculate distance');
      } finally {
        setLoading(false);
      }
    };

    getDistance();
  }, [targetLat, targetLng]);

  return { distance, loading, error };
}

/**
 * Hook to reverse geocode coordinates to address.
 */
export function useReverseGeocode(lat: number, lng: number) {
  const [address, setAddress] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const getAddress = async () => {
      try {
        const result = await reverseGeocode(lat, lng);
        setAddress(result);
        setError(null);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to reverse geocode');
      } finally {
        setLoading(false);
      }
    };

    getAddress();
  }, [lat, lng]);

  return { address, loading, error };
}
