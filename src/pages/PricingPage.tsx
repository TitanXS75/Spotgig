import { motion } from 'framer-motion';
import { ArrowLeft, Check, Zap, Crown } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useState } from 'react';

const PricingPage = () => {
  const navigate = useNavigate();
  const [isYearly, setIsYearly] = useState(false);

  return (
    <div className="max-w-4xl mx-auto px-4 md:px-6 pb-24 md:pb-10">
      {/* Header */}
      <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="pt-4 pb-2">
        <div className="flex justify-start">
          <button onClick={() => navigate(-1)} className="flex items-center gap-1 text-sm text-muted-foreground mb-3 hover:text-foreground transition-colors">
            <ArrowLeft className="w-4 h-4" /> Back
          </button>
        </div>
        <h1 className="text-subhead text-foreground">Pricing Plans</h1>
        <p className="text-sm text-muted-foreground mt-1">Simple, transparent pricing for sellers</p>
      </motion.div>

      {/* Hero Section */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1 }}
        className="text-center py-12"
      >
        <h2 className="text-3xl md:text-4xl font-bold text-foreground mb-4">
          Start Selling Today
        </h2>
        <p className="text-lg text-muted-foreground max-w-2xl mx-auto leading-relaxed mb-8">
          Choose the plan that works best for your business. No hidden fees, no commissions.
        </p>

        {/* Year Toggle */}
        <div className="flex items-center justify-center gap-4 mb-12">
          <span className={`text-sm font-medium ${!isYearly ? 'text-foreground' : 'text-muted-foreground'}`}>Monthly</span>
          <button
            onClick={() => setIsYearly(!isYearly)}
            className="relative w-14 h-7 bg-muted rounded-full transition-colors"
          >
            <div className={`absolute top-1 w-5 h-5 bg-primary rounded-full transition-transform ${isYearly ? 'translate-x-7' : 'translate-x-1'}`} />
          </button>
          <span className={`text-sm font-medium ${isYearly ? 'text-foreground' : 'text-muted-foreground'}`}>Yearly</span>
        </div>
      </motion.div>

      {/* Pricing Cards */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2 }}
        className="max-w-md mx-auto"
      >
        <div className="bg-card rounded-2xl p-8 shadow-card border border-border/50">
          <div className="text-center mb-6">
            <div className="w-16 h-16 bg-primary/20 rounded-full flex items-center justify-center mx-auto mb-4">
              <Zap className="w-8 h-8 text-primary" />
            </div>
            <h3 className="text-2xl font-bold text-foreground mb-2">
              {isYearly ? 'Annual Plan' : 'Monthly Plan'}
            </h3>
            <div className="text-4xl font-bold text-foreground mb-1">
              ₹{isYearly ? '1,200' : '100'}
            </div>
            <p className="text-muted-foreground">
              {isYearly ? 'per year' : 'per month'}
            </p>
          </div>

          <ul className="space-y-3 mb-8">
            <li className="flex items-center gap-3 text-sm">
              <Check className="w-5 h-5 text-green-500 flex-shrink-0" />
              <span>Public listing on Aaspass</span>
            </li>
            <li className="flex items-center gap-3 text-sm">
              <Check className="w-5 h-5 text-green-500 flex-shrink-0" />
              <span>WhatsApp & Instagram integration</span>
            </li>
            <li className="flex items-center gap-3 text-sm">
              <Check className="w-5 h-5 text-green-500 flex-shrink-0" />
              <span>Distance-based discovery</span>
            </li>
            <li className="flex items-center gap-3 text-sm">
              <Check className="w-5 h-5 text-green-500 flex-shrink-0" />
              <span>Searchable by keywords & category</span>
            </li>
            <li className="flex items-center gap-3 text-sm">
              <Check className="w-5 h-5 text-green-500 flex-shrink-0" />
              <span>Shareable listing URL</span>
            </li>
          </ul>

          <motion.button
            whileTap={{ scale: 0.96 }}
            onClick={() => navigate('/profile')}
            className="w-full py-3 rounded-xl bg-primary text-primary-foreground font-semibold hover:bg-primary/90 transition-colors"
          >
            Register Business
          </motion.button>
        </div>
      </motion.div>
    </div>
  );
};

export default PricingPage;
