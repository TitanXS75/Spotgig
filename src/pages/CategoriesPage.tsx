import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Search } from 'lucide-react';
import { useState } from 'react';
import { CATEGORIES, MOCK_LISTINGS } from '@/lib/mock-data';
import { useAppStore } from '@/store/app-store';

const CategoriesPage = () => {
  const navigate = useNavigate();
  const { setSelectedCategory, setSearchQuery } = useAppStore();
  const [query, setQuery] = useState('');

  const handleCategoryTap = (name: string) => {
    setSelectedCategory(name);
    navigate('/');
  };

  const handleSearch = () => {
    if (query.trim()) {
      setSearchQuery(query.trim());
      navigate('/');
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') handleSearch();
  };

  return (
    <div className="max-w-7xl mx-auto px-4 md:px-6 pb-24 md:pb-10">
      <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="pt-4 pb-5">
        <h1 className="text-subhead text-foreground">Explore Categories</h1>
        <p className="text-sm text-muted-foreground mt-1">Find sellers by what they offer</p>
      </motion.div>

      {/* Search bar */}
      <div className="flex gap-2 mb-5">
        <div className="flex-1 relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <input
            type="text"
            placeholder="Search sellers, products..."
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            onKeyDown={handleKeyDown}
            className="w-full pl-9 pr-3 py-2.5 rounded-xl bg-muted text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/20 transition-shadow"
          />
        </div>
        <motion.button
          whileTap={{ scale: 0.95 }}
          onClick={handleSearch}
          className="px-4 py-2.5 rounded-xl bg-primary text-primary-foreground text-sm font-semibold"
        >
          Search
        </motion.button>
      </div>

      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-3">
        {CATEGORIES.map(({ name, emoji }, i) => {
          const count = MOCK_LISTINGS.filter((l) => l.category === name && l.status === 'live').length;
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
              <span className="text-sm font-medium text-foreground">{name}</span>
              <span className="text-meta text-muted-foreground">{count} listing{count !== 1 ? 's' : ''}</span>
            </motion.button>
          );
        })}
      </div>
    </div>
  );
};

export default CategoriesPage;
