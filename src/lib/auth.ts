import "server-only";
import crypto from "node:crypto";
import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { get, run } from "./db";

/**
 * Admin sessions are stored server-side: the cookie holds a random 256-bit token and the
 * database keeps only its SHA-256 hash. Logout, password changes and user removal revoke
 * sessions immediately. Sessions end after 2 hours without activity or 12 hours in total.
 */
const COOKIE = "cp_admin";
const MAX_AGE = 60 * 60 * 12; // seconds: absolute lifetime
const IDLE_MS = 2 * 60 * 60 * 1000; // inactivity timeout
const TOUCH_MS = 60 * 1000; // how often last_seen is written

const hash = (token: string) => crypto.createHash("sha256").update(token).digest("hex");
const TOKEN_RE = /^[A-Za-z0-9_-]{43}$/;

export async function createSession(userId: number) {
  const token = crypto.randomBytes(32).toString("base64url");
  const now = Date.now();
  run("DELETE FROM sessions WHERE expires_at < ? OR last_seen < ?", now, now - IDLE_MS);
  run("INSERT INTO sessions (token_hash, user_id, created_at, last_seen, expires_at) VALUES (?,?,?,?,?)", hash(token), userId, now, now, now + MAX_AGE * 1000);
  (await cookies()).set(COOKIE, token, {
    httpOnly: true, sameSite: "lax", secure: process.env.NODE_ENV === "production" && process.env.INSECURE_COOKIES !== "1",
    path: "/", maxAge: MAX_AGE,
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

export type AdminUser = { id: number; email: string };

export async function getAdmin(): Promise<AdminUser | null> {
  const token = await currentToken();
  if (!token) return null;
  const now = Date.now();
  const row = get<{ id: number; email: string; token_hash: string; last_seen: number; expires_at: number }>(
    "SELECT u.id, u.email, s.token_hash, s.last_seen, s.expires_at FROM sessions s JOIN users u ON u.id = s.user_id WHERE s.token_hash = ?",
    hash(token),
  );
  if (!row) return null;
  if (row.expires_at < now || now - row.last_seen > IDLE_MS) {
    run("DELETE FROM sessions WHERE token_hash = ?", row.token_hash);
    return null;
  }
  if (now - row.last_seen > TOUCH_MS) run("UPDATE sessions SET last_seen = ? WHERE token_hash = ?", now, row.token_hash);
  return { id: row.id, email: row.email };
}

export async function requireAdmin(): Promise<AdminUser> {
  const user = await getAdmin();
  if (!user) redirect("/admin/login");
  return user;
}

export { rateLimit } from "./security";
