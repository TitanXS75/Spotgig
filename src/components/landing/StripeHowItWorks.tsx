import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  StripeStartupsWaveArt,
  StripeSunsetWaveArt,
  StripePlatformBlueWaveArt,
  StripeConnectEmeraldWaveArt,
  StripeSessionsCosmicArt,
} from './BoxBackgroundArt';

interface StepCardData {
  title: string;
  desc: string;
  actionText: string;
  href: string;
  art: 'startups-wave' | 'sunset-wave' | 'platform-blue' | 'connect-emerald' | 'sessions-cosmic';
}

const CLIENT_STEPS: StepCardData[] = [
  {
    title: 'Post your project brief',
    desc: 'Describe your business deliverables, required tech stack, and timeline—from responsive landing pages to full-stack web applications.',
    actionText: 'Post a project',
    href: '/post-project',
    art: 'startups-wave',
  },
  {
    title: 'Discover verified talent',
    desc: 'Browse student developers and creators filtered by verified university credentials, demonstrated skills, and authentic GitHub repositories.',
    actionText: 'Browse student talent',
    href: '/home',
    art: 'sunset-wave',
  },
  {
    title: 'Direct collaboration',
    desc: 'Connect directly with candidates over WhatsApp or LinkedIn with transparent scope discussions and zero middleman markups.',
    actionText: 'Explore direct hiring',
    href: '/home',
    art: 'platform-blue',
  },
  {
    title: 'Milestone delivery & payment',
    desc: 'Review deliverables at each agreed milestone, inspect live code demos, and disburse payouts directly to students via UPI or bank transfer.',
    actionText: 'View milestone model',
    href: '/pricing',
    art: 'connect-emerald',
  },
];

const FREELANCER_STEPS: StepCardData[] = [
  {
    title: 'Create your profile',
    desc: 'Register your technical skills, college background, and GitHub repositories to showcase verified capabilities to prospective clients.',
    actionText: 'Build student profile',
    href: '/auth',
    art: 'sessions-cosmic',
  },
  {
    title: 'Browse active client briefs',
    desc: 'Explore verified project briefs posted by local business owners and startups looking for agile student developers and designers.',
    actionText: 'Explore client briefs',
    href: '/home',
    art: 'sunset-wave',
  },
  {
    title: 'Work solo or form squads',
    desc: 'Take on individual tasks independently or partner with university classmates to tackle comprehensive full-stack and multi-disciplinary contracts.',
    actionText: 'Learn about campus squads',
    href: '/about',
    art: 'platform-blue',
  },
  {
    title: 'Build commercial proof of work',
    desc: 'Deliver production-ready solutions for real clients, build an undeniable commercial portfolio, and keep 100% of your agreed project earnings.',
    actionText: 'Start building portfolio',
    href: '/auth',
    art: 'connect-emerald',
  },
];

export function StripeHowItWorks() {
  const [mode, setMode] = useState<'client' | 'freelancer'>('client');
  const navigate = useNavigate();

  const steps = mode === 'client' ? CLIENT_STEPS : FREELANCER_STEPS;

  const renderArt = (type: StepCardData['art']) => {
    switch (type) {
      case 'startups-wave':
        return <StripeStartupsWaveArt />;
      case 'sunset-wave':
        return <StripeSunsetWaveArt />;
      case 'platform-blue':
        return <StripePlatformBlueWaveArt />;
      case 'connect-emerald':
        return <StripeConnectEmeraldWaveArt />;
      case 'sessions-cosmic':
        return <StripeSessionsCosmicArt />;
    }
  };

  return (
    <section id="how-it-works" className="py-24 md:py-32 px-6 bg-[#f8fafc] relative border-t border-[#e3e8ee]">
      <div className="max-w-[1400px] mx-auto relative z-10">
        
        {/* Section Header */}
        <div className="flex flex-col md:flex-row md:items-end justify-between mb-14 md:mb-16 gap-6">
          <div className="max-w-2xl">
            <div className="text-xs font-semibold uppercase tracking-wider text-[#635bff] mb-3">
              Streamlined Process
            </div>
            <h2 className="text-4xl md:text-5xl lg:text-6xl font-extrabold tracking-tight text-[#0a2540] leading-[1.1]">
              How It Works
            </h2>
            <p className="text-xl md:text-2xl text-[#425466] mt-4 font-normal leading-relaxed">
              Simple, transparent collaboration between business owners and university builders.
            </p>
          </div>

          {/* Mode Pill Switcher */}
          <div className="flex items-center bg-white p-1 rounded-full border border-[#e3e8ee] shadow-sm self-start md:self-auto">
            <button
              onClick={() => setMode('client')}
              className={`px-6 py-2 rounded-full text-sm font-semibold transition-all duration-200 ${
                mode === 'client'
                  ? 'bg-[#0a2540] text-white shadow-sm'
                  : 'text-[#425466] hover:text-[#0a2540]'
              }`}
            >
              For Clients
            </button>
            <button
              onClick={() => setMode('freelancer')}
              className={`px-6 py-2 rounded-full text-sm font-semibold transition-all duration-200 ${
                mode === 'freelancer'
                  ? 'bg-[#0a2540] text-white shadow-sm'
                  : 'text-[#425466] hover:text-[#0a2540]'
              }`}
            >
              For Freelancers
            </button>
          </div>
        </div>

        {/* 2x2 Grid: Each Box has its Own Unique Stripe Silk Wave & Boundary Glow (Zero Triangles, Zero Badges) */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {steps.map((item) => (
            <div
              key={item.title}
              className="group relative rounded-2xl bg-white border border-[#e3e8ee] hover:border-[#635bff]/60 hover:ring-1 hover:ring-[#635bff]/30 p-8 md:p-9 shadow-[0_2px_4px_rgba(0,0,0,0.02),0_8px_20px_rgba(0,0,0,0.04)] hover:shadow-[0_4px_16px_rgba(99,91,255,0.08),0_16px_36px_rgba(10,37,64,0.06)] transition-all duration-300 flex flex-col justify-between overflow-hidden min-h-[210px]"
            >
              {/* Unique Right-Side Stripe Silk Wave (No Triangles) */}
              {renderArt(item.art)}

              {/* Text Content (Left side, matching reference image typography) */}
              <div className="relative z-10 max-w-[62%] sm:max-w-[64%] md:max-w-[65%] flex flex-col justify-between h-full">
                <div>
                  <h3 className="text-base md:text-lg font-bold text-[#0a2540] inline mr-1.5 leading-snug">
                    {item.title}.
                  </h3>
                  <p className="text-sm md:text-[15px] text-[#425466] inline leading-relaxed">
                    {item.desc}
                  </p>
                </div>

                <div className="mt-6">
                  <button
                    onClick={() => {
                      window.scrollTo(0, 0);
                      navigate(item.href);
                    }}
                    className="inline-flex items-center gap-1 font-semibold text-sm text-[#635bff] group-hover:text-[#0a2540] transition-colors"
                  >
                    <span>{item.actionText}</span>
                    <span aria-hidden="true" className="transform group-hover:translate-x-1 transition-transform">
                      &rsaquo;
                    </span>
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>

      </div>
    </section>
  );
}
