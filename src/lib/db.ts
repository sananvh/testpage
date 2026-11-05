import "server-only";
import fs from "node:fs";
import path from "node:path";
import { DatabaseSync } from "node:sqlite";

export const DATA_DIR = process.env.DATA_DIR ?? path.join(process.cwd(), "data");
export const UPLOAD_DIR = path.join(DATA_DIR, "uploads");
export const PRIVATE_DIR = path.join(DATA_DIR, "private");

const SCHEMA = `
CREATE TABLE IF NOT EXISTS services (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  slug TEXT NOT NULL UNIQUE,
  phase TEXT NOT NULL DEFAULT 'assess',
  icon TEXT NOT NULL DEFAULT 'shield',
  sort INTEGER NOT NULL DEFAULT 0,
  published INTEGER NOT NULL DEFAULT 1,
  title_az TEXT NOT NULL DEFAULT '', title_en TEXT NOT NULL DEFAULT '', title_ru TEXT NOT NULL DEFAULT '',
  short_az TEXT NOT NULL DEFAULT '', short_en TEXT NOT NULL DEFAULT '', short_ru TEXT NOT NULL DEFAULT '',
  body_az TEXT NOT NULL DEFAULT '', body_en TEXT NOT NULL DEFAULT '', body_ru TEXT NOT NULL DEFAULT '',
  features_az TEXT NOT NULL DEFAULT '', features_en TEXT NOT NULL DEFAULT '', features_ru TEXT NOT NULL DEFAULT ''
);
CREATE TABLE IF NOT EXISTS products (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  slug TEXT NOT NULL UNIQUE,
  name TEXT NOT NULL,
  full_name TEXT NOT NULL DEFAULT '',
  grp TEXT NOT NULL DEFAULT 'secops',
  sort INTEGER NOT NULL DEFAULT 0,
  published INTEGER NOT NULL DEFAULT 1,
  desc_az TEXT NOT NULL DEFAULT '', desc_en TEXT NOT NULL DEFAULT '', desc_ru TEXT NOT NULL DEFAULT '',
  body_az TEXT NOT NULL DEFAULT '', body_en TEXT NOT NULL DEFAULT '', body_ru TEXT NOT NULL DEFAULT ''
);
CREATE TABLE IF NOT EXISTS partners (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  name TEXT NOT NULL,
  logo TEXT NOT NULL DEFAULT '',
  logo_dark TEXT NOT NULL DEFAULT '',
  url TEXT NOT NULL DEFAULT '',
  tags TEXT NOT NULL DEFAULT '',
  sort INTEGER NOT NULL DEFAULT 0,
  published INTEGER NOT NULL DEFAULT 1
);
CREATE TABLE IF NOT EXISTS clients (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  name TEXT NOT NULL,
  logo TEXT NOT NULL DEFAULT '',
  logo_dark TEXT NOT NULL DEFAULT '',
  url TEXT NOT NULL DEFAULT '',
  sector TEXT NOT NULL DEFAULT 'other',
  sort INTEGER NOT NULL DEFAULT 0,
  published INTEGER NOT NULL DEFAULT 1
);
CREATE TABLE IF NOT EXISTS certificates (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  name TEXT NOT NULL,
  logo TEXT NOT NULL DEFAULT '',
  logo_dark TEXT NOT NULL DEFAULT '',
  kind TEXT NOT NULL DEFAULT 'team',
  issuer TEXT NOT NULL DEFAULT '',
  sort INTEGER NOT NULL DEFAULT 0,
  published INTEGER NOT NULL DEFAULT 1
);
CREATE TABLE IF NOT EXISTS news (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  slug TEXT NOT NULL UNIQUE,
  date TEXT NOT NULL,
  image TEXT NOT NULL DEFAULT '',
  published INTEGER NOT NULL DEFAULT 1,
  title_az TEXT NOT NULL DEFAULT '', title_en TEXT NOT NULL DEFAULT '', title_ru TEXT NOT NULL DEFAULT '',
  body_az TEXT NOT NULL DEFAULT '', body_en TEXT NOT NULL DEFAULT '', body_ru TEXT NOT NULL DEFAULT ''
);
CREATE TABLE IF NOT EXISTS submissions (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  type TEXT NOT NULL,
  name TEXT NOT NULL,
  email TEXT NOT NULL,
  phone TEXT NOT NULL DEFAULT '',
  company TEXT NOT NULL DEFAULT '',
  topic TEXT NOT NULL DEFAULT '',
  message TEXT NOT NULL DEFAULT '',
  attachment TEXT NOT NULL DEFAULT '',
  locale TEXT NOT NULL DEFAULT 'az',
  emailed INTEGER NOT NULL DEFAULT 0,
  is_read INTEGER NOT NULL DEFAULT 0,
  created_at TEXT NOT NULL DEFAULT (datetime('now'))
);
CREATE TABLE IF NOT EXISTS settings (
  key TEXT PRIMARY KEY,
  value TEXT NOT NULL DEFAULT ''
);
CREATE TABLE IF NOT EXISTS assistant_chats (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  session_id TEXT NOT NULL UNIQUE,
  locale TEXT NOT NULL DEFAULT 'az',
  transcript TEXT NOT NULL DEFAULT '[]',
  turns INTEGER NOT NULL DEFAULT 0,
  mode TEXT NOT NULL DEFAULT 'ai',
  consultation INTEGER NOT NULL DEFAULT 0,
  is_read INTEGER NOT NULL DEFAULT 0,
  created_at TEXT NOT NULL DEFAULT (datetime('now')),
  updated_at TEXT NOT NULL DEFAULT (datetime('now'))
);
CREATE TABLE IF NOT EXISTS faqs (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  service_slug TEXT NOT NULL DEFAULT '',
  sort INTEGER NOT NULL DEFAULT 0,
  published INTEGER NOT NULL DEFAULT 1,
  home INTEGER NOT NULL DEFAULT 0,
  question_az TEXT NOT NULL DEFAULT '', question_en TEXT NOT NULL DEFAULT '', question_ru TEXT NOT NULL DEFAULT '',
  answer_az TEXT NOT NULL DEFAULT '', answer_en TEXT NOT NULL DEFAULT '', answer_ru TEXT NOT NULL DEFAULT ''
);
CREATE TABLE IF NOT EXISTS users (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  email TEXT NOT NULL UNIQUE,
  password_hash TEXT NOT NULL,
  created_at TEXT NOT NULL DEFAULT (datetime('now'))
);
`;

/** Adds columns introduced after a database was first created (idempotent). */
function migrate(db: DatabaseSync) {
  const add: [string, string, string][] = [
    ["partners", "logo_dark", "TEXT NOT NULL DEFAULT ''"],
    ["clients", "logo_dark", "TEXT NOT NULL DEFAULT ''"],
    ["certificates", "logo_dark", "TEXT NOT NULL DEFAULT ''"],
  ];
  for (const [table, col, def] of add) {
    const cols = db.prepare(`PRAGMA table_info(${table})`).all() as { name: string }[];
    if (!cols.some((c) => c.name === col)) db.exec(`ALTER TABLE ${table} ADD COLUMN ${col} ${def}`);
  }
}

type G = typeof globalThis & { __cpdb?: DatabaseSync };

function open(): DatabaseSync {
  fs.mkdirSync(DATA_DIR, { recursive: true });
  fs.mkdirSync(UPLOAD_DIR, { recursive: true });
  fs.mkdirSync(PRIVATE_DIR, { recursive: true });
  const db = new DatabaseSync(path.join(DATA_DIR, "cyberpoint.db"));
  db.exec("PRAGMA journal_mode = WAL; PRAGMA foreign_keys = ON;");
  db.exec(SCHEMA);
  migrate(db);
  return db;
}

export function db(): DatabaseSync {
  const g = globalThis as G;
  if (!g.__cpdb) {
    g.__cpdb = open();
    // Lazy import avoids a cycle: seed() itself uses db().
    // eslint-disable-next-line @typescript-eslint/no-require-imports
    const seed = require("./seed");
    seed.seedIfEmpty(g.__cpdb);
    seed.seedFaqIfEmpty(g.__cpdb);
  }
  return g.__cpdb;
}

export type Row = Record<string, string | number | null>;

export function all<T = Row>(sql: string, ...params: (string | number | null)[]): T[] {
  return db().prepare(sql).all(...params) as T[];
}
export function get<T = Row>(sql: string, ...params: (string | number | null)[]): T | undefined {
  return db().prepare(sql).get(...params) as T | undefined;
}
export function run(sql: string, ...params: (string | number | null)[]) {
  return db().prepare(sql).run(...params);
}
