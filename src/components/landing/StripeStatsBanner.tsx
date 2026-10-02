import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';

const STATS = [
  {
    id: 'commission',
    value: '0%',
    description: 'platform commission on student earnings (keep 100% of client payout)',
    linkText: 'zero commission',
    href: '#why-choose-spotgig',
  },
  {
    id: 'connection',
    value: '1:1',
    description: 'direct collaboration via WhatsApp & LinkedIn without platform lock-in',
    linkText: 'direct contact',
    href: '#how-it-works',
  },
  {
    id: 'verified',
    value: '100%',
    description: 'verifiable portfolio projects backed by authentic code repositories',
    linkText: 'verified work',
    href: '#why-choose-spotgig',
  },
  {
    id: 'squads',
    value: 'Squads',
    description: 'collaborate independently or form student teams with your classmates',
    linkText: 'campus squads',
    href: '#why-choose-spotgig',
  },
];

export function StripeStatsBanner() {
  const [activeStatIndex, setActiveStatIndex] = useState(0);
  const [isHovered, setIsHovered] = useState(false);

  // Auto-cycle indicator every 4 seconds if user is not hovering
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
            Core Principles
          </div>
          <h2 className="text-4xl md:text-5xl lg:text-6xl font-extrabold tracking-tight text-[#0a2540] max-w-2xl leading-[1.1]">
            Transparent, student-first freelancing
          </h2>
        </div>

        {/* ─── Stripe's Signature Stats Menu with Sliding Active Indicator ─── */}
        <div className="relative pt-6 pb-2">
          
          {/* Top Border Track with Stripe's Sliding Active Indicator */}
          <div className="absolute top-0 inset-x-0 h-[2px] bg-[#e3e8ee]">
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

          {/* 4 Pillars Grid (Honest, authentic guarantees) */}
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
                  {/* Metric Display */}
                  <div className="overflow-hidden">
                    <motion.p
                      key={stat.value}
                      initial={false}
                      className={`text-4xl md:text-5xl lg:text-6xl font-extrabold tracking-tight font-sans transition-colors duration-200 ${
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
