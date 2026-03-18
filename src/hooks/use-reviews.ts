import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import {
  getListingReviews,
  getListingAverageRating,
  getListingReviewCount,
  createReview,
  updateReview,
  deleteReview,
  getMyReview,
} from '@/lib/api/reviews';
import type { Database } from '@/lib/db-types';

type ReviewInsert = Database['public']['Tables']['reviews']['Insert'];

/**
 * Hook to fetch reviews for a listing.
 */
export function useListingReviews(listingId: string) {
  return useQuery({
    queryKey: ['reviews', listingId],
    queryFn: () => getListingReviews(listingId),
    staleTime: 5 * 60 * 1000, // 5 minutes
    enabled: !!listingId,
  });
}

/**
 * Hook to fetch average rating for a listing.
 */
export function useListingAverageRating(listingId: string) {
  return useQuery({
    queryKey: ['averageRating', listingId],
    queryFn: () => getListingAverageRating(listingId),
    staleTime: 5 * 60 * 1000,
    enabled: !!listingId,
  });
}

/**
 * Hook to fetch review count for a listing.
 */
export function useListingReviewCount(listingId: string) {
  return useQuery({
    queryKey: ['reviewCount', listingId],
    queryFn: () => getListingReviewCount(listingId),
    staleTime: 5 * 60 * 1000,
    enabled: !!listingId,
  });
}

/**
 * Hook to fetch the current user's review for a listing.
 */
export function useMyReview(listingId: string) {
  return useQuery({
    queryKey: ['myReview', listingId],
    queryFn: () => getMyReview(listingId),
    staleTime: 2 * 60 * 1000,
    enabled: !!listingId,
  });
}

/**
 * Hook to manage reviews (create, update, delete).
 */
export function useReviewMutations() {
  const queryClient = useQueryClient();

  const createMutation = useMutation({
    mutationFn: (review: Omit<ReviewInsert, 'user_id'>) => createReview(review),
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ['reviews', data.listing_id] });
      queryClient.invalidateQueries({ queryKey: ['averageRating', data.listing_id] });
      queryClient.invalidateQueries({ queryKey: ['reviewCount', data.listing_id] });
      queryClient.invalidateQueries({ queryKey: ['myReview', data.listing_id] });
    },
  });

  const updateMutation = useMutation({
    mutationFn: (params: { id: string; update: Partial<{ rating: number; comment: string | null }> }) =>
      updateReview(params.id, params.update),
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ['reviews', data.listing_id] });
      queryClient.invalidateQueries({ queryKey: ['averageRating', data.listing_id] });
      queryClient.invalidateQueries({ queryKey: ['myReview', data.listing_id] });
    },
  });

  const deleteMutation = useMutation({
    mutationFn: deleteReview,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['reviews'] });
      queryClient.invalidateQueries({ queryKey: ['averageRating'] });
      queryClient.invalidateQueries({ queryKey: ['reviewCount'] });
      queryClient.invalidateQueries({ queryKey: ['myReview'] });
    },
  });

  return {
    create: createMutation,
    update: updateMutation,
    delete: deleteMutation,
    isLoading: createMutation.isPending || updateMutation.isPending || deleteMutation.isPending,
  };
}
