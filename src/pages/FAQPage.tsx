import { motion } from 'framer-motion';
import { ArrowLeft, HelpCircle, User, Briefcase, CreditCard, Shield, Settings, MessageCircle } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useState } from 'react';

export const faqs = [
  {
    id: 1,
    category: 'client',
    question: 'How do I find freelancers near me?',
    answer: 'Enable location access and Aaspass will automatically show freelancers sorted by distance from you. You can filter by skill category, solo/team, and radius.'
  },
  {
    id: 2,
    category: 'client',
    question: 'How do I post a project?',
    answer: 'Go to your profile and click "Post a Project". Fill in project details, budget range, timeline, and required skills. Your listing goes live instantly.'
  },
  {
    id: 3,
    category: 'client',
    question: 'Can I hire a team of students?',
    answer: 'Yes! Freelancers can list themselves as "Team" — meaning they have a group ready to tackle larger projects. Simply filter by "Team" when browsing.'
  },
  {
    id: 4,
    category: 'client',
    question: 'How do I contact a freelancer?',
    answer: 'Each profile shows the freelancer\'s preferred contact method — usually WhatsApp or LinkedIn. Click the contact button to connect directly. No middleman.'
  },
  {
    id: 5,
    category: 'freelancer',
    question: 'How do I register as a freelancer?',
    answer: 'Click "Sign Up" and choose "Freelancer" as your role. Then complete the onboarding wizard to add your skills, tech stack, portfolio links, and location.'
  },
  {
    id: 6,
    category: 'freelancer',
    question: 'Can I work in a team?',
    answer: 'Absolutely. When creating your profile, select "Team" as your operating type. List your team size and the combined skills your group offers.'
  },
  {
    id: 7,
    category: 'freelancer',
    question: 'What kind of projects can I find?',
    answer: 'Web development, app development, UI/UX design, digital marketing, content writing, data analysis, video editing, and much more — posted by local businesses.'
  },
  {
    id: 8,
    category: 'freelancer',
    question: 'How do I manage my listings?',
    answer: 'Access your profile to add, edit, or deactivate listings, view views count, and manage incoming inquiries.'
  },
  {
    id: 9,
    category: 'payment',
    question: 'What are the subscription plans?',
    answer: 'Freelancers pay ₹100/month or ₹1,200/year. Clients pay ₹200/month or ₹2,000/year. All new users get a 7-day free trial — no card required.'
  },
  {
    id: 10,
    category: 'payment',
    question: 'Does Aaspass take a commission from projects?',
    answer: 'No! We charge a flat subscription fee only. There is zero commission on any project you complete. All project payments happen directly between you and the client.'
  },
  {
    id: 11,
    category: 'payment',
    question: 'Can I get a refund?',
    answer: 'Refunds are handled on a case-by-case basis. Contact our support within 7 days of payment if you have any issue.'
  },
  {
    id: 12,
    category: 'safety',
    question: 'How does Aaspass verify freelancers?',
    answer: 'We verify identity through phone number and email. Freelancers can also link their LinkedIn and GitHub profiles for additional trust signals.'
  },
  {
    id: 13,
    category: 'safety',
    question: 'What should I do before paying a freelancer?',
    answer: 'Always agree on a scope and timeline in writing (even WhatsApp). For larger projects, use milestone-based payments. Meet in a public place for in-person handoffs.'
  },
  {
    id: 14,
    category: 'safety',
    question: 'Is my personal information safe?',
    answer: 'Yes. Your exact location is never shared publicly — only your area name. Your contact details are only visible to logged-in users.'
  },
  {
    id: 15,
    category: 'technical',
    question: 'The app is not showing my location correctly',
    answer: 'Ensure location services are enabled for your browser. Try refreshing the page. If the issue persists, manually enter your area in the onboarding form.'
  },
  {
    id: 16,
    category: 'technical',
    question: 'Can I use Aaspass on desktop?',
    answer: 'Yes! Aaspass works on all devices. You can also install it as a PWA on your phone for an app-like experience — no app store needed.'
  },
];

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
