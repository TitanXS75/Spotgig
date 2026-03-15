import { useAppStore } from '@/store/app-store';
import aaspassLogo from '@/assets/aaspass-logo.png';

const TopBar = () => {
  const { hasLocation } = useAppStore();

  return (
    <header className="sticky top-0 z-40 bg-background/80 backdrop-blur-xl">
      <div className="max-w-md mx-auto flex items-center justify-between h-14 px-4">
        <div className="flex items-center gap-2">
          <img src={aaspassLogo} alt="Aaspass logo" className="w-8 h-8 rounded-xl object-contain" />
          <span className="text-lg font-semibold tracking-tight text-foreground">
            Aaspass
          </span>
        </div>
        <div className="flex items-center gap-2">
          {hasLocation && (
            <span className="text-meta text-muted-foreground flex items-center gap-1">
              <span className="w-1.5 h-1.5 rounded-full bg-primary animate-pulse-dot" />
              Live
            </span>
          )}
        </div>
      </div>
    </header>
  );
};

export default TopBar;
