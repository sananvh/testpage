"use client";

import { AnimatePresence, motion } from "motion/react";
import { usePathname } from "next/navigation";
import { Fragment, useCallback, useEffect, useRef, useState } from "react";
import type { Locale } from "@/i18n/config";
import type { Dictionary } from "@/i18n/dictionaries/az";
import { useNavigate } from "../motion/ViewTransitions";
import { applyTheme } from "../layout/Theme";
import s from "./assistant.module.css";

type Action =
  | { type: "navigate"; path: string }
  | { type: "theme"; theme: "light" | "dark" }
  | { type: "language"; locale: Locale }
  | { type: "consultation"; ok: boolean };
type Msg = { id: string; role: "user" | "assistant"; text: string; chips?: string[]; error?: boolean };
type VoiceState = "idle" | "listening" | "thinking" | "speaking";
type Stored = { sessionId: string; messages: Msg[]; open: boolean; voice: boolean; muted: boolean };

// Minimal Web Speech API typings (not in lib.dom for all browsers)
type SpeechRecognitionResultLike = { isFinal: boolean; 0: { transcript: string } };
type SpeechRecognitionEventLike = { resultIndex: number; results: ArrayLike<SpeechRecognitionResultLike> };
type Recognition = {
  lang: string; interimResults: boolean; continuous: boolean; maxAlternatives: number;
  start(): void; stop(): void; abort(): void;
  onresult: ((e: SpeechRecognitionEventLike) => void) | null;
  onerror: ((e: { error: string }) => void) | null;
  onend: (() => void) | null;
};
type RecognitionCtor = new () => Recognition;

const KEY = "cp-assistant";
const LANG_TAG: Record<Locale, string> = { az: "az-AZ", en: "en-US", ru: "ru-RU" };
const uid = () => (typeof crypto !== "undefined" && "randomUUID" in crypto ? crypto.randomUUID() : `${Date.now()}-${Math.random().toString(36).slice(2)}`);

function load(): Stored | null {
  try {
    const raw = sessionStorage.getItem(KEY);
    return raw ? (JSON.parse(raw) as Stored) : null;
  } catch {
    return null;
  }
}
function save(v: Stored) {
  try {
    sessionStorage.setItem(KEY, JSON.stringify(v));
  } catch {}
}

/** Strip markdown for speech. */
const plain = (t: string) => t.replace(/\[([^\]]+)\]\([^)]+\)/g, "$1").replace(/\*\*/g, "").replace(/^\s*[-•]\s+/gm, "").replace(/\s+/g, " ").trim();

/** Renders the small markdown subset the assistant uses: paragraphs, "- " bullets, **bold**, [links](/path). */
function Rich({ text, onLink }: { text: string; onLink: (href: string) => void }) {
  const inline = (line: string, key: string) => {
    const parts = line.split(/(\*\*[^*]+\*\*|\[[^\]]+\]\([^)\s]+\))/g).filter(Boolean);
    return parts.map((p, i) => {
      if (p.startsWith("**") && p.endsWith("**")) return <strong key={`${key}-${i}`}>{p.slice(2, -2)}</strong>;
      const m = p.match(/^\[([^\]]+)\]\(([^)\s]+)\)$/);
      if (m) {
        const href = m[2];
        if (href.startsWith("/"))
          return (
            <a key={`${key}-${i}`} href={href} onClick={(e) => { e.preventDefault(); onLink(href); }}>
              {m[1]}
            </a>
          );
        return <a key={`${key}-${i}`} href={href} target="_blank" rel="noreferrer">{m[1]}</a>;
      }
      return <Fragment key={`${key}-${i}`}>{p}</Fragment>;
    });
  };
  const blocks = text.split(/\n{2,}/);
  return (
    <>
      {blocks.map((b, bi) => {
        const lines = b.split("\n").filter((l) => l.trim());
        const bullets = lines.filter((l) => /^\s*[-•]\s+/.test(l));
        const lead = lines.filter((l) => !/^\s*[-•]\s+/.test(l));
        return (
          <Fragment key={bi}>
            {lead.length > 0 && <p>{inline(lead.join(" "), `p${bi}`)}</p>}
            {bullets.length > 0 && (
              <ul>
                {bullets.map((l, li) => (
                  <li key={li}>{inline(l.replace(/^\s*[-•]\s+/, ""), `l${bi}-${li}`)}</li>
                ))}
              </ul>
            )}
          </Fragment>
        );
      })}
    </>
  );
}

export default function Assistant({ locale, t }: { locale: Locale; t: Dictionary["assistant"] }) {
  const navigate = useNavigate();
  const pathname = usePathname() ?? `/${locale}`;
  const [ready, setReady] = useState(false);
  const [open, setOpen] = useState(false);
  const [messages, setMessages] = useState<Msg[]>([]);
  const [input, setInput] = useState("");
  const [busy, setBusy] = useState(false);
  const [mode, setMode] = useState<"ai" | "basic" | null>(null);
  const [voice, setVoice] = useState(false);
  const [voiceState, setVoiceState] = useState<VoiceState>("idle");
  const [interim, setInterim] = useState("");
  const [muted, setMuted] = useState(false);
  const [notice, setNotice] = useState("");
  const session = useRef("");
  const localeRef = useRef(locale);
  const recRef = useRef<Recognition | null>(null);
  const logRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLTextAreaElement>(null);
  const voiceRef = useRef(false);
  const mutedRef = useRef(false);
  const sendRef = useRef<(text: string) => void>(() => {});

  localeRef.current = locale;
  voiceRef.current = voice;
  mutedRef.current = muted;

  // Restore across page loads and language switches
  useEffect(() => {
    const st = load();
    session.current = st?.sessionId ?? uid();
    if (st) {
      setMessages(st.messages ?? []);
      setOpen(st.open);
      setVoice(st.voice);
      setMuted(st.muted);
    }
    setReady(true);
  }, []);
  useEffect(() => {
    if (ready) save({ sessionId: session.current, messages: messages.slice(-60), open, voice, muted });
  }, [ready, messages, open, voice, muted]);

  useEffect(() => {
    logRef.current?.scrollTo({ top: logRef.current.scrollHeight, behavior: "smooth" });
  }, [messages, interim, open]);

  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && setOpen(false);
    window.addEventListener("keydown", onKey);
    if (!voice) window.setTimeout(() => inputRef.current?.focus({ preventScroll: true }), 250);
    return () => window.removeEventListener("keydown", onKey);
  }, [open, voice]);

  /* ---------------- Speech ---------------- */
  const Recognizer = (): RecognitionCtor | null => {
    if (typeof window === "undefined") return null;
    const w = window as unknown as { SpeechRecognition?: RecognitionCtor; webkitSpeechRecognition?: RecognitionCtor };
    return w.SpeechRecognition ?? w.webkitSpeechRecognition ?? null;
  };

  const stopListening = useCallback(() => {
    recRef.current?.abort();
    recRef.current = null;
    setInterim("");
  }, []);

  const listen = useCallback(() => {
    const Ctor = Recognizer();
    if (!Ctor) {
      setNotice(t.micUnsupported);
      return;
    }
    window.speechSynthesis?.cancel();
    stopListening();
    const rec = new Ctor();
    rec.lang = LANG_TAG[localeRef.current];
    rec.interimResults = true;
    rec.continuous = false;
    rec.maxAlternatives = 1;
    let finalText = "";
    rec.onresult = (e) => {
      let live = "";
      for (let i = e.resultIndex; i < e.results.length; i++) {
        const r = e.results[i];
        if (r.isFinal) finalText += r[0].transcript;
        else live += r[0].transcript;
      }
      setInterim((finalText + " " + live).trim());
    };
    rec.onerror = (e) => {
      if (e.error === "not-allowed" || e.error === "service-not-allowed") setNotice(t.micDenied);
    };
    rec.onend = () => {
      recRef.current = null;
      setInterim("");
      const text = finalText.trim();
      if (text) sendRef.current(text);
      else setVoiceState((v) => (v === "listening" ? "idle" : v));
    };
    recRef.current = rec;
    setNotice("");
    setVoiceState("listening");
    try {
      rec.start();
    } catch {
      setVoiceState("idle");
    }
  }, [stopListening, t.micUnsupported, t.micDenied]);

  const speak = useCallback((text: string, after?: () => void) => {
    const synth = typeof window !== "undefined" ? window.speechSynthesis : undefined;
    if (!synth || mutedRef.current || !text) {
      after?.();
      return;
    }
    synth.cancel();
    const u = new SpeechSynthesisUtterance(plain(text));
    const l = localeRef.current;
    u.lang = LANG_TAG[l];
    const voices = synth.getVoices();
    // Azerbaijani voices are rare; Turkish is the closest widely available fallback.
    const prefixes = l === "az" ? ["az", "tr"] : [l];
    const v = prefixes.map((p) => voices.find((x) => x.lang.toLowerCase().startsWith(p))).find(Boolean);
    if (v) {
      u.voice = v;
      u.lang = v.lang;
    }
    u.rate = 1.03;
    setVoiceState("speaking");
    u.onend = u.onerror = () => {
      setVoiceState("idle");
      after?.();
    };
    synth.speak(u);
  }, []);

  /* ---------------- Actions ---------------- */
  const doAction = useCallback(
    (a: Action): string => {
      if (a.type === "navigate") {
        if (a.path !== pathname) navigate(a.path);
        return t.navigated;
      }
      if (a.type === "theme") {
        applyTheme(a.theme);
        return t.themeChanged;
      }
      if (a.type === "language") return t.languageChanged;
      return t.consultationSent;
    },
    [navigate, pathname, t],
  );

  /* ---------------- Send ---------------- */
  const send = useCallback(
    async (raw: string) => {
      const text = raw.trim().slice(0, 1500);
      if (!text || busy) return;
      stopListening();
      window.speechSynthesis?.cancel();
      setInput("");
      setNotice("");
      const user: Msg = { id: uid(), role: "user", text };
      const reply: Msg = { id: uid(), role: "assistant", text: "", chips: [] };
      const history = [...messages.filter((m) => !m.error), user].map(({ role, text }) => ({ role, text }));
      setMessages((m) => [...m, user, reply]);
      setBusy(true);
      setVoiceState("thinking");

      let full = "";
      let pendingLocale: Locale | null = null;
      const patch = (fn: (m: Msg) => Msg) => setMessages((list) => list.map((m) => (m.id === reply.id ? fn(m) : m)));

      try {
        const res = await fetch("/api/assistant", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ sessionId: session.current, locale: localeRef.current, messages: history }),
        });
        if (!res.body) throw new Error("no body");
        const reader = res.body.getReader();
        const decoder = new TextDecoder();
        let buf = "";
        for (;;) {
          const { value, done } = await reader.read();
          if (done) break;
          buf += decoder.decode(value, { stream: true });
          const frames = buf.split("\n\n");
          buf = frames.pop() ?? "";
          for (const f of frames) {
            const line = f.split("\n").find((l) => l.startsWith("data: "));
            if (!line) continue;
            const ev = JSON.parse(line.slice(6));
            if (ev.type === "text") {
              full += ev.delta;
              patch((m) => ({ ...m, text: m.text + ev.delta }));
            } else if (ev.type === "action") {
              const a = ev.action as Action;
              if (a.type === "language") pendingLocale = a.locale;
              const label = doAction(a);
              patch((m) => ({ ...m, chips: [...(m.chips ?? []), label] }));
            } else if (ev.type === "done") {
              setMode(ev.mode);
            } else if (ev.type === "error") {
              const msg = ev.code === "rate_limited" ? t.rateLimited : t.error;
              if (!full) patch((m) => ({ ...m, text: msg, error: true }));
              else setNotice(msg);
            }
          }
        }
      } catch {
        patch((m) => ({ ...m, text: m.text || t.error, error: !m.text }));
      } finally {
        setBusy(false);
      }

      const switchLanguage = () => {
        if (!pendingLocale) return;
        localeRef.current = pendingLocale;
        navigate(window.location.pathname.replace(/^\/(az|en|ru)(?=\/|$)/, `/${pendingLocale}`));
      };
      if (voiceRef.current && full) {
        speak(full, () => {
          switchLanguage();
          if (voiceRef.current && !pendingLocale) window.setTimeout(listen, 250);
        });
      } else {
        setVoiceState("idle");
        switchLanguage();
      }
    },
    [busy, messages, stopListening, doAction, navigate, speak, listen, t],
  );
  sendRef.current = send;

  const reset = () => {
    stopListening();
    window.speechSynthesis?.cancel();
    session.current = uid();
    setMessages([]);
    setMode(null);
    setVoiceState("idle");
  };
  const toggleVoice = () => {
    if (voice) {
      stopListening();
      window.speechSynthesis?.cancel();
      setVoice(false);
      setVoiceState("idle");
    } else {
      if (!Recognizer()) {
        setNotice(t.micUnsupported);
        return;
      }
      setVoice(true);
      window.setTimeout(listen, 150);
    }
  };
  const close = () => {
    stopListening();
    window.speechSynthesis?.cancel();
    setVoiceState("idle");
    setOpen(false);
  };

  const shown: Msg[] = messages.length ? messages : [{ id: "greet", role: "assistant", text: t.greeting }];
  const stateLabel = { idle: t.tapToSpeak, listening: t.listening, thinking: t.thinking, speaking: t.speaking }[voiceState];

  return (
    <>
      <AnimatePresence>
        {!open && ready && (
          <motion.button
            key="launcher"
            type="button"
            className={s.launcher}
            aria-label={t.launcher}
            onClick={() => setOpen(true)}
            initial={{ scale: 0.6, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0.6, opacity: 0 }}
            transition={{ type: "spring", stiffness: 380, damping: 26 }}
          >
            <span className={s.launcherGlow} aria-hidden="true" />
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
              <path d="M12 3l1.6 4.4L18 9l-4.4 1.6L12 15l-1.6-4.4L6 9l4.4-1.6L12 3z" />
              <path d="M18.5 14.5l.8 2.2 2.2.8-2.2.8-.8 2.2-.8-2.2-2.2-.8 2.2-.8.8-2.2z" />
            </svg>
            <span className={s.launcherLabel}>AI</span>
          </motion.button>
        )}
      </AnimatePresence>

      <AnimatePresence>
        {open && (
          <motion.section
            key="panel"
            role="dialog"
            aria-label={t.title}
            className={s.panel}
            initial={{ opacity: 0, y: 24, scale: 0.96 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 24, scale: 0.96 }}
            transition={{ duration: 0.35, ease: [0.22, 1, 0.36, 1] }}
            data-lenis-prevent
          >
            <header className={s.head}>
              <span className={s.avatar} aria-hidden="true">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M12 3l1.6 4.4L18 9l-4.4 1.6L12 15l-1.6-4.4L6 9l4.4-1.6L12 3z" />
                </svg>
              </span>
              <div className={s.headText}>
                <strong>{t.title}</strong>
                <span>
                  <i className={mode === "basic" ? s.dotBasic : s.dot} />
                  {mode === "basic" ? t.basic : t.online}
                </span>
              </div>
              <button type="button" className={`${s.iconBtn} ${voice ? s.iconOn : ""}`} onClick={toggleVoice} aria-pressed={voice} title={voice ? t.voiceExit : t.voiceMode} aria-label={voice ? t.voiceExit : t.voiceMode}>
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" aria-hidden="true">
                  <path d="M4 10v4M8 7v10M12 4v16M16 7v10M20 10v4" />
                </svg>
              </button>
              <button type="button" className={s.iconBtn} onClick={reset} title={t.reset} aria-label={t.reset}>
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                  <path d="M4 12a8 8 0 1 0 2.4-5.7L4 8.5M4 4v4.5h4.5" />
                </svg>
              </button>
              <button type="button" className={s.iconBtn} onClick={close} title={t.close} aria-label={t.close}>
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" aria-hidden="true">
                  <path d="M6 6l12 12M18 6L6 18" />
                </svg>
              </button>
            </header>

            <div className={s.log} ref={logRef} aria-live="polite">
              {shown.map((m) => (
                <div key={m.id} className={`${s.row} ${m.role === "user" ? s.rowUser : ""}`}>
                  <div className={`${s.bubble} ${m.role === "user" ? s.user : s.bot} ${m.error ? s.err : ""}`}>
                    {m.role === "assistant" ? (
                      m.text ? (
                        <Rich text={m.text} onLink={(h) => navigate(h)} />
                      ) : (
                        <span className={s.typing} aria-label={t.thinking}>
                          <i />
                          <i />
                          <i />
                        </span>
                      )
                    ) : (
                      m.text
                    )}
                    {m.chips && m.chips.length > 0 && (
                      <span className={s.chips}>
                        {m.chips.map((c, i) => (
                          <span key={i} className={s.chip}>
                            ✓ {c}
                          </span>
                        ))}
                      </span>
                    )}
                  </div>
                </div>
              ))}
              {interim && !voice && (
                <div className={`${s.row} ${s.rowUser}`}>
                  <div className={`${s.bubble} ${s.user} ${s.interim}`}>{interim}</div>
                </div>
              )}
              {!messages.length && (
                <div className={s.suggest}>
                  {t.suggestions.map((q) => (
                    <button key={q} type="button" onClick={() => send(q)}>
                      {q}
                    </button>
                  ))}
                </div>
              )}
            </div>

            {notice && <p className={s.notice}>{notice}</p>}

            {voice ? (
              <div className={s.voice}>
                <button
                  type="button"
                  className={`${s.orb} ${s[voiceState]}`}
                  onClick={() => (voiceState === "listening" ? stopListening() : voiceState === "speaking" ? (window.speechSynthesis.cancel(), setVoiceState("idle")) : listen())}
                  aria-label={voiceState === "idle" ? t.tapToSpeak : t.stop}
                >
                  <span className={s.ring} />
                  <span className={s.ring} />
                  <span className={s.core}>
                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" aria-hidden="true">
                      {voiceState === "listening" || voiceState === "speaking" ? <rect x="7" y="7" width="10" height="10" rx="2" /> : <><rect x="9" y="3" width="6" height="12" rx="3" /><path d="M5 11a7 7 0 0 0 14 0M12 18v3" /></>}
                    </svg>
                  </span>
                </button>
                <p className={s.voiceLabel}>{interim || stateLabel}</p>
                <div className={s.voiceTools}>
                  <button type="button" onClick={() => setMuted((m) => !m)} aria-pressed={muted}>
                    {muted ? t.unmuted : t.muted}
                  </button>
                  <button type="button" onClick={toggleVoice}>
                    {t.voiceExit}
                  </button>
                </div>
              </div>
            ) : (
              <form
                className={s.inputRow}
                onSubmit={(e) => {
                  e.preventDefault();
                  send(input);
                }}
              >
                <label htmlFor="cp-assistant-input" className="sr-only">
                  {t.placeholder}
                </label>
                <textarea
                  id="cp-assistant-input"
                  ref={inputRef}
                  rows={1}
                  value={input}
                  maxLength={1500}
                  placeholder={t.placeholder}
                  onChange={(e) => setInput(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === "Enter" && !e.shiftKey) {
                      e.preventDefault();
                      send(input);
                    }
                  }}
                />
                <button
                  type="button"
                  className={`${s.mic} ${voiceState === "listening" ? s.micOn : ""}`}
                  onClick={() => (voiceState === "listening" ? stopListening() : listen())}
                  aria-label={t.mic}
                  title={t.mic}
                >
                  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" aria-hidden="true">
                    <rect x="9" y="3" width="6" height="12" rx="3" />
                    <path d="M5 11a7 7 0 0 0 14 0M12 18v3" />
                  </svg>
                </button>
                <button type="submit" className={s.sendBtn} disabled={busy || !input.trim()} aria-label={t.send}>
                  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                    <path d="M5 12h14M13 6l6 6-6 6" />
                  </svg>
                </button>
              </form>
            )}
            <a className={s.privacy} href={`/${locale}/privacy`} onClick={(e) => { e.preventDefault(); navigate(`/${locale}/privacy`); }}>
              {t.privacy}
            </a>
          </motion.section>
        )}
      </AnimatePresence>
    </>
  );
}
