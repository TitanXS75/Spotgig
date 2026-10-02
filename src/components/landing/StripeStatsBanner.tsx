import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';

const STATS = [
  {
    id: 'delivery',
    value: '99%',
    description: 'project completion rate with verified student collaborators',
    linkText: 'successful delivery',
    href: '#why-choose-spotgig',
  },
  {
    id: 'turnaround',
    value: '24 hrs',
    description: 'average turnaround from project post to active collaboration',
    linkText: 'rapid turnaround',
    href: '#how-it-works',
  },
  {
    id: 'verified',
    value: '100%',
    description: 'verified university students and authentic project portfolios',
    linkText: 'verified profiles',
    href: '#why-choose-spotgig',
  },
  {
    id: 'skills',
    value: '500+',
    description: 'active technical skills across development, design and marketing',
    linkText: 'skills directory',
    href: '#why-choose-spotgig',
  },
];

export function StripeStatsBanner() {
  const [activeStatIndex, setActiveStatIndex] = useState(0);
  const [isHovered, setIsHovered] = useState(false);

  // Auto-cycle indicator every 4 seconds if user is not hovering (just like Stripe)
  useEffect(() => {
    if (isHovered) return;
    const interval = setInterval(() => {
      setActiveStatIndex((prev) => (prev + 1) % STATS.length);
    }, 4000);
    return () => clearInterval(interval);
  }, [isHovered]);

  return (
    <section
      className="relative py-24 md:py-32 bg-white text-[#0a2540] overflow-hidden border-y border-[#e3e8ee]"
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      <div className="max-w-[1400px] mx-auto px-6 relative z-10">
        
        {/* Section Title */}
        <div className="mb-16 md:mb-20">
          <div className="text-xs font-semibold uppercase tracking-wider text-[#635bff] mb-3">
            Scale &amp; Authenticity
          </div>
          <h2 className="text-4xl md:text-5xl lg:text-6xl font-extrabold tracking-tight text-[#0a2540] max-w-2xl leading-[1.1]">
            The backbone of student freelancing
          </h2>
        </div>

        {/* ─── Stripe's Signature Stats Menu with Sliding Active Indicator ─── */}
        <div className="relative pt-6 pb-2">
          
          {/* Top Border Track with Stripe's Sliding Active Indicator */}
          <div className="absolute top-0 inset-x-0 h-[2px] bg-[#e3e8ee]">
            {/* Sliding Glowing Indigo Line */}
            <motion.div
              className="h-[2px] bg-[#635bff] shadow-[0_0_12px_rgba(99,91,255,0.6)]"
              animate={{
                left: `${(activeStatIndex / STATS.length) * 100}%`,
                width: `${100 / STATS.length}%`,
              }}
              transition={{ type: 'spring', stiffness: 350, damping: 35 }}
              style={{ position: 'absolute' }}
            />
          </div>

          {/* 4 Stats Grid (Matching Stripe index.html stats-menu) */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8 lg:gap-10">
            {STATS.map((stat, idx) => {
              const isActive = activeStatIndex === idx;
              return (
                <div
                  key={stat.id}
                  onMouseEnter={() => setActiveStatIndex(idx)}
                  onClick={() => setActiveStatIndex(idx)}
                  className="cursor-pointer group flex flex-col justify-start text-left pt-4 transition-all duration-200"
                >
                  {/* Big Number */}
                  <div className="overflow-hidden">
                    <motion.p
                      key={stat.value}
                      initial={false}
                      className={`text-5xl md:text-6xl font-extrabold tracking-tight font-sans tabular-nums transition-colors duration-200 ${
                        isActive ? 'text-[#0a2540]' : 'text-[#0a2540]/60 group-hover:text-[#0a2540]'
                      }`}
                    >
                      {stat.value}
                    </motion.p>
                  </div>

                  {/* Description with inline link style like Stripe */}
                  <p
                    className={`mt-3 text-base leading-snug transition-colors duration-200 ${
                      isActive ? 'text-[#425466]' : 'text-[#425466]/70 group-hover:text-[#425466]'
                    }`}
                  >
                    <span className="font-semibold underline decoration-[#635bff]/40 underline-offset-4 decoration-2">
                      {stat.linkText}
                    </span>{' '}
                    {stat.description.replace(stat.linkText, '').trim()}
                  </p>

                  {/* Subtle active dot */}
                  <div className="mt-4 flex items-center gap-1.5">
                    <span
                      className={`w-1.5 h-1.5 rounded-full transition-all duration-300 ${
                        isActive ? 'bg-[#635bff] scale-125' : 'bg-transparent'
                      }`}
                    />
                  </div>
                </div>
              );
            })}
          </div>
        </div>

      </div>
    </section>
  );
}
