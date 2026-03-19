import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { DEFAULT_LAT, DEFAULT_LNG } from '@/lib/distance';

interface User {
  email: string;
  name: string;
  age: number | null;
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
  distanceFilter: number; // km, 0 = anywhere
  sortBy: 'distance' | 'newest';
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
  setDistanceFilter: (d: number) => void;
  setSortBy: (s: 'distance' | 'newest') => void;
  setLoading: (loading: boolean) => void;
  setSidebarOpen: (open: boolean) => void;
  setTheme: (theme: 'light' | 'dark' | 'system') => void;
  toggleFavorite: (id: string) => void;
  isFavorited: (id: string) => boolean;
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
      distanceFilter: 0,
      sortBy: 'distance',
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
      
      resetFilters: () =>
        set({
          searchQuery: '',
          selectedCategory: null,
          typeFilter: 'all',
          distanceFilter: 0,
          sortBy: 'distance',
        }),
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
        favoritedIds: state.favoritedIds,
        sortBy: state.sortBy,
        distanceFilter: state.distanceFilter,
        theme: state.theme,
      }),
    }
  )
);
