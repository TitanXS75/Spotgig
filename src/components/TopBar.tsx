import { MapPin } from 'lucide-react';
import { useAppStore } from '@/store/app-store';

const TopBar = () => {
  const { hasLocation } = useAppStore();

  return (
    <header className="sticky top-0 z-40 bg-background/80 backdrop-blur-xl">
      <div className="max-w-md mx-auto flex items-center justify-between h-14 px-4">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-xl bg-primary flex items-center justify-center">
            <MapPin className="w-4 h-4 text-primary-foreground" />
          </div>
          <span className="text-lg font-semibold tracking-tight text-foreground">
            Lokalink
          </span>
        </div>
        <div className="flex items-center gap-2">
          {hasLocation && (
            <span className="text-meta text-muted-foreground flex items-center gap-1">
              <span className="w-1.5 h-1.5 rounded-full bg-primary animate-pulse-dot" />
              Live
            </span>
          )}
          <button className="text-meta font-medium text-primary px-3 py-1.5 rounded-lg bg-primary/10">
            Login
          </button>
        </div>
      </div>
    </header>
  );
};

export default TopBar;
