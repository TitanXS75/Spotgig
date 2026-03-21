import { motion } from 'framer-motion';
import { MessageCircle } from 'lucide-react';
import { HeartIcon } from '@/components/ui/animated-state-icons';
import { useNavigate } from 'react-router-dom';
import type { Listing } from '@/lib/mock-data';
import { getDistance } from '@/lib/distance';
import { useAppStore } from '@/store/app-store';

interface ListingCardProps {
  listing: Listing;
}

const ListingCard = ({ listing }: ListingCardProps) => {
  const navigate = useNavigate();
  const { userLat, userLng, hasLocation, toggleFavorite, isFavorited } = useAppStore();
  const distance = hasLocation ? getDistance(userLat, userLng, listing.lat, listing.lng) : null;
  const isProduct = listing.type === 'product';
  const favorited = isFavorited(listing.id);

  return (
    <motion.div
      whileHover={{ y: -4 }}
      whileTap={{ scale: 0.98 }}
      transition={{ type: 'spring', stiffness: 400, damping: 25 }}
      onClick={() => navigate(`/listing/${listing.id}`)}
      className="relative flex flex-col bg-card rounded-2xl shadow-card overflow-hidden cursor-pointer hover:shadow-card-hover transition-shadow duration-200"
    >
      <div className={`aspect-square flex items-center justify-center text-5xl ${
        isProduct ? 'bg-secondary/10' : 'bg-accent-service/10'
      }`}>
        {listing.image_url ? (
          <img src={listing.image_url} className="object-cover w-full h-full" alt={listing.name} />
        ) : (
          <span className="select-none">{listing.emoji}</span>
        )}
      </div>

      {/* Favorite button */}
      <div
        className="absolute top-2 right-2 w-8 h-8 flex items-center justify-center rounded-full bg-background/80 backdrop-blur-sm shadow-sm"
        onClick={(e) => {
          e.stopPropagation();
          toggleFavorite(listing.id);
        }}
        title={favorited ? 'Remove from favorites' : 'Save'}
      >
        <HeartIcon size={20} active={favorited} />
      </div>

      <div className="p-3 flex flex-col gap-1">
        <div className="flex justify-between items-start">
          <div className="flex gap-1.5 flex-wrap">
            <span className={`text-[10px] uppercase tracking-wider font-bold px-1.5 py-0.5 rounded ${
              listing.type === 'product'
                ? 'text-emerald-600 bg-emerald-100 dark:text-emerald-400 dark:bg-emerald-500/10'
                : 'text-purple-600 bg-purple-100 dark:text-purple-400 dark:bg-purple-500/10'
            }`}>
              {listing.type}
            </span>
            <span className={`text-[10px] uppercase tracking-wider font-bold px-1.5 py-0.5 rounded ${
              listing.operating_type === 'home'
                ? 'text-orange-600 bg-orange-100 dark:text-orange-400 dark:bg-orange-500/10'
                : 'text-blue-600 bg-blue-100 dark:text-blue-400 dark:bg-blue-500/10'
            }`}>
              {listing.operating_type}
            </span>
          </div>
          <span className="text-meta tabular-nums text-muted-foreground whitespace-nowrap ml-2">
            {distance === null ? '—' : `${distance} km`}
          </span>
        </div>
        <h3 className="font-semibold text-card-foreground leading-tight truncate text-sm">
          {listing.name}
        </h3>
        <p className="text-[11px] text-muted-foreground truncate">
          {listing.area}
        </p>
        <p className="text-xs text-muted-foreground line-clamp-2 leading-relaxed">
          {listing.description}
        </p>
        <div className="flex items-center gap-1.5 mt-1 flex-wrap">
          {listing.tags.slice(0, 3).map((tag) => (
            <span key={tag} className="text-[10px] font-medium text-muted-foreground bg-muted px-1.5 py-0.5 rounded">
              {tag}
            </span>
          ))}
        </div>
        <div className="flex items-center gap-1 mt-1 text-muted-foreground">
          {listing.whatsapp && <MessageCircle className="w-3 h-3 text-primary" />}
          {listing.instagram && (
            <svg className="w-3 h-3" viewBox="0 0 24 24" fill="currentColor">
              <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zM12 0C8.741 0 8.333.014 7.053.072 2.695.272.273 2.69.073 7.052.014 8.333 0 8.741 0 12c0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98C8.333 23.986 8.741 24 12 24c3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98C15.668.014 15.259 0 12 0zm0 5.838a6.162 6.162 0 100 12.324 6.162 6.162 0 000-12.324zM12 16a4 4 0 110-8 4 4 0 010 8zm6.406-11.845a1.44 1.44 0 100 2.881 1.44 1.44 0 000-2.881z"/>
            </svg>
          )}
        </div>
      </div>
    </motion.div>
  );
};

export default ListingCard;
