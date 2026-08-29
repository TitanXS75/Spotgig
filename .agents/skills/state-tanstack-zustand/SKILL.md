---
name: state-tanstack-zustand
description: Best practices for managing client UI state (Zustand) and server cache state (TanStack Query v5) in Aaspass with zero state conflicts.
---

# State Architecture Skill (TanStack Query + Zustand) — Aaspass

## When to Use
Load this skill when adding data fetching, query invalidation, caching strategies, optimistic UI updates, or global UI filters.

---

## 1. The Strict Division of Responsibility

| State Type | Library | Location | Examples |
|---|---|---|---|
| **Client / UI State** | **Zustand** | `src/store/app-store.ts` | Selected category, distance slider, user location, search query, theme |
| **Server / Data State** | **TanStack Query** | Custom hooks in `src/hooks/` | Listings feed, user profile, reviews, comments, favorite list |

> ⚠️ **CRITICAL RULE**: Never copy TanStack Query response data into Zustand. TanStack Query IS the store for server state.

---

## 2. TanStack Query v5 Hook Patterns

### Standard Data Query
```tsx
import { useQuery } from "@tanstack/react-query";
import { fetchListings } from "@/lib/api/listings";
import { useAppStore } from "@/store/app-store";

export function useListings() {
  const { userLat, userLng, distanceFilter, selectedCategory, typeFilter, searchQuery } = useAppStore();

  return useQuery({
    queryKey: ['listings', { userLat, userLng, distanceFilter, selectedCategory, typeFilter, searchQuery }],
    queryFn: () => fetchListings({
      lat: userLat,
      lng: userLng,
      radius_km: distanceFilter,
      category: selectedCategory ?? undefined,
      type: typeFilter === 'all' ? undefined : typeFilter,
      query: searchQuery || undefined,
    }),
    staleTime: 1000 * 60 * 2, // 2 minutes fresh cache
    gcTime: 1000 * 60 * 10,   // 10 minutes garbage collection
  });
}
```

### Optimistic Mutation (e.g. Toggle Favorite)
```tsx
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { toggleFavorite } from "@/lib/api/favorites";
import { toast } from "sonner";

export function useToggleFavorite() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (listingId: string) => toggleFavorite(listingId),
    onMutate: async (listingId) => {
      await queryClient.cancelQueries({ queryKey: ['favorites'] });
      const previousFavorites = queryClient.getQueryData<string[]>(['favorites']) ?? [];
      
      const isFav = previousFavorites.includes(listingId);
      const nextFavorites = isFav 
        ? previousFavorites.filter(id => id !== listingId)
        : [...previousFavorites, listingId];

      queryClient.setQueryData(['favorites'], nextFavorites);
      return { previousFavorites };
    },
    onError: (err, listingId, context) => {
      if (context?.previousFavorites) {
        queryClient.setQueryData(['favorites'], context.previousFavorites);
      }
      toast.error("Could not update bookmark");
    },
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: ['favorites'] });
    },
  });
}
```

---

## 3. Zustand Store Rules

- Use `persist` middleware only for data that needs to survive page reloads (e.g. `userLat`, `userLng`, `theme`).
- Use `partialize` to exclude transient loading flags or modal states from `localStorage`.
- Access store properties with atomic selectors to prevent unnecessary re-renders:
  ```tsx
  // Good (only re-renders when selectedCategory changes)
  const selectedCategory = useAppStore((state) => state.selectedCategory);
  ```
