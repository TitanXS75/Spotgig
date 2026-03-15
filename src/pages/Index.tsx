import { useEffect, useMemo, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import SearchBar from '@/components/SearchBar';
import CategoryPills from '@/components/CategoryPills';
import TypeToggle from '@/components/TypeToggle';
import ListingCard from '@/components/ListingCard';
import ListingCardSkeleton from '@/components/ListingCardSkeleton';
import SellerCTA from '@/components/SellerCTA';
import { MOCK_LISTINGS } from '@/lib/mock-data';
import { getDistance } from '@/lib/distance';
import { useAppStore } from '@/store/app-store';
import { PackageOpen } from 'lucide-react';

const Index = () => {
  const [loading, setLoading] = useState(true);
  const {
    userLat, userLng, hasLocation,
    searchQuery, selectedCategory, typeFilter, distanceFilter, sortBy,
    setUserLocation, setSortBy,
  } = useAppStore();

  useEffect(() => {
    navigator.geolocation?.getCurrentPosition(
      (pos) => setUserLocation(pos.coords.latitude, pos.coords.longitude),
      () => {},
      { enableHighAccuracy: false, timeout: 5000 }
    );
    const t = setTimeout(() => setLoading(false), 600);
    return () => clearTimeout(t);
  }, [setUserLocation]);

  const filtered = useMemo(() => {
    let items = MOCK_LISTINGS.filter((l) => l.status === 'live');

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
    if (distanceFilter > 0) {
      items = items.filter(
        (l) => getDistance(userLat, userLng, l.lat, l.lng) <= distanceFilter
      );
    }

    if (sortBy === 'distance') {
      items.sort(
        (a, b) =>
          getDistance(userLat, userLng, a.lat, a.lng) -
          getDistance(userLat, userLng, b.lat, b.lng)
      );
    } else {
      items.sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime());
    }

    return items;
  }, [searchQuery, selectedCategory, typeFilter, distanceFilter, sortBy, userLat, userLng]);

  return (
    <div className="max-w-md mx-auto px-4 pb-24">
      {/* Hero */}
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        className="pt-4 pb-5"
      >
        <h1 className="text-display text-foreground">
          Apne aaspass ke sellers dhundho.
        </h1>
        <p className="text-sm text-muted-foreground mt-2">
          Ghar baithe local products & services paao, paidal distance mein.
        </p>
        {!hasLocation && (
          <p className="text-[11px] text-muted-foreground mt-2 flex items-center gap-1">
            <span className="w-1.5 h-1.5 rounded-full bg-secondary" />
            Distances from city centre — enable location for accuracy
          </p>
        )}
      </motion.div>

      {/* Search & Filters */}
      <div className="flex flex-col gap-3 mb-4">
        <SearchBar />
        <TypeToggle />
        <CategoryPills />
      </div>

      {/* Results meta */}
      <div className="flex items-center justify-between mb-3">
        <span className="text-meta text-muted-foreground">
          {filtered.length} seller{filtered.length !== 1 ? 's' : ''} found
        </span>
        <select
          value={sortBy}
          onChange={(e) => setSortBy(e.target.value as 'distance' | 'newest')}
          className="text-meta text-muted-foreground bg-transparent focus:outline-none cursor-pointer"
        >
          <option value="distance">Nearest first</option>
          <option value="newest">Newest first</option>
        </select>
      </div>

      {/* Grid */}
      {loading ? (
        <div className="grid grid-cols-2 gap-3">
          {Array.from({ length: 6 }).map((_, i) => (
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
          <motion.div layout className="grid grid-cols-2 gap-3">
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

      {/* Seller CTA */}
      <SellerCTA />
    </div>
  );
};

export default Index;
