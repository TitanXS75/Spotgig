import { motion } from 'framer-motion';
import { ArrowLeft, Check, Star, Zap, Shield, Crown } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

const PricingPage = () => {
  const navigate = useNavigate();

  return (
    <div className="max-w-4xl mx-auto px-4 md:px-6 pb-24 md:pb-10">
      {/* Header */}
      <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="pt-4 pb-2">
        <button onClick={() => navigate(-1)} className="flex items-center gap-1 text-sm text-muted-foreground mb-3">
          <ArrowLeft className="w-4 h-4" /> Back
        </button>
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
        <p className="text-lg text-muted-foreground max-w-2xl mx-auto leading-relaxed">
          Choose the plan that works best for your business. No hidden fees, no commissions - just straightforward pricing.
        </p>
      </motion.div>

      {/* Pricing Cards */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2 }}
        className="grid md:grid-cols-2 gap-8 mb-12"
      >
        {/* Monthly Plan */}
        <div className="bg-card rounded-2xl p-8 shadow-card border border-border/50 hover:shadow-lg transition-shadow">
          <div className="text-center mb-6">
            <div className="w-16 h-16 bg-primary/20 rounded-full flex items-center justify-center mx-auto mb-4">
              <Zap className="w-8 h-8 text-primary" />
            </div>
            <h3 className="text-2xl font-bold text-foreground mb-2">Monthly Plan</h3>
            <div className="text-4xl font-bold text-foreground mb-1">₹100</div>
            <p className="text-muted-foreground">per month</p>
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
            <li className="flex items-center gap-3 text-sm">
              <Check className="w-5 h-5 text-green-500 flex-shrink-0" />
              <span>Basic analytics dashboard</span>
            </li>
          </ul>

          <motion.button
            whileTap={{ scale: 0.96 }}
            onClick={() => navigate('/profile')}
            className="w-full py-3 rounded-xl bg-muted text-foreground font-semibold hover:bg-muted/80 transition-colors"
          >
            Get Started
          </motion.button>
        </div>

        {/* Annual Plan */}
        <div className="bg-primary rounded-2xl p-8 shadow-card text-primary-foreground relative overflow-hidden">
          <div className="absolute top-4 right-4 bg-amber-400 text-amber-900 px-3 py-1 rounded-full text-xs font-semibold">
            BEST VALUE
          </div>
          
          <div className="text-center mb-6">
            <div className="w-16 h-16 bg-primary-foreground/20 rounded-full flex items-center justify-center mx-auto mb-4">
              <Crown className="w-8 h-8 text-primary-foreground" />
            </div>
            <h3 className="text-2xl font-bold mb-2">Annual Plan</h3>
            <div className="text-4xl font-bold mb-1">₹1,200</div>
            <p className="text-primary-foreground/80">per year</p>
            <p className="text-sm text-primary-foreground/60 mt-2">Save ₹600 (20% discount)</p>
          </div>

          <ul className="space-y-3 mb-8">
            <li className="flex items-center gap-3 text-sm">
              <Check className="w-5 h-5 text-green-300 flex-shrink-0" />
              <span>Everything in Monthly Plan</span>
            </li>
            <li className="flex items-center gap-3 text-sm">
              <Check className="w-5 h-5 text-green-300 flex-shrink-0" />
              <span>Priority customer support</span>
            </li>
            <li className="flex items-center gap-3 text-sm">
              <Check className="w-5 h-5 text-green-300 flex-shrink-0" />
              <span>Advanced analytics & insights</span>
            </li>
            <li className="flex items-center gap-3 text-sm">
              <Check className="w-5 h-5 text-green-300 flex-shrink-0" />
              <span>Promotional badge on listings</span>
            </li>
            <li className="flex items-center gap-3 text-sm">
              <Check className="w-5 h-5 text-green-300 flex-shrink-0" />
              <span>Early access to new features</span>
            </li>
            <li className="flex items-center gap-3 text-sm">
              <Check className="w-5 h-5 text-green-300 flex-shrink-0" />
              <span>Monthly performance reports</span>
            </li>
          </ul>

          <motion.button
            whileTap={{ scale: 0.96 }}
            onClick={() => navigate('/profile')}
            className="w-full py-3 rounded-xl bg-primary-foreground text-primary font-semibold hover:bg-primary-foreground/90 transition-colors"
          >
            Get Started
          </motion.button>
        </div>
      </motion.div>

      {/* Features Comparison */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.3 }}
        className="mb-12"
      >
        <h2 className="text-2xl font-bold text-foreground mb-6 text-center">Feature Comparison</h2>
        <div className="bg-card rounded-xl shadow-card overflow-hidden">
          <table className="w-full">
            <thead>
              <tr className="border-b border-border">
                <th className="text-left p-4 text-sm font-semibold text-foreground">Feature</th>
                <th className="text-center p-4 text-sm font-semibold text-foreground">Monthly</th>
                <th className="text-center p-4 text-sm font-semibold text-foreground">Annual</th>
              </tr>
            </thead>
            <tbody>
              <tr className="border-b border-border/50">
                <td className="p-4 text-sm text-muted-foreground">Listing Duration</td>
                <td className="p-4 text-center text-sm">30 days</td>
                <td className="p-4 text-center text-sm">365 days</td>
              </tr>
              <tr className="border-b border-border/50">
                <td className="p-4 text-sm text-muted-foreground">Photos per Listing</td>
                <td className="p-4 text-center text-sm">5</td>
                <td className="p-4 text-center text-sm">10</td>
              </tr>
              <tr className="border-b border-border/50">
                <td className="p-4 text-sm text-muted-foreground">Customer Support</td>
                <td className="p-4 text-center text-sm">Email</td>
                <td className="p-4 text-center text-sm">Priority</td>
              </tr>
              <tr className="border-b border-border/50">
                <td className="p-4 text-sm text-muted-foreground">Analytics</td>
                <td className="p-4 text-center text-sm">Basic</td>
                <td className="p-4 text-center text-sm">Advanced</td>
              </tr>
              <tr>
                <td className="p-4 text-sm text-muted-foreground">Promotional Tools</td>
                <td className="p-4 text-center text-sm">Standard</td>
                <td className="p-4 text-center text-sm">Enhanced</td>
              </tr>
            </tbody>
          </table>
        </div>
      </motion.div>

      {/* FAQ Section */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.4 }}
        className="mb-12"
      >
        <h2 className="text-2xl font-bold text-foreground mb-6 text-center">Frequently Asked Questions</h2>
        <div className="space-y-4">
          <div className="bg-muted/30 rounded-xl p-4">
            <h3 className="font-semibold text-foreground mb-2">Can I change my plan later?</h3>
            <p className="text-sm text-muted-foreground">
              Yes! You can upgrade or downgrade your plan at any time. Changes take effect at the next billing cycle.
            </p>
          </div>
          <div className="bg-muted/30 rounded-xl p-4">
            <h3 className="font-semibold text-foreground mb-2">Is there a free trial?</h3>
            <p className="text-sm text-muted-foreground">
              We offer a 7-day free trial for new sellers to experience all features before committing to a plan.
            </p>
          </div>
          <div className="bg-muted/30 rounded-xl p-4">
            <h3 className="font-semibold text-foreground mb-2">What payment methods do you accept?</h3>
            <p className="text-sm text-muted-foreground">
              We accept UPI, credit/debit cards, and net banking for subscription payments.
            </p>
          </div>
          <div className="bg-muted/30 rounded-xl p-4">
            <h3 className="font-semibold text-foreground mb-2">Can I cancel anytime?</h3>
            <p className="text-sm text-muted-foreground">
              Yes, you can cancel your subscription at any time. Your listing will remain active until the end of your billing period.
            </p>
          </div>
        </div>
      </motion.div>

      {/* CTA Section */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.5 }}
        className="bg-primary/5 rounded-2xl p-8 text-center"
      >
        <h2 className="text-2xl font-bold text-foreground mb-4">Ready to Start Selling?</h2>
        <p className="text-muted-foreground mb-6">
          Join thousands of local sellers reaching customers in their neighbourhood.
        </p>
        <motion.button
          whileTap={{ scale: 0.96 }}
          onClick={() => navigate('/profile')}
          className="px-8 py-3 rounded-xl bg-primary text-primary-foreground font-semibold hover:bg-primary/90 transition-colors"
        >
          Get Started Now
        </motion.button>
      </motion.div>
    </div>
  );
};

export default PricingPage;
