"use client";

import { useEffect, useState } from "react";
import type { Dictionary } from "@/i18n/dictionaries/az";
import styles from "./hero.module.css";

type Sev = "crit" | "warn" | "ok";
type Row = { id: number; time: string; sev: Sev; msg: string };

const VISIBLE = 5;
const BASE_TIME = new Date("2026-01-01T14:02:11");

function fmt(d: Date) {
  return d.toTimeString().slice(0, 8);
}

function initialSeries() {
  // Deterministic so server and client render the same first frame.
  return Array.from({ length: 40 }, (_, i) => 26 + Math.sin(i / 3) * 6 + Math.cos(i / 1.7) * 3);
}

function path(series: number[]) {
  const max = 46;
  const step = 300 / (series.length - 1);
  const pts = series.map((v, i) => `${(i * step).toFixed(1)},${(max - v).toFixed(1)}`);
  return { line: `M${pts.join(" L")}`, area: `M0,46 L${pts.join(" L")} L300,46 Z` };
}

export default function SocPanel({ t }: { t: Dictionary["soc"] }) {
  const [rows, setRows] = useState<Row[]>(() =>
    t.events.slice(0, VISIBLE).map(([sev, msg], i) => ({
      id: i,
      time: fmt(new Date(BASE_TIME.getTime() - i * 27000)),
      sev: sev as Sev,
      msg,
    })),
  );
  const [count, setCount] = useState(18432);
  const [series, setSeries] = useState(initialSeries);

  useEffect(() => {
    // Restamp the server-rendered rows against the visitor's clock.
    const now = Date.now();
    setRows((r) => r.map((row, i) => ({ ...row, time: fmt(new Date(now - i * 27000)) })));
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    let k = VISIBLE;
    const id = window.setInterval(() => {
      const [sev, msg] = t.events[k % t.events.length];
      const row: Row = { id: k, time: fmt(new Date()), sev: sev as Sev, msg };
      k += 1;
      setRows((r) => [row, ...r].slice(0, VISIBLE));
      setCount((c) => c + Math.round(Math.random() * 40));
      setSeries((s) => [...s.slice(1), 22 + Math.random() * 16]);
    }, 2600);
    return () => window.clearInterval(id);
  }, [t.events]);

  const { line, area } = path(series);

  return (
    <aside className={styles.panel} aria-label={t.aria}>
      <div className={styles.panelHead}>
        <div className={styles.panelTitle}>
          <svg viewBox="0 0 24 24" fill="none" aria-hidden="true">
            <path d="M12 3l7 3v5c0 4.6-3 8.4-7 10-4-1.6-7-5.4-7-10V6l7-3z" stroke="currentColor" strokeWidth="1.6" />
            <path d="M8.5 12l2.4 2.4L15.5 10" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
          {t.title}
        </div>
        <span className={styles.live}>
          <span className="pulse" aria-hidden="true" />
          {t.live}
        </span>
      </div>

      <div className={styles.kpis}>
        <div className={styles.kpi}>
          <b>{count.toLocaleString("en-US").replace(/,/g, " ")}</b>
          <span>{t.eventsPerHour}</span>
        </div>
        <div className={styles.kpi}>
          <b>3</b>
          <span>{t.openIncidents}</span>
        </div>
        <div className={styles.kpi}>
          <b>{t.responseValue}</b>
          <span>{t.responseTime}</span>
        </div>
      </div>

      <div className={styles.spark} aria-hidden="true">
        <svg viewBox="0 0 300 46" preserveAspectRatio="none">
          <defs>
            <linearGradient id="soc-spark" x1="0" x2="0" y1="0" y2="1">
              <stop offset="0" stopColor="#0D6EF5" stopOpacity=".45" />
              <stop offset="1" stopColor="#0D6EF5" stopOpacity="0" />
            </linearGradient>
          </defs>
          <path d={area} fill="url(#soc-spark)" />
          <path d={line} fill="none" stroke="#5C9BFF" strokeWidth="1.6" />
        </svg>
      </div>

      <ul className={styles.feed}>
        {rows.map((r) => (
          <li key={r.id}>
            <time>{r.time}</time>
            <span className={`${styles.sev} ${styles[r.sev]}`}>{t.severity[r.sev]}</span>
            <span className={styles.msg}>{r.msg}</span>
          </li>
        ))}
      </ul>

      <div className={styles.panelFoot}>
        <span>{t.footer}</span>
        <b>● {t.status}</b>
      </div>
    </aside>
  );
}
