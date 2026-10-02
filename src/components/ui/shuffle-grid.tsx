"use client"

import { motion } from "framer-motion";
import { useEffect, useRef, useState } from "react";
import { Compass } from "lucide-react";
import { cn } from "@/lib/utils";

const squareData = [
  { id: 1, src: "https://images.unsplash.com/photo-1586023492125-27b2c045efd7?w=900&auto=format&fit=crop&q=60" },
  { id: 2, src: "https://images.unsplash.com/photo-1567620905732-2d1ec7ab7445?w=600&auto=format&fit=crop&q=60" },
  { id: 3, src: "https://images.unsplash.com/photo-1581578731548-c64695cc6952?w=600&auto=format&fit=crop&q=60" },
  { id: 4, src: "https://images.unsplash.com/photo-1423666639041-f56000c27a9a?w=600&auto=format&fit=crop&q=60" },
  { id: 5, src: "https://images.unsplash.com/photo-1544367567-0f2fcb009e0b?w=600&auto=format&fit=crop&q=60" },
  { id: 6, src: "https://images.unsplash.com/photo-1460518451285-97b6aa326961?w=600&auto=format&fit=crop&q=60" },
  { id: 7, src: "https://images.unsplash.com/photo-1560066984-138dadb4c035?w=600&auto=format&fit=crop&q=60" },
  { id: 8, src: "https://images.unsplash.com/photo-1512621776951-a57141f2eefd?w=600&auto=format&fit=crop&q=60" },
  { id: 9, src: "https://images.unsplash.com/photo-1606787366850-de6330128bfc?w=600&auto=format&fit=crop&q=60" },
  { id: 10, src: "https://images.unsplash.com/photo-1516975080664-ed2fc6a32937?w=600&auto=format&fit=crop&q=60" },
  { id: 11, src: "https://images.unsplash.com/photo-1562240020-ce31ccb0fa7d?w=600&auto=format&fit=crop&q=60" },
  { id: 12, src: "https://images.unsplash.com/photo-1517248135467-4c7edcad34c4?w=600&auto=format&fit=crop&q=60" },
  { id: 13, src: "https://images.unsplash.com/photo-1621905252507-b35492cc74b4?w=600&auto=format&fit=crop&q=60" },
  { id: 14, src: "https://images.unsplash.com/photo-1449965408869-eaa3f722e40d?w=600&auto=format&fit=crop&q=60" },
  { id: 15, src: "https://images.unsplash.com/photo-1540189549336-e6e99c3679fe?w=600&auto=format&fit=crop&q=60" },
  { id: 16, src: "https://images.unsplash.com/photo-1534452203293-494d7ddbf7e0?w=600&auto=format&fit=crop&q=60" },
];

const shuffle = (array: (typeof squareData)[0][]) => {
  let currentIndex = array.length;
  let randomIndex;

  while (currentIndex !== 0) {
    randomIndex = Math.floor(Math.random() * currentIndex);
    currentIndex--;
    [array[currentIndex], array[randomIndex]] = [array[randomIndex], array[currentIndex]];
  }

  return array;
};

const generateSquares = () => {
  return shuffle([...squareData]).map((sq) => (
    <motion.div
      key={sq.id}
      layout
      transition={{ duration: 1.5, type: "spring" }}
      className="w-full h-full rounded-md overflow-hidden bg-muted"
      style={{
        backgroundImage: `url(${sq.src})`,
        backgroundSize: "cover",
        backgroundPosition: "center",
      }}
    />
  ));
};

const ShuffleGrid = () => {
  const timeoutRef = useRef<NodeJS.Timeout | null>(null);
  const [squares, setSquares] = useState<JSX.Element[]>(generateSquares());

  useEffect(() => {
    const shuffleSquares = () => {
      setSquares(generateSquares());
      timeoutRef.current = setTimeout(shuffleSquares, 3000);
    };

    shuffleSquares();

    return () => {
      if (timeoutRef.current) clearTimeout(timeoutRef.current);
    };
  }, []);

  return (
    <div className="grid grid-cols-4 grid-rows-4 h-[450px] gap-1 sm:h-[500px] md:h-[520px]">
      {squares}
    </div>
  );
};

type ShuffleHeroProps = {
  onGetStarted?: () => void;
  onExploreMarketplace?: () => void;
};

export const ShuffleHero = ({ onGetStarted, onExploreMarketplace }: ShuffleHeroProps) => {
  return (
    <div className="relative w-full bg-white overflow-hidden border-b border-[#e3e8ee]">
      {/* ─── Stripe Signature Pre-Dawn Sunrise Gradient Wave Effect ─── */}
      <div className="absolute inset-0 pointer-events-none overflow-hidden" aria-hidden="true">
        {/* Luminous Pre-Dawn Sunrise Diagonal Canvas */}
        <div
          className="absolute -top-[30%] -right-[15%] w-[1100px] h-[750px] opacity-75 blur-[90px] rounded-full transform -rotate-12"
          style={{
            background: 'radial-gradient(ellipse at center, rgba(255, 107, 107, 0.45) 0%, rgba(249, 200, 81, 0.35) 30%, rgba(132, 94, 194, 0.30) 60%, rgba(99, 91, 255, 0.20) 80%, transparent 100%)',
          }}
        />
        {/* Soft Twilight Indigo Aura on Left */}
        <div
          className="absolute -top-[10%] -left-[10%] w-[650px] h-[550px] opacity-50 blur-[100px] rounded-full"
          style={{
            background: 'radial-gradient(circle, rgba(99, 91, 255, 0.22) 0%, rgba(121, 40, 202, 0.15) 50%, transparent 80%)',
          }}
        />
        {/* Subtle Angle Mesh Sweep */}
        <div className="absolute inset-0 bg-gradient-to-b from-transparent via-white/50 to-white" />
      </div>

      {/* ─── Stripe Architectural Margin Borders (Fullbleed Lines) ─── */}
      <div className="max-w-[1560px] mx-auto border-x border-[#e3e8ee]/70 relative z-10">
        <section className="w-full px-6 py-16 md:px-12 xl:px-16 md:py-24 grid grid-cols-1 lg:grid-cols-2 items-center gap-12 lg:gap-16">
          <div className="space-y-6">
            {/* High-Contrast Bold Stripe Heading */}
            <h1 className="text-4xl sm:text-5xl md:text-6xl xl:text-7xl font-extrabold text-[#0a2540] tracking-tight leading-[1.08]">
              Find skilled student &amp; pro freelancers.
            </h1>

            {/* Crisp High-Readability Description */}
            <p className="text-base sm:text-lg md:text-xl text-[#425466] leading-relaxed max-w-xl font-normal">
              Connect businesses, startups, and founders with ambitious college students and tech specialists. Get your website, app, design, or project built with authentic, verified talent.
            </p>

            {/* High-Agency Stripe Button Group */}
            <div className="flex flex-wrap gap-4 pt-2">
              <button
                onClick={onGetStarted}
                className={cn(
                  "inline-flex items-center justify-center gap-2 bg-[#635bff] hover:bg-[#534be8] text-white font-bold py-3.5 px-7 rounded-xl text-base shadow-[0_4px_16px_rgba(99,91,255,0.25)] hover:shadow-[0_8px_24px_rgba(99,91,255,0.35)]",
                  "transition-all duration-200 active:scale-95",
                  "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#635bff]"
                )}
              >
                Get Started
              </button>

              <button
                onClick={onExploreMarketplace}
                className={cn(
                  "inline-flex items-center justify-center gap-2 border border-[#e3e8ee] hover:border-slate-300 bg-white hover:bg-slate-50 text-[#0a2540] font-bold py-3.5 px-7 rounded-xl text-base shadow-sm",
                  "transition-all duration-200 active:scale-95",
                  "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#0a2540]"
                )}
              >
                Explore Platform
                <Compass className="w-4 h-4 text-[#635bff]" />
              </button>
            </div>
          </div>

          <div className="relative">
            {/* Subtle glow border around the grid */}
            <div className="relative rounded-2xl p-2 bg-gradient-to-b from-white/80 to-white/40 border border-[#e3e8ee] shadow-[0_12px_36px_rgba(0,0,0,0.06)] backdrop-blur-sm">
              <ShuffleGrid />
            </div>
          </div>
        </section>
      </div>
    </div>
  );
};
