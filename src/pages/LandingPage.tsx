import { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import {
  MapPin, Zap, ShieldCheck, Users, TrendingUp,
  Briefcase, GraduationCap, Code2, Share2, PlusSquare, MoreVertical,
  DownloadCloud, CheckCircle2
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import Lenis from '@studio-freight/lenis';
import { FeaturesSectionWithHoverEffects } from '@/components/ui/feature-section-with-hover-effects';
import { ZoomParallax } from '@/components/ui/zoom-parallax';
import { UniqueAccordion } from '@/components/ui/interactive-accordion';
import { ShuffleHero } from '@/components/ui/shuffle-grid';
import ThemeToggle from '@/components/ThemeToggle';

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

const FEATURES = [
  {
    icon: <MapPin className="text-secondary w-6 h-6" />,
    title: 'Nearby Freelancers',
    description: 'Find skilled students and professionals within your area. Real-time distance calculations show you the closest talent.',
  },
  {
    icon: <Zap className="text-primary w-6 h-6" />,
    title: 'Instant Connection',
    description: 'Direct WhatsApp and LinkedIn links for zero friction communication. Connect with freelancers immediately.',
  },
  {
    icon: <Users className="text-purple-500 w-6 h-6" />,
    title: 'Solo or Team Projects',
    description: 'Students can work individually or form groups to take on bigger, more complex client projects.',
  },
  {
    icon: <GraduationCap className="text-blue-500 w-6 h-6" />,
    title: 'Real Experience',
    description: 'Students gain portfolio worthy work and real income, not just internship certificates.',
  },
  {
    icon: <ShieldCheck className="text-green-500 w-6 h-6" />,
    title: 'Verified Profiles',
    description: "Profile links to college/LinkedIn for trust. Clients know exactly who they're working with.",
  },
  {
    icon: <TrendingUp className="text-amber-500 w-6 h-6" />,
    title: 'Skill-Based Discovery',
    description: 'Filter by skill: Web Dev, Design, AI/ML, Marketing, and more. Find the right fit fast.',
  },
];

const CLIENTS_HOW_IT_WORKS = [
  { step: 1, title: 'Post Your Project', desc: 'Describe your project needs such as website, app, design, marketing, or any IT task.' },
  { step: 2, title: 'Discover Nearby Talent', desc: 'See freelancers sorted by distance, skill, and availability for solo or team projects.' },
  { step: 3, title: 'Review Profiles', desc: 'Check portfolios, ratings, LinkedIn profiles, and past project experience.' },
  { step: 4, title: 'Connect & Hire', desc: 'Message on WhatsApp or LinkedIn. No middleman, no commission.' },
];

const FREELANCERS_HOW_IT_WORKS = [
  { step: 1, title: 'Create Your Profile', desc: 'Register your skills, tech stack, experience level, and portfolio links.' },
  { step: 2, title: 'Browse Projects Nearby', desc: 'See client projects sorted by your location, filter by budget or category.' },
  { step: 3, title: 'Join Solo or as Team', desc: 'Take on projects alone or invite classmates to form a team for bigger gigs.' },
  { step: 4, title: 'Earn & Build Portfolio', desc: 'Get paid real money and add real client projects to your resume.' },
];

const LandingPage = () => {
  const navigate = useNavigate();
  const [howItWorksMode, setHowItWorksMode] = useState<'client' | 'freelancer'>('client');

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
              Sign In
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
      <section id="how-it-works" className="pt-16 pb-6 md:pt-20 md:pb-10 px-6">
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
              Get started in 4 simple steps
            </motion.p>
          </div>

          <div className="flex bg-muted p-1 rounded-full w-max mx-auto mb-6">
            <button
              onClick={() => setHowItWorksMode('client')}
              className={`px-6 py-2.5 rounded-full text-sm font-semibold transition-all ${howItWorksMode === 'client' ? 'bg-background shadow text-foreground' : 'text-muted-foreground hover:text-foreground'}`}
            >
              For Clients
            </button>
            <button
              onClick={() => setHowItWorksMode('freelancer')}
              className={`px-6 py-2.5 rounded-full text-sm font-semibold transition-all ${howItWorksMode === 'freelancer' ? 'bg-background shadow text-foreground' : 'text-muted-foreground hover:text-foreground'}`}
            >
              For Freelancers
            </button>
          </div>

          <UniqueAccordion
            items={(howItWorksMode === 'client' ? CLIENTS_HOW_IT_WORKS : FREELANCERS_HOW_IT_WORKS).map((item) => ({
              id: item.title.toLowerCase().replace(/\s+/g, '-'),
              number: String(item.step).padStart(2, '0'),
              title: item.title,
              content: item.desc,
            }))}
          />
        </div>
      </section>

      {/* ─── WHY AASPASS ─── */}
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
              Why Choose Aaspass?
            </motion.h2>
            <motion.p
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, delay: 0.1 }}
              className="text-lg text-muted-foreground max-w-2xl mx-auto"
            >
              Features designed for the next generation of freelancing
            </motion.p>
          </div>

          <FeaturesSectionWithHoverEffects features={FEATURES} />
        </div>
      </section>

      {/* ─── TWO AUDIENCE CARDS ─── */}
      <section className="pt-12 pb-8 px-6 bg-muted/20">
        <div className="max-w-5xl mx-auto">
          <div className="text-center mb-8">
            <motion.h2
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              className="text-3xl md:text-4xl font-bold text-foreground"
            >
              Who is Aaspass for?
            </motion.h2>
          </div>
          <div className="grid md:grid-cols-2 gap-6">
            {/* Client card */}
            <motion.div
              initial={{ opacity: 0, x: -30 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5 }}
              className="bg-card rounded-2xl p-8 border border-border shadow-sm flex flex-col justify-between"
            >
              <div>
                <div className="w-14 h-14 bg-primary/10 rounded-2xl flex items-center justify-center mb-5">
                  <Briefcase className="w-7 h-7 text-primary" />
                </div>
                <h3 className="text-xl font-bold text-foreground mb-2">Clients &amp; Business Owners</h3>
                <p className="text-muted-foreground leading-relaxed mb-5">
                  Need a website, app, or tech project done? Post it here and find talented students nearby.
                  Affordable rates, real skills, local collaboration.
                </p>
                <ul className="space-y-2 text-sm text-muted-foreground mb-6">
                  <li className="flex items-center gap-2">✅ Business owners wanting a digital presence</li>
                  <li className="flex items-center gap-2">✅ Experienced professionals seeking project guidance</li>
                  <li className="flex items-center gap-2">✅ Startups needing part-time tech help</li>
                </ul>
              </div>
              <button
                onClick={() => handleNavigate('/auth', 'signup')}
                className="w-full py-3 rounded-xl bg-primary text-primary-foreground font-semibold hover:bg-primary/90 transition"
              >
                Post a Project
              </button>
            </motion.div>

            {/* Freelancer card */}
            <motion.div
              initial={{ opacity: 0, x: 30 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5 }}
              className="bg-card rounded-2xl p-8 border border-border shadow-sm flex flex-col justify-between"
            >
              <div>
                <div className="w-14 h-14 bg-purple-500/10 rounded-2xl flex items-center justify-center mb-5">
                  <GraduationCap className="w-7 h-7 text-purple-500" />
                </div>
                <h3 className="text-xl font-bold text-foreground mb-2">Students &amp; Freelancers</h3>
                <p className="text-muted-foreground leading-relaxed mb-5">
                  College students, B.Tech engineers, MBA grads, and vibe coders: register your skills and
                  earn real money from nearby clients. Work solo or team up!
                </p>
                <ul className="space-y-2 text-sm text-muted-foreground mb-6">
                  <li className="flex items-center gap-2">✅ Students wanting part-time income</li>
                  <li className="flex items-center gap-2">✅ Coders building their first portfolio</li>
                  <li className="flex items-center gap-2">✅ Teams who want to tackle bigger projects</li>
                </ul>
              </div>
              <button
                onClick={() => handleNavigate('/auth', 'signup')}
                className="w-full py-3 rounded-xl bg-purple-600 text-white font-semibold hover:bg-purple-700 transition"
              >
                Register as Freelancer
              </button>
            </motion.div>
          </div>
        </div>
      </section>

      {/* ─── INSTALL PWA ─── */}
      <section className="pt-10 pb-4 md:pt-14 md:pb-6 px-6 bg-background relative overflow-hidden">
        <div className="max-w-6xl mx-auto relative z-10">
          <div className="text-center max-w-3xl mx-auto mb-8 md:mb-10">
            <h2 className="text-3xl md:text-5xl font-bold text-foreground tracking-tight mb-3">
              Get the App on Your Phone
            </h2>
            <p className="text-base md:text-lg text-muted-foreground leading-relaxed">
              Add Aaspass directly to your home screen for fast, one tap access with zero downloads or app store updates needed.
            </p>
          </div>

          <div className="grid md:grid-cols-2 gap-8 max-w-5xl mx-auto">
            {/* iOS Guide Card */}
            <div className="bg-card border border-border/80 rounded-3xl p-7 sm:p-8 shadow-sm hover:shadow-md transition-all duration-300 flex flex-col justify-between">
              <div>
                <div className="flex items-center justify-between mb-6 pb-4 border-b border-border/50">
                  <div className="flex items-center gap-3">
                    <div className="w-11 h-11 rounded-2xl bg-muted flex items-center justify-center">
                      <img
                        src="https://upload.wikimedia.org/wikipedia/commons/f/fa/Apple_logo_black.svg"
                        alt="Apple logo"
                        className="h-5 w-auto object-contain dark:invert opacity-90"
                      />
                    </div>
                    <div>
                      <h3 className="text-lg font-bold text-foreground">Apple iOS</h3>
                      <p className="text-xs text-muted-foreground">Safari browser</p>
                    </div>
                  </div>
                  <span className="text-xs font-medium px-3 py-1 rounded-full bg-muted text-muted-foreground">
                    iOS Setup
                  </span>
                </div>

                <div className="space-y-3.5">
                  <div className="flex items-center gap-3 p-2.5 rounded-xl bg-muted/40">
                    <span className="w-6 h-6 rounded-full bg-primary/10 text-primary text-xs font-semibold flex items-center justify-center shrink-0">
                      1
                    </span>
                    <span className="text-sm text-foreground/90">
                      Open Aaspass in your Safari browser
                    </span>
                  </div>

                  <div className="flex items-center gap-3 p-2.5 rounded-xl bg-muted/40">
                    <span className="w-6 h-6 rounded-full bg-primary/10 text-primary text-xs font-semibold flex items-center justify-center shrink-0">
                      2
                    </span>
                    <span className="text-sm text-foreground/90 flex items-center gap-1.5 flex-wrap">
                      Tap the Share button <Share2 className="w-3.5 h-3.5 text-primary inline" /> in the bottom bar
                    </span>
                  </div>

                  <div className="flex items-center gap-3 p-2.5 rounded-xl bg-muted/40">
                    <span className="w-6 h-6 rounded-full bg-primary/10 text-primary text-xs font-semibold flex items-center justify-center shrink-0">
                      3
                    </span>
                    <span className="text-sm text-foreground/90 flex items-center gap-1.5 flex-wrap">
                      Select "Add to Home Screen" <PlusSquare className="w-3.5 h-3.5 text-primary inline" />
                    </span>
                  </div>

                  <div className="flex items-center gap-3 p-2.5 rounded-xl bg-muted/40">
                    <span className="w-6 h-6 rounded-full bg-primary/10 text-primary text-xs font-semibold flex items-center justify-center shrink-0">
                      4
                    </span>
                    <span className="text-sm text-foreground/90">
                      Tap Add in top right to launch anytime
                    </span>
                  </div>
                </div>
              </div>

              <div className="mt-6 pt-4 border-t border-border/50 flex items-center gap-2 text-xs text-muted-foreground">
                <CheckCircle2 className="w-4 h-4 text-primary shrink-0" />
                <span>Instant launch · Offline cache · Zero storage usage</span>
              </div>
            </div>

            {/* Android Guide Card */}
            <div className="bg-card border border-border/80 rounded-3xl p-7 sm:p-8 shadow-sm hover:shadow-md transition-all duration-300 flex flex-col justify-between">
              <div>
                <div className="flex items-center justify-between mb-6 pb-4 border-b border-border/50">
                  <div className="flex items-center gap-3">
                    <div className="w-11 h-11 rounded-2xl bg-muted flex items-center justify-center">
                      <img
                        src="https://upload.wikimedia.org/wikipedia/commons/d/d7/Android_robot.svg"
                        alt="Android logo"
                        className="h-5 w-auto object-contain"
                      />
                    </div>
                    <div>
                      <h3 className="text-lg font-bold text-foreground">Android</h3>
                      <p className="text-xs text-muted-foreground">Chrome &amp; Edge browsers</p>
                    </div>
                  </div>
                  <span className="text-xs font-medium px-3 py-1 rounded-full bg-muted text-muted-foreground">
                    Android Setup
                  </span>
                </div>

                <div className="space-y-3.5">
                  <div className="flex items-center gap-3 p-2.5 rounded-xl bg-muted/40">
                    <span className="w-6 h-6 rounded-full bg-primary/10 text-primary text-xs font-semibold flex items-center justify-center shrink-0">
                      1
                    </span>
                    <span className="text-sm text-foreground/90">
                      Open Aaspass in your Chrome or browser
                    </span>
                  </div>

                  <div className="flex items-center gap-3 p-2.5 rounded-xl bg-muted/40">
                    <span className="w-6 h-6 rounded-full bg-primary/10 text-primary text-xs font-semibold flex items-center justify-center shrink-0">
                      2
                    </span>
                    <span className="text-sm text-foreground/90 flex items-center gap-1.5 flex-wrap">
                      Tap the Menu icon <MoreVertical className="w-3.5 h-3.5 text-primary inline" /> (three dots) at top right
                    </span>
                  </div>

                  <div className="flex items-center gap-3 p-2.5 rounded-xl bg-muted/40">
                    <span className="w-6 h-6 rounded-full bg-primary/10 text-primary text-xs font-semibold flex items-center justify-center shrink-0">
                      3
                    </span>
                    <span className="text-sm text-foreground/90 flex items-center gap-1.5 flex-wrap">
                      Select "Install app" or "Add to Home screen" <DownloadCloud className="w-3.5 h-3.5 text-primary inline" />
                    </span>
                  </div>

                  <div className="flex items-center gap-3 p-2.5 rounded-xl bg-muted/40">
                    <span className="w-6 h-6 rounded-full bg-primary/10 text-primary text-xs font-semibold flex items-center justify-center shrink-0">
                      4
                    </span>
                    <span className="text-sm text-foreground/90">
                      Confirm Install when prompted to finish
                    </span>
                  </div>
                </div>
              </div>

              <div className="mt-6 pt-4 border-t border-border/50 flex items-center gap-2 text-xs text-muted-foreground">
                <CheckCircle2 className="w-4 h-4 text-primary shrink-0" />
                <span>One tap access · Fast performance · Real time updates</span>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ─── ZOOM PARALLAX CTA ─── */}
      <section className="bg-background pt-2 md:pt-4">
        <div className="relative flex flex-col items-center justify-center pt-0 pb-4 px-6 text-center">
          <motion.span
            initial={{ opacity: 0, y: 10 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-xs md:text-sm font-semibold tracking-wider uppercase text-primary mb-2"
          >
            Hyperlocal Talent Network
          </motion.span>
          <h2 className="text-3xl md:text-5xl lg:text-6xl font-black tracking-tighter text-center">
            Ready to Bridge the Gap?
          </h2>
          <p className="text-sm md:text-base text-muted-foreground mt-2 max-w-xl">
            Join hundreds of local businesses and student freelancers collaborating right now.
          </p>
        </div>

        <ZoomParallax images={DEMO_IMAGES.map(src => ({ src }))} />

        <div className="py-12 px-6 flex flex-col sm:flex-row items-center justify-center gap-4">
          <button
            onClick={() => handleNavigate('/auth', 'signup')}
            className="bg-primary text-primary-foreground px-6 py-4 rounded-xl font-bold text-base sm:px-10 sm:py-5 sm:text-lg hover:bg-primary/90 transition-all duration-200 shadow-xl hover:shadow-2xl active:scale-95 text-center w-full sm:w-auto"
          >
            Join as Freelancer
          </button>
          <button
            onClick={() => handleNavigate('/home')}
            className="px-6 py-4 rounded-xl border-2 border-primary text-primary font-bold text-base sm:px-10 sm:py-5 sm:text-lg transition-all duration-200 hover:bg-primary/5 active:scale-95 text-center w-full sm:w-auto"
          >
            Explore Platform
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
              <p className="text-sm text-muted-foreground">Bridge between student talent and real client needs. Hyperlocal freelancing, done right.</p>
            </div>
            <div>
              <h4 className="font-semibold text-foreground mb-4">For Clients</h4>
              <ul className="space-y-2 text-sm text-muted-foreground">
                <li><button onClick={() => handleNavigate('/home')} className="hover:text-foreground transition">Find Freelancers</button></li>
                <li><button onClick={() => handleSmoothScroll('how-it-works')} className="hover:text-foreground transition">How It Works</button></li>
                <li><button onClick={() => handleNavigate('/safety-tips')} className="hover:text-foreground transition">Safety Tips</button></li>
              </ul>
            </div>
            <div>
              <h4 className="font-semibold text-foreground mb-4">For Freelancers</h4>
              <ul className="space-y-2 text-sm text-muted-foreground">
                <li><button onClick={() => handleNavigate('/auth', 'signup')} className="hover:text-foreground transition">Register Skills</button></li>
                <li><button onClick={() => handleNavigate('/pricing')} className="hover:text-foreground transition">Pricing</button></li>
                <li><button onClick={() => handleNavigate('/faq')} className="hover:text-foreground transition">FAQ</button></li>
              </ul>
            </div>
            <div>
              <h4 className="font-semibold text-foreground mb-4">Company</h4>
              <ul className="space-y-2 text-sm text-muted-foreground">
                <li><button onClick={() => handleNavigate('/about')} className="hover:text-foreground transition">About Us</button></li>
                <li><button onClick={() => handleNavigate('/contact')} className="hover:text-foreground transition">Contact</button></li>
                <li><button onClick={() => handleNavigate('/privacy')} className="hover:text-foreground transition">Privacy Policy</button></li>
                <li><button onClick={() => handleNavigate('/terms')} className="hover:text-foreground transition">Terms</button></li>
              </ul>
            </div>
          </div>
          {/* Bottom Bar */}
          <div className="pt-8 border-t border-border flex flex-col md:flex-row justify-between items-center gap-4 text-xs text-muted-foreground">
            <p>© {new Date().getFullYear()} Aaspass. All Rights Reserved.</p>
            <div className="flex gap-4 items-center">
              <span className="flex items-center gap-1 opacity-80">
                <Code2 className="w-3.5 h-3.5" /> Built for student freelancers
              </span>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default LandingPage;
