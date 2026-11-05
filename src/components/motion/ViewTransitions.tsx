"use client";

import NextLink from "next/link";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { createContext, forwardRef, Suspense, useCallback, useContext, useEffect, useRef } from "react";

type Navigate = (href: string) => void;
const Ctx = createContext<Navigate | null>(null);

type VTDocument = Document & { startViewTransition?: (cb: () => Promise<void> | void) => { finished: Promise<void> } };

function RouteWatcher({ onChange }: { onChange: () => void }) {
  const pathname = usePathname();
  const search = useSearchParams();
  useEffect(() => {
    onChange();
  }, [pathname, search, onChange]);
  return null;
}

/** Wraps router.push in document.startViewTransition so page switches animate (see globals.css). */
export function ViewTransitions({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const pending = useRef<(() => void) | null>(null);

  const finish = useCallback(() => {
    pending.current?.();
    pending.current = null;
  }, []);

  const navigate = useCallback<Navigate>(
    (href) => {
      const doc = document as VTDocument;
      const reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
      if (!doc.startViewTransition || reduce) {
        router.push(href);
        return;
      }
      doc.startViewTransition(
        () =>
          new Promise<void>((resolve) => {
            pending.current = resolve;
            router.push(href);
            window.setTimeout(resolve, 2500); // never hang the transition
          }),
      );
    },
    [router],
  );

  return (
    <Ctx.Provider value={navigate}>
      <Suspense fallback={null}>
        <RouteWatcher onChange={finish} />
      </Suspense>
      {children}
    </Ctx.Provider>
  );
}

export function useNavigate(): Navigate {
  const router = useRouter();
  return useContext(Ctx) ?? ((href: string) => router.push(href));
}

type LinkProps = React.ComponentProps<typeof NextLink>;

/** Drop-in replacement for next/link that animates internal navigations. */
export const Link = forwardRef<HTMLAnchorElement, LinkProps>(function Link({ onClick, href, target, ...rest }, ref) {
  const navigate = useContext(Ctx);
  return (
    <NextLink
      ref={ref}
      href={href}
      target={target}
      {...rest}
      onClick={(e) => {
        onClick?.(e);
        if (e.defaultPrevented || !navigate) return;
        const url = typeof href === "string" ? href : href.pathname ?? "";
        const isInternal = url.startsWith("/") && !url.startsWith("//");
        if (!isInternal || target === "_blank" || e.metaKey || e.ctrlKey || e.shiftKey || e.altKey || e.button !== 0) return;
        const here = window.location.pathname + window.location.search;
        if (url === here || url.startsWith("#") || (url.includes("#") && url.split("#")[0] === window.location.pathname)) return;
        e.preventDefault();
        navigate(url);
      }}
    />
  );
});
