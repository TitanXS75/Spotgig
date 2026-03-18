import { useAppStore } from '@/store/app-store';
import { useLocation, useNavigate } from 'react-router-dom';
import { Home, Map, Grid3X3, User } from 'lucide-react';
import aplgLogo from '/aplg.png';
import { motion } from 'framer-motion';
import ThemeToggle from './ThemeToggle';

const NAV_ITEMS = [
  { path: '/home', icon: Home, label: 'Home' },
  { path: '/categories', icon: Grid3X3, label: 'Explore' },
  { path: '/map', icon: Map, label: 'Map' },
  { path: '/profile', icon: User, label: 'Profile' },
];

const TopBar = () => {
  const { hasLocation } = useAppStore();
  const location = useLocation();
  const navigate = useNavigate();

  // Hide top bar on landing and auth pages
  if (location.pathname === '/' || location.pathname === '/auth' || location.pathname === '/forgot-password') return null;

  return (
    <header className="sticky top-0 z-40 bg-background/80 backdrop-blur-xl border-b border-border/50">
      <div className="max-w-7xl mx-auto flex items-center justify-between h-14 px-4 md:px-6">
        {/* Logo */}
        <div
          className="flex items-center gap-2 cursor-pointer"
          onClick={() => navigate('/home')}
        >
          <img src={aplgLogo} alt="Aaspass logo" className="w-8 h-8 rounded-xl object-contain" />
          <span className="text-lg font-semibold tracking-tight text-foreground">Aaspass</span>
        </div>

        {/* Desktop nav links */}
        <nav className="hidden md:flex items-center gap-1">
          {NAV_ITEMS.map(({ path, icon: Icon, label }) => {
            const isActive = location.pathname === path;
            return (
              <motion.button
                key={path}
                whileTap={{ scale: 0.96 }}
                onClick={() => navigate(path)}
                className={`flex items-center gap-1.5 px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
                  isActive
                    ? 'text-primary bg-primary/8'
                    : 'text-muted-foreground hover:text-foreground hover:bg-muted'
                }`}
              >
                <Icon className="w-4 h-4" strokeWidth={isActive ? 2.5 : 2} />
                {label}
              </motion.button>
            );
          })}
        </nav>

        {/* Right actions */}
        <div className="flex items-center gap-2">
          <ThemeToggle />
        </div>
      </div>
    </header>
  );
};

export default TopBar;
