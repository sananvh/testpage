"use client";

import { useState } from "react";
import type { Locale } from "@/i18n/config";
import type { Dictionary } from "@/i18n/dictionaries/az";
import Icon from "../Icon";
import s from "./form.module.css";

type Props = {
  kind: "contact" | "career";
  t: Dictionary["form"];
  locale: Locale;
  title?: string;
  text?: string;
  topics?: { value: string; label: string }[];
  initialTopic?: string;
};

type Errors = Partial<Record<"name" | "email" | "message" | "consent" | "cv", string>>;
type Status = "idle" | "sending" | "success" | "error" | "limited";

const EMAIL = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/;
const CV_TYPES = [".pdf", ".doc", ".docx"];

export default function LeadForm({ kind, t, locale, title, text, topics = [], initialTopic = "" }: Props) {
  const [status, setStatus] = useState<Status>("idle");
  const [errors, setErrors] = useState<Errors>({});
  const [fileName, setFileName] = useState("");

  async function onSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const form = e.currentTarget;
    const data = new FormData(form);
    const get = (k: string) => String(data.get(k) ?? "").trim();

    const next: Errors = {};
    if (!get("name")) next.name = t.required;
    if (!get("email")) next.email = t.required;
    else if (!EMAIL.test(get("email"))) next.email = t.invalidEmail;
    if (kind === "contact" && !get("message")) next.message = t.required;
    if (!data.get("consent")) next.consent = t.required;
    const cv = data.get("cv");
    if (kind === "career") {
      if (!(cv instanceof File) || cv.size === 0) next.cv = t.required;
      else if (!CV_TYPES.some((x) => cv.name.toLowerCase().endsWith(x)) || cv.size > 5 * 1024 * 1024) next.cv = t.fileType;
    }
    setErrors(next);
    if (Object.keys(next).length) {
      form.querySelector<HTMLElement>(`[name="${Object.keys(next)[0]}"]`)?.focus();
      return;
    }

    data.set("kind", kind);
    data.set("locale", locale);
    setStatus("sending");
    try {
      const res = await fetch("/api/forms", { method: "POST", body: data });
      if (res.status === 429) return setStatus("limited");
      if (!res.ok) throw new Error(String(res.status));
      setStatus("success");
      form.reset();
      setFileName("");
    } catch {
      setStatus("error");
    }
  }

  const aria = (k: keyof Errors) => ({
    "aria-invalid": errors[k] ? true : undefined,
    "aria-describedby": errors[k] ? `${kind}-${k}-err` : undefined,
  });
  const err = (k: keyof Errors) => errors[k] && <em id={`${kind}-${k}-err`}>{errors[k]}</em>;
  const id = (k: string) => `${kind}-${k}`;

  if (status === "success") {
    return (
      <div className={s.form} role="status">
        <div className={s.done}>
          <span className={s.doneIcon}>
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
              <path d="M5 12.5l4.5 4.5L19 7.5" />
            </svg>
          </span>
          <p>{t.success}</p>
          <button type="button" className="btn btn-outline btn-sm" onClick={() => setStatus("idle")}>
            OK
          </button>
        </div>
      </div>
    );
  }

  return (
    <form className={s.form} onSubmit={onSubmit} noValidate>
      {title && <h2 className={s.title}>{title}</h2>}
      {text && <p className={s.text}>{text}</p>}

      <div className={s.row}>
        <label className={s.field} htmlFor={id("name")}>
          <span>{t.name} *</span>
          <input id={id("name")} name="name" autoComplete="name" maxLength={120} {...aria("name")} />
          {err("name")}
        </label>
        <label className={s.field} htmlFor={id("email")}>
          <span>{t.email} *</span>
          <input id={id("email")} name="email" type="email" autoComplete="email" maxLength={160} placeholder="name@company.az" {...aria("email")} />
          {err("email")}
        </label>
      </div>
      <div className={s.row}>
        <label className={s.field} htmlFor={id("phone")}>
          <span>{t.phone}</span>
          <input id={id("phone")} name="phone" type="tel" autoComplete="tel" maxLength={40} placeholder="+994" />
        </label>
        {kind === "contact" ? (
          <label className={s.field} htmlFor={id("company")}>
            <span>{t.company}</span>
            <input id={id("company")} name="company" autoComplete="organization" maxLength={160} />
          </label>
        ) : (
          <label className={s.field} htmlFor={id("topic")}>
            <span>{t.position}</span>
            <input id={id("topic")} name="topic" maxLength={120} placeholder={t.positionPlaceholder} />
          </label>
        )}
      </div>

      {kind === "contact" && topics.length > 0 && (
        <label className={s.field} htmlFor={id("topic")}>
          <span>{t.topic}</span>
          <select id={id("topic")} name="topic" defaultValue={initialTopic}>
            <option value="">{t.topicPlaceholder}</option>
            {topics.map((o) => (
              <option key={o.value} value={o.value}>
                {o.label}
              </option>
            ))}
            <option value="other">{t.topicOther}</option>
          </select>
        </label>
      )}

      {kind === "career" && (
        <label className={`${s.field} ${s.file}`} htmlFor={id("cv")}>
          <span>{t.cv} *</span>
          <span className={s.drop}>
            <Icon name="clipboard" />
            <b>{fileName || "PDF · DOC · DOCX"}</b>
          </span>
          <input
            id={id("cv")}
            name="cv"
            type="file"
            accept=".pdf,.doc,.docx,application/pdf,application/msword,application/vnd.openxmlformats-officedocument.wordprocessingml.document"
            onChange={(e) => setFileName(e.target.files?.[0]?.name ?? "")}
            {...aria("cv")}
          />
          {err("cv")}
        </label>
      )}

      <label className={s.field} htmlFor={id("message")}>
        <span>
          {t.message}
          {kind === "contact" ? " *" : ""}
        </span>
        <textarea id={id("message")} name="message" rows={5} maxLength={4000} placeholder={t.messagePlaceholder} {...aria("message")} />
        {err("message")}
      </label>

      <input type="text" name="website" tabIndex={-1} autoComplete="off" className={s.hp} aria-hidden="true" />

      <label className={s.consent} htmlFor={id("consent")}>
        <input id={id("consent")} type="checkbox" name="consent" value="yes" {...aria("consent")} />
        <span>{t.consent}</span>
      </label>
      {err("consent")}

      <button type="submit" className="btn btn-primary" disabled={status === "sending"}>
        {status === "sending" ? t.sending : t.submit}
        <span className="btn-icon">
          <Icon name="arrow" />
        </span>
      </button>
      <p className={s.error} role="alert">
        {status === "error" ? t.error : status === "limited" ? t.tooMany : ""}
      </p>
    </form>
  );
}
