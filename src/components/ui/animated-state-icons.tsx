"use client";

import { cn } from "@/lib/utils";
import { motion } from "framer-motion";

interface StateIconProps {
  size?: number;
  color?: string;
  className?: string;
  active?: boolean;
  onClick?: () => void;
}

/* ─── HEART → FILLED ─── heart fills with bounce */
export function HeartIcon({ size = 40, color = "currentColor", className, active = false, onClick }: StateIconProps) {
  return (
    <svg
      viewBox="0 0 40 40"
      fill="none"
      className={cn("cursor-pointer", className)}
      style={{ width: size, height: size }}
      onClick={onClick}
    >
      <motion.path
        d="M20 34s-12-7.5-12-16a7.5 7.5 0 0112-6 7.5 7.5 0 0112 6c0 8.5-12 16-12 16z"
        stroke={active ? "#EF4444" : color}
        strokeWidth={2}
        fill={active ? "#EF4444" : "none"}
        animate={active ? { scale: [1, 1.25, 1] } : { scale: 1 }}
        transition={{ duration: 0.4, ease: [0.32, 0.72, 0, 1] }}
        style={{ transformOrigin: "20px 22px" }}
      />
    </svg>
  );
}

/* ─── EYE → HIDDEN ─── eye opens/closes with slash */
export function EyeToggleIcon({ size = 40, color = "currentColor", className, active = false, onClick }: StateIconProps) {
  return (
    <svg
      viewBox="0 0 40 40"
      fill="none"
      className={cn("cursor-pointer", className)}
      style={{ width: size, height: size }}
      onClick={onClick}
    >
      <motion.path
        d="M4 20s6-10 16-10 16 10 16 10-6 10-16 10S4 20 4 20z"
        stroke={color}
        strokeWidth={2}
        strokeLinecap="round"
        strokeLinejoin="round"
        animate={active ? { opacity: 0.3 } : { opacity: 1 }}
        transition={{ duration: 0.3 }}
      />
      <motion.circle
        cx="20"
        cy="20"
        r="5"
        stroke={color}
        strokeWidth={2}
        animate={active ? { scale: 0.6, opacity: 0.2 } : { scale: 1, opacity: 1 }}
        transition={{ duration: 0.3 }}
      />
      <motion.line
        x1="6"
        y1="34"
        x2="34"
        y2="6"
        stroke={color}
        strokeWidth={2.5}
        strokeLinecap="round"
        animate={active ? { opacity: 1 } : { opacity: 0 }}
        transition={{ duration: 0.25 }}
      />
    </svg>
  );
}
