"use client";

import { useEffect, useId, useState } from "react";
import type { Dictionary } from "@/i18n/dictionaries/az";
import SocMark from "./SocMark";
import hero from "./hero.module.css";
import s from "./soc.module.css";

/**
 * SOC ecosystem (illustration): sources feed EDR and SIEM, SIEM hands incidents to SOAR,
 * SOAR responds, and 24/7 analysts oversee everything. Below the map, one incident is followed
 * step by step. All texts come from the dictionary (editable in the admin: Saytın mətnləri → Ana səhifə).
 */
type T = Dictionary["soc"];
const STEPS = ["edr", "siem", "soar", "analyst"] as const;
type Step = (typeof STEPS)[number];
// incident timeline: detected in 30 s, automated response 15 s after correlation, closed by an analyst
const TIMES = ["00:30", "00:34", "00:49", "02:10"];
const STEP_MS = 4200;
const TASK_MS = 650;
const TONE: Record<Step, string> = { edr: s.edr, siem: s.siem, soar: s.soar, analyst: s.analyst };
const TAG: Record<Step, string> = { edr: "EDR", siem: "SIEM", soar: "SOAR", analyst: "SOC" };

// Wires on the 480×290 map: [id, path, colour]
const WIRES: [string, string, "blue" | "purple" | "green"][] = [
  ["w1", "M58 38 C 58 74, 96 80, 106 100", "blue"],
  ["w2", "M150 38 C 150 74, 128 82, 122 97", "blue"],
  ["w3", "M240 38 C 240 70, 336 72, 350 98", "purple"],
  ["w4", "M330 38 C 330 70, 358 76, 360 96", "purple"],
  ["w5", "M422 38 C 422 74, 384 82, 376 100", "purple"],
  ["w6", "M150 122 C 208 84, 272 84, 330 122", "blue"],
  ["w7", "M350 156 C 336 186, 292 198, 260 210", "purple"],
  ["w8", "M216 238 C 160 248, 104 246, 78 262", "green"],
  ["w9", "M240 254 L240 262", "green"],
  ["w10", "M264 238 C 320 248, 376 246, 402 262", "green"],
];
const PARTICLES: [string, string, number][] = [
  ["w1", "#7fb2ff", 0], ["w2", "#7fb2ff", 0.7], ["w3", "#c9a2f0", 0.3], ["w4", "#c9a2f0", 1.1], ["w5", "#c9a2f0", 0.5],
  ["w6", "#9ec2ff", 0.2], ["w6", "#9ec2ff", 1.3], ["w7", "#c9a2f0", 0.6], ["w8", "#5fe3b4", 0.9], ["w9", "#5fe3b4", 1.2], ["w10", "#5fe3b4", 0.4],
];
const SOURCES = [
  ["laptops", 58],
  ["servers", 150],
  ["email", 240],
  ["network", 330],
  ["cloud", 422],
] as const;
const ACTIONS = [
  ["isolate", 78],
  ["block", 240],
  ["ticket", 402],
] as const;

export default function SocPanel({ t }: { t: T }) {
  const uid = useId().replace(/[^a-zA-Z0-9]/g, "");
  const [step, setStep] = useState(0);
  const [tasksDone, setTasksDone] = useState(0);
  const [animate, setAnimate] = useState(false);
  const tasks = t.soar.tasks;
  const cur: Step = STEPS[step];
  const stepMs = cur === "soar" ? Math.max(STEP_MS, 900 + tasks.length * TASK_MS + 900) : STEP_MS;

  useEffect(() => {
    setAnimate(!window.matchMedia("(prefers-reduced-motion: reduce)").matches);
  }, []);

  // Advance through the incident; the SOAR step lasts long enough for every playbook task.
  useEffect(() => {
    if (!animate) return;
    const id = window.setTimeout(() => setStep((n) => (n + 1) % STEPS.length), stepMs);
    return () => window.clearTimeout(id);
  }, [step, animate, stepMs]);

  useEffect(() => {
    if (cur !== "soar") return;
    if (!animate) {
      setTasksDone(tasks.length);
      return;
    }
    setTasksDone(0);
    const ids = tasks.map((_, i) => window.setTimeout(() => setTasksDone(i + 1), 500 + (i + 1) * TASK_MS));
    return () => ids.forEach((x) => window.clearTimeout(x));
  }, [cur, animate, tasks]);

  const active = (k: Step) => (cur === k ? s.on : "");

  return (
    <aside className={`${hero.panel} ${s.panel}`} aria-label={t.aria}>
      <div className={hero.panelHead}>
        <div className={hero.panelTitle}>
          <SocMark className={s.mark} />
          {t.title}
        </div>
        <span className={hero.live}>
          <span className="pulse" aria-hidden="true" />
          {t.live}
        </span>
      </div>

      {/* Ecosystem map (desktop and tablet) */}
      <svg className={s.map} viewBox="0 0 480 290" aria-hidden="true">
        <defs>
          <radialGradient id={`${uid}core`}>
            <stop offset="0" stopColor="#2a3bb8" />
            <stop offset="1" stopColor="#121a5c" />
          </radialGradient>
        </defs>
        {WIRES.map(([id, d, c]) => (
          <path key={id} id={`${uid}${id}`} d={d} className={`${s.wire} ${s[c]}`} />
        ))}
        <path className={s.over} d="M206 140 L150 130" />
        <path className={s.over} d="M274 140 L330 130" />
        <path className={s.over} d="M240 184 L240 200" />

        {SOURCES.map(([k, x]) => (
          <g key={k} className={s.src}>
            <rect x={x - 42} y="14" width="84" height="24" rx="8" />
            <text x={x} y="30">
              {t.sources[k]}
            </text>
          </g>
        ))}

        <g className={`${s.sys} ${s.nEdr} ${active("edr")}`}>
          <circle className={s.halo} cx="118" cy="126" r="32" />
          <circle className={s.base} cx="118" cy="126" r="32" />
          <text className={s.name} x="118" y="131">EDR</text>
          <text className={s.val} x="118" y="176">{t.systems.edr.value}</text>
          <text className={s.lbl} x="118" y="189">{t.systems.edr.label}</text>
        </g>
        <g className={`${s.sys} ${s.nSiem} ${active("siem")}`}>
          <circle className={s.halo} cx="362" cy="126" r="32" />
          <circle className={s.base} cx="362" cy="126" r="32" />
          <text className={s.name} x="362" y="131">SIEM</text>
          <text className={s.val} x="362" y="176">{t.systems.siem.value}</text>
          <text className={s.lbl} x="362" y="189">{t.systems.siem.label}</text>
        </g>
        <g className={`${s.sys} ${s.nCore} ${active("analyst")}`}>
          <circle className={s.halo} cx="240" cy="146" r="36" />
          <circle className={s.ring} cx="240" cy="146" r="44" />
          <circle className={s.base} cx="240" cy="146" r="36" fill={`url(#${uid}core)`} />
          <text className={s.coreName} x="240" y="145">{t.core}</text>
          <text className={s.coreSub} x="240" y="160">{t.analysts}</text>
        </g>
        <g className={`${s.sys} ${s.nSoar} ${active("soar")}`}>
          <circle className={s.halo} cx="240" cy="228" r="26" />
          <circle className={s.base} cx="240" cy="228" r="26" />
          <text className={s.name} x="240" y="233">SOAR</text>
          <text className={`${s.val} ${s.side}`} x="276" y="226">{t.systems.soar.value}</text>
          <text className={`${s.lbl} ${s.side}`} x="276" y="239">{t.systems.soar.label}</text>
        </g>

        {ACTIONS.map(([k, x]) => (
          <g key={k} className={s.act}>
            <rect x={x - 56} y="262" width="112" height="24" rx="8" />
            <text x={x} y="278">
              {t.actions[k]}
            </text>
          </g>
        ))}

        {animate &&
          PARTICLES.map(([id, color, delay], i) => (
            <circle key={i} r="3" fill={color} style={{ filter: `drop-shadow(0 0 4px ${color})` }}>
              <animateMotion dur="2.2s" repeatCount="indefinite" begin={`${delay}s`}>
                <mpath href={`#${uid}${id}`} />
              </animateMotion>
            </circle>
          ))}
      </svg>

      {/* Compact system strip (phones, where the map would be too small) */}
      <ol className={s.strip} aria-hidden="true">
        {STEPS.map((k, i) => (
          <li key={k} className={`${TONE[k]} ${i === step ? s.on : ""} ${i < step ? s.done : ""}`}>
            {TAG[k]}
          </li>
        ))}
      </ol>

      {/* Step details: one incident from detection to closure */}
      <div className={s.detail}>
        <div className={s.dhead}>
          <span className={`${s.chip} ${TONE[cur]}`}>{TAG[cur]}</span>
          <strong>{t.steps[cur]}</strong>
          <time className={s.time}>{TIMES[step]}</time>
        </div>
        <div className={s.segs}>
          {STEPS.map((k, i) => (
            <button
              key={k}
              type="button"
              className={`${s.seg} ${TONE[k]} ${i < step ? s.done : ""} ${i === step ? s.on : ""}`}
              onClick={() => setStep(i)}
              aria-label={`${TAG[k]}: ${t.steps[k]}`}
              aria-current={i === step ? "step" : undefined}
            >
              <i key={i === step ? `on-${step}` : "off"} style={i === step && animate ? { animationDuration: `${stepMs}ms` } : undefined} />
            </button>
          ))}
        </div>

        <div className={s.body} key={cur}>
          {cur === "edr" && (
            <>
              <div className={s.row}>
                <span className={s.mono}>{t.edr.host}</span>
                <span className={`${s.chip} ${s.crit}`}>{t.severity.crit}</span>
              </div>
              <div className={s.tree}>
                <div>outlook.exe</div>
                <div>&nbsp;└─ winword.exe invoice_0611.docm</div>
                <div className={s.bad}>
                  &nbsp;&nbsp;&nbsp;&nbsp;└─ powershell.exe -enc JABzAD0A… <em>⚠ {t.edr.suspicious}</em>
                </div>
              </div>
              <dl className={s.kv}>
                <dt>{t.edr.behaviourLabel}</dt>
                <dd>{t.edr.behaviour}</dd>
                <dt>MITRE ATT&amp;CK</dt>
                <dd className={s.mono}>T1566.001 · T1059.001</dd>
              </dl>
            </>
          )}

          {cur === "siem" && (
            <>
              <div className={s.row}>
                <span>{t.siem.summary}</span>
                <span className={`${s.chip} ${s.crit}`}>{t.siem.risk} 92</span>
              </div>
              <div className={s.merge}>
                <ul className={s.srcList}>
                  <li>
                    <span className={`${s.chip} ${s.edr}`}>EDR</span>PowerShell
                  </li>
                  <li>
                    <span className={`${s.chip} ${s.warn}`}>Proxy</span>
                    {t.siem.proxy}
                  </li>
                  <li>
                    <span className={`${s.chip} ${s.warn}`}>Mail</span>
                    {t.siem.mail}
                  </li>
                </ul>
                <div className={s.alert}>
                  <b>{t.siem.ruleTitle}</b>
                  <span>{t.siem.ruleText}</span>
                  <i className={s.risk} />
                </div>
              </div>
            </>
          )}

          {cur === "soar" && (
            <>
              <div className={s.row}>
                <span>{t.soar.playbook}</span>
                <span className={s.mono}>
                  {tasksDone}/{tasks.length}
                </span>
              </div>
              <ul className={s.play}>
                {tasks.map((task, i) => (
                  <li key={i} className={i < tasksDone ? s.ok : i === tasksDone ? s.run : ""}>
                    <i aria-hidden="true" />
                    {task.text}
                    <span>{task.tool}</span>
                  </li>
                ))}
              </ul>
            </>
          )}

          {cur === "analyst" && (
            <>
              <div className={s.row}>
                <span className={s.closed}>✓ {t.analyst.title}</span>
              </div>
              <p className={s.note}>{t.analyst.text}</p>
              <dl className={s.metrics}>
                {t.analyst.metrics.map((m, i) => (
                  <div key={i}>
                    <dd>{m.value}</dd>
                    <dt>{m.label}</dt>
                  </div>
                ))}
              </dl>
            </>
          )}
        </div>
      </div>
    </aside>
  );
}
