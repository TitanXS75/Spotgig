import { motion } from 'framer-motion';
import { MessageCircle, Globe, Users, User } from 'lucide-react';
import { HeartIcon } from '@/components/ui/animated-state-icons';
import { useNavigate } from 'react-router-dom';
import type { Database } from '@/lib/db-types';
import { getDistance } from '@/lib/distance';
import { useAppStore } from '@/store/app-store';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { getMyFavorites, toggleFavorite } from '@/lib/api/favorites';

export type DbListing = Database['public']['Tables']['listings']['Row'];

interface ListingCardProps {
  listing: DbListing;
}

// LinkedIn SVG icon
const LinkedInIcon = ({ className }: { className?: string }) => (
  <svg className={className} viewBox="0 0 24 24" fill="currentColor">
    <path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433a2.062 2.062 0 01-2.063-2.065 2.064 2.064 0 112.063 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z"/>
  </svg>
);

const ListingCard = ({ listing }: ListingCardProps) => {
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const { user, userLat, userLng, hasLocation } = useAppStore();
  const distance = hasLocation ? getDistance(userLat, userLng, listing.lat, listing.lng) : null;
  const isProject = listing.type === 'project';

  const { data: favorites = [] } = useQuery({
    queryKey: ['favorites', 'me'],
    queryFn: async () => {
      if (!user) return [];
      return getMyFavorites();
    },
    enabled: !!user,
  });

  const favorited = favorites.some((f: any) => f.id === listing.id);

  const toggleMutation = useMutation({
    mutationFn: async () => {
      if (!user) return;
      await toggleFavorite(listing.id);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['favorites', 'me'] });
    }
  });

  return (
    <motion.div
      whileHover={{ y: -4 }}
      whileTap={{ scale: 0.98 }}
      transition={{ type: 'spring', stiffness: 400, damping: 25 }}
      onClick={() => navigate(`/listing/${listing.id}`)}
      className="relative flex flex-col bg-card rounded-2xl shadow-card overflow-hidden cursor-pointer hover:shadow-card-hover transition-shadow duration-200"
    >
      <div className={`aspect-square flex items-center justify-center text-5xl ${
        isProject ? 'bg-secondary/10' : 'bg-accent-service/10'
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
          if (!user) {
            navigate('/auth');
          } else {
            toggleMutation.mutate();
          }
        }}
        title={favorited ? 'Remove from favorites' : 'Save'}
      >
        <HeartIcon size={20} active={favorited} />
      </div>

      <div className="p-3 flex flex-col gap-1">
        <div className="flex justify-between items-start">
          <div className="flex gap-1.5 flex-wrap">
            {/* Type badge: Project vs Freelancer */}
            <span className={`text-[10px] uppercase tracking-wider font-bold px-1.5 py-0.5 rounded ${
              isProject
                ? 'text-emerald-600 bg-emerald-100 dark:text-emerald-400 dark:bg-emerald-500/10'
                : 'text-purple-600 bg-purple-100 dark:text-purple-400 dark:bg-purple-500/10'
            }`}>
              {isProject ? 'Project' : 'Freelancer'}
            </span>
            {/* Operating badge: Solo vs Team */}
            <span className={`text-[10px] uppercase tracking-wider font-bold px-1.5 py-0.5 rounded ${
              listing.operating_type === 'solo'
                ? 'text-orange-600 bg-orange-100 dark:text-orange-400 dark:bg-orange-500/10'
                : 'text-blue-600 bg-blue-100 dark:text-blue-400 dark:bg-blue-500/10'
            }`}>
              {listing.operating_type === 'solo' ? (
                <span className="flex items-center gap-0.5"><User className="w-2.5 h-2.5 inline" /> Solo</span>
              ) : (
                <span className="flex items-center gap-0.5"><Users className="w-2.5 h-2.5 inline" /> Team</span>
              )}
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
          {listing.tags?.slice(0, 3).map((tag) => (
            <span key={tag} className="text-[10px] font-medium text-muted-foreground bg-muted px-1.5 py-0.5 rounded">
              {tag}
            </span>
          ))}
        </div>
        <div className="flex items-center gap-1 mt-1 text-muted-foreground">
          {listing.whatsapp && <MessageCircle className="w-3 h-3 text-primary" />}
          {(listing as any).linkedin && (
            <LinkedInIcon className="w-3 h-3 text-blue-600" />
          )}
          {listing.instagram && (
            <svg className="w-3 h-3 text-pink-500" viewBox="0 0 24 24" fill="currentColor">
              <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zM12 0C8.741 0 8.333.014 7.053.072 2.695.272.273 2.69.073 7.052.014 8.333 0 8.741 0 12c0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98C8.333 23.986 8.741 24 12 24c3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98C15.668.014 15.259 0 12 0zm0 5.838a6.162 6.162 0 100 12.324 6.162 6.162 0 000-12.324zM12 16a4 4 0 110-8 4 4 0 010 8zm6.406-11.845a1.44 1.44 0 100 2.881 1.44 1.44 0 000-2.881z"/>
            </svg>
          )}
          {listing.website && <Globe className="w-3 h-3 text-blue-500" />}
        </div>
      </div>
    </motion.div>
  );
};

export default ListingCard;
