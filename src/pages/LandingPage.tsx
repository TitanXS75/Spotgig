import { motion } from 'framer-motion';
import { ArrowRight, Store, MapPin, Smartphone, ShieldCheck, Zap, Users, TrendingUp, Star, Shield } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

const CATEGORIES = [
  { emoji: '🍱', title: 'Food & Snacks', desc: 'Homemade tiffins & bakes', color: 'bg-orange-50 dark:bg-orange-950/30' },
  { emoji: '🔧', title: 'Home Repair', desc: 'Plumbers & electricians', color: 'bg-blue-50 dark:bg-blue-950/30' },
  { emoji: '👗', title: 'Boutiques', desc: 'Custom tailored clothing', color: 'bg-pink-50 dark:bg-pink-950/30' },
  { emoji: '🧘', title: 'Fitness', desc: 'Yoga & personal trainers', color: 'bg-green-50 dark:bg-green-950/30' },
  { emoji: '📚', title: 'Tutoring', desc: 'Classes & coaching', color: 'bg-purple-50 dark:bg-purple-950/30' },
  { emoji: '💐', title: 'Art & Crafts', desc: 'Handmade creations', color: 'bg-rose-50 dark:bg-rose-950/30' },
];

const FEATURES = [
  {
    icon: MapPin,
    title: 'Hyperlocal Discovery',
    desc: 'Find exactly what you need within walking distance. Real-time distance calculations show you the nearest options.',
    color: 'text-secondary',
  },
  {
    icon: Zap,
    title: 'Instant Connection',
    desc: 'Direct WhatsApp and Instagram links for zero-friction communication. Connect with sellers immediately.',
    color: 'text-primary',
  },
  {
    icon: ShieldCheck,
    title: 'Support Local',
    desc: 'Help home-based entrepreneurs and micro-businesses in your neighbourhood grow and thrive.',
    color: 'text-green-500',
  },
  {
    icon: Smartphone,
    title: 'Mobile First',
    desc: 'Optimized for mobile devices. Browse, search, and contact sellers on the go.',
    color: 'text-blue-500',
  },
  {
    icon: Users,
    title: 'Community Driven',
    desc: 'Share your ratings to help others decide. Read what neighbourhood members think.',
    color: 'text-purple-500',
  },
  {
    icon: TrendingUp,
    title: 'Grow Your Business',
    desc: 'Easy seller onboarding. Start selling in minutes with affordable monthly plans.',
    color: 'text-amber-500',
  },
];

const HOW_IT_WORKS = [
  { step: 1, title: 'Enable Location', desc: 'Allow access to your location for accurate distance calculations.' },
  { step: 2, title: 'Browse Nearby', desc: 'See sellers sorted by distance, category, and type (product/service).' },
  { step: 3, title: 'Check Details', desc: 'View full listing, reviews, ratings, and seller information.' },
  { step: 4, title: 'Connect Now', desc: 'Message on WhatsApp or Instagram to place orders and inquire.' },
];

const TESTIMONIALS = [
  {
    name: 'Priya M.',
    role: 'Home Cook',
    text: 'Aaspass helped me reach 50+ customers in my first month. No commissions, just direct sales!',
    avatar: '👩‍🍳',
  },
  {
    name: 'Rahul K.',
    role: 'Customer',
    text: 'Found amazing homemade food 200m away from my apartment. So convenient and affordable!',
    avatar: '👨‍💼',
  },
  {
    name: 'Divya S.',
    role: 'Fashion Designer',
    text: 'The onboarding was super simple. Now I get tailoring orders from my neighbourhood regularly.',
    avatar: '👩‍🎨',
  },
];

const STATS = [
  { number: '10K+', label: 'Active Sellers', icon: Store },
  { number: '50K+', label: 'Happy Customers', icon: Users },
  { number: '8 Cities', label: 'Live & Growing', icon: MapPin },
  { number: '4.8 ⭐', label: 'Average Rating', icon: Star },
];

const LandingPage = () => {
  const navigate = useNavigate();

  const handleNavigate = (path: string) => {
    window.scrollTo(0, 0);
    navigate(path);
  };

  const handleSmoothScroll = (sectionId: string) => {
    const element = document.getElementById(sectionId);
    if (element) {
      element.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
  };

  return (
    <div className="min-h-screen bg-background text-foreground flex flex-col font-sans selection:bg-primary/20">
      {/* ─── NAVBAR ─── */}
      <header className="sticky top-0 z-50 bg-background/80 backdrop-blur-md border-b border-border/50">
        <div className="flex items-center justify-between px-6 py-4 max-w-7xl mx-auto w-full">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-primary flex items-center justify-center">
              <Store className="w-4 h-4 text-primary-foreground" />
            </div>
            <span className="font-bold text-lg tracking-tight">Aaspass</span>
          </div>
          <div className="flex items-center gap-4">
            <button
              onClick={() => handleNavigate('/auth')}
              className="text-sm font-medium text-muted-foreground hover:text-foreground transition-colors hidden sm:block"
            >
              Log in
            </button>
            <button
              onClick={() => handleNavigate('/auth')}
              className="text-sm font-semibold bg-primary text-primary-foreground px-6 py-2 rounded-full hover:bg-primary/90 transition-all duration-200 shadow-sm hover:shadow-md"
            >
              Sign up
            </button>
          </div>
        </div>
      </header>

      {/* ─── HERO SECTION ─── */}
      <section className="relative min-h-screen flex flex-col items-center justify-center px-6 pt-20 pb-20 overflow-hidden">
        <div className="max-w-5xl mx-auto text-center">
          <motion.h1
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.1 }}
            className="text-5xl md:text-7xl font-extrabold tracking-tight text-foreground mb-6"
            style={{ textWrap: 'balance' }}
          >
            Discover Local Sellers,<br className="hidden md:block" /> Support Your Community
          </motion.h1>

          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.2 }}
            className="text-lg md:text-xl text-muted-foreground max-w-3xl mx-auto mb-10 leading-relaxed"
          >
            Aaspass is a hyperlocal marketplace connecting you with home-based sellers, freelancers, and local businesses within walking distance. No commissions. No middlemen. Just direct connections with your neighbourhood.
          </motion.p>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.3 }}
            className="flex flex-col sm:flex-row items-center justify-center gap-4 mb-12"
          >
            <button
              onClick={() => handleNavigate('/home')}
              className="flex items-center gap-2 bg-primary text-primary-foreground px-8 py-4 rounded-full font-semibold text-lg hover:bg-primary/90 transition-all duration-200 shadow-lg hover:shadow-xl active:scale-95 w-full sm:w-auto justify-center"
            >
              Explore Sellers
            </button>
            <button
              onClick={() => handleNavigate('/profile')}
              className="flex items-center gap-2 bg-muted text-foreground px-8 py-4 rounded-full font-semibold text-lg hover:bg-muted/80 transition-all duration-200 shadow-md hover:shadow-lg active:scale-95 w-full sm:w-auto justify-center"
            >
              Become a Seller
            </button>
          </motion.div>
        </div>
      </section>

      {/* ─── CATEGORIES SECTION ─── */}
      <section id="browse-sellers" className="py-20 px-6 bg-gray-50">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-16">
            <motion.h2
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5 }}
              className="text-4xl md:text-5xl font-bold text-foreground mb-4"
            >
              What You Can Find
            </motion.h2>
            <motion.p
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, delay: 0.1 }}
              className="text-lg text-muted-foreground max-w-2xl mx-auto"
            >
              From homemade food to personal services, discover thousands of options right in your neighbourhood
            </motion.p>
          </div>

          <div className="grid grid-cols-2 lg:grid-cols-6 gap-4">
            {CATEGORIES.map((card, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, y: 40 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.6, delay: i * 0.1 }}
                className="flex flex-col items-center text-center p-6 rounded-2xl bg-white border border-gray-200 hover:shadow-lg hover:scale-105 transition-all duration-300 cursor-pointer"
              >
                <span className="text-4xl mb-3">{card.emoji}</span>
                <h3 className="font-semibold text-foreground text-sm md:text-base">{card.title}</h3>
                <p className="text-xs text-muted-foreground mt-1">{card.desc}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* ─── HOW IT WORKS ─── */}
      <section id="how-it-works" className="py-20 px-6">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-16">
            <motion.h2
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5 }}
              className="text-4xl md:text-5xl font-bold text-foreground mb-4"
            >
              How It Works
            </motion.h2>
            <motion.p
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, delay: 0.1 }}
              className="text-lg text-muted-foreground max-w-2xl mx-auto"
            >
              Get started in 4 easy steps
            </motion.p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
            {HOW_IT_WORKS.map((item, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, y: 40 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.6, delay: i * 0.15 }}
                className="relative"
              >
                <div className="bg-white rounded-2xl p-8 border border-gray-200 h-full shadow-sm hover:shadow-md transition-shadow">
                  <div className="w-12 h-12 rounded-full bg-gray-800 text-white flex items-center justify-center font-bold text-lg mb-4">
                    {item.step}
                  </div>
                  <h3 className="text-xl font-bold text-foreground mb-2">{item.title}</h3>
                  <p className="text-muted-foreground">{item.desc}</p>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* ─── FEATURES SECTION ─── */}
      <section id="why-choose-aaspass" className="py-20 px-6 bg-gray-50">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-16">
            <motion.h2
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5 }}
              className="text-4xl md:text-5xl font-bold text-foreground mb-4"
            >
              Why Choose Aaspass ?
            </motion.h2>
            <motion.p
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, delay: 0.1 }}
              className="text-lg text-muted-foreground max-w-2xl mx-auto"
            >
              Features designed for seamless local commerce
            </motion.p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
            {FEATURES.map((feature, i) => {
              const Icon = feature.icon;
              return (
                <motion.div
                  key={i}
                  initial={{ opacity: 0, y: 40 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ duration: 0.6, delay: i * 0.1 }}
                  className="bg-background rounded-2xl p-8 border border-border/50 hover:shadow-lg hover:border-primary/30 transition-all duration-300"
                >
                  <div className={`w-14 h-14 rounded-xl bg-primary/10 flex items-center justify-center mb-5`}>
                    <Icon className={`w-7 h-7 ${feature.color}`} />
                  </div>
                  <h3 className="text-xl font-bold text-foreground mb-3">{feature.title}</h3>
                  <p className="text-muted-foreground leading-relaxed">{feature.desc}</p>
                </motion.div>
              );
            })}
          </div>
        </div>
      </section>

      {/* ─── TESTIMONIALS SECTION ─── */}
      <section id="success-stories" className="py-20 px-6">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-16">
            <motion.h2
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5 }}
              className="text-4xl md:text-5xl font-bold text-foreground mb-4"
            >
              Loved by Our Community
            </motion.h2>
            <motion.p
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, delay: 0.1 }}
              className="text-lg text-muted-foreground max-w-2xl mx-auto"
            >
              Real ratings from sellers and buyers
            </motion.p>
          </div>

          <div className="grid md:grid-cols-3 gap-8">
            {TESTIMONIALS.map((testimonial, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, y: 40 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.6, delay: i * 0.15 }}
                className="bg-white rounded-2xl p-8 border border-gray-200 hover:shadow-lg transition-all duration-300"
              >
                <div className="flex items-center gap-4 mb-5">
                  <div className="w-12 h-12 rounded-full bg-primary/20 flex items-center justify-center text-2xl">
                    {testimonial.avatar}
                  </div>
                  <div>
                    <p className="font-bold text-foreground">{testimonial.name}</p>
                    <p className="text-sm text-muted-foreground">{testimonial.role}</p>
                  </div>
                </div>
                <p className="text-muted-foreground leading-relaxed italic">"{testimonial.text}"</p>
                <div className="flex gap-1 mt-4">
                  {[...Array(5)].map((_, i) => (
                    <Star key={i} className="w-4 h-4 fill-amber-400 text-amber-400" />
                  ))}
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* ─── DOWNLOAD PWA SECTION ─── */}
      <section className="py-20 px-6 bg-white">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-16">
            <motion.h2
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5 }}
              className="text-4xl md:text-5xl font-bold text-foreground mb-4"
            >
              Download Aaspass PWA (Progressive Web App)
            </motion.h2>
            <motion.p
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, delay: 0.1 }}
              className="text-lg text-muted-foreground max-w-2xl mx-auto mb-8"
            >
              Install Aaspass as an app on your phone for quick access
            </motion.p>
          </div>

          <div className="grid md:grid-cols-2 gap-8 max-w-4xl mx-auto">
            {/* iPhone Instructions */}
            <motion.div
              initial={{ opacity: 0, y: 40 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6 }}
              className="bg-gray-50 rounded-2xl p-8 border border-gray-200 shadow-sm"
            >
              <div className="text-4xl mb-4">📱</div>
              <h3 className="text-2xl font-bold text-foreground mb-4">iPhone</h3>
              <ol className="space-y-3 text-muted-foreground text-sm leading-relaxed">
                <li><strong>1.</strong> Open this website in Safari</li>
                <li><strong>2.</strong> Tap the Share button (box icon)</li>
                <li><strong>3.</strong> Select "Add to Home Screen"</li>
                <li><strong>4.</strong> Tap "Add" to confirm</li>
                <li><strong>5.</strong> Open Aaspass anytime from your home screen</li>
              </ol>
            </motion.div>

            {/* Android Instructions */}
            <motion.div
              initial={{ opacity: 0, y: 40 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6, delay: 0.15 }}
              className="bg-gray-50 rounded-2xl p-8 border border-gray-200 shadow-sm"
            >
              <div className="text-4xl mb-4">🤖</div>
              <h3 className="text-2xl font-bold text-foreground mb-4">Android</h3>
              <ol className="space-y-3 text-muted-foreground text-sm leading-relaxed">
                <li><strong>1.</strong> Open this website in Chrome</li>
                <li><strong>2.</strong> Tap the menu (three dots)</li>
                <li><strong>3.</strong> Select "Install app" or "Add to Home screen"</li>
                <li><strong>4.</strong> Confirm when asked</li>
                <li><strong>5.</strong> Open Aaspass anytime from your home screen</li>
              </ol>
            </motion.div>
          </div>

          <div className="text-center mt-12">
            <motion.p
              initial={{ opacity: 0 }}
              whileInView={{ opacity: 1 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5 }}
              className="text-sm text-muted-foreground"
            >
              <strong>💡 Benefits:</strong> Fast loading, no app store needed, saves storage space
            </motion.p>
          </div>
        </div>
      </section>

      {/* ─── CTA SECTION ─── */}
      <section className="py-20 px-6 bg-gray-50 border-t border-gray-200">
        <div className="max-w-4xl mx-auto text-center">
          <motion.h2
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5 }}
            className="text-4xl md:text-5xl font-bold text-foreground mb-6"
          >
            Ready to Join ?
          </motion.h2>
          <motion.p
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5, delay: 0.1 }}
            className="text-lg text-muted-foreground max-w-2xl mx-auto mb-10 leading-relaxed"
          >
            Download Aaspass today and start discovering amazing local sellers in your neighbourhood. It only takes 2 minutes to sign up!
          </motion.p>
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5, delay: 0.2 }}
            className="flex flex-col sm:flex-row gap-4 items-center justify-center"
          >
            <button
              onClick={() => handleNavigate('/auth')}
              className="bg-primary text-primary-foreground px-8 py-4 rounded-full font-semibold text-lg hover:bg-primary/90 transition-all duration-200 shadow-lg hover:shadow-xl active:scale-95 w-full sm:w-auto"
            >
              Get Started Free
            </button>
            <button
              onClick={() => handleNavigate('/home')}
              className="border-2 border-primary text-primary px-8 py-4 rounded-full font-semibold text-lg hover:bg-primary/5 transition-all duration-200 active:scale-95 w-full sm:w-auto"
            >
              Explore as Guest
            </button>
          </motion.div>
        </div>
      </section>

      {/* ─── FOOTER ─── */}
      <footer className="border-t border-border/50 bg-muted/30 py-12 px-6">
        <div className="max-w-7xl mx-auto">
          <div className="grid md:grid-cols-4 gap-8 mb-8">
            <div>
              <div className="flex items-center gap-2 mb-4">
                <div className="w-8 h-8 rounded-lg bg-primary flex items-center justify-center">
                  <Store className="w-4 h-4 text-primary-foreground" />
                </div>
                <span className="font-bold text-lg">Aaspass</span>
              </div>
              <p className="text-sm text-muted-foreground">Your neighbourhood, in your pocket. Support local, think global.</p>
            </div>
            <div>
              <h4 className="font-semibold text-foreground mb-4">For Buyers</h4>
              <ul className="space-y-2 text-sm text-muted-foreground">
                <li><button onClick={() => handleNavigate('/home')} className="hover:text-foreground transition">Browse Sellers</button></li>
                <li><button onClick={() => handleSmoothScroll('how-it-works')} className="hover:text-foreground transition">How It Works</button></li>
                <li><button onClick={() => handleNavigate('/safety-tips')} className="hover:text-foreground transition">Safety Tips</button></li>
              </ul>
            </div>
            <div>
              <h4 className="font-semibold text-foreground mb-4">For Sellers</h4>
              <ul className="space-y-2 text-sm text-muted-foreground">
                <li><button onClick={() => handleNavigate('/profile')} className="hover:text-foreground transition">Get Started</button></li>
                <li><button onClick={() => handleNavigate('/pricing')} className="hover:text-foreground transition">Pricing</button></li>
                <li><button onClick={() => handleSmoothScroll('success-stories')} className="hover:text-foreground transition">Success Stories</button></li>
              </ul>
            </div>
            <div>
              <h4 className="font-semibold text-foreground mb-4">Company</h4>
              <ul className="space-y-2 text-sm text-muted-foreground">
                <li><button onClick={() => handleNavigate('/about')} className="hover:text-foreground transition">About Us</button></li>
                <li><button onClick={() => handleNavigate('/contact')} className="hover:text-foreground transition">Contact</button></li>
                <li><button onClick={() => handleNavigate('/privacy')} className="hover:text-foreground transition">Privacy Policy</button></li>
              </ul>
            </div>
          </div>
          {/* Bottom Bar */}
        <div className="pt-8 border-t border-border flex flex-col md:flex-row justify-between items-center gap-4 text-xs text-muted-foreground">
          <p>© {new Date().getFullYear()} Aaspass. All Rights Reserved.</p>
          <div className="flex gap-4 items-center">
            <img src="https://upload.wikimedia.org/wikipedia/commons/e/e1/UPI-Logo-vector.svg" alt="UPI" className="h-6 opacity-60 hover:opacity-100 transition-opacity" />
            <span className="flex items-center gap-1 opacity-80">
              Secured by Razorpay
            </span>
          </div>
        </div>
      </div>
    </footer>
    </div>
  );
};

export default LandingPage;
