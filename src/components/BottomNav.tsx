import { Home, MapPin, Grid3X3, User } from 'lucide-react';
import { useLocation, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';

const NAV_ITEMS = [
  { path: '/', icon: Home, label: 'Home' },
  { path: '/map', icon: MapPin, label: 'Map' },
  { path: '/categories', icon: Grid3X3, label: 'Explore' },
  { path: '/profile', icon: User, label: 'Profile' },
];

const BottomNav = () => {
  const location = useLocation();
  const navigate = useNavigate();

  return (
    <nav className="fixed bottom-0 left-0 right-0 z-50 bg-background/80 backdrop-blur-xl shadow-nav safe-bottom">
      <div className="max-w-md mx-auto flex items-center justify-around h-16">
        {NAV_ITEMS.map(({ path, icon: Icon, label }) => {
          const isActive = location.pathname === path;
          return (
            <motion.button
              key={path}
              whileTap={{ scale: 0.96 }}
              onClick={() => navigate(path)}
              className={`flex flex-col items-center gap-0.5 px-4 py-2 transition-colors ${
                isActive ? 'text-primary' : 'text-muted-foreground'
              }`}
            >
              <Icon className="w-5 h-5" strokeWidth={isActive ? 2.5 : 2} />
              <span className="text-[10px] font-medium">{label}</span>
            </motion.button>
          );
        })}
      </div>
    </nav>
  );
};

export default BottomNav;
