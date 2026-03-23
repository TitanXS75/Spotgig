import { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { ArrowRight, Store, MapPin, Smartphone, ShieldCheck, Zap, Users, TrendingUp, Star, Shield } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import Lenis from '@studio-freight/lenis';
import { FeaturesSectionWithHoverEffects } from '@/components/ui/feature-section-with-hover-effects';
import { ZoomParallax } from '@/components/ui/zoom-parallax';
import { UniqueAccordion } from '@/components/ui/interactive-accordion';
import { ShuffleHero } from '@/components/ui/shuffle-grid';
import ThemeToggle from '@/components/ThemeToggle';

const DEMO_IMAGES = [
  "https://images.unsplash.com/photo-1517248135467-4c7edcad34c4?w=900&auto=format&fit=crop&q=60", // Dining
  "https://images.unsplash.com/photo-1586023492125-27b2c045efd7?w=900&auto=format&fit=crop&q=60", // Gardening
  "https://images.unsplash.com/photo-1449965408869-eaa3f722e40d?w=900&auto=format&fit=crop&q=60", // Transport
  "https://images.unsplash.com/photo-1423666639041-f56000c27a9a?w=900&auto=format&fit=crop&q=60", // Tutoring / Education
  "https://images.unsplash.com/photo-1544367567-0f2fcb009e0b?w=900&auto=format&fit=crop&q=60", // Yoga / Fitness
  "https://images.unsplash.com/photo-1460518451285-97b6aa326961?w=900&auto=format&fit=crop&q=60", // Arts / Crafts
  "https://images.unsplash.com/photo-1560066984-138dadb4c035?w=900&auto=format&fit=crop&q=60", // Beauty / Salon
  "https://images.unsplash.com/photo-1512621776951-a57141f2eefd?w=900&auto=format&fit=crop&q=60", // Salad
  "https://images.unsplash.com/photo-1606787366850-de6330128bfc?w=900&auto=format&fit=crop&q=60", // Crafts
  "https://images.unsplash.com/photo-1516975080664-ed2fc6a32937?w=900&auto=format&fit=crop&q=60", // Makeup
  "https://images.unsplash.com/photo-1562240020-ce31ccb0fa7d?w=900&auto=format&fit=crop&q=60", // Cleaning
  "https://images.unsplash.com/photo-1546069901-ba9599a7e63c?w=900&auto=format&fit=crop&q=60", // Food
  "https://images.unsplash.com/photo-1621905252507-b35492cc74b4?w=900&auto=format&fit=crop&q=60", // Handyman
  "https://images.unsplash.com/photo-1581578731548-c64695cc6952?w=900&auto=format&fit=crop&q=60", // Repair / Services
  "https://images.unsplash.com/photo-1540189549336-e6e99c3679fe?w=900&auto=format&fit=crop&q=60", // Photography
  "https://images.unsplash.com/photo-1534452203293-494d7ddbf7e0?w=900&auto=format&fit=crop&q=60", // Event
  "https://images.unsplash.com/photo-1556910103-1c02745a30bf?w=900&auto=format&fit=crop&q=60", // Kitchen/Cooking
];

const FEATURES = [
  {
    icon: <MapPin className="text-secondary w-6 h-6" />,
    title: 'Hyperlocal Discovery',
    description: 'Find exactly what you need within walking distance. Real time distance calculations show you the nearest options.',
  },
  {
    icon: <Zap className="text-primary w-6 h-6" />,
    title: 'Instant Connection',
    description: 'Direct WhatsApp and Instagram links for zero friction communication. Connect with sellers immediately.',
  },
  {
    icon: <ShieldCheck className="text-green-500 w-6 h-6" />,
    title: 'Support Local',
    description: 'Help home-based entrepreneurs and micro businesses in your neighbourhood grow and thrive.',
  },
  {
    icon: <Smartphone className="text-blue-500 w-6 h-6" />,
    title: 'Mobile First',
    description: 'Optimized for mobile devices. Browse, search, and contact sellers on the go.',
  },
  {
    icon: <Users className="text-purple-500 w-6 h-6" />,
    title: 'Community Driven',
    description: 'Share your ratings to help others decide. Read what neighbourhood members think.',
  },
  {
    icon: <TrendingUp className="text-amber-500 w-6 h-6" />,
    title: 'Grow Your Business',
    description: 'Easy seller onboarding. Start selling in minutes with affordable monthly plans.',
  },
];

const BUYERS_HOW_IT_WORKS = [
  { step: 1, title: 'Enable Location', desc: 'Allow access to your location for accurate distance calculations.' },
  { step: 2, title: 'Browse Nearby', desc: 'See sellers sorted by distance, category, and type (product/service).' },
  { step: 3, title: 'Check Details', desc: 'View full listing, reviews, ratings, and seller information.' },
  { step: 4, title: 'Connect Now', desc: 'Message on WhatsApp or Instagram to place orders and inquire.' },
];

const SELLERS_HOW_IT_WORKS = [
  { step: 1, title: 'Create Profile', desc: 'Set up your business profile with photos, description, and location.' },
  { step: 2, title: 'Add Listings', desc: 'List your products or services with pricing and details.' },
  { step: 3, title: 'Get Discovered', desc: 'Nearby customers find you instantly through our location-based search.' },
  { step: 4, title: 'Grow Business', desc: 'Receive inquiries directly on WhatsApp and build your local customer base.' },
];



const STATS = [
  { number: '10K+', label: 'Active Sellers', icon: Store },
  { number: '50K+', label: 'Happy Customers', icon: Users },
  { number: '8 Cities', label: 'Live & Growing', icon: MapPin },
  { number: '4.8 ⭐', label: 'Average Rating', icon: Star },
];

const LandingPage = () => {
  const navigate = useNavigate();
  const [howItWorksMode, setHowItWorksMode] = useState<'buyer' | 'seller'>('buyer');

  useEffect(() => {
    const lenis = new Lenis();
    function raf(time: number) {
      lenis.raf(time);
      requestAnimationFrame(raf);
    }
    requestAnimationFrame(raf);
    return () => lenis.destroy();
  }, []);

  const handleNavigate = (path: string, mode?: 'login' | 'signup') => {
    window.scrollTo(0, 0);
    if (mode) {
      navigate(path, { state: { mode } });
    } else {
      navigate(path);
    }
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
          <div className="flex items-center">
            <img src="/aplg.png" alt="Aaspass" className="w-auto h-10 object-contain transform scale-125" />
          </div>
          <div className="flex items-center gap-2">
            <ThemeToggle />
            <button
              onClick={() => handleNavigate('/auth', 'login')}
              className="text-sm font-semibold bg-primary text-primary-foreground px-6 py-2 rounded-full hover:bg-primary/90 transition-all duration-200 shadow-sm hover:shadow-md"
            >
              Log in
            </button>
          </div>
        </div>
      </header>

      {/* ─── HERO SECTION ─── */}
      <ShuffleHero
        onGetStarted={() => handleNavigate('/auth', 'signup')}
        onExploreMarketplace={() => handleNavigate('/home')}
      />

      {/* ─── HOW IT WORKS ─── */}
      <section id="how-it-works" className="pt-12 pb-4 md:pt-16 md:pb-8 px-6">
        <div className="max-w-7xl mx-auto flex flex-col items-center">
          <div className="text-center mb-6">
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

          <div className="flex bg-muted p-1 rounded-full w-max mx-auto mb-6">
            <button
              onClick={() => setHowItWorksMode('buyer')}
              className={`px-6 py-2.5 rounded-full text-sm font-semibold transition-all ${howItWorksMode === 'buyer' ? 'bg-background shadow text-foreground' : 'text-muted-foreground hover:text-foreground'}`}
            >
              For Buyers
            </button>
            <button
              onClick={() => setHowItWorksMode('seller')}
              className={`px-6 py-2.5 rounded-full text-sm font-semibold transition-all ${howItWorksMode === 'seller' ? 'bg-background shadow text-foreground' : 'text-muted-foreground hover:text-foreground'}`}
            >
              For Sellers
            </button>
          </div>

          <UniqueAccordion
            items={(howItWorksMode === 'buyer' ? BUYERS_HOW_IT_WORKS : SELLERS_HOW_IT_WORKS).map((item) => ({
              id: item.title.toLowerCase().replace(/\s+/g, '-'),
              number: String(item.step).padStart(2, '0'),
              title: item.title,
              content: item.desc,
            }))}
          />
        </div>
      </section>

      {/* ─── WHY CHOOSE AASPASS SECTION ─── */}
      <section id="why-choose-aaspass" className="pt-12 pb-4 md:pt-16 md:pb-8 px-6 bg-background">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-8">
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

          <FeaturesSectionWithHoverEffects features={FEATURES} />
        </div>
      </section>

      {/* ─── DOWNLOAD PWA SECTION ─── */}
      <section className="pt-4 pb-4 md:pt-6 md:pb-8 px-6 bg-background">
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
              className="bg-muted rounded-2xl p-8 border border-border shadow-sm"
            >
              <div className="flex items-center gap-3 mb-4">
                <img src="https://upload.wikimedia.org/wikipedia/commons/f/fa/Apple_logo_black.svg" alt="iOS" className="h-10 w-auto object-contain dark:invert" />
                <h3 className="text-3xl font-bold text-foreground">iOS</h3>
              </div>
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
              className="bg-muted rounded-2xl p-8 border border-border shadow-sm"
            >
              <div className="flex items-center gap-3 mb-4">
                <img src="https://upload.wikimedia.org/wikipedia/commons/d/d7/Android_robot.svg" alt="Android" className="h-10 w-auto object-contain" />
                <h3 className="text-3xl font-bold text-foreground">Android</h3>
              </div>
              <ol className="space-y-3 text-muted-foreground text-sm leading-relaxed">
                <li><strong>1.</strong> Open this website in Chrome</li>
                <li><strong>2.</strong> Tap the menu (three dots)</li>
                <li><strong>3.</strong> Select "Install app" or "Add to Home screen"</li>
                <li><strong>4.</strong> Confirm when asked</li>
                <li><strong>5.</strong> Open Aaspass anytime from your home screen</li>
              </ol>
            </motion.div>
          </div>

          <div className="text-center mt-8">
            <motion.p
              initial={{ opacity: 0 }}
              whileInView={{ opacity: 1 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5 }}
              className="text-sm text-muted-foreground"
            >
              <strong>Benefits:</strong> Fast loading, no app store needed, saves storage space
            </motion.p>
          </div>
        </div>
      </section>

      {/* ─── ZOOM PARALLAX CTA SECTION ─── */}
      <section className="bg-background pt-4 md:pt-8">
        <div className="relative flex items-center justify-center pt-6 pb-4">
          <h2 className="text-3xl md:text-5xl lg:text-6xl font-black tracking-tighter text-center">
            Ready to Join Aaspass ?
          </h2>
        </div>
        <ZoomParallax images={DEMO_IMAGES.slice(0, 7).map(src => ({ src }))} />
        <div className="py-12 px-6 flex flex-col sm:flex-row items-center justify-center gap-4">
          <button
            onClick={() => handleNavigate('/auth', 'signup')}
            className="bg-primary text-primary-foreground px-6 py-4 rounded-xl font-bold text-base sm:px-10 sm:py-5 sm:text-lg hover:bg-primary/90 transition-all duration-200 shadow-xl hover:shadow-2xl active:scale-95 text-center w-full sm:w-auto"
          >
            Get Started Free
          </button>
          <button
            onClick={() => handleNavigate('/home')}
            className="px-6 py-4 rounded-xl border-2 border-primary text-primary font-bold text-base sm:px-10 sm:py-5 sm:text-lg transition-all duration-200 hover:bg-primary/5 active:scale-95 text-center w-full sm:w-auto"
          >
            Explore Marketplace
          </button>
        </div>
      </section>

      {/* ─── FOOTER ─── */}
      <footer className="border-t border-border/50 bg-muted/30 py-12 px-6">
        <div className="max-w-7xl mx-auto">
          <div className="grid md:grid-cols-4 gap-8 mb-8">
            <div>
              <div className="flex items-center gap-2 mb-4">
                <img src="/aplg.png" alt="Aaspass" className="h-12 w-auto object-contain" />
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
                <li><button onClick={() => handleNavigate('/auth', 'signup')} className="hover:text-foreground transition">Get Started</button></li>
                <li><button onClick={() => handleNavigate('/pricing')} className="hover:text-foreground transition">Pricing</button></li>
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
