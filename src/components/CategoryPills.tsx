import { motion } from 'framer-motion';
import { CATEGORIES } from '@/lib/mock-data';
import { useAppStore } from '@/store/app-store';

const CategoryPills = () => {
  const { selectedCategory, setSelectedCategory } = useAppStore();

  return (
    <div className="flex gap-2 overflow-x-auto pb-2 scrollbar-none -mx-4 px-4">
      <motion.button
        whileTap={{ scale: 0.96 }}
        onClick={() => setSelectedCategory(null)}
        className={`flex items-center gap-1.5 px-3 py-2 rounded-xl text-sm font-medium whitespace-nowrap transition-colors shrink-0 ${
          selectedCategory === null
            ? 'bg-primary text-primary-foreground shadow-sm'
            : 'bg-muted text-foreground'
        }`}
      >
        <span>🌟</span>
        <span>All</span>
      </motion.button>
      {CATEGORIES.map(({ name, emoji }) => {
        const isActive = selectedCategory === name;
        return (
          <motion.button
            key={name}
            whileTap={{ scale: 0.96 }}
            onClick={() => setSelectedCategory(isActive ? null : name)}
            className={`flex items-center gap-1.5 px-3 py-2 rounded-xl text-sm font-medium whitespace-nowrap transition-colors shrink-0 ${
              isActive
                ? 'bg-primary text-primary-foreground shadow-sm'
                : 'bg-muted text-foreground'
            }`}
          >
            <span>{emoji}</span>
            <span>{name}</span>
          </motion.button>
        );
      })}
    </div>
  );
};

export default CategoryPills;
