import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { DEFAULT_LAT, DEFAULT_LNG } from '@/lib/distance';

import type { Listing } from '@/lib/mock-data';

interface User {
  email: string;
  name: string;
  gender: 'male' | 'female' | 'other' | null;
  phone: string | null;
}

interface AppState {
  // Auth
  user: User | null;
  // Location
  userLat: number;
  userLng: number;
  hasLocation: boolean;
  userArea: string | null;
  // Filters & search
  searchQuery: string;
  selectedCategory: string | null;
  typeFilter: 'all' | 'product' | 'service';
  operationTypeFilter: 'all' | 'home' | 'shop';
  distanceFilter: number; // km, 0 = anywhere
  sortBy: 'distance' | 'newest';
  // User Listings (Persisted)
  userListings: Listing[];
  // Favorites (local, persisted to localStorage)
  favoritedIds: string[];
  // UI State
  isLoading: boolean;
  isSidebarOpen: boolean;
  theme: 'light' | 'dark' | 'system';
  // Actions
  setUser: (user: User | null) => void;
  updateUserProfile: (updates: Partial<User>) => void;
  logout: () => void;
  setUserLocation: (lat: number, lng: number, area?: string) => void;
  setSearchQuery: (q: string) => void;
  setSelectedCategory: (c: string | null) => void;
  setTypeFilter: (t: 'all' | 'product' | 'service') => void;
  setOperationTypeFilter: (t: 'all' | 'home' | 'shop') => void;
  setDistanceFilter: (d: number) => void;
  setSortBy: (s: 'distance' | 'newest') => void;
  setLoading: (loading: boolean) => void;
  setSidebarOpen: (open: boolean) => void;
  setTheme: (theme: 'light' | 'dark' | 'system') => void;
  toggleFavorite: (id: string) => void;
  isFavorited: (id: string) => boolean;
  addListing: (listing: Listing) => void;
  updateListing: (id: string, updates: Partial<Listing>) => void;
  deleteListing: (id: string) => void;
  resetFilters: () => void;
}

export const useAppStore = create<AppState>()(
  persist(
    (set, get) => ({
      user: null,
      userLat: DEFAULT_LAT,
      userLng: DEFAULT_LNG,
      hasLocation: false,
      userArea: null,
      searchQuery: '',
      selectedCategory: null,
      typeFilter: 'all',
      operationTypeFilter: 'all',
      distanceFilter: 0,
      sortBy: 'distance',
      userListings: [],
      favoritedIds: [],
      isLoading: false,
      isSidebarOpen: false,
      theme: 'system',

      setUser: (user) => set({ user }),
      updateUserProfile: (updates) => {
        const { user } = get();
        if (user) {
          set({ user: { ...user, ...updates } });
        }
      },
      logout: () => set({ user: null }),
      setUserLocation: (lat, lng, area) =>
        set({ userLat: lat, userLng: lng, hasLocation: true, userArea: area || null }),
      setSearchQuery: (q) => set({ searchQuery: q }),
      setSelectedCategory: (c) => set({ selectedCategory: c }),
      setTypeFilter: (t) => set({ typeFilter: t }),
      setOperationTypeFilter: (t) => set({ operationTypeFilter: t }),
      setDistanceFilter: (d) => set({ distanceFilter: d }),
      setSortBy: (s) => set({ sortBy: s }),
      setLoading: (loading) => set({ isLoading: loading }),
      setSidebarOpen: (open) => set({ isSidebarOpen: open }),
      setTheme: (theme) => set({ theme }),

      toggleFavorite: (id) => {
        const { favoritedIds } = get();
        const exists = favoritedIds.includes(id);
        set({
          favoritedIds: exists ? favoritedIds.filter((x) => x !== id) : [...favoritedIds, id],
        });
      },
      isFavorited: (id) => get().favoritedIds.includes(id),

      addListing: (listing) => set((state) => ({ userListings: [listing, ...state.userListings] })),
      updateListing: (id, updates) => set((state) => ({
        userListings: state.userListings.map(l => l.id === id ? { ...l, ...updates } : l)
      })),
      
      resetFilters: () =>
        set({
          searchQuery: '',
          selectedCategory: null,
          typeFilter: 'all',
          operationTypeFilter: 'all',
          distanceFilter: 0,
          sortBy: 'distance',
        }),
      deleteListing: (id) => set((state) => ({
        userListings: state.userListings.filter(l => l.id !== id)
      })),
    }),
    {
      name: 'aaspass-store',
      // Persist last known location so the app stays in the user's region across reloads.
      partialize: (state) => ({
        user: state.user,
        userLat: state.userLat,
        userLng: state.userLng,
        hasLocation: state.hasLocation,
        userArea: state.userArea,
        userListings: state.userListings,
        favoritedIds: state.favoritedIds,
        sortBy: state.sortBy,
        operationTypeFilter: state.operationTypeFilter,
        distanceFilter: state.distanceFilter,
        theme: state.theme,
      }),
    }
  )
);
