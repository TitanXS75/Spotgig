import { useParams, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { ArrowLeft, Share2, MessageCircle, MapPin, Calendar, Eye } from 'lucide-react';
import { MOCK_LISTINGS } from '@/lib/mock-data';
import { getDistance } from '@/lib/distance';
import { useAppStore } from '@/store/app-store';

const ListingDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { userLat, userLng, hasLocation } = useAppStore();
  const listing = MOCK_LISTINGS.find((l) => l.id === id);

  if (!listing) {
    return (
      <div className="max-w-3xl mx-auto px-4 pt-20 text-center">
        <p className="text-muted-foreground">Listing not found.</p>
        <button onClick={() => navigate('/')} className="text-primary font-medium mt-2">
          Go home
        </button>
      </div>
    );
  }

  const distance = hasLocation ? getDistance(userLat, userLng, listing.lat, listing.lng) : null;
  const isProduct = listing.type === 'product';

  const handleShare = async () => {
    const url = window.location.href;
    if (navigator.share) {
      await navigator.share({ title: listing.name, text: listing.description, url });
    } else {
      await navigator.clipboard.writeText(url);
    }
  };

  const whatsappUrl = listing.whatsapp
    ? `https://wa.me/${listing.whatsapp}?text=${encodeURIComponent(
        `Hi! I found you on Aaspass. I'm interested in ${listing.name}.`
      )}`
    : null;

  const instagramUrl = listing.instagram
    ? `https://instagram.com/${listing.instagram}`
    : null;

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      className="max-w-5xl mx-auto px-4 md:px-6 pb-24 md:pb-10"
    >
      {/* Back button */}
      <button
        onClick={() => navigate(-1)}
        className="flex items-center gap-1.5 text-sm text-muted-foreground mt-4 mb-4 hover:text-foreground transition-colors"
      >
        <ArrowLeft className="w-4 h-4" /> Back
      </button>

      {/* Desktop: side-by-side | Mobile: stacked */}
      <div className="md:grid md:grid-cols-[minmax(0,1.2fr)_minmax(0,1fr)] md:gap-8 lg:gap-12">

        {/* Left — Image */}
        <div className={`relative rounded-2xl overflow-hidden aspect-square md:aspect-auto md:min-h-[400px] flex items-center justify-center text-8xl ${
          isProduct ? 'bg-secondary/10' : 'bg-accent-service/10'
        }`}>
          {listing.image_url ? (
            <img src={listing.image_url} className="object-cover w-full h-full" alt={listing.name} />
          ) : (
            <span className="select-none">{listing.emoji}</span>
          )}
          <button
            onClick={handleShare}
            className="absolute top-4 right-4 w-10 h-10 rounded-xl bg-background/80 backdrop-blur-sm flex items-center justify-center"
          >
            <Share2 className="w-5 h-5 text-foreground" />
          </button>
        </div>

        {/* Right — Content */}
        <div className="pt-4 md:pt-0 flex flex-col">
          <div className="flex items-center gap-2 mb-2">
            <span className={`text-[10px] uppercase tracking-wider font-bold px-1.5 py-0.5 rounded ${
              isProduct
                ? 'text-secondary bg-secondary/10'
                : 'text-accent-service bg-accent-service/10'
            }`}>
              {listing.type}
            </span>
            <span className="text-meta text-muted-foreground">{listing.category}</span>
          </div>

          <h1 className="text-2xl md:text-3xl font-semibold tracking-tight text-foreground">
            {listing.name}
          </h1>

          <div className="flex flex-wrap items-center gap-3 mt-2 text-meta text-muted-foreground">
            <span>{listing.seller_name}</span>
            <span className="flex items-center gap-1">
              <MapPin className="w-3 h-3" />
              {listing.area} · {listing.operating_type === 'home' ? 'Home' : 'Shop'}
            </span>
            <span className="tabular-nums font-medium">{distance === null ? '—' : `${distance} km`}</span>
          </div>

          <div className="flex items-center gap-3 mt-2 text-meta text-muted-foreground">
            <span className="flex items-center gap-1">
              <Calendar className="w-3 h-3" />
              Joined {new Date(listing.created_at).toLocaleDateString('en-IN', { month: 'short', year: 'numeric' })}
            </span>
            <span className="flex items-center gap-1">
              <Eye className="w-3 h-3" />
              {listing.views} views
            </span>
          </div>

          <p className="text-body text-foreground mt-4 leading-relaxed">
            {listing.description}
          </p>

          <div className="flex flex-wrap gap-2 mt-3">
            {listing.tags.map((tag) => (
              <span key={tag} className="text-meta text-muted-foreground bg-muted px-2 py-1 rounded-lg">
                {tag}
              </span>
            ))}
          </div>

          {/* Contact buttons */}
          <div className="mt-6 flex flex-col gap-2 md:mt-auto md:pt-6">
            {whatsappUrl && (
              <motion.a
                whileTap={{ scale: 0.96 }}
                href={whatsappUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center justify-center gap-2 w-full py-3 bg-primary text-primary-foreground font-semibold rounded-xl text-sm"
              >
                <MessageCircle className="w-5 h-5" />
                Message on WhatsApp
              </motion.a>
            )}
            {instagramUrl && (
              <motion.a
                whileTap={{ scale: 0.96 }}
                href={instagramUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center justify-center gap-2 w-full py-3 bg-foreground text-background font-semibold rounded-xl text-sm"
              >
                <svg className="w-5 h-5" viewBox="0 0 24 24" fill="currentColor">
                  <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zM12 0C8.741 0 8.333.014 7.053.072 2.695.272.273 2.69.073 7.052.014 8.333 0 8.741 0 12c0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98C8.333 23.986 8.741 24 12 24c3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98C15.668.014 15.259 0 12 0zm0 5.838a6.162 6.162 0 100 12.324 6.162 6.162 0 000-12.324zM12 16a4 4 0 110-8 4 4 0 010 8zm6.406-11.845a1.44 1.44 0 100 2.881 1.44 1.44 0 000-2.881z"/>
                </svg>
                View on Instagram
              </motion.a>
            )}
            {!whatsappUrl && !instagramUrl && (
              <p className="text-sm text-muted-foreground text-center py-3">
                Contact info not available
              </p>
            )}
          </div>
        </div>
      </div>
    </motion.div>
  );
};

export default ListingDetail;
