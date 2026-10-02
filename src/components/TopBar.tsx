import { useAppStore } from '@/store/app-store';
import { useLocation, useNavigate } from 'react-router-dom';
import { Briefcase, FolderKanban, Plus, User, Inbox } from 'lucide-react';
import { useQuery } from '@tanstack/react-query';
import { getProjectRequestsForOwner } from '@/lib/api/requests';
import aplgLogo from '/aplg.png';
import { motion } from 'framer-motion';

const TopBar = () => {
  const { user } = useAppStore();
  const location = useLocation();
  const navigate = useNavigate();

  const isHidden = location.pathname === '/' || location.pathname === '/auth' || location.pathname === '/forgot-password';
  const isOwner = user?.role === 'project_owner';

  // If project owner, fetch pending requests for badge indicator (must be called before any early return)
  const { data: ownerRequests = [] } = useQuery({
    queryKey: ['owner-requests', user?.id],
    queryFn: () => getProjectRequestsForOwner(),
    enabled: !!user && isOwner && !isHidden,
  });

  // Hide top bar on landing and auth pages (placed AFTER all hooks to adhere to React Rules of Hooks)
  if (isHidden) return null;

  const pendingCount = ownerRequests.filter(r => r.status === 'pending').length;

  return (
    <header className="sticky top-0 z-40 bg-background/85 backdrop-blur-xl border-b border-border/60">
      <div className="w-full max-w-[1720px] mx-auto flex items-center justify-between h-14 px-4 sm:px-6 md:px-8 xl:px-12">
        {/* Logo */}
        <div
          className="flex items-center gap-2 cursor-pointer"
          onClick={() => navigate('/home')}
        >
          <img src={aplgLogo} alt="Spotgig logo" className="w-auto h-8 object-contain transform scale-110" />
        </div>

        {/* Desktop nav links */}
        <nav className="hidden md:flex items-center gap-1.5">
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
          {/* Post a Project button (for owners or guests, hidden on explore page) */}
          {(!user || isOwner) && location.pathname !== '/home' && location.pathname !== '/projects' && (
            <motion.button
              whileTap={{ scale: 0.95 }}
              onClick={() => navigate('/post-project')}
              className="hidden sm:inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl bg-primary text-primary-foreground text-xs font-semibold hover:bg-primary/90 shadow-sm transition"
            >
              <Plus className="w-3.5 h-3.5" />
              Post a Project
            </motion.button>
          )}

          {!user && (
            <motion.button
              whileTap={{ scale: 0.95 }}
              onClick={() => navigate('/auth')}
              className="h-9 px-4 rounded-xl border border-border/80 bg-muted/60 hover:bg-muted text-xs sm:text-sm font-semibold text-foreground transition-colors flex items-center justify-center shadow-xs"
            >
              Sign In
            </motion.button>
          )}
        </div>
      </div>
    </header>
  );
};

export default TopBar;
