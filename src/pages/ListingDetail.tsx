import { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { ArrowLeft, Share2, MessageCircle, MapPin, Calendar, Eye, Edit2, Settings, ThumbsUp, ThumbsDown, Trash2, Send } from 'lucide-react';
import { MOCK_LISTINGS } from '@/lib/mock-data';
import { getDistance } from '@/lib/distance';
import { useAppStore } from '@/store/app-store';

const ListingDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user, userLat, userLng, hasLocation, userListings } = useAppStore();
  const listing = [...userListings, ...MOCK_LISTINGS].find((l) => l.id === id);

  const [likes, setLikes] = useState(124);
  const [dislikes, setDislikes] = useState(12);
  const [userVote, setUserVote] = useState<'up' | 'down' | null>(null);

  const [comments, setComments] = useState([
    { id: '1', user: 'Rohan Sharma', text: 'Great service! Highly recommended.', time: '2 days ago', email: 'mock1@example.com' },
    { id: '2', user: 'Priya Patel', text: 'Very professional and quick response.', time: '1 week ago', email: 'mock2@example.com' }
  ]);
  const [newComment, setNewComment] = useState('');
  
  const handleVote = (type: 'up' | 'down') => {
    if (userVote === type) {
      setUserVote(null);
      if (type === 'up') setLikes(prev => prev - 1);
      else setDislikes(prev => prev - 1);
    } else {
      if (userVote === 'up') setLikes(prev => prev - 1);
      if (userVote === 'down') setDislikes(prev => prev - 1);
      
      setUserVote(type);
      if (type === 'up') setLikes(prev => prev + 1);
      else setDislikes(prev => prev + 1);
    }
  };

  const handleAddComment = () => {
    if (!newComment.trim()) return;
    setComments([
      {
        id: Date.now().toString(),
        user: user?.email ? user.email.split('@')[0] : 'Guest User',
        email: user?.email || '',
        text: newComment.trim(),
        time: 'Just now'
      },
      ...comments
    ]);
    setNewComment('');
  };

  const handleDeleteComment = (commentId: string) => {
    setComments(comments.filter(c => c.id !== commentId));
  };

  // Check if current logged-in user owns this listing
  const isOwner = user?.email && listing?.user_id && user.email === listing.user_id;

  if (!listing) {
    return (
      <div className="max-w-3xl mx-auto px-4 pt-20 text-center">
        <p className="text-muted-foreground">Listing not found.</p>
        <button onClick={() => navigate('/home')} className="text-primary font-medium mt-2">
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

          {/* Actions */}
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
                className="flex items-center justify-center gap-2 w-full py-3 bg-gradient-to-r from-[#833ab4] via-[#fd1d1d] to-[#fcb045] text-white font-semibold rounded-xl text-sm"
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

            {isOwner && (
              <div className="mt-4 pt-4 border-t border-border flex flex-col gap-2">
                <div className="p-3 bg-primary/10 rounded-xl border border-primary/20 text-center mb-2">
                  <p className="text-sm font-semibold text-primary">This is your business listing</p>
                  <p className="text-xs text-primary/70 mt-0.5">You are seeing it exactly as customers do.</p>
                </div>
                <motion.button
                  whileTap={{ scale: 0.96 }}
                  onClick={() => navigate(`/edit-listing/${listing.id}`)}
                  className="flex items-center justify-center gap-2 w-full py-3 bg-primary text-primary-foreground font-semibold rounded-xl text-sm"
                >
                  <Edit2 className="w-5 h-5" />
                  Edit Details
                </motion.button>
                <motion.button
                  whileTap={{ scale: 0.96 }}
                  onClick={() => navigate('/profile')}
                  className="flex items-center justify-center gap-2 w-full py-3 bg-muted text-foreground font-semibold rounded-xl text-sm hover:bg-muted/80"
                >
                  <Settings className="w-5 h-5" />
                  Manage Business
                </motion.button>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Comments & Reactions Section */}
      <div className="mt-12 md:mt-16 border-t border-border pt-8 mb-8">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8">
          <h2 className="text-xl md:text-2xl font-semibold text-foreground">Community Feedback</h2>
          
          <div className="flex items-center gap-3 backdrop-blur-md bg-muted/50 p-1.5 rounded-full border border-border/50">
            <button 
              onClick={() => handleVote('up')}
              className={`flex items-center gap-2 px-4 py-2 rounded-full text-sm font-medium transition-colors ${
                userVote === 'up' ? 'bg-primary text-primary-foreground' : 'hover:bg-background text-muted-foreground'
              }`}
            >
              <ThumbsUp className={`w-4 h-4 ${userVote === 'up' ? 'fill-current' : ''}`} />
              {likes}
            </button>
            <div className="w-px h-4 bg-border"></div>
            <button 
              onClick={() => handleVote('down')}
              className={`flex items-center gap-2 px-4 py-2 rounded-full text-sm font-medium transition-colors ${
                userVote === 'down' ? 'bg-destructive/10 text-destructive' : 'hover:bg-background text-muted-foreground'
              }`}
            >
              <ThumbsDown className={`w-4 h-4 ${userVote === 'down' ? 'fill-current' : ''}`} />
              {dislikes}
            </button>
          </div>
        </div>

        {/* Add Comment */}
        <div className="flex gap-3 mb-8">
          <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center shrink-0">
            <span className="text-primary font-semibold text-sm">
              {user?.email ? user.email[0].toUpperCase() : 'G'}
            </span>
          </div>
          <div className="flex-1 relative">
            <input
              type="text"
              value={newComment}
              onChange={(e) => setNewComment(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && handleAddComment()}
              placeholder="Add a public comment..."
              className="w-full bg-muted/50 border border-border rounded-xl px-4 py-3 pr-12 text-sm focus:outline-none focus:ring-2 focus:ring-primary/20 transition-all"
            />
            <button
              onClick={handleAddComment}
              disabled={!newComment.trim()}
              className="absolute right-2 top-1/2 -translate-y-1/2 w-8 h-8 flex items-center justify-center text-primary disabled:opacity-50 disabled:cursor-not-allowed hover:bg-primary/10 rounded-lg transition-colors"
            >
              <Send className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Comments List */}
        <div className="space-y-6">
          {comments.map((comment) => (
            <div key={comment.id} className="flex gap-3 group">
              <div className="w-10 h-10 rounded-full bg-secondary/10 flex items-center justify-center shrink-0">
                <span className="text-secondary font-semibold text-sm">
                  {comment.user[0].toUpperCase()}
                </span>
              </div>
              <div className="flex-1">
                <div className="flex items-center gap-2 mb-1">
                  <span className="font-semibold text-sm text-foreground">{comment.user}</span>
                  <span className="text-xs text-muted-foreground">{comment.time}</span>
                </div>
                <p className="text-sm text-foreground/90">{comment.text}</p>
              </div>
              {comment.email === user?.email && (
                <button
                  onClick={() => handleDeleteComment(comment.id)}
                  className="opacity-0 group-hover:opacity-100 p-2 text-muted-foreground hover:text-destructive transition-all"
                  title="Delete comment"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              )}
            </div>
          ))}
          {comments.length === 0 && (
            <div className="text-center py-8 text-muted-foreground text-sm">
              No comments yet. Be the first to share your thoughts!
            </div>
          )}
        </div>
      </div>
    </motion.div>
  );
};

export default ListingDetail;
