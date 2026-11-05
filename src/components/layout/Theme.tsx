"use client";

import { flushSync } from "react-dom";
import { usePathname } from "next/navigation";
import { useEffect, useLayoutEffect, useState } from "react";

export const THEME_KEY = "cp-theme";

/** Inline script: sets data-theme before first paint (no flash). */
export const themeScript = `(function(){try{var t=localStorage.getItem('${THEME_KEY}');if(t!=='light'&&t!=='dark'){t=matchMedia('(prefers-color-scheme: dark)').matches?'dark':'light'}document.documentElement.setAttribute('data-theme',t)}catch(e){}})();`;

/** Applies and remembers a theme (used by the toggle and the AI assistant). */
export function applyTheme(next: "light" | "dark") {
  document.documentElement.setAttribute("data-theme", next);
  try {
    localStorage.setItem(THEME_KEY, next);
  } catch {}
  window.dispatchEvent(new CustomEvent("cp-theme", { detail: next }));
}

/**
 * Re-applies the saved theme after client navigations. Switching language re-renders the root
 * <html> element, which drops the data-theme attribute set by the inline script.
 */
export function ThemeSync() {
  const pathname = usePathname();
  useLayoutEffect(() => {
    let t: string | null = null;
    try {
      t = localStorage.getItem(THEME_KEY);
    } catch {}
    if (t !== "light" && t !== "dark") t = window.matchMedia("(prefers-color-scheme: dark)").matches ? "dark" : "light";
    if (document.documentElement.getAttribute("data-theme") !== t) document.documentElement.setAttribute("data-theme", t);
  }, [pathname]);
  return null;
}

type VTDoc = Document & { startViewTransition?: (cb: () => void) => { ready: Promise<void> } };

export function ThemeToggle({ labels }: { labels: { light: string; dark: string } }) {
  const [theme, setTheme] = useState<"light" | "dark" | null>(null);

  useEffect(() => {
    setTheme(document.documentElement.getAttribute("data-theme") === "dark" ? "dark" : "light");
    const onChange = (e: Event) => setTheme((e as CustomEvent<"light" | "dark">).detail);
    window.addEventListener("cp-theme", onChange);
    return () => window.removeEventListener("cp-theme", onChange);
  }, []);

  const toggle = (e: React.MouseEvent<HTMLButtonElement>) => {
    const next = theme === "dark" ? "light" : "dark";
    const apply = () => {
      applyTheme(next);
      setTheme(next);
    };
    const doc = document as VTDoc;
    if (!doc.startViewTransition || window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
      apply();
      return;
    }
    // Circular reveal from the button
    const x = e.clientX;
    const y = e.clientY;
    const r = Math.hypot(Math.max(x, innerWidth - x), Math.max(y, innerHeight - y));
    document.documentElement.style.viewTransitionName = "theme";
    const vt = doc.startViewTransition(() => flushSync(apply));
    vt.ready
      .then(() => {
        document.documentElement.animate(
          { clipPath: [`circle(0px at ${x}px ${y}px)`, `circle(${r}px at ${x}px ${y}px)`] },
          { duration: 600, easing: "cubic-bezier(0.22, 1, 0.36, 1)", pseudoElement: "::view-transition-new(theme)" },
        );
      })
      .finally(() => {
        window.setTimeout(() => (document.documentElement.style.viewTransitionName = ""), 700);
      });
  };

  const label = theme === "dark" ? labels.light : labels.dark;
  return (
    <button type="button" className="theme-toggle" onClick={toggle} aria-label={label} title={label}>
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" aria-hidden="true">
        {theme === "dark" ? (
          <>
            <circle cx="12" cy="12" r="4.2" />
            <path d="M12 2.5v2M12 19.5v2M2.5 12h2M19.5 12h2M5.3 5.3l1.4 1.4M17.3 17.3l1.4 1.4M5.3 18.7l1.4-1.4M17.3 6.7l1.4-1.4" />
          </>
        ) : (
          <path d="M20 14.5A8 8 0 0 1 9.5 4a8 8 0 1 0 10.5 10.5z" />
        )}
      </svg>
    </button>
  );
}
