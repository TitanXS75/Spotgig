import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Menu, X, ChevronRight, Briefcase, Sparkles, Compass } from 'lucide-react';

export function LandingNavbar() {
  const navigate = useNavigate();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 20);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const handleScrollTo = (sectionId: string) => {
    setMobileMenuOpen(false);
    const element = document.getElementById(sectionId);
    if (element) {
      element.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
  };

  const handleNavigate = (path: string, state?: any) => {
    setMobileMenuOpen(false);
    window.scrollTo(0, 0);
    navigate(path, { state });
  };

  return (
    <header
      className={`sticky top-0 z-50 w-full transition-all duration-300 ${
        scrolled
          ? 'bg-white/95 backdrop-blur-md shadow-[0_1px_3px_rgba(0,0,0,0.05),0_10px_24px_rgba(0,0,0,0.03)] border-b border-[#e3e8ee]'
          : 'bg-white/80 backdrop-blur-sm border-b border-[#e3e8ee]'
      }`}
    >
      <div className="max-w-[1400px] mx-auto px-6 h-20 flex items-center justify-between">
        
        {/* Brand Logo */}
        <div
          onClick={() => handleNavigate('/')}
          className="flex items-center cursor-pointer group select-none"
        >
          <img
            src="/aplg.png"
            alt="Spotgig Logo"
            className="w-auto h-11 object-contain transform group-hover:scale-105 transition-transform duration-200"
          />
        </div>

        {/* Desktop Navigation Links */}
        <nav className="hidden md:flex items-center gap-1 lg:gap-2">
          <button
            onClick={() => handleNavigate('/home')}
            className="text-sm font-semibold text-[#425466] hover:text-[#0a2540] px-3.5 py-2 rounded-lg hover:bg-slate-100/80 transition-all duration-200"
          >
            Marketplace
          </button>

          <button
            onClick={() => handleScrollTo('how-it-works')}
            className="text-sm font-semibold text-[#425466] hover:text-[#0a2540] px-3.5 py-2 rounded-lg hover:bg-slate-100/80 transition-all duration-200"
          >
            How It Works
          </button>

          <button
            onClick={() => handleScrollTo('why-choose-spotgig')}
            className="text-sm font-semibold text-[#425466] hover:text-[#0a2540] px-3.5 py-2 rounded-lg hover:bg-slate-100/80 transition-all duration-200"
          >
            Why Spotgig
          </button>

          <button
            onClick={() => handleNavigate('/pricing')}
            className="text-sm font-semibold text-[#425466] hover:text-[#0a2540] px-3.5 py-2 rounded-lg hover:bg-slate-100/80 transition-all duration-200"
          >
            Pricing
          </button>

          <button
            onClick={() => handleNavigate('/about')}
            className="text-sm font-semibold text-[#425466] hover:text-[#0a2540] px-3.5 py-2 rounded-lg hover:bg-slate-100/80 transition-all duration-200"
          >
            About
          </button>
        </nav>

        {/* Desktop Actions */}
        <div className="hidden md:flex items-center gap-3">
          <button
            onClick={() => handleNavigate('/auth', { mode: 'login' })}
            className="h-10 px-4 rounded-full text-sm font-semibold text-[#0a2540] hover:text-[#635bff] hover:bg-slate-100/70 transition-colors inline-flex items-center justify-center"
          >
            Sign in
          </button>

          <button
            onClick={() => handleNavigate('/post-project')}
            className="h-10 px-5 rounded-full text-sm font-semibold bg-[#0a2540] hover:bg-[#635bff] text-white transition-all duration-200 shadow-sm hover:shadow-[0_4px_16px_rgba(99,91,255,0.25)] inline-flex items-center justify-center gap-1.5 group"
          >
            <span>Post a Project</span>
            <span aria-hidden="true" className="transform group-hover:translate-x-0.5 transition-transform text-[#a5b4fc]">
              &rsaquo;
            </span>
          </button>
        </div>

        {/* Mobile Hamburger Button */}
        <button
          onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
          className="md:hidden p-2 rounded-xl text-[#0a2540] hover:bg-slate-100 transition-colors"
          aria-label="Toggle menu"
        >
          {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
        </button>
      </div>

      {/* Mobile Drawer Menu */}
      {mobileMenuOpen && (
        <div className="md:hidden bg-white border-b border-[#e3e8ee] px-6 py-6 space-y-4 shadow-xl animate-in slide-in-from-top-4 duration-200">
          <nav className="flex flex-col space-y-2">
            <button
              onClick={() => handleNavigate('/home')}
              className="flex items-center justify-between text-left text-base font-semibold text-[#0a2540] py-2.5 px-3 rounded-xl hover:bg-slate-50 transition-colors"
            >
              <span>Explore Marketplace</span>
              <ChevronRight className="w-4 h-4 text-[#635bff]" />
            </button>

            <button
              onClick={() => handleScrollTo('how-it-works')}
              className="flex items-center justify-between text-left text-base font-semibold text-[#0a2540] py-2.5 px-3 rounded-xl hover:bg-slate-50 transition-colors"
            >
              <span>How It Works</span>
              <ChevronRight className="w-4 h-4 text-[#635bff]" />
            </button>

            <button
              onClick={() => handleScrollTo('why-choose-spotgig')}
              className="flex items-center justify-between text-left text-base font-semibold text-[#0a2540] py-2.5 px-3 rounded-xl hover:bg-slate-50 transition-colors"
            >
              <span>Why Spotgig</span>
              <ChevronRight className="w-4 h-4 text-[#635bff]" />
            </button>

            <button
              onClick={() => handleNavigate('/pricing')}
              className="flex items-center justify-between text-left text-base font-semibold text-[#0a2540] py-2.5 px-3 rounded-xl hover:bg-slate-50 transition-colors"
            >
              <span>Pricing</span>
              <ChevronRight className="w-4 h-4 text-[#635bff]" />
            </button>

            <button
              onClick={() => handleNavigate('/about')}
              className="flex items-center justify-between text-left text-base font-semibold text-[#0a2540] py-2.5 px-3 rounded-xl hover:bg-slate-50 transition-colors"
            >
              <span>About Us</span>
              <ChevronRight className="w-4 h-4 text-[#635bff]" />
            </button>
          </nav>

          <div className="pt-4 border-t border-[#e3e8ee] flex flex-col gap-3">
            <button
              onClick={() => handleNavigate('/auth', { mode: 'login' })}
              className="w-full py-3 rounded-xl border border-[#e3e8ee] font-semibold text-sm text-[#0a2540] hover:bg-slate-50 transition-colors text-center"
            >
              Sign in
            </button>
            <button
              onClick={() => handleNavigate('/post-project')}
              className="w-full py-3 rounded-xl bg-[#0a2540] hover:bg-[#635bff] text-white font-semibold text-sm transition-colors text-center shadow-sm"
            >
              Post a Project
            </button>
          </div>
        </div>
      )}
    </header>
  );
}
