import { useEffect } from 'react';
import { motion } from 'framer-motion';
import {
  Code2, ShieldCheck, Zap,
  CheckCircle2, Sparkles
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import Lenis from '@studio-freight/lenis';
import { ZoomParallax } from '@/components/ui/zoom-parallax';
import { ShuffleHero } from '@/components/ui/shuffle-grid';
import { StripeBentoFeatures } from '@/components/landing/StripeBentoFeatures';
import { StripeHowItWorks } from '@/components/landing/StripeHowItWorks';
import { StripeAudienceBento } from '@/components/landing/StripeAudienceBento';
import { StripeMobileInstall } from '@/components/landing/StripeMobileInstall';
import { LandingNavbar } from '@/components/landing/LandingNavbar';

const DEMO_IMAGES = [
  // Center main image (Zooms 4x — high-res 4K/ultra HD to remain crystal clear)
  "https://images.unsplash.com/photo-1522071820081-009f0129c71c?auto=format&fit=crop&w=2800&q=95",
  // Surrounding images (High-res 2400px+)
  "https://images.unsplash.com/photo-1531482615713-2afd69097998?auto=format&fit=crop&w=2400&q=90",
  "https://images.unsplash.com/photo-1552664730-d307ca884978?auto=format&fit=crop&w=2400&q=90",
  "https://images.unsplash.com/photo-1498050108023-c5249f4df085?auto=format&fit=crop&w=2400&q=90",
  "https://images.unsplash.com/photo-1517245386807-bb43f82c33c4?auto=format&fit=crop&w=2400&q=90",
  "https://images.unsplash.com/photo-1581291518857-4e27b48ff24e?auto=format&fit=crop&w=2400&q=90",
  "https://images.unsplash.com/photo-1524178232363-1fb2b075b655?auto=format&fit=crop&w=2400&q=90",
];

const LandingPage = () => {
  const navigate = useNavigate();

  useEffect(() => {
    const lenis = new Lenis({
      duration: 1.2,
      easing: (t) => Math.min(1, 1.001 - Math.pow(2, -10 * t)),
    });
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
    <div className="min-h-screen bg-white text-[#0a2540] flex flex-col font-sans selection:bg-[#635bff]/20">
      
      {/* ─── PROFESSIONAL STRIPE-GRADE NAVBAR ─── */}
      <LandingNavbar />

      {/* ─── HERO SECTION (With Stripe Pre-Dawn Sunrise Wave & High Contrast Text) ─── */}
      <ShuffleHero
        onGetStarted={() => handleNavigate('/auth', 'signup')}
        onExploreMarketplace={() => handleNavigate('/home')}
      />

      {/* ─── HOW IT WORKS (Stripe-Style Workflow) ─── */}
      <StripeHowItWorks />

      {/* ─── STRIPE-STYLE PROGRAM BENTO FEATURES ─── */}
      <StripeBentoFeatures />

      {/* ─── STRIPE-STYLE AUDIENCE PROGRAM CARDS ─── */}
      <StripeAudienceBento
        onClientAction={() => handleNavigate('/auth', 'signup')}
        onFreelancerAction={() => handleNavigate('/auth', 'signup')}
      />

      {/* ─── STRIPE-STYLE MOBILE APP INSTALL CARDS (Centered) ─── */}
      <StripeMobileInstall />

      {/* ─── ZOOM PARALLAX SHOWCASE (Sticky Scroll Restored - NO overflow-hidden on container) ─── */}
      <section className="bg-white pt-24 md:pt-32 border-t border-[#e3e8ee] relative">
        {/* Architectural Header */}
        <div className="relative flex flex-col items-center justify-center pb-8 px-6 text-center z-10 max-w-4xl mx-auto">
          <div className="text-xs font-semibold uppercase tracking-wider text-[#635bff] mb-3">
            Portfolio In Motion
          </div>
          <h2 className="text-4xl md:text-5xl lg:text-6xl font-extrabold tracking-tight text-[#0a2540] text-center leading-[1.1]">
            Ready to Bridge the Gap?
          </h2>
          <p className="text-lg md:text-xl text-[#425466] mt-3 font-normal max-w-xl">
            Join hundreds of businesses and student freelancers collaborating right now.
          </p>
        </div>

        {/* Zoom Parallax: Requires uninhibited vertical scroll without parent overflow-hidden */}
        <div className="w-full relative">
          <ZoomParallax images={DEMO_IMAGES.map(src => ({ src }))} />
        </div>

        {/* Closing Conversion Action Banner Following Parallax */}
        <div className="py-20 px-6 border-t border-[#e3e8ee] bg-white relative z-20">
          <div className="max-w-[1400px] mx-auto flex flex-col items-center justify-center text-center">
            <h3 className="text-2xl md:text-3xl font-extrabold text-[#0a2540] tracking-tight mb-2">
              Start your next project today.
            </h3>
            <p className="text-base text-[#425466] max-w-md mb-8">
              Post a project in minutes or register as a student freelancer to keep 100% of your earnings.
            </p>

            <div className="flex flex-col sm:flex-row items-center justify-center gap-4 w-full sm:w-auto">
              <button
                onClick={() => handleNavigate('/auth', 'signup')}
                className="bg-[#635bff] hover:bg-[#534be8] text-white px-8 py-4 rounded-xl font-bold text-base transition-all duration-200 shadow-[0_4px_16px_rgba(99,91,255,0.25)] hover:shadow-[0_6px_24px_rgba(99,91,255,0.35)] active:scale-95 text-center w-full sm:w-auto flex items-center justify-center"
              >
                <span>Join as Freelancer</span>
              </button>
              <button
                onClick={() => handleNavigate('/home')}
                className="px-8 py-4 rounded-xl border border-[#e3e8ee] bg-white hover:bg-[#f8fafc] text-[#0a2540] font-bold text-base transition-all duration-200 active:scale-95 text-center w-full sm:w-auto flex items-center justify-center shadow-sm"
              >
                <span>Explore Platform</span>
              </button>
            </div>

            {/* Reassurance Badges */}
            <div className="flex flex-wrap items-center justify-center gap-6 pt-8 text-xs text-[#425466] font-medium">
              <span className="flex items-center gap-1.5">
                <Zap className="w-3.5 h-3.5 text-[#635bff]" /> Direct Collaboration
              </span>
              <span className="flex items-center gap-1.5">
                <ShieldCheck className="w-3.5 h-3.5 text-emerald-600" /> Verified Student Portfolios
              </span>
              <span className="flex items-center gap-1.5">
                <CheckCircle2 className="w-3.5 h-3.5 text-blue-600" /> Direct WhatsApp Connection
              </span>
            </div>
          </div>
        </div>
      </section>

      {/* ─── FOOTER with Stripe Margin Borders ─── */}
      <footer className="border-t border-[#e3e8ee] bg-[#f8fafc] py-16 px-6">
        <div className="max-w-[1560px] mx-auto border-x border-[#e3e8ee]/70 px-6 md:px-12">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-10 mb-12">
            <div>
              <div className="flex items-center gap-2 mb-4 cursor-pointer" onClick={() => handleNavigate('/')}>
                <img src="/aplg.png" alt="Spotgig" className="h-10 w-auto object-contain" />
              </div>
              <p className="text-sm text-[#425466] leading-relaxed">
                Bridge between student talent and real business needs. Direct freelancing, done right.
              </p>
            </div>
            <div>
              <h4 className="font-bold text-[#0a2540] text-xs uppercase tracking-wider mb-4">For Clients</h4>
              <ul className="space-y-3 text-sm text-[#425466]">
                <li><button onClick={() => handleNavigate('/home')} className="hover:text-[#0a2540] transition-colors">Find Freelancers</button></li>
                <li><button onClick={() => handleSmoothScroll('how-it-works')} className="hover:text-[#0a2540] transition-colors">How It Works</button></li>
                <li><button onClick={() => handleNavigate('/safety-tips')} className="hover:text-[#0a2540] transition-colors">Safety Tips</button></li>
              </ul>
            </div>
            <div>
              <h4 className="font-bold text-[#0a2540] text-xs uppercase tracking-wider mb-4">For Freelancers</h4>
              <ul className="space-y-3 text-sm text-[#425466]">
                <li><button onClick={() => handleNavigate('/auth', 'signup')} className="hover:text-[#0a2540] transition-colors">Register Skills</button></li>
                <li><button onClick={() => handleNavigate('/pricing')} className="hover:text-[#0a2540] transition-colors">Pricing</button></li>
                <li><button onClick={() => handleNavigate('/faq')} className="hover:text-[#0a2540] transition-colors">FAQ</button></li>
              </ul>
            </div>
            <div>
              <h4 className="font-bold text-[#0a2540] text-xs uppercase tracking-wider mb-4">Company</h4>
              <ul className="space-y-3 text-sm text-[#425466]">
                <li><button onClick={() => handleNavigate('/about')} className="hover:text-[#0a2540] transition-colors">About Us</button></li>
                <li><button onClick={() => handleNavigate('/contact')} className="hover:text-[#0a2540] transition-colors">Contact</button></li>
                <li><button onClick={() => handleNavigate('/privacy')} className="hover:text-[#0a2540] transition-colors">Privacy Policy</button></li>
                <li><button onClick={() => handleNavigate('/terms')} className="hover:text-[#0a2540] transition-colors">Terms</button></li>
              </ul>
            </div>
          </div>
          
          {/* Bottom Bar */}
          <div className="pt-8 border-t border-[#e3e8ee] flex flex-col sm:flex-row justify-between items-center gap-4 text-xs text-[#425466]">
            <p>© {new Date().getFullYear()} Spotgig. All Rights Reserved.</p>
            <div className="flex gap-4 items-center">
              <span className="flex items-center gap-1.5 opacity-90">
                <Code2 className="w-3.5 h-3.5 text-[#635bff]" /> Built for student freelancers
              </span>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default LandingPage;
