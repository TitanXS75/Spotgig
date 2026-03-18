import { describe, it, expect } from 'vitest';
import { calculateDistance, formatDistance } from '@/lib/api/location';

describe('Location Services', () => {
  describe('calculateDistance', () => {
    it('should calculate distance between two coordinates', () => {
      // Bangalore to Pune (approximate distance: ~735 km)
      const distance = calculateDistance(12.9716, 77.5946, 18.5204, 73.8567);
      expect(distance).toBeGreaterThan(730);
      expect(distance).toBeLessThan(740);
    });

    it('should return 0 for same coordinates', () => {
      const distance = calculateDistance(12.9716, 77.5946, 12.9716, 77.5946);
      expect(distance).toBeLessThan(0.01);
    });

    it('should work for nearby locations', () => {
      // Two nearby points (100 meters apart, approximately)
      const distance = calculateDistance(12.9716, 77.5946, 12.9725, 77.5955);
      expect(distance).toBeGreaterThan(0.1);
      expect(distance).toBeLessThan(0.2);
    });
  });

  describe('formatDistance', () => {
    it('should format distance in meters when less than 1 km', () => {
      const formatted = formatDistance(0.5);
      expect(formatted).toBe('500 m');
    });

    it('should format distance in kilometers when >= 1 km', () => {
      const formatted = formatDistance(2.345);
      expect(formatted).toBe('2.3 km');
    });

    it('should round to 1 decimal place', () => {
      const formatted = formatDistance(15.678);
      expect(formatted).toBe('15.7 km');
    });
  });
});
