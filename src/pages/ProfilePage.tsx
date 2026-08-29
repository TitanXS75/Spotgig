import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { LogOut, Edit2, X, Check } from 'lucide-react';
import { useAppStore } from '@/store/app-store';
import { getMyListings } from '@/lib/api/listings';
import { useQuery } from '@tanstack/react-query';
import { useState } from 'react';

const ProfilePage = () => {
  const navigate = useNavigate();
  const { user, logout, updateUserProfile } = useAppStore();
  const [isEditing, setIsEditing] = useState(false);
  const [editData, setEditData] = useState({
    name: user?.name || '',
    phone: user?.phone || '',
    gender: user?.gender || null,
  });

  const { data: userListings = [] } = useQuery({
    queryKey: ['listings', 'me'],
    queryFn: getMyListings,
    enabled: !!user,
  });

  const calculateDaysRemaining = (expiryDate: string) => {
    const expiry = new Date(expiryDate);
    const today = new Date();
    const diffTime = expiry.getTime() - today.getTime();
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    return diffDays > 0 ? diffDays : 0;
  };

  const handleLogout = () => {
    logout();
  };

  const handleSaveEdit = () => {
    updateUserProfile(editData);
    setIsEditing(false);
  };

  const handleSellerClick = () => {
    if (user) {
      navigate('/seller/onboarding');
    } else {
      navigate('/auth');
    }
  };

  if (user) {
    return (
      <div className="max-w-2xl mx-auto px-4 md:px-6 pb-24 md:pb-10">
        <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="pt-4 flex items-center justify-between">
          <h1 className="text-subhead text-foreground">Profile</h1>
          <motion.button
            whileTap={{ scale: 0.96 }}
            onClick={handleLogout}
            className="flex items-center gap-2 px-4 py-2 text-sm font-medium text-destructive hover:bg-destructive/10 rounded-lg transition-colors"
          >
            <LogOut className="w-4 h-4" />
            Logout
          </motion.button>
        </motion.div>

        <div className="mt-8 space-y-6">
          {/* Avatar & Name */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="flex flex-col items-center text-center py-6"
          >
            <div className="w-28 h-28 rounded-full bg-primary/10 flex items-center justify-center mb-4 text-4xl overflow-hidden shadow-md ring-4 ring-primary/5">
              <img src="https://images.unsplash.com/photo-1472214103451-9374bd1c798e?auto=format&fit=crop&w=300&q=80" alt={user.name} className="w-full h-full object-cover" />
            </div>
            <h2 className="text-2xl font-bold text-foreground">{user.name}</h2>
            <p className="text-sm text-muted-foreground mt-1">{user.email}</p>
          </motion.div>

          {/* Profile Details */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="bg-muted/30 rounded-2xl p-6 space-y-4"
          >
            {isEditing ? (
              <>
                <div>
                  <label className="text-xs font-semibold text-muted-foreground uppercase">Full Name</label>
                  <input
                    type="text"
                    value={editData.name}
                    onChange={(e) => setEditData({ ...editData, name: e.target.value.replace(/[^a-zA-Z\s]/g, '') })}
                    className="w-full mt-1 px-3 py-2 bg-background rounded-lg text-foreground focus:outline-none focus:ring-2 focus:ring-primary/30"
                  />
                </div>
                <div>
                  <label className="text-xs font-semibold text-muted-foreground uppercase">Gender</label>
                  <select
                    value={editData.gender || ''}
                    onChange={(e) => setEditData({ ...editData, gender: (e.target.value || null) as 'male' | 'female' | 'other' | null })}
                    className="w-full mt-1 px-3 py-2 bg-background rounded-lg text-foreground focus:outline-none focus:ring-2 focus:ring-primary/30"
                  >
                    <option value="">Prefer not to say</option>
                    <option value="male">Male</option>
                    <option value="female">Female</option>
                    <option value="other">Other</option>
                  </select>
                </div>
                <div>
                  <label className="text-xs font-semibold text-muted-foreground uppercase">Phone</label>
                  <input
                    type="tel"
                    value={editData.phone || ''}
                    onChange={(e) => setEditData({ ...editData, phone: e.target.value.replace(/\D/g, '').slice(0, 10) })}
                    maxLength={10}
                    className="w-full mt-1 px-3 py-2 bg-background rounded-lg text-foreground focus:outline-none focus:ring-2 focus:ring-primary/30"
                  />
                </div>
                <div className="flex gap-2 pt-2">
                  <motion.button
                    whileTap={{ scale: 0.96 }}
                    onClick={handleSaveEdit}
                    className="flex-1 flex items-center justify-center gap-2 px-4 py-2 bg-primary text-primary-foreground rounded-lg text-sm font-semibold"
                  >
                    <Check className="w-4 h-4" />
                    Save
                  </motion.button>
                  <motion.button
                    whileTap={{ scale: 0.96 }}
                    onClick={() => {
                      setIsEditing(false);
                      setEditData({
                        name: user?.name || '',
                        phone: user?.phone || '',
                        gender: user?.gender || null,
                      });
                    }}
                    className="flex-1 flex items-center justify-center gap-2 px-4 py-2 bg-muted text-foreground rounded-lg text-sm font-semibold"
                  >
                    <X className="w-4 h-4" />
                    Cancel
                  </motion.button>
                </div>
              </>
            ) : (
              <>
                <div>
                  <label className="text-xs font-semibold text-muted-foreground uppercase">Full Name</label>
                  <p className="text-foreground mt-1">{user.name}</p>
                </div>
                {user.gender && (
                  <div>
                    <label className="text-xs font-semibold text-muted-foreground uppercase">Gender</label>
                    <p className="text-foreground mt-1 capitalize">{user.gender}</p>
                  </div>
                )}
                {user.phone && (
                  <div>
                    <label className="text-xs font-semibold text-muted-foreground uppercase">Phone</label>
                    <p className="text-foreground mt-1">{user.phone}</p>
                  </div>
                )}
                <div>
                  <label className="text-xs font-semibold text-muted-foreground uppercase">Email</label>
                  <p className="text-foreground mt-1">{user.email}</p>
                </div>
                <motion.button
                  whileTap={{ scale: 0.96 }}
                  onClick={() => setIsEditing(true)}
                  className="w-full mt-4 flex items-center justify-center gap-2 px-4 py-2 bg-muted hover:bg-muted/80 text-foreground rounded-lg text-sm font-semibold transition-colors"
                >
                  <Edit2 className="w-4 h-4" />
                  Edit Profile
                </motion.button>
              </>
            )}
          </motion.div>

          {/* User Listings Section */}
          {userListings.length > 0 && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.15 }}
              className="space-y-4"
            >
              <h3 className="font-semibold text-foreground text-lg">My Listings & Profiles</h3>
              <div className="grid gap-3">
                {userListings.map(listing => {
                    const daysRemaining = calculateDaysRemaining(listing.plan_expires_at);
                    return (
                      <div key={listing.id} className="bg-card shadow-sm border border-border rounded-xl p-4 flex flex-col gap-4">
                        <div className="flex gap-4 items-center">
                          <div className="w-16 h-16 rounded-lg bg-primary/10 flex items-center justify-center text-3xl shrink-0 overflow-hidden">
                            {listing.image_url ? <img src={listing.image_url} alt="Logo" className="w-full h-full object-cover" /> : listing.emoji}
                          </div>
                          <div className="flex-1 min-w-0">
                            <h4 className="font-semibold text-foreground truncate">{listing.name}</h4>
                            <p className="text-sm text-muted-foreground truncate">{listing.category} • {listing.area}</p>
                            <div className="flex items-center gap-2 mt-1">
                              <span className={`text-xs font-medium px-2 py-0.5 rounded-full ${
                                daysRemaining > 30 ? 'bg-green-100 text-green-700 dark:bg-green-950/40 dark:text-green-400' :
                                daysRemaining > 7 ? 'bg-yellow-100 text-yellow-700 dark:bg-yellow-950/40 dark:text-yellow-400' :
                                'bg-red-100 text-red-700 dark:bg-red-950/40 dark:text-red-400'
                              }`}>
                                {daysRemaining} days left
                              </span>
                              <span className="text-xs text-muted-foreground capitalize">
                                {listing.plan === 'free_trial' ? 'Free Trial' : listing.plan}
                              </span>
                            </div>
                          </div>
                          <button onClick={() => navigate(`/listing/${listing.slug || listing.id}`)} className="px-3 py-1.5 bg-muted hover:bg-muted/80 text-foreground text-xs font-medium rounded-lg shrink-0 transition-colors">
                            View
                          </button>
                        </div>
                        {daysRemaining === 0 && (
                          <div className="p-3 bg-red-50 dark:bg-red-900/20 rounded-lg border border-red-100 dark:border-red-900/30">
                            <p className="text-xs text-red-600 dark:text-red-400 font-medium">Your listing has expired. Renew your plan to become visible again to clients and freelancers.</p>
                          </div>
                        )}
                      </div>
                    );
                  })}
              </div>
            </motion.div>
          )}

          {/* Action Button (Add Another or Get Started) */}
          <motion.button
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            whileTap={{ scale: 0.96 }}
            onClick={handleSellerClick}
            className="w-full bg-primary/5 rounded-2xl p-5 text-left hover:bg-primary/10 transition-colors border border-primary/10"
          >
            <h3 className="font-semibold text-foreground">{userListings.length > 0 ? "Add another skill or project" : "Offer your skills / Post a project"}</h3>
            <p className="text-sm text-muted-foreground mt-1">
              List your freelance services or post a project requirement for local student talent. Start with a free trial!
            </p>
            <p className="mt-3 text-sm font-semibold text-primary">Get Started →</p>
          </motion.button>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-2xl mx-auto px-4 md:px-6 pb-24 md:pb-10">
      <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="pt-4">
        <h1 className="text-subhead text-foreground">Profile</h1>
      </motion.div>
      <div className="flex flex-col items-center py-12 text-center">
        <div className="w-24 h-24 rounded-full bg-muted flex items-center justify-center mb-4 text-3xl overflow-hidden ring-4 ring-muted/50">
          <img src="https://images.unsplash.com/photo-1441974231531-c6227db76b6e?auto=format&fit=crop&w=300&q=80" alt="Guest" className="w-full h-full object-cover" />
        </div>
        <h2 className="font-semibold text-foreground text-lg">Sign in to Aaspass</h2>
        <p className="text-sm text-muted-foreground mt-1 max-w-[320px]">
          Create an account to connect with nearby student talent, hire for projects, or offer your freelance skills.
        </p>
        <div className="flex gap-2 mt-5">
          <motion.button
            whileTap={{ scale: 0.96 }}
            onClick={() => navigate('/auth')}
            className="px-5 py-2.5 bg-primary text-primary-foreground text-sm font-semibold rounded-xl shadow-sm hover:bg-primary/90 transition-colors"
          >
            Sign Up Free
          </motion.button>
          <motion.button
            whileTap={{ scale: 0.96 }}
            onClick={() => navigate('/auth')}
            className="px-5 py-2.5 bg-muted text-foreground text-sm font-medium rounded-xl hover:bg-muted/80 transition-colors"
          >
            Login
          </motion.button>
        </div>
      </div>

      <motion.button
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1 }}
        whileTap={{ scale: 0.96 }}
        onClick={handleSellerClick}
        className="w-full bg-primary/5 rounded-2xl p-5 text-left hover:bg-primary/10 transition-colors border border-primary/10"
      >
        <h3 className="font-semibold text-foreground">Looking to hire or freelance?</h3>
        <p className="text-sm text-muted-foreground mt-1">
          Discover verified student developers, designers, and creators nearby — or list your own tech skills and earn with zero platform commission.
        </p>
        <p className="mt-3 text-sm font-semibold text-primary">Get Started Free →</p>
      </motion.button>
    </div>
  );
};

export default ProfilePage;
