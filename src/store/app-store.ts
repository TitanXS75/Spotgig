import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { DEFAULT_LAT, DEFAULT_LNG } from '@/lib/distance';

interface AppState {
  // Location
  userLat: number;
  userLng: number;
  hasLocation: boolean;
  // Filters & search
  searchQuery: string;
  selectedCategory: string | null;
  typeFilter: 'all' | 'product' | 'service';
  distanceFilter: number; // km, 0 = anywhere
  sortBy: 'distance' | 'newest';
  // Favorites (local, persisted to localStorage)
  favoritedIds: string[];
  // Actions
  setUserLocation: (lat: number, lng: number) => void;
  setSearchQuery: (q: string) => void;
  setSelectedCategory: (c: string | null) => void;
  setTypeFilter: (t: 'all' | 'product' | 'service') => void;
  setDistanceFilter: (d: number) => void;
  setSortBy: (s: 'distance' | 'newest') => void;
  toggleFavorite: (id: string) => void;
  isFavorited: (id: string) => boolean;
}

export const useAppStore = create<AppState>()(
  persist(
    (set, get) => ({
      userLat: DEFAULT_LAT,
      userLng: DEFAULT_LNG,
      hasLocation: false,
      searchQuery: '',
      selectedCategory: null,
      typeFilter: 'all',
      distanceFilter: 0,
      sortBy: 'distance',
      favoritedIds: [],

      setUserLocation: (lat, lng) => set({ userLat: lat, userLng: lng, hasLocation: true }),
      setSearchQuery: (q) => set({ searchQuery: q }),
      setSelectedCategory: (c) => set({ selectedCategory: c }),
      setTypeFilter: (t) => set({ typeFilter: t }),
      setDistanceFilter: (d) => set({ distanceFilter: d }),
      setSortBy: (s) => set({ sortBy: s }),

      toggleFavorite: (id) => {
        const { favoritedIds } = get();
        const exists = favoritedIds.includes(id);
        set({ favoritedIds: exists ? favoritedIds.filter((x) => x !== id) : [...favoritedIds, id] });
      },
      isFavorited: (id) => get().favoritedIds.includes(id),
    }),
    {
      name: 'aaspass-store',
      // Only persist certain fields — don't persist geolocation (always re-fetch)
      partialize: (state) => ({
        favoritedIds: state.favoritedIds,
        sortBy: state.sortBy,
        distanceFilter: state.distanceFilter,
      }),
    }
  )
);
