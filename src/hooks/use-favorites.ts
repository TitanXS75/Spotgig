import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { toggleFavorite, getMyFavorites, isFavorited } from '@/lib/api/favorites';
import { useCallback } from 'react';

/**
 * Hook to manage favorites for the current user.
 * Provides queries and mutations for favorite listings.
 */
export function useFavorites() {
  const queryClient = useQueryClient();

  // Query: Get all favorite listings
  const favoritesQuery = useQuery({
    queryKey: ['favorites'],
    queryFn: getMyFavorites,
    staleTime: 5 * 60 * 1000, // 5 minutes
  });

  // Mutation: Toggle favorite status
  const toggleMutation = useMutation({
    mutationFn: toggleFavorite,
    onMutate: async (listingId) => {
      // Optimistic update
      await queryClient.cancelQueries({ queryKey: ['favorites'] });
      const previousFavorites = queryClient.getQueryData(['favorites']);

      queryClient.setQueryData<Array<{ id: string }>>(['favorites'], (old) => {
        if (!old) return old;
        const isFav = old.some((f) => f && f.id === listingId);
        return isFav ? old.filter((f) => f && f.id !== listingId) : [...old];
      });

      return { previousFavorites };
    },
    onError: (err, listingId, context) => {
      // Rollback on error
      if (context?.previousFavorites) {
        queryClient.setQueryData(['favorites'], context.previousFavorites);
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['favorites'] });
    },
  });

  const isFav = useCallback(
    (listingId: string) => {
      return favoritesQuery.data?.some((f) => f.id === listingId) ?? false;
    },
    [favoritesQuery.data]
  );

  return {
    favorites: favoritesQuery.data ?? [],
    isLoading: favoritesQuery.isLoading,
    isError: favoritesQuery.isError,
    error: favoritesQuery.error,
    toggle: toggleMutation.mutate,
    isToggling: toggleMutation.isPending,
    isFav,
  };
}

/**
 * Hook to check if a specific listing is favorited.
 */
export function useListingFavorited(listingId: string) {
  return useQuery({
    queryKey: ['favorite', listingId],
    queryFn: () => isFavorited(listingId),
    staleTime: 1 * 60 * 1000, // 1 minute
  });
}
