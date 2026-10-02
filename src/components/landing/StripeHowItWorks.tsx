import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  FileText, Compass, UserCheck, MessageSquare,
  Sparkles, Star, CheckCircle2, ShieldCheck,
  Send, Users, DollarSign, ArrowRight
} from 'lucide-react';

interface StepItem {
  step: number;
  title: string;
  desc: string;
}

const CLIENTS_STEPS: StepItem[] = [
  { step: 1, title: 'Post Your Project', desc: 'Describe your project needs such as website, app, design, marketing, or any IT task.' },
  { step: 2, title: 'Discover Top Talent', desc: 'See freelancers sorted by skill, ratings, and availability for solo or team projects.' },
  { step: 3, title: 'Review Profiles', desc: 'Check portfolios, ratings, LinkedIn profiles, and past project experience.' },
  { step: 4, title: 'Connect & Hire', desc: 'Message on WhatsApp or LinkedIn with direct collaboration.' },
];

const FREELANCERS_STEPS: StepItem[] = [
  { step: 1, title: 'Create Your Profile', desc: 'Register your skills, tech stack, experience level, and portfolio links.' },
  { step: 2, title: 'Browse Live Projects', desc: 'See client projects, filter by budget, tech stack, or category.' },
  { step: 3, title: 'Join Solo or as Team', desc: 'Take on projects alone or invite classmates to form a team for bigger gigs.' },
  { step: 4, title: 'Earn & Build Portfolio', desc: 'Get paid real money and add real client projects to your resume.' },
];

export function StripeHowItWorks() {
  const [mode, setMode] = useState<'client' | 'freelancer'>('client');
  const [activeStepIndex, setActiveStepIndex] = useState<number>(0);

  const steps = mode === 'client' ? CLIENTS_STEPS : FREELANCERS_STEPS;
  const currentStep = steps[activeStepIndex] || steps[0];

  const handleTabSwitch = (newMode: 'client' | 'freelancer') => {
    setMode(newMode);
    setActiveStepIndex(0);
  };

  return (
    <section id="how-it-works" className="py-24 md:py-32 px-6 bg-[#f8fafc] relative border-t border-[#e3e8ee]">
      <div className="max-w-[1400px] mx-auto relative z-10">
        
        {/* Header */}
        <div className="flex flex-col md:flex-row md:items-end justify-between mb-16 gap-6">
          <div className="max-w-2xl">
            <div className="text-xs font-semibold uppercase tracking-wider text-[#635bff] mb-3">
              Streamlined Process
            </div>
            <h2 className="text-4xl md:text-5xl lg:text-6xl font-extrabold tracking-tight text-[#0a2540] leading-[1.1]">
              How It Works
            </h2>
            <p className="text-xl md:text-2xl text-[#425466] mt-4 font-normal leading-relaxed">
              Get started in 4 simple steps
            </p>
          </div>

          {/* Stripe-style Pill Switcher on White */}
          <div className="flex items-center bg-white p-1 rounded-full border border-[#e3e8ee] shadow-sm self-start md:self-auto">
            <button
              onClick={() => handleTabSwitch('client')}
              className={`px-6 py-2 rounded-full text-sm font-semibold transition-all duration-200 ${
                mode === 'client'
                  ? 'bg-[#0a2540] text-white shadow-sm'
                  : 'text-[#425466] hover:text-[#0a2540]'
              }`}
            >
              For Clients
            </button>
            <button
              onClick={() => handleTabSwitch('freelancer')}
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

        {/* Dual Column Layout: Steps + Live Inspector */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
          
          {/* Left Column: 4 Step Cards */}
          <div className="lg:col-span-6 space-y-3.5">
            {steps.map((item, idx) => {
              const isActive = activeStepIndex === idx;
              return (
                <div
                  key={item.step}
                  onClick={() => setActiveStepIndex(idx)}
                  className={`group relative rounded-xl p-6 border cursor-pointer transition-all duration-200 ${
                    isActive
                      ? 'bg-white border-[#635bff] shadow-[0_4px_16px_rgba(99,91,255,0.08)]'
                      : 'bg-white border-[#e3e8ee] hover:border-slate-300 hover:shadow-sm'
                  }`}
                >
                  <div className="flex items-start gap-4">
                    <div
                      className={`w-8 h-8 rounded-lg flex items-center justify-center font-mono font-bold text-xs shrink-0 transition-colors ${
                        isActive
                          ? 'bg-[#635bff] text-white'
                          : 'bg-[#f1f5f9] text-[#425466] group-hover:text-[#0a2540]'
                      }`}
                    >
                      0{item.step}
                    </div>

                    <div className="flex-1">
                      <div className="leading-snug">
                        <h4 className="font-bold text-[#0a2540] inline text-base mr-1.5">
                          {item.title}.
                        </h4>
                        <p className="text-[#425466] inline text-sm leading-relaxed">
                          {item.desc}
                        </p>
                      </div>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>

          {/* Right Column: Dynamic Live Visual Inspector on Pure White */}
          <div className="lg:col-span-6 sticky top-24">
            <div className="rounded-2xl border border-[#e3e8ee] bg-white p-7 shadow-[0_2px_4px_rgba(0,0,0,0.02),0_12px_24px_rgba(0,0,0,0.04)] min-h-[440px] flex flex-col justify-between">
              
              {/* Header Badge */}
              <div className="flex items-center justify-between border-b border-[#e3e8ee] pb-4 mb-6">
                <div className="flex items-center gap-2">
                  <div className="w-2.5 h-2.5 rounded-full bg-slate-300" />
                  <div className="w-2.5 h-2.5 rounded-full bg-slate-300" />
                  <div className="w-2.5 h-2.5 rounded-full bg-slate-300" />
                  <span className="ml-2 text-xs font-mono text-[#425466]">
                    live-preview · {mode === 'client' ? 'client_workflow' : 'student_workflow'}
                  </span>
                </div>
                <span className="text-xs font-semibold px-2.5 py-0.5 rounded-full bg-[#635bff]/10 text-[#635bff] border border-[#635bff]/20">
                  Step 0{currentStep.step} of 04
                </span>
              </div>

              {/* Dynamic Preview */}
              <AnimatePresence mode="wait">
                <motion.div
                  key={`${mode}-${currentStep.step}`}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -10 }}
                  transition={{ duration: 0.2 }}
                  className="flex-1 flex flex-col justify-center"
                >
                  {mode === 'client' ? (
                    currentStep.step === 1 ? (
                      <div className="space-y-3.5">
                        <div className="flex items-center gap-2.5 mb-1">
                          <FileText className="w-5 h-5 text-[#635bff]" />
                          <h5 className="font-bold text-[#0a2540] text-sm">Post Project Specifications</h5>
                        </div>
                        <div className="p-4 rounded-xl bg-[#f8fafc] border border-[#e3e8ee] space-y-3">
                          <div>
                            <span className="text-[11px] font-semibold text-[#425466] uppercase">Project Title</span>
                            <div className="bg-white p-2.5 rounded-lg border border-[#e3e8ee] text-xs font-medium text-[#0a2540] mt-1">
                              Custom CRM Dashboard &amp; Landing Page
                            </div>
                          </div>
                          <div className="grid grid-cols-2 gap-2 text-xs">
                            <div className="bg-white p-2 rounded-lg border border-[#e3e8ee]">
                              <span className="text-[10px] text-[#425466] block">Category</span>
                              <span className="font-semibold text-[#0a2540]">Fullstack Web</span>
                            </div>
                            <div className="bg-white p-2 rounded-lg border border-[#e3e8ee]">
                              <span className="text-[10px] text-[#425466] block">Budget</span>
                              <span className="font-bold text-[#635bff] font-mono">₹15,000 – ₹20,000</span>
                            </div>
                          </div>
                        </div>
                      </div>
                    ) : currentStep.step === 2 ? (
                      <div className="space-y-3">
                        <div className="flex items-center gap-2.5 mb-1">
                          <Compass className="w-5 h-5 text-blue-600" />
                          <h5 className="font-bold text-[#0a2540] text-sm">Top Matching Talent</h5>
                        </div>
                        <div className="space-y-2">
                          <div className="p-3.5 rounded-xl bg-[#f8fafc] border border-[#e3e8ee] flex items-center justify-between">
                            <div className="flex items-center gap-3">
                              <div className="w-8 h-8 rounded-full bg-[#635bff]/10 text-[#635bff] font-bold text-xs flex items-center justify-center">RM</div>
                              <div>
                                <p className="text-xs font-bold text-[#0a2540]">Rohan M.</p>
                                <p className="text-[11px] text-[#425466]">React · TypeScript · Tailwind</p>
                              </div>
                            </div>
                            <span className="text-xs font-semibold text-emerald-600 bg-emerald-50 px-2.5 py-1 rounded-full border border-emerald-200">
                              Available
                            </span>
                          </div>
                          <div className="p-3.5 rounded-xl bg-[#f8fafc] border border-[#e3e8ee] flex items-center justify-between">
                            <div className="flex items-center gap-3">
                              <div className="w-8 h-8 rounded-full bg-purple-100 text-purple-600 font-bold text-xs flex items-center justify-center">PS</div>
                              <div>
                                <p className="text-xs font-bold text-[#0a2540]">Pooja S.</p>
                                <p className="text-[11px] text-[#425466]">UI/UX · Figma · Design Systems</p>
                              </div>
                            </div>
                            <span className="text-xs font-semibold text-blue-600 bg-blue-50 px-2.5 py-1 rounded-full border border-blue-200">
                              Top Rated
                            </span>
                          </div>
                        </div>
                      </div>
                    ) : currentStep.step === 3 ? (
                      <div className="space-y-3">
                        <div className="flex items-center gap-2.5 mb-1">
                          <UserCheck className="w-5 h-5 text-purple-600" />
                          <h5 className="font-bold text-[#0a2540] text-sm">Verified Credentials Review</h5>
                        </div>
                        <div className="p-4 rounded-xl bg-[#f8fafc] border border-[#e3e8ee] space-y-3">
                          <div className="flex justify-between items-center">
                            <div>
                              <div className="flex items-center gap-1.5 font-bold text-sm text-[#0a2540]">
                                Kavya I. <ShieldCheck className="w-4 h-4 text-emerald-600" />
                              </div>
                              <span className="text-xs text-[#425466]">B.Tech CS · Class of 2026</span>
                            </div>
                            <div className="flex items-center gap-1 text-xs font-bold text-amber-500">
                              <Star className="w-3.5 h-3.5 fill-amber-500" /> 4.9 (14 reviews)
                            </div>
                          </div>
                          <div className="flex gap-2 text-[11px]">
                            <span className="px-2.5 py-1 rounded bg-white border border-[#e3e8ee] text-[#0a2540]">LinkedIn Verified</span>
                            <span className="px-2.5 py-1 rounded bg-white border border-[#e3e8ee] text-[#0a2540]">8 Shipped Projects</span>
                          </div>
                        </div>
                      </div>
                    ) : (
                      <div className="space-y-3">
                        <div className="flex items-center gap-2.5 mb-1">
                          <MessageSquare className="w-5 h-5 text-emerald-600" />
                          <h5 className="font-bold text-[#0a2540] text-sm">Direct Connect</h5>
                        </div>
                        <div className="p-4 rounded-xl bg-emerald-50/50 border border-emerald-200 space-y-3">
                          <div className="flex justify-between items-center text-xs">
                            <span className="font-bold text-[#0a2540]">Direct WhatsApp Channel</span>
                            <span className="text-emerald-700 font-bold">Direct Connection</span>
                          </div>
                          <p className="text-xs text-[#425466] leading-relaxed">
                            Message directly on WhatsApp, agree on scope, and collaborate friction-free.
                          </p>
                          <div className="py-2.5 rounded-lg bg-emerald-600 text-white font-semibold text-xs flex items-center justify-center gap-2 shadow-sm">
                            <Send className="w-3.5 h-3.5" /> Start Conversation
                          </div>
                        </div>
                      </div>
                    )
                  ) : (
                    currentStep.step === 1 ? (
                      <div className="space-y-3">
                        <div className="flex items-center gap-2.5">
                          <ShieldCheck className="w-5 h-5 text-[#635bff]" />
                          <h5 className="font-bold text-[#0a2540] text-sm">Student Profile Setup</h5>
                        </div>
                        <div className="p-4 rounded-xl bg-[#f8fafc] border border-[#e3e8ee] space-y-2.5">
                          <div className="flex flex-wrap gap-1.5">
                            {['React', 'Node.js', 'Figma', 'TypeScript', 'Tailwind'].map(skill => (
                              <span key={skill} className="px-2 py-0.5 rounded bg-white border border-[#e3e8ee] text-xs font-medium text-[#0a2540]">
                                {skill}
                              </span>
                            ))}
                          </div>
                          <p className="text-xs text-[#425466]">
                            Authenticated university ID and GitHub sync for instant credibility.
                          </p>
                        </div>
                      </div>
                    ) : currentStep.step === 2 ? (
                      <div className="space-y-3">
                        <div className="flex items-center gap-2.5">
                          <FileText className="w-5 h-5 text-blue-600" />
                          <h5 className="font-bold text-[#0a2540] text-sm">Live Client Project Feed</h5>
                        </div>
                        <div className="space-y-2">
                          <div className="p-3 bg-[#f8fafc] border border-[#e3e8ee] rounded-lg">
                            <div className="flex justify-between items-center text-xs font-bold text-[#0a2540] mb-0.5">
                              <span>Clinic Appointment Portal</span>
                              <span className="font-mono text-[#635bff]">₹18,000</span>
                            </div>
                            <span className="text-[11px] text-[#425466]">Tech: React + Supabase</span>
                          </div>
                          <div className="p-3 bg-[#f8fafc] border border-[#e3e8ee] rounded-lg">
                            <div className="flex justify-between items-center text-xs font-bold text-[#0a2540] mb-0.5">
                              <span>Brand Identity &amp; Assets</span>
                              <span className="font-mono text-[#635bff]">₹8,000</span>
                            </div>
                            <span className="text-[11px] text-[#425466]">Tech: Figma + Vector</span>
                          </div>
                        </div>
                      </div>
                    ) : currentStep.step === 3 ? (
                      <div className="space-y-3">
                        <div className="flex items-center gap-2.5">
                          <Users className="w-5 h-5 text-purple-600" />
                          <h5 className="font-bold text-[#0a2540] text-sm">Campus Squads Collaboration</h5>
                        </div>
                        <div className="p-4 bg-[#f8fafc] border border-[#e3e8ee] rounded-xl space-y-2">
                          <div className="flex justify-between text-xs font-semibold text-[#0a2540]">
                            <span>Team Project Capacity</span>
                            <span className="text-purple-600 font-mono">3 Members</span>
                          </div>
                          <p className="text-xs text-[#425466]">
                            Team up with classmates to take on large full-stack enterprise projects.
                          </p>
                        </div>
                      </div>
                    ) : (
                      <div className="space-y-3">
                        <div className="flex items-center gap-2.5">
                          <DollarSign className="w-5 h-5 text-emerald-600" />
                          <h5 className="font-bold text-[#0a2540] text-sm">Verified Earnings &amp; Portfolio</h5>
                        </div>
                        <div className="p-4 bg-emerald-50/50 border border-emerald-200 rounded-xl space-y-2">
                          <div className="flex justify-between items-center text-xs font-bold">
                            <span className="text-[#0a2540]">Monthly Direct Payouts</span>
                            <span className="text-emerald-700 font-mono">₹24,500</span>
                          </div>
                          <p className="text-xs text-[#425466]">
                            Real commercial work on your resume to impress hiring managers.
                          </p>
                        </div>
                      </div>
                    )
                  )}
                </motion.div>
              </AnimatePresence>

              {/* Bottom Card Summary */}
              <div className="pt-4 border-t border-[#e3e8ee] flex items-center justify-between text-xs text-[#425466]">
                <span>{currentStep.title}</span>
                <span className="font-semibold text-[#635bff]">Aaspass Platform</span>
              </div>
            </div>
          </div>

        </div>

      </div>
    </section>
  );
}
