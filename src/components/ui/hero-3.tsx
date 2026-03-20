"use client";

import React from "react";
import { motion, Variants } from "framer-motion";
import { cn } from "@/lib/utils"; // Assuming you have a `cn` utility from shadcn

// Props interface for the component
interface AnimatedMarqueeHeroProps {
  tagline: string;
  title: React.ReactNode;
  description: string;
  ctaText: string;
  images: string[];
  className?: string;
  onCtaClick?: () => void;
  secondaryCtaText?: string;
  onSecondaryCtaClick?: () => void;
}

// Reusable Button component styled like in the image
const ActionButton = ({ children, onClick }: { children: React.ReactNode, onClick?: () => void }) => (
  <motion.button
    onClick={onClick}
    whileHover={{ scale: 1.05 }}
    whileTap={{ scale: 0.95 }}
    className="px-8 py-3 rounded-full bg-primary text-primary-foreground font-semibold shadow-lg transition-colors hover:bg-primary/90 focus:outline-none focus:ring-2 focus:ring-primary/50 focus:ring-opacity-75"
  >
    {children}
  </motion.button>
);

// The main hero component
export const AnimatedMarqueeHero: React.FC<AnimatedMarqueeHeroProps> = ({
  tagline,
  title,
  description,
  ctaText,
  images,
  className,
  onCtaClick,
  secondaryCtaText,
  onSecondaryCtaClick,
}) => {
  // Animation variants for the text content
  const FADE_IN_ANIMATION_VARIANTS: Variants = {
    hidden: { opacity: 0, y: 10 },
    show: { opacity: 1, y: 0, transition: { type: "spring", stiffness: 100, damping: 20 } },
  };

  // Duplicate images multiple times for a seamless loop
  const numSets = 4;
  const duplicatedImages = Array(numSets).fill(images).flat();

  return (
    <section
      className={cn(
        "relative w-full min-h-screen overflow-hidden bg-background flex flex-col items-center justify-center text-center px-4 pt-20 pb-10",
        className
      )}
    >
      <div className="z-10 flex flex-col items-center mt-10">
        {/* Tagline */}
        <motion.div
          initial="hidden"
          animate="show"
          variants={FADE_IN_ANIMATION_VARIANTS}
          className="mb-4 inline-block rounded-full border border-border bg-card/50 px-4 py-1.5 text-sm font-medium text-muted-foreground backdrop-blur-sm"
        >
          {tagline}
        </motion.div>

        {/* Main Title */}
        <motion.h1
          initial="hidden"
          animate="show"
          variants={{
            hidden: {},
            show: {
              transition: {
                staggerChildren: 0.1,
              },
            },
          }}
          className="text-5xl md:text-7xl font-bold tracking-tighter text-foreground text-balance"
        >
          {typeof title === 'string' ? (
            title.split(" ").map((word, i) => (
              <motion.span
                key={i}
                variants={FADE_IN_ANIMATION_VARIANTS}
                className="inline-block"
              >
                {word}&nbsp;
              </motion.span>
            ))
          ) : (
            title
          )}
        </motion.h1>

        {/* Description */}
        <motion.p
          initial="hidden"
          animate="show"
          variants={FADE_IN_ANIMATION_VARIANTS}
          transition={{ delay: 0.5 }}
          className="mt-6 max-w-xl text-lg text-muted-foreground mb-8"
        >
          {description}
        </motion.p>
      </div>

      {/* Animated Image Marquee - Positioned properly in document flow */}
      <div className="relative w-full h-[40vh] md:h-[50vh] flex-shrink-0 [mask-image:linear-gradient(to_right,transparent,black_20%,black_80%,transparent)] md:[mask-image:linear-gradient(to_bottom,transparent,black_20%,black_80%,transparent)] mb-2 overflow-hidden flex items-center">
        <motion.div
          className="flex gap-4 px-4 h-full items-center"
          animate={{
            x: ["0%", `-${100 / numSets}%`],
          }}
          transition={{
            ease: "linear",
            duration: 40,
            repeat: Infinity,
            repeatType: "loop",
          }}
          style={{ width: "max-content" }}
        >
          {duplicatedImages.map((src, index) => (
            <div
              key={index}
              className="relative aspect-[3/4] h-48 md:h-64 flex-shrink-0 mx-2 w-[144px] md:w-[192px] bg-muted rounded-2xl"
              style={{
                rotate: `${(index % 2 === 0 ? -2 : 5)}deg`,
              }}
            >
              <img
                src={src}
                alt={`Showcase image ${index + 1}`}
                className="w-full h-full object-cover rounded-2xl shadow-md"
                onError={(e) => { e.currentTarget.src = "https://images.unsplash.com/photo-1546069901-ba9599a7e63c?w=900&auto=format&fit=crop&q=60" }}
              />
            </div>
          ))}
        </motion.div>
      </div>

      {/* Call to Action Button placed below image slideshow */}
      <motion.div
        initial="hidden"
        animate="show"
        variants={FADE_IN_ANIMATION_VARIANTS}
        transition={{ delay: 0.6 }}
        className="z-10 mt-6 pb-4"
      >
        <div className="flex flex-col sm:flex-row gap-4 items-center justify-center">
          <ActionButton onClick={onCtaClick}>{ctaText}</ActionButton>
          {secondaryCtaText && (
            <motion.button
              onClick={onSecondaryCtaClick}
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              className="px-8 py-3 rounded-full border-2 border-primary text-primary font-semibold transition-colors hover:bg-primary/5 focus:outline-none focus:ring-2 focus:ring-primary/50 focus:ring-opacity-75"
            >
              {secondaryCtaText}
            </motion.button>
          )}
        </div>
      </motion.div>

    </section>
  );
};
