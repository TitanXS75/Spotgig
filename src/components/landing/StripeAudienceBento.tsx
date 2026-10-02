import { motion } from 'framer-motion';
import {
  Briefcase, GraduationCap, ArrowRight,
  CheckCircle2, Building2, TrendingUp, Users
} from 'lucide-react';

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
            Who is Aaspass for?
          </h2>
          <p className="text-xl md:text-2xl text-[#425466] mt-4 font-normal leading-relaxed">
            Designed for businesses seeking agile technical talent and students building real-world software careers.
          </p>
        </div>

        {/* ─── Stripe-Style Dual Program Cards ─── */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          
          {/* Card 1: Clients & Business Owners */}
          <motion.div
            initial={{ opacity: 0, y: 16 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.4 }}
            className="group relative rounded-2xl bg-white border border-[#e3e8ee] p-8 md:p-10 shadow-[0_2px_4px_rgba(0,0,0,0.02),0_10px_24px_rgba(0,0,0,0.04)] hover:shadow-[0_4px_8px_rgba(0,0,0,0.04),0_16px_36px_rgba(0,0,0,0.08)] hover:border-slate-300 transition-all duration-300 flex flex-col justify-between"
          >
            <div>
              <div className="flex items-center justify-between mb-6">
                <div className="w-12 h-12 rounded-xl bg-[#f8fafc] border border-[#e3e8ee] flex items-center justify-center text-[#0a2540]">
                  <Briefcase className="w-6 h-6 text-[#635bff]" />
                </div>
                <span className="text-xs font-semibold uppercase tracking-wider text-[#635bff] bg-[#635bff]/5 px-3 py-1 rounded-full border border-[#635bff]/15">
                  For Businesses
                </span>
              </div>

              {/* Stripe Inline Title and Description */}
              <div className="mb-6">
                <h4 className="font-bold text-[#0a2540] inline text-2xl mr-1.5">
                  Clients &amp; Business Owners.
                </h4>
                <p className="text-[#425466] inline text-base leading-relaxed">
                  Need a website, app, or tech project done? Post it here and find talented students. Affordable rates, real skills, direct collaboration.
                </p>
              </div>

              {/* Checkmarks */}
              <div className="space-y-3 mb-8">
                {[
                  'Business owners wanting a digital presence',
                  'Experienced professionals seeking project guidance',
                  'Startups needing part-time tech help'
                ].map((item, idx) => (
                  <div key={idx} className="flex items-center gap-3 text-sm text-[#425466]">
                    <CheckCircle2 className="w-4 h-4 text-emerald-500 shrink-0" />
                    <span>{item}</span>
                  </div>
                ))}
              </div>

              {/* Mini Showcase Card */}
              <div className="p-4 rounded-xl bg-[#f8fafc] border border-[#e3e8ee] mb-8 space-y-2">
                <div className="flex items-center justify-between text-xs font-semibold text-[#0a2540]">
                  <span className="flex items-center gap-1.5">
                    <Building2 className="w-4 h-4 text-[#635bff]" /> Retail Point of Sale App
                  </span>
                  <span className="text-emerald-600 font-bold font-mono">Completed</span>
                </div>
                <p className="text-xs text-[#425466]">
                  "Hired 2 B.Tech student developers. Delivered our inventory and checkout web app on time and on budget."
                </p>
              </div>
            </div>

            {/* Stripe Action Link Button */}
            <button
              onClick={onClientAction}
              className="group/btn w-full py-3.5 px-6 rounded-xl bg-[#0a2540] hover:bg-[#1a385c] text-white font-semibold text-sm transition-all duration-200 flex items-center justify-center gap-2 shadow-sm"
            >
              <span>Post a Project</span>
              <ArrowRight className="w-4 h-4 transition-transform duration-200 group-hover/btn:translate-x-1" />
            </button>
          </motion.div>

          {/* Card 2: Students & Freelancers */}
          <motion.div
            initial={{ opacity: 0, y: 16 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.4, delay: 0.1 }}
            className="group relative rounded-2xl bg-white border border-[#e3e8ee] p-8 md:p-10 shadow-[0_2px_4px_rgba(0,0,0,0.02),0_10px_24px_rgba(0,0,0,0.04)] hover:shadow-[0_4px_8px_rgba(0,0,0,0.04),0_16px_36px_rgba(0,0,0,0.08)] hover:border-slate-300 transition-all duration-300 flex flex-col justify-between"
          >
            <div>
              <div className="flex items-center justify-between mb-6">
                <div className="w-12 h-12 rounded-xl bg-[#f8fafc] border border-[#e3e8ee] flex items-center justify-center text-purple-600">
                  <GraduationCap className="w-6 h-6 text-purple-600" />
                </div>
                <span className="text-xs font-semibold uppercase tracking-wider text-purple-600 bg-purple-50 px-3 py-1 rounded-full border border-purple-200">
                  For Campus Builders
                </span>
              </div>

              {/* Stripe Inline Title and Description */}
              <div className="mb-6">
                <h4 className="font-bold text-[#0a2540] inline text-2xl mr-1.5">
                  Students &amp; Freelancers.
                </h4>
                <p className="text-[#425466] inline text-base leading-relaxed">
                  College students, B.Tech engineers, MBA grads, and vibe coders: register your skills and earn real money from real clients. Work solo or team up!
                </p>
              </div>

              {/* Checkmarks */}
              <div className="space-y-3 mb-8">
                {[
                  'Students wanting part-time income',
                  'Coders building their first portfolio',
                  'Teams who want to tackle bigger projects'
                ].map((item, idx) => (
                  <div key={idx} className="flex items-center gap-3 text-sm text-[#425466]">
                    <CheckCircle2 className="w-4 h-4 text-purple-600 shrink-0" />
                    <span>{item}</span>
                  </div>
                ))}
              </div>

              {/* Mini Showcase Card */}
              <div className="p-4 rounded-xl bg-[#f8fafc] border border-[#e3e8ee] mb-8 space-y-2">
                <div className="flex items-center justify-between text-xs font-semibold text-[#0a2540]">
                  <span className="flex items-center gap-1.5">
                    <TrendingUp className="w-4 h-4 text-purple-600" /> Dev Portfolio Momentum
                  </span>
                  <span className="text-purple-600 font-bold font-mono">₹24,000 Earned</span>
                </div>
                <p className="text-xs text-[#425466]">
                  "Built 3 commercial client projects during 3rd semester. Landed off-campus interviews through verified portfolio links."
                </p>
              </div>
            </div>

            {/* Stripe Action Link Button */}
            <button
              onClick={onFreelancerAction}
              className="group/btn w-full py-3.5 px-6 rounded-xl bg-[#635bff] hover:bg-[#534be8] text-white font-semibold text-sm transition-all duration-200 flex items-center justify-center gap-2 shadow-sm"
            >
              <span>Register as Freelancer</span>
              <ArrowRight className="w-4 h-4 transition-transform duration-200 group-hover/btn:translate-x-1" />
            </button>
          </motion.div>

        </div>

      </div>
    </section>
  );
}
