import { useNavigate } from 'react-router-dom';
import {
  StripeStartupsWaveArt,
  StripeSunsetWaveArt,
  StripePlatformBlueWaveArt,
  StripeConnectEmeraldWaveArt,
} from './BoxBackgroundArt';

export function StripeBentoFeatures() {
  const navigate = useNavigate();

  const handleAction = (path: string) => {
    window.scrollTo(0, 0);
    navigate(path);
  };

  return (
    <section id="why-choose-spotgig" className="py-24 md:py-32 px-6 bg-white relative border-b border-[#e3e8ee]">
      <div className="max-w-[1400px] mx-auto">
        
        {/* Section Header */}
        <div className="mb-16 md:mb-20 max-w-3xl">
          <div className="text-xs font-semibold uppercase tracking-wider text-[#635bff] mb-3">
            Modular Platform
          </div>
          <h2 className="text-4xl md:text-5xl lg:text-6xl font-extrabold tracking-tight text-[#0a2540] leading-[1.1]">
            Why Choose Spotgig?
          </h2>
          <p className="text-xl md:text-2xl text-[#425466] mt-4 font-normal leading-relaxed">
            Built for modern student-business collaboration. Direct communication, verified technical talent, and zero platform commission.
          </p>
        </div>

        {/* ─── Bento Grid with Unique Stripe Artwork Backgrounds & Boundary Glow (Zero Triangles, Zero Badges) ─── */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">

          {/* ─── CARD 1: Large Featured Card (Span 2) - Pure Clean White (No Enlarge Button) ─── */}
          <div
            className="lg:col-span-2 group relative rounded-2xl bg-white border border-[#e3e8ee] hover:border-[#635bff]/60 hover:ring-1 hover:ring-[#635bff]/30 p-8 md:p-10 shadow-[0_2px_4px_rgba(0,0,0,0.02),0_8px_20px_rgba(0,0,0,0.04)] hover:shadow-[0_4px_16px_rgba(99,91,255,0.08),0_16px_36px_rgba(10,37,64,0.06)] transition-all duration-300 flex flex-col justify-between overflow-hidden min-h-[340px]"
          >
            {/* Silk Wave & Smooth Masking Overlay blending into pure white */}
            <div className="absolute inset-0 pointer-events-none overflow-hidden">
              <img
                src="https://images.stripeassets.com/fzn2n1nzq965/vYmk6v8n7oDAwbDpwhjV6/846f9b3e214549b8f14e2b8c8cfe9343/payment-bento-background.jpg?w=860&fm=webp&q=80"
                alt=""
                className="w-full h-full object-cover object-center opacity-75 group-hover:scale-105 transition-transform duration-700"
              />
              <div
                className="absolute inset-0"
                style={{
                  background: 'linear-gradient(to right, #ffffff 0%, #ffffff 35%, rgba(255,255,255,0.85) 58%, rgba(255,255,255,0.2) 80%, rgba(255,255,255,0) 100%)'
                }}
              />
            </div>

            {/* Content */}
            <div className="relative z-10 max-w-xl">
              <h3 className="text-2xl md:text-3xl font-extrabold text-[#0a2540] tracking-tight leading-snug">
                On-Demand Student Talent.
              </h3>
              <p className="text-[#425466] text-base md:text-lg mt-3 leading-relaxed font-normal">
                Connect directly with university engineering students, vibe coders, and UI/UX designers ready to build. Filter by authenticated skills, live project links, and direct availability.
              </p>
            </div>

            {/* Action */}
            <div className="relative z-10 mt-8 pt-4 border-t border-[#e3e8ee]/80">
              <button
                onClick={() => handleAction('/home')}
                className="inline-flex items-center gap-1 font-semibold text-sm text-[#635bff] group-hover:text-[#0a2540] transition-colors"
              >
                <span>Explore student directory</span>
                <span aria-hidden="true" className="transform group-hover:translate-x-1 transition-transform">&rsaquo;</span>
              </button>
            </div>
          </div>

          {/* ─── CARD 2: Flexible Delivery Models (Clean White, No BG) ─── */}
          <div
            className="group relative rounded-2xl bg-white border border-[#e3e8ee] hover:border-[#635bff]/60 hover:ring-1 hover:ring-[#635bff]/30 p-7 md:p-8 shadow-[0_2px_4px_rgba(0,0,0,0.02),0_8px_20px_rgba(0,0,0,0.04)] hover:shadow-[0_4px_16px_rgba(99,91,255,0.08),0_16px_36px_rgba(10,37,64,0.06)] transition-all duration-300 flex flex-col justify-between overflow-hidden min-h-[340px]"
          >
            <div className="relative z-10 w-full flex flex-col justify-between h-full">
              <div>
                <h4 className="font-bold text-[#0a2540] text-lg mb-2">
                  Enable any project model.
                </h4>
                <p className="text-[#425466] text-sm leading-relaxed">
                  Support fixed milestones, sprint deliverables, or multi-week support contracts with direct peer payouts and zero platform holdback.
                </p>
              </div>

              <div className="mt-8 pt-4 border-t border-[#e3e8ee]/80">
                <button
                  onClick={() => handleAction('/pricing')}
                  className="inline-flex items-center gap-1 font-semibold text-sm text-[#635bff] group-hover:text-[#0a2540] transition-colors"
                >
                  <span>Explore project models</span>
                  <span aria-hidden="true" className="transform group-hover:translate-x-1 transition-transform">&rsaquo;</span>
                </button>
              </div>
            </div>
          </div>

          {/* ─── CARD 3: Direct Connection (Clean White, No BG) ─── */}
          <div
            className="group relative rounded-2xl bg-white border border-[#e3e8ee] hover:border-[#635bff]/60 hover:ring-1 hover:ring-[#635bff]/30 p-7 md:p-8 shadow-[0_2px_4px_rgba(0,0,0,0.02),0_8px_20px_rgba(0,0,0,0.04)] hover:shadow-[0_4px_16px_rgba(99,91,255,0.08),0_16px_36px_rgba(10,37,64,0.06)] transition-all duration-300 flex flex-col justify-between overflow-hidden min-h-[340px]"
          >
            <div className="relative z-10 w-full flex flex-col justify-between h-full">
              <div>
                <h4 className="font-bold text-[#0a2540] text-lg mb-2">
                  Instant Connection.
                </h4>
                <p className="text-[#425466] text-sm leading-relaxed">
                  Direct WhatsApp and LinkedIn links for fast, transparent communication. No locked messaging systems or hidden contact details.
                </p>
              </div>

              <div className="mt-8 pt-4 border-t border-[#e3e8ee]/80">
                <button
                  onClick={() => handleAction('/home')}
                  className="inline-flex items-center gap-1 font-semibold text-sm text-[#635bff] group-hover:text-[#0a2540] transition-colors"
                >
                  <span>Start direct chat</span>
                  <span aria-hidden="true" className="transform group-hover:translate-x-1 transition-transform">&rsaquo;</span>
                </button>
              </div>
            </div>
          </div>

          {/* ─── CARD 4: Campus Squads (Stripe Connect Emerald Ribbon) ─── */}
          <div
            className="group relative rounded-2xl bg-white border border-[#e3e8ee] hover:border-[#635bff]/60 hover:ring-1 hover:ring-[#635bff]/30 p-7 md:p-8 shadow-[0_2px_4px_rgba(0,0,0,0.02),0_8px_20px_rgba(0,0,0,0.04)] hover:shadow-[0_4px_16px_rgba(99,91,255,0.08),0_16px_36px_rgba(10,37,64,0.06)] transition-all duration-300 flex flex-col justify-between overflow-hidden min-h-[340px]"
          >
            <StripeConnectEmeraldWaveArt />

            <div className="relative z-10 max-w-[66%] flex flex-col justify-between h-full">
              <div>
                <h4 className="font-bold text-[#0a2540] text-lg mb-2">
                  Solo or Campus Squads.
                </h4>
                <p className="text-[#425466] text-sm leading-relaxed">
                  Students can work individually on quick tasks or form multi-member campus squads combining frontend, backend, and UI/UX design.
                </p>
              </div>

              <div className="mt-8 pt-4 border-t border-[#e3e8ee]/80">
                <button
                  onClick={() => handleAction('/about')}
                  className="inline-flex items-center gap-1 font-semibold text-sm text-[#635bff] group-hover:text-[#0a2540] transition-colors"
                >
                  <span>Learn about squads</span>
                  <span aria-hidden="true" className="transform group-hover:translate-x-1 transition-transform">&rsaquo;</span>
                </button>
              </div>
            </div>
          </div>

          {/* ─── CARD 5: Real Proof of Work (Stripe Startups Magenta Wave) ─── */}
          <div
            className="group relative rounded-2xl bg-white border border-[#e3e8ee] hover:border-[#635bff]/60 hover:ring-1 hover:ring-[#635bff]/30 p-7 md:p-8 shadow-[0_2px_4px_rgba(0,0,0,0.02),0_8px_20px_rgba(0,0,0,0.04)] hover:shadow-[0_4px_16px_rgba(99,91,255,0.08),0_16px_36px_rgba(10,37,64,0.06)] transition-all duration-300 flex flex-col justify-between overflow-hidden min-h-[340px]"
          >
            <StripeStartupsWaveArt />

            <div className="relative z-10 max-w-[66%] flex flex-col justify-between h-full">
              <div>
                <h4 className="font-bold text-[#0a2540] text-lg mb-2">
                  Real Commercial Experience.
                </h4>
                <p className="text-[#425466] text-sm leading-relaxed">
                  Students gain verifiable commercial work and production deployments on their resumes, demonstrating practical ability to future employers.
                </p>
              </div>

              <div className="mt-8 pt-4 border-t border-[#e3e8ee]/80">
                <button
                  onClick={() => handleAction('/home')}
                  className="inline-flex items-center gap-1 font-semibold text-sm text-[#635bff] group-hover:text-[#0a2540] transition-colors"
                >
                  <span>View project portfolio</span>
                  <span aria-hidden="true" className="transform group-hover:translate-x-1 transition-transform">&rsaquo;</span>
                </button>
              </div>
            </div>
          </div>

        </div>

      </div>
    </section>
  );
}
