import { motion } from 'framer-motion';
import { MapPin } from 'lucide-react';

const MapPlaceholder = () => (
  <div className="max-w-md mx-auto px-4 pb-24">
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      className="flex flex-col items-center justify-center py-24 text-center"
    >
      <div className="w-16 h-16 rounded-2xl bg-primary/10 flex items-center justify-center mb-4">
        <MapPin className="w-8 h-8 text-primary" />
      </div>
      <h2 className="font-semibold text-foreground text-lg">Map View</h2>
      <p className="text-sm text-muted-foreground mt-1.5 max-w-[260px]">
        Interactive map with seller locations coming soon. Browse sellers on the home page for now.
      </p>
    </motion.div>
  </div>
);

export default MapPlaceholder;
