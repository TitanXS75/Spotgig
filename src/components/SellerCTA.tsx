import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { useAppStore } from '@/store/app-store';

const SellerCTA = () => {
  const navigate = useNavigate();
  const { user } = useAppStore();

  const handleClient = () => {
    navigate(user ? '/seller/onboarding' : '/auth');
  };

  const handleFreelancer = () => {
    navigate(user ? '/seller/onboarding' : '/auth');
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      className="bg-primary/5 rounded-2xl p-5 mt-6 border border-primary/10"
    >
      <h3 className="font-semibold text-foreground text-lg leading-tight">
        Got a project? Or skills to offer? 💼
      </h3>
      <p className="text-sm text-muted-foreground mt-1.5 leading-relaxed">
        Clients — post your project and find skilled freelancers near you.<br />
        Freelancers — register your skills and start earning real money.
      </p>
      <div className="flex flex-col sm:flex-row gap-2 mt-3">
        <motion.button
          whileTap={{ scale: 0.96 }}
          onClick={handleClient}
          className="inline-flex items-center justify-center gap-2 px-4 py-2.5 bg-primary text-primary-foreground text-sm font-semibold rounded-lg"
        >
          Post a Project
        </motion.button>
        <motion.button
          whileTap={{ scale: 0.96 }}
          onClick={handleFreelancer}
          className="inline-flex items-center justify-center gap-2 px-4 py-2.5 bg-muted text-foreground text-sm font-semibold rounded-lg border border-border"
        >
          Register as Freelancer
        </motion.button>
      </div>
    </motion.div>
  );
};

export default SellerCTA;
