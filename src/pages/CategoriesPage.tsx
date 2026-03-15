import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { CATEGORIES, MOCK_LISTINGS } from '@/lib/mock-data';
import { useAppStore } from '@/store/app-store';

const CategoriesPage = () => {
  const navigate = useNavigate();
  const { setSelectedCategory } = useAppStore();

  const handleCategoryTap = (name: string) => {
    setSelectedCategory(name);
    navigate('/');
  };

  return (
    <div className="max-w-md mx-auto px-4 pb-24">
      <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="pt-4 pb-5">
        <h1 className="text-subhead text-foreground">Explore Categories</h1>
        <p className="text-sm text-muted-foreground mt-1">Find sellers by what they offer</p>
      </motion.div>
      <div className="grid grid-cols-2 gap-3">
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
