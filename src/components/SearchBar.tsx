import { Search } from 'lucide-react';
import { useAppStore } from '@/store/app-store';

const SearchBar = () => {
  const { searchQuery, setSearchQuery, distanceFilter, setDistanceFilter } = useAppStore();

  return (
    <div className="flex gap-2">
      <div className="flex-1 relative">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
        <input
          type="text"
          placeholder="Search sellers, products..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="w-full pl-9 pr-3 py-2.5 rounded-xl bg-muted text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/20 transition-shadow"
        />
      </div>
      <select
        value={distanceFilter}
        onChange={(e) => setDistanceFilter(Number(e.target.value))}
        className="px-3 py-2.5 rounded-xl bg-muted text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-primary/20 appearance-none cursor-pointer font-medium"
      >
        <option value={0}>Any</option>
        <option value={1}>1 km</option>
        <option value={2}>2 km</option>
        <option value={5}>5 km</option>
        <option value={10}>10 km</option>
      </select>
    </div>
  );
};

export default SearchBar;
