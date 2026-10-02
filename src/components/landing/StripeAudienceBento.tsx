import { CheckCircle2 } from 'lucide-react';
import {
  StripePlatformBlueWaveArt,
  StripeStartupsWaveArt,
} from './BoxBackgroundArt';

interface StripeAudienceBentoProps {
  onClientAction: () => void;
  onFreelancerAction: () => void;
}

export function StripeAudienceBento({ onClientAction, onFreelancerAction }: StripeAudienceBentoProps) {
  return (
    <section className="py-24 md:py-32 px-6 bg-white relative border-t border-[#e3e8ee]">
      <div className="max-w-[1400px] mx-auto">
        
        {/* Section Header */}
        <div className="mb-16 md:mb-20 max-w-3xl">
          <div className="text-xs font-semibold uppercase tracking-wider text-[#635bff] mb-3">
            Two Sides of the Marketplace
          </div>
          <h2 className="text-4xl md:text-5xl lg:text-6xl font-extrabold tracking-tight text-[#0a2540] leading-[1.1]">
            Who is Spotgig for?
          </h2>
          <p className="text-xl md:text-2xl text-[#425466] mt-4 font-normal leading-relaxed">
            Designed for businesses seeking agile technical talent and students building real-world software careers.
          </p>
        </div>

        {/* ─── Stripe-Style Dual Cards with Silk Wave Art & Boundary Glow (Zero Triangles, Zero Badges, Zero Fake Data) ─── */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          
          {/* Card 1: Clients & Business Owners (Clean White, No BG) */}
          <div
            className="group relative rounded-2xl bg-white border border-[#e3e8ee] hover:border-[#635bff]/60 hover:ring-1 hover:ring-[#635bff]/30 p-8 md:p-10 shadow-[0_2px_4px_rgba(0,0,0,0.02),0_8px_20px_rgba(0,0,0,0.04)] hover:shadow-[0_4px_16px_rgba(99,91,255,0.08),0_16px_36px_rgba(10,37,64,0.06)] transition-all duration-300 flex flex-col justify-between overflow-hidden"
          >
            <div className="relative z-10 w-full">
              {/* Stripe Inline Title and Description */}
              <div className="mb-6">
                <h4 className="font-bold text-[#0a2540] inline text-2xl mr-1.5 leading-snug">
                  Clients &amp; Business Owners.
                </h4>
                <p className="text-[#425466] inline text-base leading-relaxed">
                  Need a responsive website, mobile application, or technical task completed? Post your requirements and connect with skilled students. Fast delivery, transparent rates, and direct communication.
                </p>
              </div>

              {/* Genuine Value Points (No Badges, No Fake Reviews) */}
              <div className="space-y-3 mb-8">
                {[
                  'Direct WhatsApp and LinkedIn connection with student creators',
                  'Clear milestone-based agreements with zero intermediary platform fees',
                  'Collaborate with individual specialists or assembled campus project squads'
                ].map((item, idx) => (
                  <div key={idx} className="flex items-start gap-3 text-sm text-[#425466]">
                    <CheckCircle2 className="w-4 h-4 text-emerald-500 shrink-0 mt-0.5" />
                    <span>{item}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* Action Button */}
            <div className="relative z-10 mt-4">
              <button
                onClick={onClientAction}
                className="w-full sm:w-auto py-3.5 px-8 rounded-xl bg-[#0a2540] hover:bg-[#1a385c] text-white font-semibold text-sm transition-all duration-200 flex items-center justify-center shadow-sm"
              >
                <span>Post a Project</span>
              </button>
            </div>
          </div>

          {/* Card 2: Students & Freelancers */}
          <div
            className="group relative rounded-2xl bg-white border border-[#e3e8ee] hover:border-[#635bff]/60 hover:ring-1 hover:ring-[#635bff]/30 p-8 md:p-10 shadow-[0_2px_4px_rgba(0,0,0,0.02),0_8px_20px_rgba(0,0,0,0.04)] hover:shadow-[0_4px_16px_rgba(99,91,255,0.08),0_16px_36px_rgba(10,37,64,0.06)] transition-all duration-300 flex flex-col justify-between overflow-hidden"
          >
            {/* Luminous Startups Magenta Silk Wave (No Triangle) */}
            <StripeStartupsWaveArt />

            <div className="relative z-10 max-w-[68%]">
              {/* Stripe Inline Title and Description */}
              <div className="mb-6">
                <h4 className="font-bold text-[#0a2540] inline text-2xl mr-1.5 leading-snug">
                  Students &amp; Freelancers.
                </h4>
                <p className="text-[#425466] inline text-base leading-relaxed">
                  University students, engineering builders, and designers: showcase your verified GitHub repositories, work with real local businesses, and build a competitive portfolio before graduating.
                </p>
              </div>

              {/* Genuine Value Points (No Badges, No Fake Reviews) */}
              <div className="space-y-3 mb-8">
                {[
                  'Keep 100% of your earnings with zero platform cuts on client payouts',
                  'Build verified proof of work and real production code on your resume',
                  'Tackle projects independently or assemble project squads with classmates'
                ].map((item, idx) => (
                  <div key={idx} className="flex items-start gap-3 text-sm text-[#425466]">
                    <CheckCircle2 className="w-4 h-4 text-purple-600 shrink-0 mt-0.5" />
                    <span>{item}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* Action Button */}
            <div className="relative z-10 mt-4">
              <button
                onClick={onFreelancerAction}
                className="w-full sm:w-auto py-3.5 px-8 rounded-xl bg-[#635bff] hover:bg-[#534be8] text-white font-semibold text-sm transition-all duration-200 flex items-center justify-center shadow-sm"
              >
                <span>Register as Freelancer</span>
              </button>
            </div>
          </div>

        </div>

      </div>
    </section>
  );
}
