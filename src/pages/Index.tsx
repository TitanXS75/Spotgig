import { useEffect, useMemo, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import SearchBar from '@/components/SearchBar';
import CategoryPills from '@/components/CategoryPills';
import TypeToggle from '@/components/TypeToggle';
import ListingCard from '@/components/ListingCard';
import ListingCardSkeleton from '@/components/ListingCardSkeleton';
import SellerCTA from '@/components/SellerCTA';

import { getDistance } from '@/lib/distance';
import { useAppStore } from '@/store/app-store';
import { PackageOpen } from 'lucide-react';


const Index = () => {
  const [loading, setLoading] = useState(true);
  const {
    userLat, userLng, hasLocation,
    searchQuery, selectedCategory, typeFilter,
    setUserLocation, userListings,
  } = useAppStore();

  useEffect(() => {
    // Get user's real location for distance-based sorting.
    // We persist the last known location in the store, so this is mostly for first-run / updates.
    navigator.geolocation?.getCurrentPosition(
      (pos) => setUserLocation(pos.coords.latitude, pos.coords.longitude),
      () => {},
      { enableHighAccuracy: true, timeout: 8000, maximumAge: 30_000 }
    );
    const t = setTimeout(() => setLoading(false), 600);
    return () => clearTimeout(t);
  }, [setUserLocation]);

  const filtered = useMemo(() => {
    let items = userListings.filter((l) => l.status === 'live');

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
        items.sort(
          (a, b) =>
            getDistance(userLat, userLng, a.lat, a.lng) -
            getDistance(userLat, userLng, b.lat, b.lng)
        );
      }

    return items;
  }, [searchQuery, selectedCategory, typeFilter, userLat, userLng]);

  return (
    <div className="max-w-7xl mx-auto px-4 md:px-6 pb-24 md:pb-10">
      {/* Hero */}
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        className="pt-6 pb-5"
      >
        <h1 className="text-display text-foreground md:text-5xl">
          Find Home sellers near you.
        </h1>
        <p className="text-sm md:text-base text-muted-foreground mt-2">
          Discover local products &amp; services within walking distance.
        </p>
        {!hasLocation && (
          <p className="text-[11px] text-muted-foreground mt-2 flex items-center gap-1">
            <span className="w-1.5 h-1.5 rounded-full bg-secondary" />
            Enable location for accuracy
          </p>
        )}
      </motion.div>

      <div>
        {/* Search & Filters */}
        <div className="flex flex-col gap-3 mb-4">
          <SearchBar />
          <TypeToggle />
          <CategoryPills />
        </div>

        {/* Grid */}
        {loading ? (
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
            <p className="font-medium text-foreground">No sellers found nearby</p>
            <p className="text-sm text-muted-foreground mt-1">
              Try increasing your distance or clearing filters
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

        {/* Seller CTA — shown below results */}
        {!loading && (
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
