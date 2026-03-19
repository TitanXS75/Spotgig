import { motion } from 'framer-motion';
import { ArrowLeft, HelpCircle, User, Store, CreditCard, Shield, MapPin, MessageCircle, Settings } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useState } from 'react';

const FAQPage = () => {
  const navigate = useNavigate();
  const [activeCategory, setActiveCategory] = useState('all');

  const categories = [
    { id: 'all', name: 'All Questions', icon: HelpCircle },
    { id: 'buyer', name: 'For Buyers', icon: User },
    { id: 'seller', name: 'For Sellers', icon: Store },
    { id: 'payment', name: 'Payment & Pricing', icon: CreditCard },
    { id: 'safety', name: 'Safety & Security', icon: Shield },
    { id: 'technical', name: 'Technical Support', icon: Settings }
  ];

  const faqs = [
    {
      id: 1,
      category: 'buyer',
      question: 'How do I find sellers near me?',
      answer: 'Simply enable location access when using Aaspass, and the app will automatically show sellers sorted by distance from your current location. You can also search by area name or pincode.'
    },
    {
      id: 2,
      category: 'buyer',
      question: 'How do I contact a seller?',
      answer: 'Each listing shows the seller\'s preferred contact method - usually WhatsApp or Instagram. Simply click on the contact button to reach out directly to the seller.'
    },
    {
      id: 3,
      category: 'buyer',
      question: 'Is it safe to buy from sellers on Aaspass?',
      answer: 'While we verify sellers, always exercise caution. Meet in public places, verify products before payment, and read our safety tips for more guidelines.'
    },
    {
      id: 4,
      category: 'seller',
      question: 'How do I start selling on Aaspass?',
      answer: 'Click "Become a Seller" on the homepage or visit your profile page. Complete the onboarding process, choose your plan, and create your first listing.'
    },
    {
      id: 5,
      category: 'seller',
      question: 'What documents do I need to register?',
      answer: 'You\'ll need basic information like your name, contact details, and business location. For certain categories, additional verification may be required.'
    },
    {
      id: 6,
      category: 'seller',
      question: 'How do I manage my listings?',
      answer: 'Access your seller dashboard from the profile section to add, edit, or deactivate listings, view analytics, and manage customer inquiries.'
    },
    {
      id: 7,
      category: 'payment',
      question: 'What are the subscription plans?',
      answer: 'We offer Monthly (₹100/month) and Annual (₹1,200/year) plans. The annual plan saves you 20% and includes additional features like priority support and advanced analytics.'
    },
    {
      id: 8,
      category: 'payment',
      question: 'How do I pay for my subscription?',
      answer: 'We accept UPI, credit/debit cards, and net banking. Payment is processed securely through our payment partners.'
    },
    {
      id: 9,
      category: 'payment',
      question: 'Can I get a refund?',
      answer: 'Refunds are handled on a case-by-case basis. Please contact our support team within 7 days of payment for refund requests.'
    },
    {
      id: 10,
      category: 'safety',
      question: 'How does Aaspass verify sellers?',
      answer: 'We verify seller identity through phone verification and address confirmation. Additional verification may be required for certain categories.'
    },
    {
      id: 11,
      category: 'safety',
      question: 'What should I do if I encounter a fake seller?',
      answer: 'Report the seller immediately through our app or email safety@aaspass.com. We take such reports seriously and will investigate promptly.'
    },
    {
      id: 12,
      category: 'safety',
      question: 'Is my personal information safe?',
      answer: 'Yes, we protect your data with industry-standard security measures. Your exact address is never shared publicly - only your area name is shown.'
    },
    {
      id: 13,
      category: 'technical',
      question: 'The app is not showing my location correctly',
      answer: 'Ensure location services are enabled for your browser/app. Try refreshing the page or restarting the app. If issues persist, contact support.'
    },
    {
      id: 14,
      category: 'technical',
      question: 'How do I report a technical issue?',
      answer: 'Email support@aaspass.com with details about the issue, including screenshots if possible. We typically respond within 24 hours.'
    },
    {
      id: 15,
      category: 'technical',
      question: 'Can I use Aaspass on my desktop?',
      answer: 'Yes! Aaspass works on both mobile and desktop devices. You can also install it as a PWA on your phone for app-like experience.'
    }
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
        <p className="text-sm text-muted-foreground mt-1">Find answers to common questions</p>
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
            transition={{ delay: 0.3 + index * 0.05 }}
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
