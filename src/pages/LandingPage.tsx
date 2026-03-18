import { motion } from 'framer-motion';
import { ArrowRight, Store, MapPin, Smartphone, ShieldCheck } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

const CARDS = [
  { emoji: '🍱', title: 'Food & Snacks', desc: 'Homemade tiffins & bakes', color: 'bg-orange-50 dark:bg-orange-950/30' },
  { emoji: '🔧', title: 'Home Repair', desc: 'Plumbers & electricians', color: 'bg-blue-50 dark:bg-blue-950/30' },
  { emoji: '👗', title: 'Boutiques', desc: 'Custom tailored clothing', color: 'bg-pink-50 dark:bg-pink-950/30' },
  { emoji: '🧘', title: 'Fitness', desc: 'Yoga & personal trainers', color: 'bg-green-50 dark:bg-green-950/30' },
];

const LandingPage = () => {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-background text-foreground flex flex-col font-sans selection:bg-primary/20">

      {/* Navbar (Landing specific) */}
      <header className="flex items-center justify-between px-6 py-4 max-w-7xl mx-auto w-full">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-lg bg-primary flex items-center justify-center">
            <Store className="w-4 h-4 text-primary-foreground" />
          </div>
          <span className="font-bold text-lg tracking-tight">Aaspass</span>
        </div>
        <div className="flex items-center gap-4">
          <button
            onClick={() => navigate('/auth')}
            className="text-sm font-medium text-muted-foreground hover:text-foreground transition-colors hidden sm:block"
          >
            Log in
          </button>
          <button
            onClick={() => navigate('/auth')}
            className="text-sm font-semibold bg-foreground text-background px-4 py-2 rounded-full hover:bg-foreground/90 transition-colors"
          >
            Sign up
          </button>
        </div>
      </header>

      {/* Hero Section */}
      <main className="flex-1 flex flex-col items-center justify-center px-6 pt-16 pb-24 text-center max-w-5xl mx-auto">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-primary/10 text-primary text-xs font-semibold mb-8">
        </motion.div>

        <motion.h1
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.1 }}
          className="text-5xl md:text-7xl font-extrabold tracking-tight text-foreground balance-text"
          style={{ textWrap: 'balance' }}
        >
          Your neighbourhood,<br className="hidden md:block" /> now online.
        </motion.h1>

        <motion.p
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.2 }}
          className="mt-6 text-lg md:text-xl text-muted-foreground max-w-2xl mx-auto"
        >
          Discover home sellers, freelancers, and local businesses within walking distance. Support your community and find exactly what you need.
        </motion.p>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.3 }}
          className="mt-10 flex flex-col sm:flex-row items-center gap-4"
        >
          <button
            onClick={() => navigate('/home')}
            className="flex items-center gap-2 bg-primary text-primary-foreground px-8 py-4 rounded-full font-semibold text-lg hover:bg-primary/90 transition-transform active:scale-95 w-full sm:w-auto justify-center"
          >
            Start Exploring
          </button>
          <button
            onClick={() => navigate('/auth')}
            className="flex items-center gap-2 bg-muted text-foreground px-8 py-4 rounded-full font-semibold text-lg hover:bg-muted/80 transition-transform active:scale-95 w-full sm:w-auto justify-center"
          >
            Become a Seller
          </button>
        </motion.div>

        {/* Floating Cards */}
        <div className="w-full mt-24 mb-16 px-4">
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 md:gap-6">
            {CARDS.map((card, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, y: 40 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: 0.4 + i * 0.1 }}
                className={`flex flex-col items-center text-center p-6 md:p-8 rounded-3xl ${card.color} border border-border/50`}
              >
                <span className="text-4xl md:text-5xl mb-4">{card.emoji}</span>
                <h3 className="font-semibold text-foreground">{card.title}</h3>
                <p className="text-xs text-muted-foreground mt-1">{card.desc}</p>
              </motion.div>
            ))}
          </div>
        </div>

        {/* Features / About Section */}
        <motion.div
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true, margin: "-100px" }}
          className="grid md:grid-cols-3 gap-12 text-left pt-16 border-t border-border/50 w-full"
        >
          <div>
            <div className="w-12 h-12 rounded-2xl bg-secondary/10 flex items-center justify-center mb-5">
              <MapPin className="w-6 h-6 text-secondary" />
            </div>
            <h3 className="text-xl font-bold text-foreground mb-2">Hyperlocal Discovery</h3>
            <p className="text-muted-foreground leading-relaxed">
              Find products and services available just blocks away from your home. Filter strictly by distance.
            </p>
          </div>
          <div>
            <div className="w-12 h-12 rounded-2xl bg-primary/10 flex items-center justify-center mb-5">
              <Smartphone className="w-6 h-6 text-primary" />
            </div>
            <h3 className="text-xl font-bold text-foreground mb-2">Direct Contact</h3>
            <p className="text-muted-foreground leading-relaxed">
              No middlemen, no hidden fees. Connect directly with sellers on WhatsApp or Instagram seamlessly.
            </p>
          </div>
          <div>
            <div className="w-12 h-12 rounded-2xl bg-accent-service/10 flex items-center justify-center mb-5">
              <ShieldCheck className="w-6 h-6 text-accent-service" />
            </div>
            <h3 className="text-xl font-bold text-foreground mb-2">Trusted Locals</h3>
            <p className="text-muted-foreground leading-relaxed">
              Support independent creators, home chefs, and freelancers right in your own neighbourhood.
            </p>
          </div>
        </motion.div>

      </main>

      {/* Very simple footer */}
      <footer className="border-t border-border/50 py-8 text-center text-sm text-muted-foreground">
        © {new Date().getFullYear()} Aaspass. All rights reserved.
      </footer>
    </div>
  );
};

export default LandingPage;
