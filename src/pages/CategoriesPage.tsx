import { useState, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Search, ArrowLeft, PackageOpen } from 'lucide-react';
import { CATEGORIES } from '@/lib/mock-data';
import ListingCard from '@/components/ListingCard';
import { useAppStore } from '@/store/app-store';
import { getDistance } from '@/lib/distance';

const CategoriesPage = () => {
  // Two separate query states: one for category search, one for shop search
  const [categoryQuery, setCategoryQuery] = useState('');
  const [listingQuery, setListingQuery] = useState('');
  
  // The currently viewed category (null = viewing all categories)
  const [activeCategory, setActiveCategory] = useState<string | null>(null);
  
  const { userLat, userLng, favoritedIds, userListings } = useAppStore();

  const handleCategoryTap = (name: string) => {
    setActiveCategory(name);
    // Reset the internal listing query when entering a new category
    setListingQuery('');
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      (e.target as HTMLInputElement).blur();
    }
  };

  // Filter the category list based on categoryQuery
  const filteredCategories = useMemo(() => {
    if (!categoryQuery.trim()) return CATEGORIES;
    const q = categoryQuery.toLowerCase();
    return CATEGORIES.filter((c) => c.name.toLowerCase().includes(q));
  }, [categoryQuery]);

  // Filter the listings when inside a specific category
  const filteredListings = useMemo(() => {
    if (!activeCategory) return [];

    let items;
    if (activeCategory === 'Favourites') {
      items = userListings.filter((l) => favoritedIds.includes(l.id));
    } else {
      items = userListings.filter(
        (l) => l.status === 'live' && l.category === activeCategory
      );
    }

    if (listingQuery.trim()) {
      const q = listingQuery.toLowerCase();
      items = items.filter(
        (l) =>
          l.name.toLowerCase().includes(q) ||
          l.description.toLowerCase().includes(q) ||
          l.tags.some((t) => t.toLowerCase().includes(q)) ||
          l.seller_name.toLowerCase().includes(q)
      );
    }
    
    // Sort by distance
    items.sort((a, b) => getDistance(userLat, userLng, a.lat, a.lng) - getDistance(userLat, userLng, b.lat, b.lng));
    return items;
  }, [listingQuery, activeCategory, userLat, userLng]);

  return (
    <div className="max-w-7xl mx-auto px-4 md:px-6 pb-24 md:pb-10">
      <AnimatePresence mode="wait">
        {!activeCategory ? (
          <motion.div
            key="categories-view"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
          >
            <div className="pt-4 pb-5">
              <h1 className="text-subhead text-foreground">Explore Categories</h1>
              <p className="text-sm text-muted-foreground mt-1">Find what you need by category</p>
            </div>

            {/* Category Search bar */}
            <div className="flex gap-2 mb-5">
              <div className="flex-1 relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                <input
                  type="text"
                  placeholder="Search categories..."
                  value={categoryQuery}
                  onChange={(e) => setCategoryQuery(e.target.value)}
                  onKeyDown={handleKeyDown}
                  className="w-full pl-9 pr-3 py-2.5 rounded-xl bg-muted text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/20 transition-shadow"
                />
              </div>
            </div>

            {filteredCategories.length === 0 ? (
              <div className="text-center py-10">
                <p className="text-muted-foreground text-sm">No categories found matching "{categoryQuery}"</p>
              </div>
            ) : (
              <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-3">
                {(!categoryQuery.trim() || 'favourites saved'.includes(categoryQuery.toLowerCase())) && (
                  <motion.button
                    key="Favourites"
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    whileTap={{ scale: 0.96 }}
                    onClick={() => handleCategoryTap('Favourites')}
                    className="flex flex-col items-center gap-2 p-5 bg-card rounded-2xl shadow-card hover:shadow-card-hover transition-shadow border border-primary/20 bg-primary/5"
                  >
                    <span className="text-4xl mt-1">❤️</span>
                    <span className="text-sm font-medium text-foreground text-center leading-tight mt-1">
                      Favourites
                    </span>
                    <span className="text-meta text-muted-foreground mt-auto">
                      {favoritedIds.length} saved
                    </span>
                  </motion.button>
                )}
                {filteredCategories.map(({ name, emoji }, i) => {
                  const count = userListings.filter((l) => l.category === name && l.status === 'live').length;
                  return (
                    <motion.button
                      key={name}
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: i * 0.04 }}
                      whileTap={{ scale: 0.96 }}
                      onClick={() => handleCategoryTap(name)}
                      className="flex flex-col items-center gap-2 p-5 bg-card rounded-2xl shadow-card hover:shadow-card-hover transition-shadow"
                    >
                      <span className="text-4xl">{emoji}</span>
                      <span className="text-sm font-medium text-foreground text-center leading-tight">
                        {name}
                      </span>
                      <span className="text-meta text-muted-foreground mt-auto">
                        {count} listing{count !== 1 ? 's' : ''}
                      </span>
                    </motion.button>
                  );
                })}
              </div>
            )}
          </motion.div>
        ) : (
          <motion.div
            key="listings-view"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            transition={{ duration: 0.2 }}
          >
            {/* Header + Back Button */}
            <div className="pt-4 pb-4 border-b border-border/50 mb-5 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <button
                  onClick={() => setActiveCategory(null)}
                  className="p-1.5 -ml-1.5 hover:bg-muted rounded-full transition-colors text-muted-foreground hover:text-foreground"
                >
                  <ArrowLeft className="w-5 h-5" />
                </button>
                <h1 className="text-subhead text-foreground truncate">{activeCategory}</h1>
              </div>
              <span className="text-sm text-muted-foreground">
                {filteredListings.length} found
              </span>
            </div>

            {/* Shop Search bar */}
            <div className="flex gap-2 mb-5">
              <div className="flex-1 relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                <input
                  type="text"
                  placeholder={`Search shops in ${activeCategory}...`}
                  value={listingQuery}
                  onChange={(e) => setListingQuery(e.target.value)}
                  onKeyDown={handleKeyDown}
                  className="w-full pl-9 pr-3 py-2.5 rounded-xl bg-muted text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/20 transition-shadow"
                />
              </div>
            </div>

            {/* Results Grid */}
            {filteredListings.length === 0 ? (
              <div className="flex flex-col items-center py-16 text-center">
                <PackageOpen className="w-12 h-12 text-muted-foreground/40 mb-3" />
                <p className="font-medium text-foreground">No shops found</p>
                <p className="text-sm text-muted-foreground mt-1">
                  Try a different search term in {activeCategory}
                </p>
              </div>
            ) : (
              <div className="grid grid-cols-2 sm:grid-cols-2 md:grid-cols-3 xl:grid-cols-4 gap-3">
                {filteredListings.map((listing) => (
                  <ListingCard key={listing.id} listing={listing} />
                ))}
              </div>
            )}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default CategoriesPage;
