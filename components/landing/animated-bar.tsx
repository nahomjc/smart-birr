"use client";

import { motion } from "framer-motion";
import { barRise, viewportOnce } from "./motion";

type AnimatedBarProps = {
  heightPercent: number;
  index: number;
  className?: string;
};

/** Bar that grows from the bottom when scrolled into view. */
export function AnimatedBar({ heightPercent, index, className }: AnimatedBarProps) {
  return (
    <motion.span
      className={`origin-bottom flex-1 rounded-t-md ${className ?? ""}`}
      style={{ height: `${heightPercent}%` }}
      variants={barRise(index)}
      initial="hidden"
      whileInView="visible"
      viewport={viewportOnce}
    />
  );
}
