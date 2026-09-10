import { useAppStore } from '@/store/app-store';
import { useLocation, useNavigate } from 'react-router-dom';
import { Briefcase, FolderKanban, Plus, User, Search, LogIn, Inbox } from 'lucide-react';
import { useQuery } from '@tanstack/react-query';
import { getProjectRequestsForOwner } from '@/lib/api/requests';
import aplgLogo from '/aplg.png';
import { motion } from 'framer-motion';
import ThemeToggle from './ThemeToggle';

const TopBar = () => {
  const { user } = useAppStore();
  const location = useLocation();
  const navigate = useNavigate();

  // Hide top bar on landing and auth pages
  if (location.pathname === '/' || location.pathname === '/auth' || location.pathname === '/forgot-password') return null;

  const isOwner = user?.role === 'project_owner';

  // If project owner, fetch pending requests for badge indicator
  const { data: ownerRequests = [] } = useQuery({
    queryKey: ['owner-requests', user?.id],
    queryFn: () => getProjectRequestsForOwner(),
    enabled: !!user && isOwner,
  });

  const pendingCount = ownerRequests.filter(r => r.status === 'pending').length;

  return (
    <header className="sticky top-0 z-40 bg-background/85 backdrop-blur-xl border-b border-border/60">
      <div className="max-w-7xl mx-auto flex items-center justify-between h-14 px-4 md:px-6">
        {/* Logo */}
        <div
          className="flex items-center gap-2 cursor-pointer"
          onClick={() => navigate('/home')}
        >
          <img src={aplgLogo} alt="Aaspass logo" className="w-auto h-8 object-contain transform scale-110" />
        </div>

        {/* Desktop nav links */}
        <nav className="hidden md:flex items-center gap-1.5">
          <motion.button
            whileTap={{ scale: 0.96 }}
            onClick={() => navigate('/home')}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-sm font-medium transition-colors ${
              location.pathname === '/home' || location.pathname === '/projects'
                ? 'text-primary bg-primary/10'
                : 'text-muted-foreground hover:text-foreground hover:bg-muted/60'
            }`}
          >
            <Search className="w-4 h-4" />
            Find Projects
          </motion.button>

          {isOwner ? (
            <>
              <motion.button
                whileTap={{ scale: 0.96 }}
                onClick={() => navigate('/my-projects')}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-sm font-medium transition-colors ${
                  location.pathname === '/my-projects'
                    ? 'text-primary bg-primary/10'
                    : 'text-muted-foreground hover:text-foreground hover:bg-muted/60'
                }`}
              >
                <FolderKanban className="w-4 h-4" />
                My Projects
              </motion.button>

              <motion.button
                whileTap={{ scale: 0.96 }}
                onClick={() => navigate('/requests')}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-sm font-medium transition-colors ${
                  location.pathname === '/requests'
                    ? 'text-primary bg-primary/10'
                    : 'text-muted-foreground hover:text-foreground hover:bg-muted/60'
                }`}
              >
                <Inbox className="w-4 h-4" />
                Requests
                {pendingCount > 0 && (
                  <span className="ml-0.5 px-1.5 py-0.2 rounded-full bg-primary text-primary-foreground text-[10px] font-bold">
                    {pendingCount}
                  </span>
                )}
              </motion.button>
            </>
          ) : (
            <>
              {user && (
                <motion.button
                  whileTap={{ scale: 0.96 }}
                  onClick={() => navigate('/my-requests')}
                  className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-sm font-medium transition-colors ${
                    location.pathname === '/my-requests'
                      ? 'text-primary bg-primary/10'
                      : 'text-muted-foreground hover:text-foreground hover:bg-muted/60'
                  }`}
                >
                  <Inbox className="w-4 h-4" />
                  My Requests
                </motion.button>
              )}
            </>
          )}

          {user && (
            <motion.button
              whileTap={{ scale: 0.96 }}
              onClick={() => navigate('/profile')}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-sm font-medium transition-colors ${
                location.pathname === '/profile'
                  ? 'text-primary bg-primary/10'
                  : 'text-muted-foreground hover:text-foreground hover:bg-muted/60'
              }`}
            >
              <User className="w-4 h-4" />
              Profile
            </motion.button>
          )}
        </nav>

        {/* Right actions */}
        <div className="flex items-center gap-2.5">
          <ThemeToggle />

          {/* Post a Project button (for owners or guests) */}
          {(!user || isOwner) && (
            <motion.button
              whileTap={{ scale: 0.95 }}
              onClick={() => navigate('/post-project')}
              className="hidden sm:inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-full bg-primary text-primary-foreground text-xs font-semibold hover:bg-primary/90 shadow-sm transition"
            >
              <Plus className="w-3.5 h-3.5" />
              Post a Project
            </motion.button>
          )}

          {!user && (
            <motion.button
              whileTap={{ scale: 0.95 }}
              onClick={() => navigate('/auth')}
              className="inline-flex items-center gap-1 px-3 py-1.5 rounded-full border border-border text-xs font-medium hover:bg-muted transition"
            >
              <LogIn className="w-3.5 h-3.5" />
              Sign In
            </motion.button>
          )}
        </div>
      </div>
    </header>
  );
};

export default TopBar;
