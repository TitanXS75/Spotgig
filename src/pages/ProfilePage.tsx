import { motion } from 'framer-motion';
import { ArrowRight } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

const ProfilePage = () => {
  const navigate = useNavigate();
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

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1 }}
        className="bg-primary/5 rounded-2xl p-5"
      >
        <h3 className="font-semibold text-foreground">Become a seller</h3>
        <p className="text-sm text-muted-foreground mt-1">
          List your business for just ₹100/month. Go yearly at ₹1,200 and stay live all year!
        </p>
        <motion.button
          whileTap={{ scale: 0.96 }}
          onClick={() => navigate('/seller/onboarding')}
          className="mt-3 inline-flex items-center gap-2 text-sm font-semibold text-primary"
        >
          Get Started <ArrowRight className="w-4 h-4" />
        </motion.button>
      </motion.div>
    </div>
  );
};

export default ProfilePage;
