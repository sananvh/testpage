import "server-only";
import crypto from "node:crypto";
import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { get, run } from "./db";

/**
 * Admin sessions are stored server-side: the cookie holds a random 256-bit token and the
 * database keeps only its SHA-256 hash. Logout, password changes and user removal revoke
 * sessions immediately. Sessions end after 2 hours without activity or 12 hours in total.
 *
 * Two-factor login: after the password a session is only "pending" (stage 2fa, setup or codes,
 * valid 10 minutes). Only a "full" session of a user with two-factor login enabled opens the
 * panel, and the token is replaced when the login completes.
 */
const COOKIE = "cp_admin";
const MAX_AGE = 60 * 60 * 12; // seconds: absolute lifetime
const PENDING_MS = 10 * 60 * 1000; // password accepted, second factor still missing
const IDLE_MS = 2 * 60 * 60 * 1000; // inactivity timeout
const TOUCH_MS = 60 * 1000; // how often last_seen is written

export type Stage = "full" | "2fa" | "setup" | "codes";
const hash = (token: string) => crypto.createHash("sha256").update(token).digest("hex");
const TOKEN_RE = /^[A-Za-z0-9_-]{43}$/;

export async function createSession(userId: number, stage: Stage = "full", data = "") {
  const token = crypto.randomBytes(32).toString("base64url");
  const now = Date.now();
  const ttl = stage === "full" ? MAX_AGE * 1000 : PENDING_MS;
  run("DELETE FROM sessions WHERE expires_at < ? OR last_seen < ?", now, now - IDLE_MS);
  run(
    "INSERT INTO sessions (token_hash, user_id, created_at, last_seen, expires_at, stage, data) VALUES (?,?,?,?,?,?,?)",
    hash(token), userId, now, now, now + ttl, stage, data,
  );
  (await cookies()).set(COOKIE, token, {
    httpOnly: true, sameSite: "lax", secure: process.env.NODE_ENV === "production" && process.env.INSECURE_COOKIES !== "1",
    path: "/", maxAge: stage === "full" ? MAX_AGE : PENDING_MS / 1000,
  });
}

async function currentToken(): Promise<string | null> {
  const raw = (await cookies()).get(COOKIE)?.value;
  return raw && TOKEN_RE.test(raw) ? raw : null;
}

export async function destroySession() {
  const token = await currentToken();
  if (token) run("DELETE FROM sessions WHERE token_hash = ?", hash(token));
  (await cookies()).delete(COOKIE);
}

/** Ends every session of a user, optionally keeping the one making the request. */
export async function revokeUserSessions(userId: number, keepCurrent = false) {
  const token = keepCurrent ? await currentToken() : null;
  if (token) run("DELETE FROM sessions WHERE user_id = ? AND token_hash != ?", userId, hash(token));
  else run("DELETE FROM sessions WHERE user_id = ?", userId);
}

type SessionRow = {
  id: number; email: string; totp_enabled: number; token_hash: string; last_seen: number; expires_at: number; stage: Stage; data: string;
};

async function currentSession(): Promise<SessionRow | null> {
  const token = await currentToken();
  if (!token) return null;
  const now = Date.now();
  const row = get<SessionRow>(
    `SELECT u.id, u.email, u.totp_enabled, s.token_hash, s.last_seen, s.expires_at, s.stage, s.data
     FROM sessions s JOIN users u ON u.id = s.user_id WHERE s.token_hash = ?`,
    hash(token),
  );
  if (!row) return null;
  if (row.expires_at < now || now - row.last_seen > IDLE_MS) {
    run("DELETE FROM sessions WHERE token_hash = ?", row.token_hash);
    return null;
  }
  if (now - row.last_seen > TOUCH_MS) run("UPDATE sessions SET last_seen = ? WHERE token_hash = ?", now, row.token_hash);
  return row;
}

export type AdminUser = { id: number; email: string };

/** Fully signed-in admin (password + second factor), or null. */
export async function getAdmin(): Promise<AdminUser | null> {
  const s = await currentSession();
  if (!s || s.stage !== "full" || !s.totp_enabled) return null;
  return { id: s.id, email: s.email };
}

export async function requireAdmin(): Promise<AdminUser> {
  const user = await getAdmin();
  if (!user) redirect("/admin/login");
  return user;
}

/** A login that is between the password and the end of the second-factor step. */
export async function getPending(stages: Stage[]): Promise<(AdminUser & { stage: Stage; data: string; tokenHash: string }) | null> {
  const s = await currentSession();
  if (!s || !stages.includes(s.stage)) return null;
  return { id: s.id, email: s.email, stage: s.stage, data: s.data, tokenHash: s.token_hash };
}

export function updatePending(tokenHash: string, stage: Stage, data: string) {
  run("UPDATE sessions SET stage = ?, data = ? WHERE token_hash = ?", stage, data, tokenHash);
}

/** Second factor done: replace the pending session with a new full one (new token). */
export async function completeLogin(userId: number, tokenHash: string) {
  run("DELETE FROM sessions WHERE token_hash = ?", tokenHash);
  await createSession(userId, "full");
}

/** Short-lived data on the current full session (e.g. new backup codes shown once). */
export async function setSessionData(data: string) {
  const token = await currentToken();
  if (token) run("UPDATE sessions SET data = ? WHERE token_hash = ?", data, hash(token));
}
export async function takeSessionData(): Promise<string> {
  const token = await currentToken();
  if (!token) return "";
  const row = get<{ data: string }>("SELECT data FROM sessions WHERE token_hash = ?", hash(token));
  if (row?.data) run("UPDATE sessions SET data = '' WHERE token_hash = ?", hash(token));
  return row?.data ?? "";
}

export { rateLimit } from "./security";
