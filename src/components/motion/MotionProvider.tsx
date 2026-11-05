"use client";

import { MotionConfig } from "motion/react";

/** Respects the visitor's reduced-motion setting for every Framer Motion animation. */
export default function MotionProvider({ children }: { children: React.ReactNode }) {
  return <MotionConfig reducedMotion="user">{children}</MotionConfig>;
}
