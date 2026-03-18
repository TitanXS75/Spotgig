import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { LogOut, Edit2, X, Check } from 'lucide-react';
import { useAppStore } from '@/store/app-store';
import { useState } from 'react';

const ProfilePage = () => {
  const navigate = useNavigate();
  const { user, logout, updateUserProfile } = useAppStore();
  const [isEditing, setIsEditing] = useState(false);
  const [editData, setEditData] = useState({
    name: user?.name || '',
    phone: user?.phone || '',
    age: user?.age || null,
  });

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
            <div className="w-20 h-20 rounded-full bg-primary/20 flex items-center justify-center mb-4 text-4xl">
              👤
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
                  <label className="text-xs font-semibold text-muted-foreground uppercase">Age</label>
                  <input
                    type="number"
                    value={editData.age || ''}
                    onChange={(e) => setEditData({ ...editData, age: e.target.value ? parseInt(e.target.value) : null })}
                    className="w-full mt-1 px-3 py-2 bg-background rounded-lg text-foreground focus:outline-none focus:ring-2 focus:ring-primary/30"
                  />
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
                        age: user?.age || null,
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
                {user.age && (
                  <div>
                    <label className="text-xs font-semibold text-muted-foreground uppercase">Age</label>
                    <p className="text-foreground mt-1">{user.age} years</p>
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

          {/* Become a Seller Button */}
          <motion.button
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            whileTap={{ scale: 0.96 }}
            onClick={handleSellerClick}
            className="w-full bg-primary/5 rounded-2xl p-5 text-left hover:bg-primary/10 transition-colors"
          >
            <h3 className="font-semibold text-foreground">Become a seller</h3>
            <p className="text-sm text-muted-foreground mt-1">
              List your business for just ₹100/month. Go yearly at ₹1,200 and stay live all year!
            </p>
            <p className="mt-3 text-sm font-semibold text-primary">Get Started</p>
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
        <div className="w-16 h-16 rounded-full bg-muted flex items-center justify-center mb-4 text-3xl">
          👤
        </div>
        <h2 className="font-semibold text-foreground">Sign in to Aaspass</h2>
        <p className="text-sm text-muted-foreground mt-1 max-w-[280px]">
          Create an account to contact sellers and list your own business.
        </p>
        <div className="flex gap-2 mt-5">
          <motion.button
            whileTap={{ scale: 0.96 }}
            onClick={() => navigate('/auth')}
            className="px-5 py-2.5 bg-primary text-primary-foreground text-sm font-semibold rounded-xl"
          >
            Sign Up Free
          </motion.button>
          <motion.button
            whileTap={{ scale: 0.96 }}
            onClick={() => navigate('/auth')}
            className="px-5 py-2.5 bg-muted text-foreground text-sm font-medium rounded-xl"
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
        className="w-full bg-primary/5 rounded-2xl p-5 text-left hover:bg-primary/10 transition-colors"
      >
        <h3 className="font-semibold text-foreground">Are you a local seller?</h3>
        <p className="text-sm text-muted-foreground mt-1">
          List your business for just ₹100/month and reach customers near you. Save with ₹1,200/year plan!
        </p>
        <p className="mt-3 text-sm font-semibold text-primary">Register Now</p>
      </motion.button>
    </div>
  );
};

export default ProfilePage;
