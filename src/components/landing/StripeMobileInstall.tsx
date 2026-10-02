
import {
  Share2, PlusSquare, MoreVertical, DownloadCloud,
  CheckCircle2, Smartphone
} from 'lucide-react';

export function StripeMobileInstall() {
  return (
    <section className="py-24 md:py-32 px-6 bg-white relative border-t border-[#e3e8ee]">
      <div className="max-w-[1400px] mx-auto">
        
        {/* Header (Centered) */}
        <div className="text-center max-w-3xl mx-auto mb-16 md:mb-20 flex flex-col items-center">
          <div className="text-xs font-semibold uppercase tracking-wider text-[#635bff] mb-3">
            Mobile Experience
          </div>
          <h2 className="text-4xl md:text-5xl lg:text-6xl font-extrabold tracking-tight text-[#0a2540] leading-[1.1]">
            Get the App on Your Phone
          </h2>
          <p className="text-xl md:text-2xl text-[#425466] mt-4 font-normal leading-relaxed max-w-2xl">
            Add Spotgig directly to your home screen for fast, one tap access with zero downloads or app store updates needed.
          </p>
        </div>

        {/* Dual Device Program Cards (Centered) */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 max-w-5xl mx-auto">
          
          {/* iOS Card */}
          <div
            className="group relative rounded-2xl bg-white border border-[#e3e8ee] p-8 shadow-[0_2px_4px_rgba(0,0,0,0.02),0_10px_24px_rgba(0,0,0,0.04)] hover:shadow-[0_4px_8px_rgba(0,0,0,0.04),0_16px_36px_rgba(0,0,0,0.08)] hover:border-slate-300 transition-all duration-300 flex flex-col justify-between"
          >
            <div>
              {/* Header */}
              <div className="flex items-center justify-between pb-5 mb-6 border-b border-[#e3e8ee]">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-[#f8fafc] border border-[#e3e8ee] flex items-center justify-center">
                    <img
                      src="https://upload.wikimedia.org/wikipedia/commons/f/fa/Apple_logo_black.svg"
                      alt="Apple logo"
                      className="h-5 w-auto object-contain opacity-90"
                    />
                  </div>
                  <div>
                    <h4 className="text-base font-bold text-[#0a2540]">Apple iOS</h4>
                    <p className="text-xs text-[#425466]">Safari browser</p>
                  </div>
                </div>
                <span className="text-xs font-semibold px-2.5 py-1 rounded-full bg-[#f8fafc] text-[#425466] border border-[#e3e8ee]">
                  iOS Setup
                </span>
              </div>

              {/* Steps */}
              <div className="space-y-3">
                <div className="flex items-center gap-3 p-3 rounded-xl bg-[#f8fafc] border border-[#e3e8ee]">
                  <span className="w-6 h-6 rounded-md bg-white text-[#0a2540] font-mono text-xs font-bold flex items-center justify-center shrink-0 border border-[#e3e8ee]">
                    1
                  </span>
                  <span className="text-sm text-[#0a2540] font-medium">
                    Open Spotgig in your Safari browser
                  </span>
                </div>

                <div className="flex items-center gap-3 p-3 rounded-xl bg-[#f8fafc] border border-[#e3e8ee]">
                  <span className="w-6 h-6 rounded-md bg-white text-[#0a2540] font-mono text-xs font-bold flex items-center justify-center shrink-0 border border-[#e3e8ee]">
                    2
                  </span>
                  <span className="text-sm text-[#0a2540] font-medium flex items-center gap-1.5 flex-wrap">
                    Tap the Share button <Share2 className="w-4 h-4 text-[#635bff] inline" /> in the bottom bar
                  </span>
                </div>

                <div className="flex items-center gap-3 p-3 rounded-xl bg-[#f8fafc] border border-[#e3e8ee]">
                  <span className="w-6 h-6 rounded-md bg-white text-[#0a2540] font-mono text-xs font-bold flex items-center justify-center shrink-0 border border-[#e3e8ee]">
                    3
                  </span>
                  <span className="text-sm text-[#0a2540] font-medium flex items-center gap-1.5 flex-wrap">
                    Select "Add to Home Screen" <PlusSquare className="w-4 h-4 text-[#635bff] inline" />
                  </span>
                </div>

                <div className="flex items-center gap-3 p-3 rounded-xl bg-[#f8fafc] border border-[#e3e8ee]">
                  <span className="w-6 h-6 rounded-md bg-white text-[#0a2540] font-mono text-xs font-bold flex items-center justify-center shrink-0 border border-[#e3e8ee]">
                    4
                  </span>
                  <span className="text-sm text-[#0a2540] font-medium">
                    Tap Add in top right to launch anytime
                  </span>
                </div>
              </div>
            </div>

            <div className="mt-6 pt-4 border-t border-[#e3e8ee] flex items-center gap-2 text-xs text-[#425466]">
              <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
              <span>Instant launch · Offline cache · Zero storage usage</span>
            </div>
          </div>

          {/* Android Card */}
          <div
            className="group relative rounded-2xl bg-white border border-[#e3e8ee] p-8 shadow-[0_2px_4px_rgba(0,0,0,0.02),0_10px_24px_rgba(0,0,0,0.04)] hover:shadow-[0_4px_8px_rgba(0,0,0,0.04),0_16px_36px_rgba(0,0,0,0.08)] hover:border-slate-300 transition-all duration-300 flex flex-col justify-between"
          >
            <div>
              {/* Header */}
              <div className="flex items-center justify-between pb-5 mb-6 border-b border-[#e3e8ee]">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-[#f8fafc] border border-[#e3e8ee] flex items-center justify-center">
                    <img
                      src="https://upload.wikimedia.org/wikipedia/commons/d/d7/Android_robot.svg"
                      alt="Android logo"
                      className="h-5 w-auto object-contain"
                    />
                  </div>
                  <div>
                    <h4 className="text-base font-bold text-[#0a2540]">Android</h4>
                    <p className="text-xs text-[#425466]">Chrome &amp; Edge browsers</p>
                  </div>
                </div>
                <span className="text-xs font-semibold px-2.5 py-1 rounded-full bg-[#f8fafc] text-[#425466] border border-[#e3e8ee]">
                  Android Setup
                </span>
              </div>

              {/* Steps */}
              <div className="space-y-3">
                <div className="flex items-center gap-3 p-3 rounded-xl bg-[#f8fafc] border border-[#e3e8ee]">
                  <span className="w-6 h-6 rounded-md bg-white text-[#0a2540] font-mono text-xs font-bold flex items-center justify-center shrink-0 border border-[#e3e8ee]">
                    1
                  </span>
                  <span className="text-sm text-[#0a2540] font-medium">
                    Open Spotgig in your Chrome or browser
                  </span>
                </div>

                <div className="flex items-center gap-3 p-3 rounded-xl bg-[#f8fafc] border border-[#e3e8ee]">
                  <span className="w-6 h-6 rounded-md bg-white text-[#0a2540] font-mono text-xs font-bold flex items-center justify-center shrink-0 border border-[#e3e8ee]">
                    2
                  </span>
                  <span className="text-sm text-[#0a2540] font-medium flex items-center gap-1.5 flex-wrap">
                    Tap the Menu icon <MoreVertical className="w-4 h-4 text-[#635bff] inline" /> (three dots) at top right
                  </span>
                </div>

                <div className="flex items-center gap-3 p-3 rounded-xl bg-[#f8fafc] border border-[#e3e8ee]">
                  <span className="w-6 h-6 rounded-md bg-white text-[#0a2540] font-mono text-xs font-bold flex items-center justify-center shrink-0 border border-[#e3e8ee]">
                    3
                  </span>
                  <span className="text-sm text-[#0a2540] font-medium flex items-center gap-1.5 flex-wrap">
                    Select "Install app" or "Add to Home screen" <DownloadCloud className="w-4 h-4 text-[#635bff] inline" />
                  </span>
                </div>

                <div className="flex items-center gap-3 p-3 rounded-xl bg-[#f8fafc] border border-[#e3e8ee]">
                  <span className="w-6 h-6 rounded-md bg-white text-[#0a2540] font-mono text-xs font-bold flex items-center justify-center shrink-0 border border-[#e3e8ee]">
                    4
                  </span>
                  <span className="text-sm text-[#0a2540] font-medium">
                    Confirm Install when prompted to finish
                  </span>
                </div>
              </div>
            </div>

            <div className="mt-6 pt-4 border-t border-[#e3e8ee] flex items-center gap-2 text-xs text-[#425466]">
              <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
              <span>One tap access · Fast performance · Real time updates</span>
            </div>
          </div>

        </div>

      </div>
    </section>
  );
}
