"use client";

import Lenis from "lenis";
import { usePathname } from "next/navigation";
import { useEffect, useRef } from "react";

type W = Window & { __lenis?: Lenis };

/** Lenis smooth scrolling (as on jis.az). Disabled for reduced-motion users and touch devices. */
export default function SmoothScroll() {
  const pathname = usePathname();
  const lenis = useRef<Lenis | null>(null);

  useEffect(() => {
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    if (window.matchMedia("(pointer: coarse)").matches) return;
    const l = new Lenis({ duration: 1.1, easing: (t) => 1 - Math.pow(1 - t, 4), anchors: { offset: -100 } });
    lenis.current = l;
    (window as W).__lenis = l;
    let raf = 0;
    const loop = (time: number) => {
      l.raf(time);
      raf = requestAnimationFrame(loop);
    };
    raf = requestAnimationFrame(loop);
    return () => {
      cancelAnimationFrame(raf);
      l.destroy();
      lenis.current = null;
      delete (window as W).__lenis;
    };
  }, []);

  useEffect(() => {
    if (!window.location.hash) lenis.current?.scrollTo(0, { immediate: true });
  }, [pathname]);

  return null;
}

export function lockScroll(lock: boolean) {
  const l = (window as W).__lenis;
  if (l) {
    if (lock) l.stop();
    else l.start();
  }
  document.documentElement.style.overflow = lock ? "hidden" : "";
}
