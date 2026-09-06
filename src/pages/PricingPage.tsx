import { motion } from 'framer-motion';
import { ArrowLeft, Check, Zap, Crown, Users } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useState } from 'react';

const FREELANCER_FEATURES = [
  'Public skill profile on Aaspass',
  'WhatsApp & LinkedIn integration',
  'Distance-based client discovery',
  'Searchable by skill & category',
  'Shareable profile URL',
  'Solo or Team listing',
];

const CLIENT_FEATURES = [
  'Post unlimited project listings',
  'Discover nearby freelancers',
  'Filter by skill, distance & team type',
  'Direct WhatsApp/LinkedIn contact',
  'Project detail & review system',
  'Priority placement in search',
];

const PricingPage = () => {
  const navigate = useNavigate();
  const [isYearly, setIsYearly] = useState(false);
  const [activeTab, setActiveTab] = useState<'freelancer' | 'client'>('freelancer');

  const features = activeTab === 'freelancer' ? FREELANCER_FEATURES : CLIENT_FEATURES;

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
        <p className="text-sm text-muted-foreground mt-1">Simple, transparent pricing for freelancers &amp; clients</p>
      </motion.div>

      {/* Hero Section */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1 }}
        className="text-center py-10"
      >
        <h2 className="text-3xl md:text-4xl font-bold text-foreground mb-4">
          Get Visible. Get Hired.
        </h2>
        <p className="text-lg text-muted-foreground max-w-2xl mx-auto leading-relaxed mb-8">
          One simple plan for freelancers and clients. No hidden fees, no commissions.
        </p>

        {/* Role tab */}
        <div className="flex gap-1 p-1 bg-muted rounded-xl w-max mx-auto mb-8">
          <button
            onClick={() => setActiveTab('freelancer')}
            className={`px-6 py-2 rounded-lg text-sm font-semibold transition-all ${activeTab === 'freelancer' ? 'bg-background shadow text-foreground' : 'text-muted-foreground'}`}
          >
            Freelancer
          </button>
          <button
            onClick={() => setActiveTab('client')}
            className={`px-6 py-2 rounded-lg text-sm font-semibold transition-all ${activeTab === 'client' ? 'bg-background shadow text-foreground' : 'text-muted-foreground'}`}
          >
            Client
          </button>
        </div>

        {/* Year Toggle */}
        <div className="flex items-center justify-center gap-4 mb-12">
          <span className={`text-sm font-medium ${!isYearly ? 'text-foreground' : 'text-muted-foreground'}`}>Monthly</span>
          <button
            onClick={() => setIsYearly(!isYearly)}
            className="relative w-14 h-7 bg-muted rounded-full transition-colors"
          >
            <div className={`absolute top-1 w-5 h-5 bg-primary rounded-full transition-transform ${isYearly ? 'translate-x-7' : 'translate-x-1'}`} />
          </button>
          <span className={`text-sm font-medium ${isYearly ? 'text-foreground' : 'text-muted-foreground'}`}>
            Yearly <span className="text-green-500 font-bold ml-1">-20%</span>
          </span>
        </div>
      </motion.div>

      {/* Pricing Card */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2 }}
        className="max-w-md mx-auto"
      >
        <div className="bg-card rounded-2xl p-8 shadow-card border border-border/50">
          <div className="text-center mb-6">
            <div className="w-16 h-16 bg-primary/20 rounded-full flex items-center justify-center mx-auto mb-4">
              {activeTab === 'freelancer' ? <Zap className="w-8 h-8 text-primary" /> : <Users className="w-8 h-8 text-primary" />}
            </div>
            <h3 className="text-2xl font-bold text-foreground mb-2">
              {activeTab === 'freelancer' ? 'Freelancer' : 'Client'} ({isYearly ? 'Annual' : 'Monthly'})
            </h3>
            <div className="text-4xl font-bold text-foreground mb-1">
              ₹{isYearly ? (activeTab === 'freelancer' ? '1,200' : '2,000') : (activeTab === 'freelancer' ? '100' : '200')}
            </div>
            <p className="text-muted-foreground">
              {isYearly ? 'per year' : 'per month'}
            </p>
            {isYearly && (
              <p className="text-green-500 text-sm font-medium mt-1">
                Save ₹{activeTab === 'freelancer' ? '400' : '400'} compared to monthly
              </p>
            )}
          </div>

          <ul className="space-y-3 mb-8">
            {features.map((feature) => (
              <li key={feature} className="flex items-center gap-3 text-sm">
                <Check className="w-5 h-5 text-green-500 flex-shrink-0" />
                <span>{feature}</span>
              </li>
            ))}
          </ul>

          <motion.button
            whileTap={{ scale: 0.96 }}
            onClick={() => navigate('/auth')}
            className="w-full py-3 rounded-xl bg-primary text-primary-foreground font-semibold hover:bg-primary/90 transition-colors"
          >
            {activeTab === 'freelancer' ? 'Start Freelancing' : 'Post Your Project'}
          </motion.button>
        </div>
      </motion.div>

      {/* Free trial note */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.4 }}
        className="text-center mt-8 text-sm text-muted-foreground"
      >
        <Crown className="w-4 h-4 inline mr-1 text-amber-500" />
        New users get a <strong>7-day free trial</strong> with no credit card required.
      </motion.div>
    </div>
  );
};

export default PricingPage;
