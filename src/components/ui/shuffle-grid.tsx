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
    <section className="w-full px-6 py-12 md:px-8 xl:px-12 md:py-20 grid grid-cols-1 lg:grid-cols-2 items-center gap-12 max-w-[1680px] mx-auto">
      <div className="space-y-4">
        <span className="block text-xs md:text-sm text-primary font-semibold tracking-wide uppercase">
          Aaspass • Hyperlocal Freelancing Platform
        </span>
        <h1 className="text-4xl md:text-6xl font-bold text-foreground leading-tight">
          Find skilled student &amp; pro freelancers near you
        </h1>
        <p className="text-base md:text-lg text-muted-foreground leading-relaxed">
          Connect businesses, founders, and project leads with talented students and tech freelancers in your neighborhood. Get your website, app, design, or project built with verified local talent.
        </p>
        <div className="flex flex-wrap gap-3 pt-2">
          <button
            onClick={onGetStarted}
            className={cn(
              "inline-flex items-center gap-2 bg-primary text-primary-foreground font-semibold py-3 px-6 rounded-xl shadow-sm",
              "transition-all duration-200 hover:bg-primary/90 active:scale-95",
              "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
            )}
          >
            Get Started
          </button>

          <button
            onClick={onExploreMarketplace}
            className={cn(
              "inline-flex items-center gap-2 border border-border hover:border-primary/40 text-foreground font-semibold py-3 px-6 rounded-xl bg-background",
              "transition-all duration-200 hover:bg-muted active:scale-95",
              "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
            )}
          >
            Explore Platform
            <Compass className="w-4 h-4 text-primary" />
          </button>
        </div>
      </div>

      <ShuffleGrid />
    </section>
  );
};
