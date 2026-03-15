import { create } from 'zustand';
import { DEFAULT_LAT, DEFAULT_LNG } from '@/lib/distance';

interface AppState {
  userLat: number;
  userLng: number;
  hasLocation: boolean;
  searchQuery: string;
  selectedCategory: string | null;
  typeFilter: 'all' | 'product' | 'service';
  distanceFilter: number; // km, 0 = anywhere
  sortBy: 'distance' | 'newest';
  setUserLocation: (lat: number, lng: number) => void;
  setSearchQuery: (q: string) => void;
  setSelectedCategory: (c: string | null) => void;
  setTypeFilter: (t: 'all' | 'product' | 'service') => void;
  setDistanceFilter: (d: number) => void;
  setSortBy: (s: 'distance' | 'newest') => void;
}

export const useAppStore = create<AppState>((set) => ({
  userLat: DEFAULT_LAT,
  userLng: DEFAULT_LNG,
  hasLocation: false,
  searchQuery: '',
  selectedCategory: null,
  typeFilter: 'all',
  distanceFilter: 0,
  sortBy: 'distance',
  setUserLocation: (lat, lng) => set({ userLat: lat, userLng: lng, hasLocation: true }),
  setSearchQuery: (q) => set({ searchQuery: q }),
  setSelectedCategory: (c) => set({ selectedCategory: c }),
  setTypeFilter: (t) => set({ typeFilter: t }),
  setDistanceFilter: (d) => set({ distanceFilter: d }),
  setSortBy: (s) => set({ sortBy: s }),
}));
