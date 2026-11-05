"use client";

import { motion, useInView, useReducedMotion, useScroll, useTransform } from "motion/react";
import { useEffect, useLayoutEffect, useRef, useState } from "react";

const ease = [0.22, 1, 0.36, 1] as const;

type RevealProps = {
  children: React.ReactNode;
  delay?: number;
  y?: number;
  className?: string;
  as?: "div" | "li" | "section" | "span" | "p" | "header";
};

/** Fades and lifts content into view once (Framer Motion, like primecotton.az). */
export function Reveal({ children, delay = 0, y = 32, className, as = "div" }: RevealProps) {
  const Comp = motion[as];
  return (
    <Comp
      className={className}
      initial={{ opacity: 0, y }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: "0px 0px -8% 0px" }}
      transition={{ duration: 0.9, ease, delay }}
    >
      {children}
    </Comp>
  );
}

/** Splits a heading into words that rise from a mask, staggered. */
export function RevealWords({ text, className, delay = 0 }: { text: string; className?: string; delay?: number }) {
  const words = text.split(" ");
  return (
    <span className={className}>
      <span className="sr-only">{text}</span>
      <motion.span
        aria-hidden="true"
        initial="hidden"
        whileInView="show"
        viewport={{ once: true, margin: "0px 0px -5% 0px" }}
        transition={{ staggerChildren: 0.06, delayChildren: delay }}
      >
        {words.map((w, i) => (
          <span key={i} style={{ display: "inline-block", overflow: "hidden", verticalAlign: "top", paddingBottom: "0.12em", marginBottom: "-0.12em" }}>
            <motion.span
              style={{ display: "inline-block" }}
              variants={{ hidden: { y: "110%" }, show: { y: "0%", transition: { duration: 0.9, ease } } }}
            >
              {w}
              {i < words.length - 1 ? "\u00A0" : ""}
            </motion.span>
          </span>
        ))}
      </motion.span>
    </span>
  );
}

/** Unmasks media with an expanding clip-path. */
export function RevealMedia({ children, className }: { children: React.ReactNode; className?: string }) {
  return (
    <motion.div
      className={className}
      initial={{ clipPath: "inset(12% 12% 12% 12% round 28px)", opacity: 0.4 }}
      whileInView={{ clipPath: "inset(0% 0% 0% 0% round 28px)", opacity: 1 }}
      viewport={{ once: true, margin: "0px 0px -10% 0px" }}
      transition={{ duration: 1.2, ease }}
    >
      {children}
    </motion.div>
  );
}

/** Subtle parallax on scroll. */
export function Parallax({ children, offset = 60, className }: { children: React.ReactNode; offset?: number; className?: string }) {
  const ref = useRef<HTMLDivElement>(null);
  const reduce = useReducedMotion();
  const { scrollYProgress } = useScroll({ target: ref, offset: ["start end", "end start"] });
  const y = useTransform(scrollYProgress, [0, 1], [offset, -offset]);
  return (
    <motion.div ref={ref} className={className} style={reduce ? undefined : { y }}>
      {children}
    </motion.div>
  );
}

/**
 * Counts up to a number when it scrolls into view. Only plain numbers (optionally "+" or "%")
 * animate; values like "7/24" render as-is. The server renders the real value (crawlers, no-JS).
 */
export function CountUp({ value }: { value: string }) {
  const ref = useRef<HTMLSpanElement>(null);
  const inView = useInView(ref, { once: true, margin: "0px 0px -10% 0px" });
  const reduce = useReducedMotion();
  const m = /^(\d+)([+%]?)$/.exec(value.trim());
  const animate = m !== null;
  const target = m ? Number(m[1]) : 0;
  const suffix = m ? m[2] : "";
  const [n, setN] = useState(target);
  const started = useRef(false);

  // Before first paint on the client: start from 0 if it will animate and hasn't been seen yet
  useLayoutEffect(() => {
    if (animate && !reduce && !started.current) setN(0);
  }, [animate, reduce]);

  useEffect(() => {
    if (!animate || !inView || started.current) return;
    started.current = true;
    if (reduce) {
      setN(target);
      return;
    }
    let raf = 0;
    const t0 = performance.now();
    const tick = (t: number) => {
      const p = Math.min(1, (t - t0) / 1400);
      setN(Math.round(target * (1 - Math.pow(1 - p, 3))));
      if (p < 1) raf = requestAnimationFrame(tick);
    };
    raf = requestAnimationFrame(tick);
    return () => {
      cancelAnimationFrame(raf);
      started.current = false;
    };
  }, [animate, inView, target, reduce]);

  if (!animate) return <span ref={ref}>{value}</span>;
  return (
    <span ref={ref} style={{ fontVariantNumeric: "tabular-nums" }}>
      {n}
      {suffix}
    </span>
  );
}
