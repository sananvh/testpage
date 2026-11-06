"use client";

import { AnimatePresence, motion } from "motion/react";
import { usePathname } from "next/navigation";
import { useEffect, useRef, useState } from "react";
import { locales, localeLabels, type Locale } from "@/i18n/config";
import type { Dictionary } from "@/i18n/dictionaries/az";
import { Link, useNavigate } from "../motion/ViewTransitions";
import { lockScroll } from "../motion/SmoothScroll";
import Icon from "../Icon";
import Logo from "./Logo";
import { Roll } from "../ui/Roll";
import { ThemeToggle } from "./Theme";
import s from "./header.module.css";

type Props = {
  locale: Locale;
  t: Dictionary["nav"];
  services: { slug: string; title: string }[];
  contact: { phone: string; email: string; socials: { name: string; href: string }[] };
};

export default function Header({ locale, t, services, contact }: Props) {
  const pathname = usePathname() ?? `/${locale}`;
  const [compact, setCompact] = useState(false);
  const [open, setOpen] = useState(false);
  const href = (p = "") => `/${locale}${p}`;
  const switchTo = (l: Locale) => pathname.replace(/^\/(az|en|ru)(?=\/|$)/, `/${l}`);

  useEffect(() => {
    const onScroll = () => setCompact(window.scrollY > 140);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  useEffect(() => setOpen(false), [pathname]);
  useEffect(() => {
    lockScroll(open);
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && setOpen(false);
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [open]);

  const main = [
    { label: t.services, path: "/services" },
    { label: t.products, path: "/products" },
    { label: t.partners, path: "/partners" },
    { label: t.clients, path: "/clients" },
    { label: t.about, path: "/about" },
    { label: t.researchNav, path: "/research" },
  ];
  const isActive = (p: string) => pathname === href(p) || pathname.startsWith(href(p) + "/");

  return (
    <>
      <a href="#main" className="skip">
        {t.skip}
      </a>
      <header className={`${s.header} ${compact ? s.compact : ""}`}>
        <div className={`container ${s.bar}`}>
          <Link href={href()} className={s.logo} aria-label="Cyberpoint">
            <Logo height={34} />
          </Link>

          <nav className={s.nav} aria-label={t.menuGroups.main}>
            {main.map((m) => (
              <Link key={m.path} href={href(m.path)} className={s.navLink} aria-current={isActive(m.path) ? "page" : undefined}>
                <Roll>{m.label}</Roll>
              </Link>
            ))}
          </nav>

          <div className={s.end}>
            <div className={s.langs} role="group" aria-label={t.language}>
              {locales.map((l) => (
                <Link key={l} href={switchTo(l)} hrefLang={l} className={s.lang} aria-current={l === locale ? "true" : undefined}>
                  {localeLabels[l]}
                </Link>
              ))}
            </div>
            <ThemeToggle labels={{ light: t.themeLight, dark: t.themeDark }} />
            <button type="button" className={s.menuBtn} onClick={() => setOpen(true)} aria-expanded={open} aria-controls="site-menu">
              <span className={s.dots} aria-hidden="true">
                <i />
                <i />
                <i />
              </span>
              <Roll>{t.menu}</Roll>
            </button>
          </div>
        </div>
      </header>

      <AnimatePresence>
        {open && (
          <MenuOverlay
            locale={locale}
            t={t}
            services={services}
            contact={contact}
            main={[...main, { label: t.news, path: "/news" }, { label: t.certificates, path: "/certificates" }, { label: t.faq, path: "/faq" }, { label: t.careers, path: "/careers" }, { label: t.contact, path: "/contact" }]}
            switchTo={switchTo}
            onClose={() => setOpen(false)}
          />
        )}
      </AnimatePresence>
    </>
  );
}

function MenuOverlay({
  locale, t, services, contact, main, switchTo, onClose,
}: Omit<Props, never> & { main: { label: string; path: string }[]; switchTo: (l: Locale) => string; onClose: () => void }) {
  const navigate = useNavigate();
  const input = useRef<HTMLInputElement>(null);
  const href = (p = "") => `/${locale}${p}`;

  useEffect(() => {
    const id = window.setTimeout(() => input.current?.focus({ preventScroll: true }), 350);
    return () => window.clearTimeout(id);
  }, []);

  const ease = [0.22, 1, 0.36, 1] as const;

  return (
    <motion.div
      id="site-menu"
      role="dialog"
      aria-modal="true"
      aria-label={t.menu}
      className={s.overlay}
      initial={{ clipPath: "circle(0% at calc(100% - 80px) 42px)" }}
      animate={{ clipPath: "circle(150% at calc(100% - 80px) 42px)" }}
      exit={{ clipPath: "circle(0% at calc(100% - 80px) 42px)" }}
      transition={{ duration: 0.7, ease }}
      data-lenis-prevent
    >
      <div className={`container ${s.overlayInner}`}>
        <div className={s.overlayTop}>
          <Logo variant="reversed" height={32} />
          <div className={s.overlayTopEnd}>
            <div className={s.langs}>
              {locales.map((l) => (
                <Link key={l} href={switchTo(l)} hrefLang={l} className={`${s.lang} ${s.langDark}`} aria-current={l === locale ? "true" : undefined}>
                  {localeLabels[l]}
                </Link>
              ))}
            </div>
            <button type="button" className={`${s.menuBtn} ${s.closeBtn}`} onClick={onClose}>
              <svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" strokeWidth="1.8" aria-hidden="true">
                <path d="M6 6l12 12M18 6L6 18" />
              </svg>
              {t.close}
            </button>
          </div>
        </div>

        <form
          className={s.search}
          role="search"
          onSubmit={(e) => {
            e.preventDefault();
            const q = input.current?.value.trim() ?? "";
            navigate(`${href("/search")}?q=${encodeURIComponent(q)}`);
          }}
        >
          <label htmlFor="menu-search" className="sr-only">
            {t.search}
          </label>
          <input ref={input} id="menu-search" name="q" type="search" placeholder={t.searchPlaceholder} autoComplete="off" />
          <button type="submit" aria-label={t.search}>
            <Icon name="search" />
          </button>
        </form>

        <div className={s.overlayGrid}>
          <motion.nav
            aria-label={t.menuGroups.main}
            initial="hidden"
            animate="show"
            transition={{ staggerChildren: 0.04, delayChildren: 0.25 }}
          >
            <p className={s.overlayLabel}>{t.menuGroups.main}</p>
            <ul className={s.overlayMain}>
              <motion.li variants={{ hidden: { opacity: 0, y: 24 }, show: { opacity: 1, y: 0, transition: { duration: 0.6, ease } } }}>
                <Link href={href()}>
                  <Roll>{t.home}</Roll>
                </Link>
              </motion.li>
              {main.map((m) => (
                <motion.li key={m.path} variants={{ hidden: { opacity: 0, y: 24 }, show: { opacity: 1, y: 0, transition: { duration: 0.6, ease } } }}>
                  <Link href={href(m.path)}>
                    <Roll>{m.label}</Roll>
                  </Link>
                </motion.li>
              ))}
            </ul>
          </motion.nav>

          <div>
            <p className={s.overlayLabel}>{t.menuGroups.services}</p>
            <ul className={s.overlayServices}>
              {services.map((sv) => (
                <li key={sv.slug}>
                  <Link href={href(`/services/${sv.slug}`)}>{sv.title}</Link>
                </li>
              ))}
            </ul>
          </div>
        </div>

        <div className={s.overlayBottom}>
          <div className={s.overlayContact}>
            <a href={`tel:${contact.phone.replace(/\s/g, "")}`}>{contact.phone}</a>
            <a href={`mailto:${contact.email}`}>{contact.email}</a>
          </div>
          <div className={s.socials}>
            {contact.socials.map((so) => (
              <a key={so.name} href={so.href} target="_blank" rel="noreferrer" aria-label={so.name}>
                {so.name === "LinkedIn" ? "in" : so.name === "Facebook" ? "f" : so.name === "Instagram" ? "ig" : "x"}
              </a>
            ))}
          </div>
          <Link href={href("/contact")} className="btn btn-primary btn-sm">
            {t.cta}
            <span className="btn-icon">
              <Icon name="arrow" />
            </span>
          </Link>
        </div>
      </div>
    </motion.div>
  );
}
