import { useEffect, useMemo, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import SearchBar from '@/components/SearchBar';
import CategoryPills from '@/components/CategoryPills';
import TypeToggle from '@/components/TypeToggle';
import ListingCard from '@/components/ListingCard';
import ListingCardSkeleton from '@/components/ListingCardSkeleton';
import SellerCTA from '@/components/SellerCTA';
import AnimatedDropdown from '@/components/ui/animated-dropdown';

import { getListings, getListingsNearby } from '@/lib/api/listings';
import { useQuery } from '@tanstack/react-query';
import { PackageOpen, MapPin } from 'lucide-react';
import { useAppStore } from '@/store/app-store';

const RADIUS_OPTIONS = [
  { id: '1km', name: '1km' },
  { id: '3km', name: '3km' },
  { id: '5km', name: '5km' },
  { id: '10km', name: '10km' },
  { id: '20km', name: '20km' },
];

const Index = () => {
  const [loading, setLoading] = useState(true);
  const [selectedRadius, setSelectedRadius] = useState('20km');
  const {
    userLat, userLng, hasLocation,
    searchQuery, selectedCategory, typeFilter,
    setUserLocation,
  } = useAppStore();

  const { data: fetchedListings = [], isLoading: isFetching } = useQuery({
    queryKey: ['listings', hasLocation, userLat, userLng],
    queryFn: () => {
      if (hasLocation) {
        return getListingsNearby(userLat, userLng, 20); // 20km radius max
      }
      return getListings({ limit: 100 });
    },
    staleTime: 60000,
  });

  useEffect(() => {
    navigator.geolocation?.getCurrentPosition(
      (pos) => setUserLocation(pos.coords.latitude, pos.coords.longitude),
      () => { },
      { enableHighAccuracy: true, timeout: 8000, maximumAge: 30_000 }
    );
    const t = setTimeout(() => setLoading(false), 600);
    return () => clearTimeout(t);
  }, [setUserLocation]);

  const filtered = useMemo(() => {
    let items = fetchedListings;

    if (searchQuery) {
      const q = searchQuery.toLowerCase();
      items = items.filter(
        (l) =>
          l.name.toLowerCase().includes(q) ||
          l.description.toLowerCase().includes(q) ||
          l.tags.some((t) => t.toLowerCase().includes(q)) ||
          l.seller_name.toLowerCase().includes(q)
      );
    }
    if (selectedCategory) {
      items = items.filter((l) => l.category === selectedCategory);
    }
    if (typeFilter !== 'all') {
      items = items.filter((l) => l.type === typeFilter);
    }

    if (hasLocation) {
      const radiusValue = parseInt(selectedRadius.replace('km', ''));
      if (!isNaN(radiusValue)) {
        items = items.filter((l) => {
          const dist = (l as { distance_km?: number }).distance_km ?? 0;
          return dist <= radiusValue;
        });
      }

      items.sort(
        (a, b) =>
          ((a as { distance_km?: number }).distance_km ?? 0) - ((b as { distance_km?: number }).distance_km ?? 0)
      );
    }

    return items;
  }, [searchQuery, selectedCategory, typeFilter, hasLocation, fetchedListings, selectedRadius]);

  return (
    <div className="max-w-7xl mx-auto px-4 md:px-6 pb-24 md:pb-10">
      {/* Hero */}
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        className="pt-6 pb-5"
      >
        <h1 className="text-display text-foreground md:text-5xl">
          Find Freelancers near you.
        </h1>
        <p className="text-sm md:text-base text-muted-foreground mt-2">
          Discover skilled students &amp; professionals for your project — within walking distance.
        </p>
        {!hasLocation && (
          <p className="text-[11px] text-muted-foreground mt-2 flex items-center gap-1">
            <span className="w-1.5 h-1.5 rounded-full bg-secondary" />
            Enable location for nearby discovery
          </p>
        )}
      </motion.div>

      <div>
        {/* Search & Filters */}
        <div className="flex flex-col gap-3 mb-4">
          <div className="flex gap-2 items-center bg-card shadow-sm border border-border p-2 rounded-2xl relative z-20">
            <div className="flex-1 min-w-0">
              <SearchBar />
            </div>
            {hasLocation && (
              <div className="w-[125px] shrink-0 border-l border-border pl-2">
                <AnimatedDropdown
                  items={RADIUS_OPTIONS}
                  selectedId={selectedRadius}
                  text="Distance"
                  onSelect={(item) => setSelectedRadius(item.id || '20km')}
                  className="w-full text-xs shadow-none border-none bg-transparent hover:bg-muted/50"
                />
              </div>
            )}
          </div>
          <TypeToggle />
          <CategoryPills />
        </div>

        {/* Grid */}
        {loading || isFetching ? (
          <div className="grid grid-cols-2 sm:grid-cols-2 md:grid-cols-3 xl:grid-cols-4 gap-3">
            {Array.from({ length: 8 }).map((_, i) => (
              <ListingCardSkeleton key={i} />
            ))}
          </div>
        ) : filtered.length === 0 ? (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="flex flex-col items-center py-16 text-center"
          >
            <PackageOpen className="w-12 h-12 text-muted-foreground/40 mb-3" />
            <p className="font-medium text-foreground">No listings yet in this area</p>
            <p className="text-sm text-muted-foreground mt-1">
              Be the first to register your skills or post a project nearby!
            </p>
          </motion.div>
        ) : (
          <AnimatePresence mode="popLayout">
            <motion.div layout className="grid grid-cols-2 sm:grid-cols-2 md:grid-cols-3 xl:grid-cols-4 gap-3">
              {filtered.map((listing) => (
                <motion.div
                  key={listing.id}
                  layout
                  initial={{ opacity: 0, scale: 0.95 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.95 }}
                  transition={{ duration: 0.2 }}
                >
                  <ListingCard listing={listing} />
                </motion.div>
              ))}
            </motion.div>
          </AnimatePresence>
        )}

        {/* CTA below results */}
        {!loading && !isFetching && (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
            className="mt-8"
          >
            <SellerCTA />
          </motion.div>
        )}
      </div>
    </div>
  );
};

export default Index;
