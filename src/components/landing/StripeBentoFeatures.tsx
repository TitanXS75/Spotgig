
import {
  Users, Zap, GraduationCap, ShieldCheck,
  UserCheck, CheckCircle2,
  Gauge
} from 'lucide-react';

const CHART_BAR_HEIGHTS = [
  15, 25, 45, 60, 35, 70, 85, 40, 55, 30,
  65, 80, 95, 75, 50, 85, 100, 70, 60, 45,
  55, 65, 50, 75, 85, 90, 100, 80, 65, 75, 85
];

export function StripeBentoFeatures() {
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
            Features designed for the next generation of freelancing. Connect, collaborate, and build credibility with direct student-business partnerships.
          </p>
        </div>

        {/* ─── Bento Grid ─── */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">

          {/* ─── CARD 1: Large Featured Card with Stripe's Silk Wave Background ─── */}
          {/* Reference: Stripe "Accept and optimise payments globally – online and in person" */}
          <div
            className="lg:col-span-2 group relative rounded-2xl bg-[#f8fafc] border border-[#e3e8ee] p-8 md:p-10 shadow-[0_2px_4px_rgba(0,0,0,0.02),0_10px_24px_rgba(0,0,0,0.04)] hover:shadow-[0_4px_8px_rgba(0,0,0,0.04),0_16px_36px_rgba(0,0,0,0.08)] hover:border-slate-300 transition-all duration-300 flex flex-col justify-between overflow-hidden min-h-[380px]"
          >
            {/* Stripe Signature Silk Wave Background Image */}
            <div className="absolute inset-0 pointer-events-none overflow-hidden">
              <img
                src="https://images.stripeassets.com/fzn2n1nzq965/vYmk6v8n7oDAwbDpwhjV6/846f9b3e214549b8f14e2b8c8cfe9343/payment-bento-background.jpg?w=860&fm=webp&q=80"
                alt=""
                className="w-full h-full object-cover object-center opacity-80 group-hover:scale-105 transition-transform duration-700"
              />
              <div className="absolute inset-0 bg-gradient-to-r from-white/95 via-white/80 to-transparent" />
            </div>

            {/* Top Row: Eyebrow + Stripe Bento Dialog Entry Icon */}
            <div className="relative z-10 flex items-center justify-between mb-4">
              <span className="text-[11px] font-semibold uppercase tracking-wider text-[#635bff] bg-white/90 backdrop-blur-sm px-3 py-1 rounded-full border border-[#e3e8ee] shadow-sm">
                Campus Network
              </span>

              {/* Stripe's Exact Bento Card Corner Icon */}
              <div className="w-8 h-8 rounded-full bg-white/90 border border-[#e3e8ee] flex items-center justify-center text-[#425466] shadow-sm">
                <svg width="16" height="16" viewBox="0 0 20 20" fill="none" xmlns="http://www.w3.org/2000/svg">
                  <path d="M13.75 6.75L10.25 6.75L10.25 5L15.5 5L15.5 10.25L13.75 10.25L13.75 6.75Z" fill="currentColor"></path>
                  <path d="M6.75 10.25L5 10.25L5 15.5L10.25 15.5L10.25 13.75L6.75 13.75L6.75 10.25Z" fill="currentColor"></path>
                </svg>
              </div>
            </div>

            {/* Content */}
            <div className="relative z-10 max-w-xl">
              <h3 className="text-2xl md:text-3xl font-extrabold text-[#0a2540] tracking-tight leading-snug">
                On-Demand Student Talent.
              </h3>
              <p className="text-[#425466] text-base md:text-lg mt-2 leading-relaxed">
                Find skilled university students and early-career specialists ready for your project. Real-time availability connects you with verified campus builders immediately.
              </p>

              {/* Floating Talent Preview Over Wave */}
              <div className="mt-6 p-4 rounded-xl bg-white/90 backdrop-blur-md border border-[#e3e8ee] shadow-sm flex items-center justify-between max-w-md">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-[#635bff]/10 text-[#635bff] font-bold flex items-center justify-center text-sm">
                    AK
                  </div>
                  <div>
                    <div className="flex items-center gap-1.5">
                      <span className="text-xs font-bold text-[#0a2540]">Aarav Kumar</span>
                      <ShieldCheck className="w-3.5 h-3.5 text-emerald-600" />
                    </div>
                    <p className="text-[11px] text-[#425466]">B.Tech CS · Fullstack Dev · 4.9 ★</p>
                  </div>
                </div>
                <span className="text-[11px] font-semibold text-emerald-700 bg-emerald-50 px-2.5 py-1 rounded-full border border-emerald-200">
                  Available Now
                </span>
              </div>
            </div>

            {/* Action */}
            <div className="relative z-10 mt-8 pt-4 border-t border-[#e3e8ee]/80 flex items-center text-sm font-semibold text-[#635bff] group-hover:text-[#0a2540] transition-colors">
              <span>Explore student talent</span>
            </div>
          </div>

          {/* ─── CARD 2: Exact Stripe "Enable any billing model" Card Design ─── */}
          {/* Reference: Pro Plan + Usage Meter + 30-day vertical bar chart */}
          <div
            className="group relative rounded-2xl bg-white border border-[#e3e8ee] p-7 md:p-8 shadow-[0_2px_4px_rgba(0,0,0,0.02),0_10px_24px_rgba(0,0,0,0.04)] hover:shadow-[0_4px_8px_rgba(0,0,0,0.04),0_16px_36px_rgba(0,0,0,0.08)] hover:border-slate-300 transition-all duration-300 flex flex-col justify-between"
          >
            <div>
              {/* Header */}
              <div className="flex items-center justify-between mb-4">
                <span className="text-[11px] font-semibold uppercase tracking-wider text-[#635bff] bg-[#635bff]/5 px-2.5 py-1 rounded-full border border-[#635bff]/15">
                  Flexible Delivery
                </span>
                <div className="w-7 h-7 rounded-full bg-[#f8fafc] border border-[#e3e8ee] flex items-center justify-center text-[#425466]">
                  <svg width="14" height="14" viewBox="0 0 20 20" fill="none" xmlns="http://www.w3.org/2000/svg">
                    <path d="M13.75 6.75L10.25 6.75L10.25 5L15.5 5L15.5 10.25L13.75 10.25L13.75 6.75Z" fill="currentColor"></path>
                    <path d="M6.75 10.25L5 10.25L5 15.5L10.25 15.5L10.25 13.75L6.75 13.75L6.75 10.25Z" fill="currentColor"></path>
                  </svg>
                </div>
              </div>

              {/* Title & Description */}
              <h4 className="font-bold text-[#0a2540] text-lg mb-1">
                Enable any project model.
              </h4>
              <p className="text-[#425466] text-sm leading-relaxed mb-5">
                Support fixed milestones, sprint deliverables, or group contracts with direct peer payouts.
              </p>

              {/* ─── Stripe-Style Plan Graphic Widget ─── */}
              <div className="space-y-3 p-4 rounded-xl bg-[#f8fafc] border border-[#e3e8ee]">
                {/* Plan Overview */}
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <div className="w-7 h-7 rounded-lg bg-[#635bff] text-white flex items-center justify-center">
                      <Zap className="w-4 h-4 fill-white" />
                    </div>
                    <div>
                      <div className="text-xs font-bold text-[#0a2540]">Milestone Plan</div>
                      <div className="text-[10px] text-[#425466]">Direct Payout (UPI / Bank)</div>
                    </div>
                  </div>
                  <span className="text-xs font-mono font-bold text-[#635bff]">₹14,000</span>
                </div>

                {/* Usage / Progress Meter */}
                <div className="space-y-1.5 pt-1">
                  <div className="flex items-center justify-between text-[11px]">
                    <span className="text-[#425466] flex items-center gap-1 font-medium">
                      <Gauge className="w-3 h-3 text-[#635bff]" /> Delivery Progress
                    </span>
                    <span className="font-mono text-[#0a2540] font-bold">78%</span>
                  </div>
                  <div className="h-1.5 w-full bg-[#e3e8ee] rounded-full overflow-hidden">
                    <div className="h-full bg-gradient-to-r from-[#635bff] to-indigo-400 rounded-full w-[78%]" />
                  </div>
                </div>

                {/* 30-Day Activity Bar Chart (Exact Stripe Style) */}
                <div className="pt-2 border-t border-[#e3e8ee]/80">
                  <div className="text-[10px] text-[#425466] mb-2 font-medium">
                    Activity &amp; commits in the last 30 days
                  </div>
                  <div className="flex items-end gap-[3px] h-9 w-full">
                    {CHART_BAR_HEIGHTS.slice(0, 24).map((height, i) => (
                      <div
                        key={i}
                        className="flex-1 bg-[#635bff]/25 hover:bg-[#635bff] rounded-t-sm transition-colors cursor-pointer"
                        style={{ height: `${height}%` }}
                        title={`Day ${i + 1}: ${height}% activity`}
                      />
                    ))}
                  </div>
                </div>
              </div>
            </div>

            {/* Action */}
            <div className="mt-6 pt-4 border-t border-[#e3e8ee]/80 flex items-center text-sm font-semibold text-[#635bff] group-hover:text-[#0a2540] transition-colors">
              <span>Explore project models</span>
            </div>
          </div>

          {/* ─── CARD 3: Instant Connection ─── */}
          <div
            className="group relative rounded-2xl bg-white border border-[#e3e8ee] p-7 md:p-8 shadow-[0_2px_4px_rgba(0,0,0,0.02),0_10px_24px_rgba(0,0,0,0.04)] hover:shadow-[0_4px_8px_rgba(0,0,0,0.04),0_16px_36px_rgba(0,0,0,0.08)] hover:border-slate-300 transition-all duration-300 flex flex-col justify-between"
          >
            <div>
              <div className="flex items-center justify-between mb-4">
                <span className="text-[11px] font-semibold uppercase tracking-wider text-amber-600 bg-amber-50 px-2.5 py-1 rounded-full border border-amber-200">
                  Zero Friction
                </span>
                <div className="w-7 h-7 rounded-full bg-[#f8fafc] border border-[#e3e8ee] flex items-center justify-center text-[#425466]">
                  <svg width="14" height="14" viewBox="0 0 20 20" fill="none" xmlns="http://www.w3.org/2000/svg">
                    <path d="M13.75 6.75L10.25 6.75L10.25 5L15.5 5L15.5 10.25L13.75 10.25L13.75 6.75Z" fill="currentColor"></path>
                    <path d="M6.75 10.25L5 10.25L5 15.5L10.25 15.5L10.25 13.75L6.75 13.75L6.75 10.25Z" fill="currentColor"></path>
                  </svg>
                </div>
              </div>

              <h4 className="font-bold text-[#0a2540] text-lg mb-1">
                Instant Connection.
              </h4>
              <p className="text-[#425466] text-sm leading-relaxed mb-5">
                Direct WhatsApp and LinkedIn links for zero friction communication. Connect with freelancers immediately.
              </p>

              {/* Chat Simulation Snippet */}
              <div className="p-3.5 rounded-xl bg-[#f8fafc] border border-[#e3e8ee] space-y-2 text-xs">
                <div className="p-2.5 rounded-lg bg-white border border-[#e3e8ee] text-[#0a2540]">
                  <p className="text-[10px] font-bold text-[#635bff] mb-0.5">Direct Message</p>
                  "Hi! Can you build our landing page with React and Tailwind?"
                </div>
                <div className="p-2.5 rounded-lg bg-[#635bff]/10 border border-[#635bff]/20 text-[#0a2540]">
                  <p className="text-[10px] font-bold text-emerald-600 mb-0.5 flex items-center gap-1">
                    Student Reply <CheckCircle2 className="w-3 h-3 text-emerald-500" />
                  </p>
                  "Yes! Available to start this week. Reviewing your brief now."
                </div>
              </div>
            </div>

            <div className="mt-6 pt-4 border-t border-[#e3e8ee]/80 flex items-center text-sm font-semibold text-[#635bff] group-hover:text-[#0a2540] transition-colors">
              <span>Start direct chats</span>
            </div>
          </div>

          {/* ─── CARD 4: Solo or Team Projects ─── */}
          <div
            className="group relative rounded-2xl bg-white border border-[#e3e8ee] p-7 md:p-8 shadow-[0_2px_4px_rgba(0,0,0,0.02),0_10px_24px_rgba(0,0,0,0.04)] hover:shadow-[0_4px_8px_rgba(0,0,0,0.04),0_16px_36px_rgba(0,0,0,0.08)] hover:border-slate-300 transition-all duration-300 flex flex-col justify-between"
          >
            <div>
              <div className="flex items-center justify-between mb-4">
                <span className="text-[11px] font-semibold uppercase tracking-wider text-purple-600 bg-purple-50 px-2.5 py-1 rounded-full border border-purple-200">
                  Campus Squads
                </span>
                <div className="w-7 h-7 rounded-full bg-[#f8fafc] border border-[#e3e8ee] flex items-center justify-center text-[#425466]">
                  <svg width="14" height="14" viewBox="0 0 20 20" fill="none" xmlns="http://www.w3.org/2000/svg">
                    <path d="M13.75 6.75L10.25 6.75L10.25 5L15.5 5L15.5 10.25L13.75 10.25L13.75 6.75Z" fill="currentColor"></path>
                    <path d="M6.75 10.25L5 10.25L5 15.5L10.25 15.5L10.25 13.75L6.75 13.75L6.75 10.25Z" fill="currentColor"></path>
                  </svg>
                </div>
              </div>

              <h4 className="font-bold text-[#0a2540] text-lg mb-1">
                Solo or Team Projects.
              </h4>
              <p className="text-[#425466] text-sm leading-relaxed mb-5">
                Students can work individually or form groups to take on bigger, more complex client projects.
              </p>

              <div className="p-4 rounded-xl bg-[#f8fafc] border border-[#e3e8ee]">
                <div className="flex items-center justify-between text-xs font-semibold text-[#0a2540] mb-2">
                  <span>Squad Formation</span>
                  <span className="text-purple-600 font-mono text-[11px]">3 Members</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="flex -space-x-2">
                    <div className="w-7 h-7 rounded-full bg-blue-500 text-white font-bold text-[10px] flex items-center justify-center ring-2 ring-white">L</div>
                    <div className="w-7 h-7 rounded-full bg-purple-500 text-white font-bold text-[10px] flex items-center justify-center ring-2 ring-white">D</div>
                    <div className="w-7 h-7 rounded-full bg-emerald-500 text-white font-bold text-[10px] flex items-center justify-center ring-2 ring-white">B</div>
                  </div>
                  <span className="text-[11px] text-[#425466]">Frontend + UI/UX + Backend</span>
                </div>
              </div>
            </div>

            <div className="mt-6 pt-4 border-t border-[#e3e8ee]/80 flex items-center text-sm font-semibold text-[#635bff] group-hover:text-[#0a2540] transition-colors">
              <span>Form a project squad</span>
            </div>
          </div>

          {/* ─── CARD 5: Real Experience ─── */}
          <div
            className="group relative rounded-2xl bg-white border border-[#e3e8ee] p-7 md:p-8 shadow-[0_2px_4px_rgba(0,0,0,0.02),0_10px_24px_rgba(0,0,0,0.04)] hover:shadow-[0_4px_8px_rgba(0,0,0,0.04),0_16px_36px_rgba(0,0,0,0.08)] hover:border-slate-300 transition-all duration-300 flex flex-col justify-between"
          >
            <div>
              <div className="flex items-center justify-between mb-4">
                <span className="text-[11px] font-semibold uppercase tracking-wider text-blue-600 bg-blue-50 px-2.5 py-1 rounded-full border border-blue-200">
                  Proof of Work
                </span>
                <div className="w-7 h-7 rounded-full bg-[#f8fafc] border border-[#e3e8ee] flex items-center justify-center text-[#425466]">
                  <svg width="14" height="14" viewBox="0 0 20 20" fill="none" xmlns="http://www.w3.org/2000/svg">
                    <path d="M13.75 6.75L10.25 6.75L10.25 5L15.5 5L15.5 10.25L13.75 10.25L13.75 6.75Z" fill="currentColor"></path>
                    <path d="M6.75 10.25L5 10.25L5 15.5L10.25 15.5L10.25 13.75L6.75 13.75L6.75 10.25Z" fill="currentColor"></path>
                  </svg>
                </div>
              </div>

              <h4 className="font-bold text-[#0a2540] text-lg mb-1">
                Real Experience.
              </h4>
              <p className="text-[#425466] text-sm leading-relaxed mb-5">
                Students gain portfolio worthy work and real income, not just internship certificates.
              </p>

              <div className="p-4 rounded-xl bg-[#f8fafc] border border-[#e3e8ee] space-y-2">
                <div className="flex items-center justify-between text-xs">
                  <span className="font-bold text-[#0a2540]">E-Commerce Redesign</span>
                  <span className="font-mono font-bold text-[#635bff]">₹12,000 Payout</span>
                </div>
                <p className="text-[11px] text-[#425466]">
                  ⭐⭐⭐⭐⭐ "Delivered exceptional UI and clean code in under a week."
                </p>
              </div>
            </div>

            <div className="mt-6 pt-4 border-t border-[#e3e8ee]/80 flex items-center text-sm font-semibold text-[#635bff] group-hover:text-[#0a2540] transition-colors">
              <span>Browse student portfolios</span>
            </div>
          </div>

          {/* ─── CARD 6: Verified Profiles ─── */}
          <div
            className="group relative rounded-2xl bg-white border border-[#e3e8ee] p-7 md:p-8 shadow-[0_2px_4px_rgba(0,0,0,0.02),0_10px_24px_rgba(0,0,0,0.04)] hover:shadow-[0_4px_8px_rgba(0,0,0,0.04),0_16px_36px_rgba(0,0,0,0.08)] hover:border-slate-300 transition-all duration-300 flex flex-col justify-between"
          >
            <div>
              <div className="flex items-center justify-between mb-4">
                <span className="text-[11px] font-semibold uppercase tracking-wider text-emerald-600 bg-emerald-50 px-2.5 py-1 rounded-full border border-emerald-200">
                  Trust &amp; Identity
                </span>
                <div className="w-7 h-7 rounded-full bg-[#f8fafc] border border-[#e3e8ee] flex items-center justify-center text-[#425466]">
                  <svg width="14" height="14" viewBox="0 0 20 20" fill="none" xmlns="http://www.w3.org/2000/svg">
                    <path d="M13.75 6.75L10.25 6.75L10.25 5L15.5 5L15.5 10.25L13.75 10.25L13.75 6.75Z" fill="currentColor"></path>
                    <path d="M6.75 10.25L5 10.25L5 15.5L10.25 15.5L10.25 13.75L6.75 13.75L6.75 10.25Z" fill="currentColor"></path>
                  </svg>
                </div>
              </div>

              <h4 className="font-bold text-[#0a2540] text-lg mb-1">
                Verified Profiles.
              </h4>
              <p className="text-[#425466] text-sm leading-relaxed mb-5">
                Profile links to college and LinkedIn for trust. Clients know exactly who they're working with.
              </p>

              <div className="p-4 rounded-xl bg-[#f8fafc] border border-[#e3e8ee] space-y-2">
                <div className="flex items-center gap-2">
                  <ShieldCheck className="w-4 h-4 text-emerald-600" />
                  <span className="text-xs font-bold text-[#0a2540]">Verified University ID</span>
                </div>
                <p className="text-[11px] text-[#425466]">
                  National Institute of Tech · B.Tech 2026 · LinkedIn Linked
                </p>
              </div>
            </div>

            <div className="mt-6 pt-4 border-t border-[#e3e8ee]/80 flex items-center text-sm font-semibold text-[#635bff] group-hover:text-[#0a2540] transition-colors">
              <span>Check credentials</span>
            </div>
          </div>

        </div>

      </div>
    </section>
  );
}
