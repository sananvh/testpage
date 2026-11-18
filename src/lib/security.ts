import "server-only";

/**
 * Visitor IP for rate limiting.
 *
 * Never trust the left-most X-Forwarded-For entry: the visitor writes it. A reverse proxy
 * (Nginx `proxy_add_x_forwarded_for`, Render, Cloudflare…) appends the address it actually saw,
 * so the trustworthy value is counted from the right:
 *   TRUSTED_PROXY_HOPS=1 (default)  one proxy in front of the app (Nginx on the VPS)
 *   CLIENT_IP_HEADER=true-client-ip,cf-connecting-ip  headers your edge (Cloudflare, Render) overwrites;
 *     the first one present wins. Only set this when such an edge is really in front, otherwise a
 *     visitor could send the header themselves.
 * The app port must not be reachable directly from the internet (docker-compose binds 127.0.0.1).
 */
export function clientIp(h: Headers): string {
  for (const name of (process.env.CLIENT_IP_HEADER ?? "").toLowerCase().split(",").map((s) => s.trim()).filter(Boolean)) {
    const v = h.get(name)?.split(",")[0]?.trim();
    if (v) return v.slice(0, 64);
  }
  const xff = h.get("x-forwarded-for");
  if (xff) {
    const parts = xff.split(",").map((s) => s.trim()).filter(Boolean);
    const hops = Math.min(10, Math.max(1, Number(process.env.TRUSTED_PROXY_HOPS) || 1));
    const ip = parts[parts.length - hops] ?? parts[0];
    if (ip) return ip.slice(0, 64);
  }
  return h.get("x-real-ip")?.trim().slice(0, 64) || "local";
}

/* ---------- In-memory sliding-window limiter (per process), with bounded memory ---------- */
const buckets = new Map<string, number[]>();
const MAX_KEYS = 50_000;
let lastSweep = 0;

function sweep(now: number) {
  if (now - lastSweep < 60_000 && buckets.size < MAX_KEYS) return;
  lastSweep = now;
  for (const [k, v] of buckets) if (!v.length || now - v[v.length - 1] > 24 * 60 * 60 * 1000) buckets.delete(k);
  if (buckets.size >= MAX_KEYS) buckets.clear(); // last resort under a flood of unique keys
}

function recent(key: string, windowMs: number, now: number): number[] {
  return (buckets.get(key) ?? []).filter((t) => now - t < windowMs);
}

/** Records one hit and returns false when `max` hits already happened within `windowMs`. */
export function rateLimit(key: string, max: number, windowMs: number): boolean {
  const now = Date.now();
  sweep(now);
  const list = recent(key, windowMs, now);
  if (list.length >= max) {
    buckets.set(key, list);
    return false;
  }
  list.push(now);
  buckets.set(key, list);
  return true;
}

/** Number of recorded hits for `key` within `windowMs`, without recording a new one. */
export function hits(key: string, windowMs: number): number {
  return recent(key, windowMs, Date.now()).length;
}

/** Records a hit without checking a limit (e.g. a failed login for an account). */
export function recordHit(key: string) {
  const now = Date.now();
  sweep(now);
  const list = recent(key, 24 * 60 * 60 * 1000, now);
  list.push(now);
  buckets.set(key, list);
}

export function clearHits(key: string) {
  buckets.delete(key);
}

/* ---------- Request bodies with a hard size cap ---------- */
/** Reads at most `max` bytes; returns null when the body is larger (checked before and while reading). */
export async function readBody(request: Request, max: number): Promise<Buffer | null> {
  const declared = Number(request.headers.get("content-length") || "0");
  if (declared > max) return null;
  if (!request.body) return Buffer.alloc(0);
  const reader = request.body.getReader();
  const chunks: Uint8Array[] = [];
  let total = 0;
  for (;;) {
    const { done, value } = await reader.read();
    if (done) break;
    total += value.byteLength;
    if (total > max) {
      await reader.cancel().catch(() => {});
      return null;
    }
    chunks.push(value);
  }
  return Buffer.concat(chunks);
}
