import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { DEFAULT_LAT, DEFAULT_LNG } from '@/lib/distance';
import type { ProjectRole, ProjectDifficulty, LocationPreference, CompensationType } from '@/lib/db-types';

export interface User {
  id: string; // Supabase user ID
  email: string;
  name: string;
  gender: 'male' | 'female' | 'other' | null;
  phone: string | null;
  role: ProjectRole | null;
}

interface AppState {
  // Auth
  user: User | null;
  // Location
  userLat: number;
  userLng: number;
  hasLocation: boolean;
  userArea: string | null;
  // Project Filters & search
  searchQuery: string;
  selectedCategory: string | null;
  industryFilter: string | null;
  difficultyFilter: 'all' | ProjectDifficulty;
  locationPreferenceFilter: 'all' | LocationPreference;
  compensationFilter: 'all' | CompensationType;
  // Legacy filters (maintained for compatibility)
  typeFilter: 'all' | 'product' | 'service';
  operationTypeFilter: 'all' | 'home' | 'shop';
  distanceFilter: number; // km, 0 = anywhere
  sortBy: 'newest' | 'distance';
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
  setIndustryFilter: (ind: string | null) => void;
  setDifficultyFilter: (d: 'all' | ProjectDifficulty) => void;
  setLocationPreferenceFilter: (loc: 'all' | LocationPreference) => void;
  setCompensationFilter: (comp: 'all' | CompensationType) => void;
  setTypeFilter: (t: 'all' | 'product' | 'service') => void;
  setOperationTypeFilter: (t: 'all' | 'home' | 'shop') => void;
  setDistanceFilter: (d: number) => void;
  setSortBy: (s: 'newest' | 'distance') => void;
  setLoading: (loading: boolean) => void;
  setSidebarOpen: (open: boolean) => void;
  setTheme: (theme: 'light' | 'dark' | 'system') => void;
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
      industryFilter: null,
      difficultyFilter: 'all',
      locationPreferenceFilter: 'all',
      compensationFilter: 'all',
      typeFilter: 'all',
      operationTypeFilter: 'all',
      distanceFilter: 0,
      sortBy: 'newest',
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
      setIndustryFilter: (ind) => set({ industryFilter: ind }),
      setDifficultyFilter: (d) => set({ difficultyFilter: d }),
      setLocationPreferenceFilter: (loc) => set({ locationPreferenceFilter: loc }),
      setCompensationFilter: (comp) => set({ compensationFilter: comp }),
      setTypeFilter: (t) => set({ typeFilter: t }),
      setOperationTypeFilter: (t) => set({ operationTypeFilter: t }),
      setDistanceFilter: (d) => set({ distanceFilter: d }),
      setSortBy: (s) => set({ sortBy: s }),
      setLoading: (loading) => set({ isLoading: loading }),
      setSidebarOpen: (open) => set({ isSidebarOpen: open }),
      setTheme: (theme) => set({ theme }),

      resetFilters: () =>
        set({
          searchQuery: '',
          selectedCategory: null,
          industryFilter: null,
          difficultyFilter: 'all',
          locationPreferenceFilter: 'all',
          compensationFilter: 'all',
          typeFilter: 'all',
          operationTypeFilter: 'all',
          distanceFilter: 0,
          sortBy: 'newest',
        }),
    }),
    {
      name: 'spotgig-store',
      partialize: (state) => ({
        user: state.user,
        userLat: state.userLat,
        userLng: state.userLng,
        hasLocation: state.hasLocation,
        sortBy: state.sortBy,
        theme: state.theme,
      }),
    }
  )
);
