import { useLocation } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { useCopilotStore } from '@/store/copilot-store';
import { useAppStore } from '@/store/app-store';

export const CopilotFloatingButton = () => {
  const location = useLocation();
  const { user } = useAppStore();
  const { isOpen, openCopilot } = useCopilotStore();

  // Only keep on the browse page (/home or /projects)
  const isBrowsePage = location.pathname === '/home' || location.pathname === '/projects';
  if (!isBrowsePage || isOpen) {
    return null;
  }

  const contextualLabel = 'Help me find a project';
  const contextType = 'discovery';

  const handleClick = () => {
    openCopilot({
      type: contextType,
      userRole: user?.role === 'project_owner' ? 'project_owner' : 'developer',
    });
  };

  return (
    <div className="fixed bottom-20 sm:bottom-6 right-4 sm:right-6 z-40 flex items-center gap-2">
      <AnimatePresence>
        <motion.div
          initial={{ opacity: 0, scale: 0.9, y: 10 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.9, y: 10 }}
          className="flex items-center"
        >
          <button
            onClick={handleClick}
            className="group relative flex items-center gap-2 px-3.5 sm:px-4 py-2.5 rounded-full bg-gradient-to-r from-primary via-primary/95 to-primary/90 text-primary-foreground shadow-lg hover:shadow-xl hover:scale-105 active:scale-95 transition-all duration-200 border border-primary-foreground/20 backdrop-blur-md"
            title="Open Spotgig AI Copilot"
          >
            <span className="relative flex h-2 w-2">
              <span className="relative inline-flex rounded-full h-2 w-2 bg-primary-foreground" />
            </span>

            <span className="text-xs sm:text-sm font-bold tracking-tight">
              {contextualLabel}
            </span>
          </button>
        </motion.div>
      </AnimatePresence>
    </div>
  );
};
