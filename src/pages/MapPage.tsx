import { motion } from 'framer-motion';
import { Map } from 'lucide-react';

const MapPage = () => {
  return (
    <div className="max-w-7xl mx-auto px-4 md:px-6 pb-24 md:pb-10">
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        className="pt-4 pb-5"
      >
        <h1 className="text-subhead text-foreground">Map View</h1>
        <p className="text-sm text-muted-foreground mt-1">See sellers near you on a map</p>
      </motion.div>

      <motion.div
        initial={{ opacity: 0, scale: 0.97 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ delay: 0.1 }}
        className="flex flex-col items-center justify-center gap-5 rounded-3xl border-2 border-dashed border-border bg-muted/30 py-24 text-center"
      >
        <div className="w-20 h-20 rounded-2xl bg-primary/10 flex items-center justify-center">
          <Map className="w-10 h-10 text-primary" />
        </div>
        <div>
          <h2 className="text-xl font-semibold text-foreground">Feature Coming Soon</h2>
          <p className="text-sm text-muted-foreground mt-2 max-w-xs">
            We're building an interactive map so you can see all sellers around you at a glance.
          </p>
        </div>
        <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-primary/10 text-primary text-xs font-semibold">
          <span className="w-1.5 h-1.5 rounded-full bg-primary animate-pulse" />
          In Development
        </span>
      </motion.div>
    </div>
  );
};

export default MapPage;
