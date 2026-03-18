import { describe, it, expect } from 'vitest';

/**
 * Hook Tests
 * These tests verify that custom hooks are properly exported and have the right structure.
 */

describe('Custom Hooks', () => {
  describe('useFavorites', () => {
    it('should be exported', async () => {
      const { useFavorites, useListingFavorited } = await import('@/hooks/use-favorites');
      expect(typeof useFavorites).toBe('function');
      expect(typeof useListingFavorited).toBe('function');
    });
  });

  describe('useReviews', () => {
    it('should have required hooks', async () => {
      const {
        useListingReviews,
        useListingAverageRating,
        useListingReviewCount,
        useMyReview,
        useReviewMutations,
      } = await import('@/hooks/use-reviews');
      
      expect(typeof useListingReviews).toBe('function');
      expect(typeof useListingAverageRating).toBe('function');
      expect(typeof useListingReviewCount).toBe('function');
      expect(typeof useMyReview).toBe('function');
      expect(typeof useReviewMutations).toBe('function');
    });
  });

  describe('useLocation', () => {
    it('should have required hooks', async () => {
      const {
        useUserLocation,
        useWatchLocation,
        useDistance,
        useReverseGeocode,
      } = await import('@/hooks/use-location');
      
      expect(typeof useUserLocation).toBe('function');
      expect(typeof useWatchLocation).toBe('function');
      expect(typeof useDistance).toBe('function');
      expect(typeof useReverseGeocode).toBe('function');
    });
  });

  describe('useImageUpload', () => {
    it('should have required hooks', async () => {
      const { useImageUpload, useImagePreview } = await import('@/hooks/use-image-upload');
      
      expect(typeof useImageUpload).toBe('function');
      expect(typeof useImagePreview).toBe('function');
    });
  });

  describe('useMobile', () => {
    it('should be exported', async () => {
      const { useIsMobile } = await import('@/hooks/use-mobile');
      expect(typeof useIsMobile).toBe('function');
    });
  });

  describe('useToast', () => {
    it('should be exported from both locations', async () => {
      const hook1 = await import('@/hooks/use-toast');
      const hook2 = await import('@/components/ui/use-toast');
      
      expect(typeof hook1.useToast).toBe('function');
      expect(typeof hook2.useToast).toBe('function');
    });
  });
});
