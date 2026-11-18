import "server-only";
import crypto from "node:crypto";

/**
 * Time-based one-time passwords (RFC 6238 / RFC 4226): HMAC-SHA1, 30-second steps, 6 digits.
 * Compatible with Google Authenticator, Microsoft Authenticator, Authy, 1Password, etc.
 */
const ALPHABET = "ABCDEFGHIJKLMNOPQRSTUVWXYZ234567";
const STEP = 30;
const DIGITS = 6;

export function base32Encode(buf: Buffer): string {
  let bits = 0, value = 0, out = "";
  for (const byte of buf) {
    value = (value << 8) | byte;
    bits += 8;
    while (bits >= 5) {
      out += ALPHABET[(value >>> (bits - 5)) & 31];
      bits -= 5;
    }
  }
  if (bits > 0) out += ALPHABET[(value << (5 - bits)) & 31];
  return out;
}

export function base32Decode(s: string): Buffer {
  const clean = s.toUpperCase().replace(/[^A-Z2-7]/g, "");
  let bits = 0, value = 0;
  const out: number[] = [];
  for (const ch of clean) {
    value = (value << 5) | ALPHABET.indexOf(ch);
    bits += 5;
    if (bits >= 8) {
      out.push((value >>> (bits - 8)) & 255);
      bits -= 8;
    }
  }
  return Buffer.from(out);
}

/** New 160-bit secret, base32 (what the authenticator app stores). */
export function newSecret(): string {
  return base32Encode(crypto.randomBytes(20));
}

export function codeAt(secret: string, step: number): string {
  const counter = Buffer.alloc(8);
  counter.writeBigUInt64BE(BigInt(step));
  const mac = crypto.createHmac("sha1", base32Decode(secret)).update(counter).digest();
  const offset = mac[mac.length - 1] & 15;
  const bin = ((mac[offset] & 127) << 24) | (mac[offset + 1] << 16) | (mac[offset + 2] << 8) | mac[offset + 3];
  return String(bin % 10 ** DIGITS).padStart(DIGITS, "0");
}

export const currentStep = (now = Date.now()) => Math.floor(now / 1000 / STEP);

/**
 * Checks a code against the current step ±1 (clock drift). Returns the matched step, or null.
 * Steps at or before `lastUsedStep` are refused, so a code cannot be used twice.
 */
export function verifyCode(secret: string, code: string, lastUsedStep = 0, now = Date.now()): number | null {
  const c = code.replace(/\s+/g, "");
  if (!/^\d{6}$/.test(c)) return null;
  const step = currentStep(now);
  for (const s of [step, step - 1, step + 1]) {
    if (s <= lastUsedStep) continue;
    const expected = codeAt(secret, s);
    if (crypto.timingSafeEqual(Buffer.from(expected), Buffer.from(c))) return s;
  }
  return null;
}

export function otpauthUri(secret: string, account: string): string {
  const issuer = "Cyberpoint Admin";
  return `otpauth://totp/${encodeURIComponent(issuer)}:${encodeURIComponent(account)}?secret=${secret}&issuer=${encodeURIComponent(issuer)}&algorithm=SHA1&digits=${DIGITS}&period=${STEP}`;
}

/* ---------- Backup codes: 10 single-use codes like "k7m2-9qxp", stored as SHA-256 hashes ---------- */
const BACKUP_ALPHABET = "abcdefghjkmnpqrstuvwxyz23456789"; // no look-alikes (0/o, 1/l/i)
export const normalizeBackup = (code: string) => code.toLowerCase().replace(/[^a-z0-9]/g, "");
export const hashBackup = (code: string) => crypto.createHash("sha256").update(normalizeBackup(code)).digest("hex");

export function newBackupCodes(n = 10): string[] {
  return Array.from({ length: n }, () => {
    const chars = Array.from(crypto.randomBytes(8), (b) => BACKUP_ALPHABET[b % BACKUP_ALPHABET.length]).join("");
    return `${chars.slice(0, 4)}-${chars.slice(4)}`;
  });
}
