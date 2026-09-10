import { Search, PlusCircle, User, LogIn, Inbox, FolderKanban } from 'lucide-react';
import { useLocation, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { useAppStore } from '@/store/app-store';

const BottomNav = () => {
  const { user } = useAppStore();
  const location = useLocation();
  const navigate = useNavigate();

  // Hide bottom nav on landing and auth pages
  if (location.pathname === '/' || location.pathname === '/auth' || location.pathname === '/forgot-password') return null;

  const isOwner = user?.role === 'project_owner';

  const navItems = isOwner
    ? [
        { path: '/home', icon: Search, label: 'Projects' },
        { path: '/my-projects', icon: FolderKanban, label: 'My Projects' },
        { path: '/post-project', icon: PlusCircle, label: 'Post' },
        { path: '/requests', icon: Inbox, label: 'Requests' },
        { path: '/profile', icon: User, label: 'Profile' },
      ]
    : user
    ? [
        { path: '/home', icon: Search, label: 'Projects' },
        { path: '/my-requests', icon: Inbox, label: 'My Requests' },
        { path: '/profile', icon: User, label: 'Profile' },
      ]
    : [
        { path: '/home', icon: Search, label: 'Projects' },
        { path: '/post-project', icon: PlusCircle, label: 'Post' },
        { path: '/auth', icon: LogIn, label: 'Sign In' },
      ];

  return (
    <nav className="md:hidden fixed bottom-0 left-0 right-0 z-50 bg-background/85 backdrop-blur-xl shadow-nav safe-bottom border-t border-border/60">
      <div className="max-w-md mx-auto flex items-center justify-around h-16">
        {navItems.map(({ path, icon: Icon, label }) => {
          const isActive = location.pathname === path;
          return (
            <motion.button
              key={path}
              whileTap={{ scale: 0.94 }}
              onClick={() => navigate(path)}
              className={`flex flex-col items-center gap-0.5 px-3 py-1.5 transition-colors ${
                isActive ? 'text-primary font-semibold' : 'text-muted-foreground'
              }`}
            >
              <Icon className="w-5 h-5" strokeWidth={isActive ? 2.5 : 2} />
              <span className="text-[10px]">{label}</span>
            </motion.button>
          );
        })}
      </div>
    </nav>
  );
};

export default BottomNav;
