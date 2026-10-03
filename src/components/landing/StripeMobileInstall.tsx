import React, { useState } from 'react';
import {
  Share2, PlusSquare, MoreVertical, DownloadCloud,
  CheckCircle2, QrCode, ArrowUpRight,
  Smartphone, MessageCircle, MapPin, Wifi, BatteryCharging,
  CreditCard, ShieldCheck, Zap
} from 'lucide-react';
import {
  StripeSessionsCosmicArt,
  StripeConnectEmeraldWaveArt,
  StripePlatformBlueWaveArt,
} from './BoxBackgroundArt';

export function StripeMobileInstall() {
  const [activePlatform, setActivePlatform] = useState<'ios' | 'android'>('ios');
  const [showQrModal, setShowQrModal] = useState(false);

  return (
    <section className="py-24 md:py-32 px-6 bg-white relative border-t border-[#e3e8ee] overflow-hidden">
      <div className="max-w-[1400px] mx-auto">
        
        {/* Section Header */}
        <div className="text-center max-w-3xl mx-auto mb-16 md:mb-20 flex flex-col items-center">
          <div className="text-xs font-semibold uppercase tracking-wider text-[#635bff] mb-3 flex items-center gap-1.5">
            <Smartphone className="w-3.5 h-3.5" />
            <span>Mobile Platform &amp; Talent Card</span>
          </div>
          <h2 className="text-4xl md:text-5xl lg:text-6xl font-extrabold tracking-tight text-[#0a2540] leading-[1.1]">
            Spotgig in Your Pocket
          </h2>
          <p className="text-xl md:text-2xl text-[#425466] mt-4 font-normal leading-relaxed max-w-2xl">
            Instant access to verified student talent, live hyperlocal gigs, and direct WhatsApp communication right from your smartphone.
          </p>
        </div>

        {/* Master Bento Layout: Phone & Card Showcase on Left, Clean Action Cards on Right */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-stretch max-w-6xl mx-auto">
          
          {/* ─────────────────────────────────────────────────────────────
              COL 1 (lg:col-span-7): 3D PHONE MOCKUP & ISSUED TALENT CARD
              (Zero badges, Flush hardware side buttons)
             ───────────────────────────────────────────────────────────── */}
          <div className="lg:col-span-7 group relative rounded-3xl bg-[#fcfdfe] border border-[#e3e8ee] hover:border-[#635bff]/60 hover:ring-1 hover:ring-[#635bff]/30 p-6 md:p-8 shadow-[0_4px_12px_rgba(0,0,0,0.03),0_16px_36px_rgba(10,37,64,0.05)] hover:shadow-[0_12px_32px_rgba(99,91,255,0.1),0_24px_64px_rgba(10,37,64,0.08)] transition-all duration-500 overflow-hidden flex flex-col justify-between h-full">
            
            {/* Luminous Stripe Background Silk Wave */}
            <StripePlatformBlueWaveArt />

            {/* Top Bar inside Card (Zero Badges, No Divider Line) */}
            <div className="relative z-10 flex items-center justify-between mb-4 sm:mb-6">
              <div>
                <h3 className="text-xl font-bold text-[#0a2540] tracking-tight">
                  Mobile Talent Pass &amp; Live App
                </h3>
                <p className="text-sm text-[#425466] mt-0.5">
                  Native device speed · Hyperlocal radar · Direct WhatsApp outreach
                </p>
              </div>
            </div>

            {/* 3D Realistic Elongated Phone Mockup Container */}
            <div className="relative z-10 flex items-center justify-center py-2 my-auto">
              
              {/* Perspective Shell */}
              <div className="relative [perspective:1400px]">
                
                {/* 3D Smartphone Device Mockup with Elongated 19.5:9 Flagship Proportions */}
                <div className="relative w-[285px] sm:w-[305px] h-[570px] sm:h-[600px] rounded-[50px] p-[10px] bg-gradient-to-b from-[#3a4454] via-[#1e293b] to-[#0f172a] shadow-[0_30px_70px_-15px_rgba(10,37,64,0.45),0_0_0_1px_rgba(255,255,255,0.18)] transition-transform duration-500 ease-out group-hover:[transform:rotateY(-3deg)_rotateX(2deg)_translateY(-4px)]">
                  
                  {/* Hardware Side Buttons */}
                  {/* Left: Action Button */}
                  <div className="absolute -left-[4px] top-24 w-[4px] h-7 bg-slate-500 rounded-l-sm shadow-sm" />
                  {/* Left: Volume Up */}
                  <div className="absolute -left-[4px] top-36 w-[4px] h-12 bg-slate-500 rounded-l-sm shadow-sm" />
                  {/* Left: Volume Down */}
                  <div className="absolute -left-[4px] top-52 w-[4px] h-12 bg-slate-500 rounded-l-sm shadow-sm" />
                  {/* Right: Power / Lock Button */}
                  <div className="absolute -right-[4px] top-36 w-[4px] h-16 bg-slate-500 rounded-r-sm shadow-sm" />

                  {/* Antenna Bands */}
                  <div className="absolute -left-[2px] top-20 w-[2px] h-1.5 bg-[#475569]/80" />
                  <div className="absolute -right-[2px] top-20 w-[2px] h-1.5 bg-[#475569]/80" />
                  <div className="absolute -left-[2px] bottom-20 w-[2px] h-1.5 bg-[#475569]/80" />
                  <div className="absolute -right-[2px] bottom-20 w-[2px] h-1.5 bg-[#475569]/80" />

                  {/* Inner Screen Chassis */}
                  <div className="relative w-full h-full rounded-[43px] bg-slate-950 overflow-hidden border border-slate-800/90 shadow-inner flex flex-col justify-between">
                    
                    {/* Glass Glare Sheen Reflection across screen */}
                    <div className="absolute inset-0 pointer-events-none bg-gradient-to-tr from-transparent via-white/[0.03] to-white/[0.12] z-30" />

                    {/* Top Status & Dynamic Island Area */}
                    <div className="relative z-40">
                      {/* Dynamic Island & Speaker Bar */}
                      <div className="pt-3 pb-1.5 px-6 flex items-center justify-between text-[11px] font-semibold text-slate-300 select-none">
                        <span>9:41</span>
                        
                        {/* Realistic Dynamic Island pill */}
                        <div className="w-28 h-6 bg-black rounded-full flex items-center justify-between px-3 shadow-md border border-slate-800/80">
                          {/* Dual camera lens & optical glass reflection */}
                          <div className="flex items-center gap-1.5">
                            <div className="w-2.5 h-2.5 rounded-full bg-slate-950 border border-slate-700/80 flex items-center justify-center">
                              <div className="w-1 h-1 rounded-full bg-indigo-500/60 ring-1 ring-blue-400/40" />
                            </div>
                            <div className="w-1.5 h-1.5 rounded-full bg-slate-900 border border-slate-800" />
                          </div>
                          
                          {/* Live Activity privacy indicator */}
                          <div className="w-1.5 h-1.5 rounded-full bg-emerald-500/90 shadow-[0_0_6px_rgba(16,185,129,0.9)]" />
                        </div>

                        {/* Cellular, Wi-Fi & Battery Status */}
                        <div className="flex items-center gap-1.5 text-slate-300">
                          <span className="text-[9px] font-bold tracking-tight text-slate-400">5G</span>
                          <Wifi className="w-3 h-3 text-slate-300" />
                          <div className="w-4 h-2.5 rounded-[3px] border border-slate-400 p-[1px] flex items-center">
                            <div className="w-full h-full bg-slate-200 rounded-[1px]" />
                          </div>
                        </div>
                      </div>

                      {/* App Header */}
                      <div className="px-4 pt-1 pb-2 flex items-center justify-between border-b border-slate-900">
                        <div className="flex items-center gap-2">
                          <div className="w-6 h-6 rounded-lg bg-gradient-to-tr from-[#635bff] to-[#00d4ff] flex items-center justify-center font-bold text-[10px] text-white shadow-sm">
                            S
                          </div>
                          <div>
                            <div className="text-xs font-bold text-white leading-tight">Spotgig</div>
                            <div className="text-[9px] text-slate-400 flex items-center gap-0.5">
                              <MapPin className="w-2.5 h-2.5 text-[#635bff]" />
                              <span>North Campus · 1.2 km</span>
                            </div>
                          </div>
                        </div>

                        <div className="flex items-center gap-2">
                          <span className="text-[9px] font-semibold px-2 py-0.5 rounded-full bg-emerald-500/15 text-emerald-400 border border-emerald-500/30">
                            Live Radar
                          </span>
                        </div>
                      </div>
                    </div>

                    {/* App Internal Body - Elongated Vertical Layout */}
                    <div className="relative z-20 px-4 py-2 flex flex-col gap-2.5 text-left flex-1 overflow-hidden">
                      
                      {/* Search Bar */}
                      <div className="w-full py-1.5 px-3 rounded-xl bg-slate-900 border border-slate-800 flex items-center justify-between text-slate-400 text-[10px]">
                        <span>Search gigs, squads, clients...</span>
                        <span className="text-[9px] text-[#635bff] font-bold">Filter</span>
                      </div>

                      {/* ─── DIGITAL STUDENT TALENT CARD (CARD ISSUING MOCKUP) ─── */}
                      <div className="relative rounded-2xl p-3.5 bg-gradient-to-br from-[#1e1b4b] via-[#0f172a] to-[#31104b] border border-white/15 shadow-[0_8px_20px_rgba(0,0,0,0.4)] overflow-hidden group/card">
                        
                        {/* Metallic / Iridescent Sheen on Card */}
                        <div className="absolute -top-12 -right-12 w-28 h-28 bg-[#635bff]/25 rounded-full blur-2xl pointer-events-none" />
                        <div className="absolute bottom-0 right-0 w-32 h-16 bg-[#00d4ff]/15 rounded-full blur-xl pointer-events-none" />

                        {/* Card Top Row: Chip & Contactless */}
                        <div className="flex items-center justify-between mb-2 relative z-10">
                          {/* Realistic Metallic Smart Chip */}
                          <div className="w-7 h-5 rounded bg-gradient-to-tr from-[#e2b053] via-[#ffeb99] to-[#c89230] p-1 border border-[#a8741e]/50 shadow-inner flex flex-col justify-between">
                            <div className="w-full h-[1px] bg-[#916216]/60" />
                            <div className="w-full h-[1px] bg-[#916216]/60" />
                          </div>
                          
                          <div className="flex items-center gap-1.5">
                            <svg className="w-3.5 h-3.5 text-slate-300" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                              <path d="M8.5 16.5a5 5 0 0 1 0-9" />
                              <path d="M12 19a8.5 8.5 0 0 0 0-14" />
                              <path d="M15.5 21.5a12 12 0 0 0 0-19" />
                            </svg>
                            <span className="text-[9px] font-mono tracking-widest text-slate-300 uppercase">
                              Spotgig Pass
                            </span>
                          </div>
                        </div>

                        {/* Card Balance / Escrow status */}
                        <div className="relative z-10">
                          <div className="text-[9px] text-slate-300 uppercase tracking-wider font-medium">
                            Escrow Balance
                          </div>
                          <div className="text-lg font-extrabold text-white font-mono tracking-tight flex items-baseline gap-2">
                            <span>₹24,500</span>
                            <span className="text-[9px] text-emerald-400 font-sans font-medium">● 2 Active Gigs</span>
                          </div>
                        </div>

                        {/* Card Bottom Row: Cardholder & Number */}
                        <div className="mt-2.5 pt-2 border-t border-white/10 flex items-center justify-between text-[9px] relative z-10">
                          <div>
                            <div className="text-[8px] text-slate-400 uppercase">Verified Student Talent</div>
                            <div className="font-semibold text-slate-200">Aryan Sharma · Fullstack</div>
                          </div>
                          <div className="font-mono text-slate-300 tracking-wider">
                            •••• 9024
                          </div>
                        </div>
                      </div>

                      {/* Live Hyperlocal Gig Match Feed in Phone */}
                      <div className="space-y-2 mt-0.5">
                        <div className="flex items-center justify-between text-[10px]">
                          <span className="font-bold text-white">Nearby Open Projects</span>
                          <span className="text-[9px] text-[#00d4ff] font-medium">Within 3 km</span>
                        </div>

                        {/* Gig 1 */}
                        <div className="p-2.5 rounded-xl bg-slate-900/90 border border-slate-800 hover:border-slate-700 transition-colors">
                          <div className="flex items-start justify-between">
                            <div>
                              <div className="text-xs font-bold text-slate-100">
                                E-Commerce Store &amp; Next.js
                              </div>
                              <div className="text-[9px] text-slate-400 mt-0.5">
                                Cafe North Hub · 1.2 km away
                              </div>
                            </div>
                            <span className="text-xs font-bold text-emerald-400 font-mono">
                              ₹18,000
                            </span>
                          </div>
                          <div className="mt-2 flex items-center justify-between pt-1.5 border-t border-slate-800/80">
                            <span className="text-[8px] text-slate-400">Milestone Escrow</span>
                            <button
                              type="button"
                              className="px-2.5 py-1 rounded-md bg-[#25D366] hover:bg-[#20ba59] text-white text-[9px] font-bold flex items-center gap-1 shadow-sm transition-transform active:scale-95"
                            >
                              <MessageCircle className="w-2.5 h-2.5" />
                              <span>WhatsApp</span>
                            </button>
                          </div>
                        </div>

                        {/* Gig 2 */}
                        <div className="p-2.5 rounded-xl bg-slate-900/90 border border-slate-800 hover:border-slate-700 transition-colors">
                          <div className="flex items-start justify-between">
                            <div>
                              <div className="text-xs font-bold text-slate-100">
                                Brand Identity &amp; UI Kit
                              </div>
                              <div className="text-[9px] text-slate-400 mt-0.5">
                                Studio Arc · 800m away
                              </div>
                            </div>
                            <span className="text-xs font-bold text-emerald-400 font-mono">
                              ₹10,500
                            </span>
                          </div>
                          <div className="mt-2 flex items-center justify-between pt-1.5 border-t border-slate-800/80">
                            <span className="text-[8px] text-slate-400">Fixed Milestone</span>
                            <button
                              type="button"
                              className="px-2.5 py-1 rounded-md bg-[#25D366] hover:bg-[#20ba59] text-white text-[9px] font-bold flex items-center gap-1 shadow-sm transition-transform active:scale-95"
                            >
                              <MessageCircle className="w-2.5 h-2.5" />
                              <span>WhatsApp</span>
                            </button>
                          </div>
                        </div>

                        {/* Gig 3 */}
                        <div className="p-2 rounded-xl bg-slate-900/60 border border-slate-800/80 text-left">
                          <div className="flex items-center justify-between">
                            <div>
                              <div className="text-[11px] font-bold text-slate-200">
                                Mobile App Flutter Prototype
                              </div>
                              <div className="text-[8px] text-slate-400">TechFoundry · 2.4 km</div>
                            </div>
                            <span className="text-[11px] font-bold text-emerald-400 font-mono">₹22,000</span>
                          </div>
                        </div>
                      </div>

                    </div>

                    {/* Phone Bottom Dock & Home Indicator */}
                    <div className="relative z-20 pt-2 pb-1 bg-slate-950/95 border-t border-slate-900 flex flex-col justify-center">
                      <div className="flex items-center justify-around text-slate-400 text-[10px] pb-1">
                        <span className="text-[#635bff] font-bold">Discover</span>
                        <span>Projects</span>
                        <div className="relative">
                          <span>Chats</span>
                          <span className="absolute -top-1 -right-2 w-1.5 h-1.5 rounded-full bg-[#635bff]" />
                        </div>
                        <span>Wallet</span>
                      </div>

                      {/* iOS Home Indicator Bar */}
                      <div className="w-28 h-1 bg-white/40 rounded-full mx-auto my-1.5" />
                    </div>

                  </div>
                </div>

                {/* Companion Floating Physical Card (Zero Badges) */}
                <div className="hidden sm:block absolute -right-10 md:-right-12 bottom-12 w-[220px] rounded-2xl p-4 bg-gradient-to-tr from-[#0a2540] via-[#111c30] to-[#1e1b4b] border border-white/20 shadow-[0_20px_40px_rgba(10,37,64,0.45)] [transform:rotate(10deg)_translateY(-10px)] group-hover:[transform:rotate(6deg)_translateY(-16px)] transition-all duration-500 z-30 pointer-events-none">
                  <div className="flex items-center justify-between mb-3">
                    <span className="text-[10px] font-mono tracking-widest text-[#00d4ff] uppercase font-bold">
                      Physical Card Pass
                    </span>
                    <Zap className="w-3.5 h-3.5 text-amber-400" />
                  </div>
                  <div className="text-xs font-bold text-white">Spotgig Verified Talent</div>
                  <div className="text-[9px] text-slate-400 mt-0.5">Tap-to-Share Portfolio via NFC</div>
                  <div className="mt-3 pt-2 border-t border-white/10 flex items-center justify-between text-[9px] font-mono text-slate-300">
                    <span>DELHI · NCR</span>
                    <span className="text-slate-300">•••• 9024</span>
                  </div>
                </div>

              </div>

            </div>

            {/* Bottom Status Row */}
            <div className="relative z-10 pt-4 border-t border-[#e3e8ee] flex flex-wrap items-center justify-between gap-3 text-xs text-[#425466]">
              <div className="flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                <span>Zero app store install delay · Works on iOS &amp; Android instantly</span>
              </div>
              <button
                type="button"
                onClick={() => setShowQrModal(true)}
                className="inline-flex items-center gap-1.5 text-xs font-semibold text-[#635bff] hover:text-[#0a2540] transition-colors"
              >
                <QrCode className="w-3.5 h-3.5" />
                <span>Scan QR to Launch</span>
              </button>
            </div>
          </div>

          {/* ─────────────────────────────────────────────────────────────
              COL 2 (lg:col-span-5): 2 STRIPE-STYLE CLEAN BENTO CARDS
              (Zero badges, Simple & Elegant Minimalist Typography)
             ───────────────────────────────────────────────────────────── */}
          <div className="lg:col-span-5 flex flex-col justify-between gap-6 lg:gap-8 h-full">
            
            {/* ─── CARD 1: PWA INSTANT LAUNCH (Simple & Elegant, Zero Badges, Clean White) ─── */}
            <div className="group relative rounded-3xl bg-white border border-[#e3e8ee] hover:border-[#635bff]/60 hover:ring-1 hover:ring-[#635bff]/30 p-7 lg:p-8 shadow-[0_2px_4px_rgba(0,0,0,0.02),0_8px_20px_rgba(0,0,0,0.04)] hover:shadow-[0_8px_24px_rgba(99,91,255,0.08),0_16px_40px_rgba(10,37,64,0.06)] transition-all duration-300 overflow-hidden flex-1 flex flex-col justify-between">
              <div className="relative z-10">
                
                {/* Platform Switcher Buttons: Apple / Apple iOS & Android / Android */}
                <div className="grid grid-cols-2 gap-3 mb-6">
                  {/* Apple / Apple iOS */}
                  <button
                    type="button"
                    onClick={() => setActivePlatform('ios')}
                    className={`p-3 rounded-2xl border text-left transition-all flex items-center gap-3 ${
                      activePlatform === 'ios'
                        ? 'bg-[#f8fafc] border-[#635bff] shadow-sm'
                        : 'bg-white border-[#e3e8ee] hover:border-slate-300'
                    }`}
                  >
                    <div className="w-8 h-8 rounded-xl bg-white border border-[#e3e8ee] flex items-center justify-center shrink-0">
                      <img
                        src="https://upload.wikimedia.org/wikipedia/commons/f/fa/Apple_logo_black.svg"
                        alt="Apple"
                        className="h-4 w-auto object-contain opacity-90"
                      />
                    </div>
                    <div>
                      <div className="text-xs font-bold text-[#0a2540] leading-tight">Apple</div>
                      <div className="text-[11px] text-[#425466]">Apple iOS</div>
                    </div>
                  </button>

                  {/* Android / Android */}
                  <button
                    type="button"
                    onClick={() => setActivePlatform('android')}
                    className={`p-3 rounded-2xl border text-left transition-all flex items-center gap-3 ${
                      activePlatform === 'android'
                        ? 'bg-[#f8fafc] border-[#635bff] shadow-sm'
                        : 'bg-white border-[#e3e8ee] hover:border-slate-300'
                    }`}
                  >
                    <div className="w-8 h-8 rounded-xl bg-white border border-[#e3e8ee] flex items-center justify-center shrink-0">
                      <img
                        src="https://upload.wikimedia.org/wikipedia/commons/d/d7/Android_robot.svg"
                        alt="Android"
                        className="h-4 w-auto object-contain"
                      />
                    </div>
                    <div>
                      <div className="text-xs font-bold text-[#0a2540] leading-tight">Android</div>
                      <div className="text-[11px] text-[#425466]">Android</div>
                    </div>
                  </button>
                </div>

                {/* Eyebrow & Title */}
                <div className="text-xs font-semibold uppercase tracking-wider text-[#635bff] mb-1">
                  PWA Instant Launch
                </div>
                <h4 className="text-2xl font-bold text-[#0a2540] tracking-tight">
                  {activePlatform === 'ios' ? 'Install via Safari' : 'Install via Chrome'}
                </h4>
                <p className="text-sm text-[#425466] mt-1 mb-6 leading-relaxed">
                  Add Spotgig to your phone with zero downloads and full offline caching.
                </p>

                {/* Numbered Steps - Clean & Typographic, Zero Clutter */}
                <div className="space-y-4">
                  {activePlatform === 'ios' ? (
                    <>
                      {/* Step 1 */}
                      <div className="flex items-start gap-3.5">
                        <span className="w-6 h-6 rounded-full bg-[#f4f6f8] text-[#0a2540] font-mono text-xs font-bold flex items-center justify-center shrink-0 border border-[#e3e8ee] mt-0.5">
                          1
                        </span>
                        <div>
                          <p className="text-sm font-medium text-[#0a2540] leading-snug">
                            Open in Safari &amp; tap Share
                          </p>
                        </div>
                      </div>

                      {/* Step 2 */}
                      <div className="flex items-start gap-3.5">
                        <span className="w-6 h-6 rounded-full bg-[#f4f6f8] text-[#0a2540] font-mono text-xs font-bold flex items-center justify-center shrink-0 border border-[#e3e8ee] mt-0.5">
                          2
                        </span>
                        <div>
                          <p className="text-sm font-medium text-[#0a2540] leading-snug">
                            Tap <strong>"Add to Home Screen"</strong>
                          </p>
                        </div>
                      </div>

                      {/* Step 3 */}
                      <div className="flex items-start gap-3.5">
                        <span className="w-6 h-6 rounded-full bg-[#f4f6f8] text-[#0a2540] font-mono text-xs font-bold flex items-center justify-center shrink-0 border border-[#e3e8ee] mt-0.5">
                          3
                        </span>
                        <div>
                          <p className="text-sm font-medium text-[#0a2540] leading-snug">
                            Tap "Add" in top right to launch anytime
                          </p>
                        </div>
                      </div>
                    </>
                  ) : (
                    <>
                      {/* Android Step 1 */}
                      <div className="flex items-start gap-3.5">
                        <span className="w-6 h-6 rounded-full bg-[#f4f6f8] text-[#0a2540] font-mono text-xs font-bold flex items-center justify-center shrink-0 border border-[#e3e8ee] mt-0.5">
                          1
                        </span>
                        <div>
                          <p className="text-sm font-medium text-[#0a2540] leading-snug">
                            Open in Chrome &amp; tap menu (three dots)
                          </p>
                        </div>
                      </div>

                      {/* Android Step 2 */}
                      <div className="flex items-start gap-3.5">
                        <span className="w-6 h-6 rounded-full bg-[#f4f6f8] text-[#0a2540] font-mono text-xs font-bold flex items-center justify-center shrink-0 border border-[#e3e8ee] mt-0.5">
                          2
                        </span>
                        <div>
                          <p className="text-sm font-medium text-[#0a2540] leading-snug">
                            Tap <strong>"Install app"</strong> or "Add to Home screen"
                          </p>
                        </div>
                      </div>

                      {/* Android Step 3 */}
                      <div className="flex items-start gap-3.5">
                        <span className="w-6 h-6 rounded-full bg-[#f4f6f8] text-[#0a2540] font-mono text-xs font-bold flex items-center justify-center shrink-0 border border-[#e3e8ee] mt-0.5">
                          3
                        </span>
                        <div>
                          <p className="text-sm font-medium text-[#0a2540] leading-snug">
                            Confirm Install to launch directly from your home screen
                          </p>
                        </div>
                      </div>
                    </>
                  )}
                </div>

              </div>

              {/* Footer Note */}
              <div className="relative z-10 mt-6 pt-4 border-t border-[#e3e8ee] flex items-center justify-between text-xs text-[#425466]">
                <div className="flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                  <span className="font-semibold text-[#0a2540]">Zero storage needed</span>
                </div>
                <span>Offline caching enabled</span>
              </div>
            </div>

            {/* ─── CARD 2: STUDENT TALENT CARD PROGRAMME (Zero Badges) ─── */}
            <div className="group relative rounded-3xl bg-white border border-[#e3e8ee] hover:border-[#635bff]/60 hover:ring-1 hover:ring-[#635bff]/30 p-7 lg:p-8 shadow-[0_2px_4px_rgba(0,0,0,0.02),0_8px_20px_rgba(0,0,0,0.04)] hover:shadow-[0_8px_24px_rgba(99,91,255,0.08),0_16px_40px_rgba(10,37,64,0.06)] transition-all duration-300 overflow-hidden flex-1 flex flex-col justify-between">
              
              {/* Luminous Stripe Emerald Ribbon Silk Wave */}
              <StripeConnectEmeraldWaveArt />

              <div className="relative z-10">
                <div className="text-xs font-semibold uppercase tracking-wider text-emerald-700 mb-1">
                  Student Talent Programme
                </div>

                <h4 className="text-2xl font-bold text-[#0a2540] tracking-tight">
                  Instant Talent Card Issuance
                </h4>
                <p className="text-sm text-[#425466] mt-1.5 leading-relaxed">
                  Every enrolled college student receives an instant digital freelancing pass upon university email verification.
                </p>

                <div className="mt-5 space-y-2.5">
                  <div className="flex items-center gap-2.5 text-xs text-[#0a2540] font-medium">
                    <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                    <span>0% commission on campus freelance gigs</span>
                  </div>
                  <div className="flex items-center gap-2.5 text-xs text-[#0a2540] font-medium">
                    <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                    <span>Razorpay &amp; UPI milestone escrow protection</span>
                  </div>
                  <div className="flex items-center gap-2.5 text-xs text-[#0a2540] font-medium">
                    <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                    <span>Direct WhatsApp client messaging without middleman fees</span>
                  </div>
                </div>
              </div>

              <div className="relative z-10 mt-6 pt-4 border-t border-[#e3e8ee] flex items-center justify-between">
                <a
                  href="/auth?tab=signup"
                  className="text-xs font-bold text-[#635bff] hover:text-[#0a2540] flex items-center gap-1 group/btn"
                >
                  <span>Claim Your Student Card</span>
                  <ArrowUpRight className="w-3.5 h-3.5 transition-transform group-hover/btn:translate-x-0.5 group-hover/btn:-translate-y-0.5" />
                </a>
                <span className="text-[11px] text-[#425466]">Free for students</span>
              </div>
            </div>

          </div>

        </div>

      </div>

      {/* QR Modal for instant phone camera scan */}
      {showQrModal && (
        <div
          className="fixed inset-0 z-50 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4 animate-in fade-in duration-200"
          onClick={() => setShowQrModal(false)}
        >
          <div
            className="bg-white rounded-3xl p-6 md:p-8 max-w-sm w-full shadow-2xl border border-[#e3e8ee] text-center"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="w-12 h-12 rounded-2xl bg-[#f0f3f8] flex items-center justify-center mx-auto mb-4 text-[#635bff]">
              <QrCode className="w-6 h-6" />
            </div>
            <h3 className="text-xl font-bold text-[#0a2540]">Scan with Your Phone</h3>
            <p className="text-xs text-[#425466] mt-1.5 mb-6">
              Point your smartphone camera at this QR code to open Spotgig directly in Safari or Chrome.
            </p>

            <div className="p-4 rounded-2xl bg-[#f8fafc] border border-[#e3e8ee] inline-block mb-6">
              <img
                src={`https://api.qrserver.com/v1/create-qr-code/?size=180x180&data=${encodeURIComponent(
                  window.location.origin
                )}`}
                alt="Scan to launch Spotgig"
                className="w-44 h-44 object-contain rounded-lg mx-auto"
              />
            </div>

            <button
              type="button"
              onClick={() => setShowQrModal(false)}
              className="w-full py-2.5 rounded-xl bg-[#0a2540] hover:bg-[#1a365d] text-white text-xs font-bold transition-colors"
            >
              Close
            </button>
          </div>
        </div>
      )}
    </section>
  );
}
