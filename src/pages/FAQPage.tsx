import { motion } from 'framer-motion';
import { ArrowLeft, HelpCircle, User, Briefcase, CreditCard, Shield, Settings, MessageCircle } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useState } from 'react';
import { faqs } from '@/lib/faq-data';

const FAQPage = () => {
  const navigate = useNavigate();
  const [activeCategory, setActiveCategory] = useState('all');

  const categories = [
    { id: 'all', name: 'All Questions', icon: HelpCircle },
    { id: 'client', name: 'For Clients', icon: Briefcase },
    { id: 'freelancer', name: 'For Freelancers', icon: User },
    { id: 'payment', name: 'Payment & Pricing', icon: CreditCard },
    { id: 'safety', name: 'Safety & Security', icon: Shield },
    { id: 'technical', name: 'Technical Support', icon: Settings },
  ];

  const filteredFAQs = activeCategory === 'all'
    ? faqs
    : faqs.filter(faq => faq.category === activeCategory);

  return (
    <div className="max-w-4xl mx-auto px-4 md:px-6 pb-24 md:pb-10">
      {/* Header */}
      <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="pt-4 pb-2">
        <div className="flex justify-start">
          <button onClick={() => navigate(-1)} className="flex items-center gap-1 text-sm text-muted-foreground mb-3 hover:text-foreground transition-colors">
            <ArrowLeft className="w-4 h-4" /> Back
          </button>
        </div>
        <h1 className="text-subhead text-foreground">Frequently Asked Questions</h1>
        <p className="text-sm text-muted-foreground mt-1">Everything you need to know about Aaspass</p>
      </motion.div>

      {/* Categories */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1 }}
        className="mb-8"
      >
        <div className="flex flex-wrap gap-2">
          {categories.map((category) => {
            const Icon = category.icon;
            return (
              <button
                key={category.id}
                onClick={() => setActiveCategory(category.id)}
                className={`flex items-center gap-2 px-4 py-2 rounded-full text-sm font-medium transition-colors ${
                  activeCategory === category.id
                    ? 'bg-primary text-primary-foreground'
                    : 'bg-muted text-foreground hover:bg-muted/80'
                }`}
              >
                <Icon className="w-4 h-4" />
                {category.name}
              </button>
            );
          })}
        </div>
      </motion.div>

      {/* FAQ Items */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2 }}
        className="space-y-4"
      >
        {filteredFAQs.map((faq, index) => (
          <motion.div
            key={faq.id}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 + index * 0.04 }}
            className="bg-card rounded-xl p-6 shadow-card"
          >
            <h3 className="font-semibold text-foreground mb-3">{faq.question}</h3>
            <p className="text-muted-foreground leading-relaxed">{faq.answer}</p>
          </motion.div>
        ))}
      </motion.div>

      {/* Still Need Help */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.5 }}
        className="mt-12 bg-primary/5 rounded-2xl p-8 text-center"
      >
        <div className="w-12 h-12 bg-primary/20 rounded-full flex items-center justify-center mx-auto mb-4">
          <MessageCircle className="w-6 h-6 text-primary" />
        </div>
        <h2 className="text-2xl font-bold text-foreground mb-3">Still Need Help?</h2>
        <p className="text-muted-foreground mb-6">
          Can't find what you're looking for? Our support team is here to help.
        </p>
        <div className="flex flex-col sm:flex-row gap-4 justify-center">
          <motion.button
            whileTap={{ scale: 0.96 }}
            onClick={() => navigate('/contact')}
            className="px-6 py-3 rounded-xl bg-primary text-primary-foreground font-semibold hover:bg-primary/90 transition-colors"
          >
            Contact Support
          </motion.button>
          <motion.button
            whileTap={{ scale: 0.96 }}
            onClick={() => window.open('mailto:support@aaspass.com')}
            className="px-6 py-3 rounded-xl bg-muted text-foreground font-semibold hover:bg-muted/80 transition-colors"
          >
            Email Us
          </motion.button>
        </div>
      </motion.div>
    </div>
  );
};

export default FAQPage;
