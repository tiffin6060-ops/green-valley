import "server-only";
import Database from "better-sqlite3";
import fs from "fs";
import path from "path";
import { randomUUID } from "crypto";

export type Row = Record<string, any>;
export type Table =
  | "users" | "credentials" | "investments" | "project_updates" | "tickets" | "visit_requests" | "documents" | "audit_log" | "cameras" | "settings";

export const DATA_DIR = path.join(process.cwd(), "data");

// Column whitelist per table (also used to convert SQLite 0/1 <-> booleans).
const COLS: Record<Table, Record<string, "text" | "int" | "bool">> = {
  users: { id: "text", created_at: "text", email: "text", name: "text", mobile: "text", role: "text", active: "bool", must_change_password: "bool" },
  credentials: { id: "text", created_at: "text", user_id: "text", password_hash: "text" },
  investments: { id: "text", created_at: "text", user_id: "text", category: "text", amount_bdt: "int", distributions_bdt: "int", stage: "text", next_review: "text", status: "text" },
  project_updates: { id: "text", created_at: "text", title: "text", body: "text", progress_pct: "int", published: "bool" },
  tickets: { id: "text", created_at: "text", user_id: "text", category: "text", subject: "text", message: "text", status: "text", reply: "text" },
  visit_requests: { id: "text", created_at: "text", full_name: "text", mobile: "text", email: "text", interest: "text", visit_date: "text", guests: "int", message: "text", status: "text", organization: "text", locale: "text" },
  documents: { id: "text", created_at: "text", title: "text", kind: "text", user_id: "text", file_name: "text", stored_name: "text", mime: "text", size: "int", uploaded_by: "text" },
  audit_log: { id: "text", created_at: "text", user_id: "text", action: "text", target: "text" },
  cameras: { id: "text", created_at: "text", name: "text", description: "text", upstream_url: "text", active: "bool", sort_order: "int" },
  settings: { id: "text", created_at: "text", key: "text", value: "text" },
};

const DDL = `
CREATE TABLE IF NOT EXISTS users (
  id TEXT PRIMARY KEY, created_at TEXT NOT NULL, email TEXT NOT NULL UNIQUE, name TEXT NOT NULL, mobile TEXT,
  role TEXT NOT NULL CHECK (role IN ('investor','staff','admin')),
  active INTEGER NOT NULL DEFAULT 1, must_change_password INTEGER NOT NULL DEFAULT 0);
CREATE TABLE IF NOT EXISTS credentials (
  id TEXT PRIMARY KEY, created_at TEXT NOT NULL, user_id TEXT NOT NULL UNIQUE REFERENCES users(id) ON DELETE CASCADE,
  password_hash TEXT NOT NULL);
CREATE TABLE IF NOT EXISTS investments (
  id TEXT PRIMARY KEY, created_at TEXT NOT NULL, user_id TEXT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  category TEXT NOT NULL, amount_bdt INTEGER NOT NULL CHECK (amount_bdt > 0),
  distributions_bdt INTEGER NOT NULL DEFAULT 0 CHECK (distributions_bdt >= 0),
  stage TEXT NOT NULL DEFAULT 'Onboarding', next_review TEXT,
  status TEXT NOT NULL DEFAULT 'active' CHECK (status IN ('active','closed')));
CREATE INDEX IF NOT EXISTS investments_user_idx ON investments(user_id);
CREATE TABLE IF NOT EXISTS project_updates (
  id TEXT PRIMARY KEY, created_at TEXT NOT NULL, title TEXT NOT NULL, body TEXT NOT NULL,
  progress_pct INTEGER NOT NULL DEFAULT 0 CHECK (progress_pct BETWEEN 0 AND 100), published INTEGER NOT NULL DEFAULT 0);
CREATE TABLE IF NOT EXISTS tickets (
  id TEXT PRIMARY KEY, created_at TEXT NOT NULL, user_id TEXT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  category TEXT NOT NULL, subject TEXT NOT NULL, message TEXT NOT NULL,
  status TEXT NOT NULL DEFAULT 'open' CHECK (status IN ('open','answered','closed')), reply TEXT);
CREATE INDEX IF NOT EXISTS tickets_user_idx ON tickets(user_id);
CREATE TABLE IF NOT EXISTS visit_requests (
  id TEXT PRIMARY KEY, created_at TEXT NOT NULL, full_name TEXT NOT NULL, mobile TEXT NOT NULL, email TEXT,
  interest TEXT, visit_date TEXT, guests INTEGER CHECK (guests BETWEEN 1 AND 50), message TEXT,
  organization TEXT, locale TEXT,
  status TEXT NOT NULL DEFAULT 'new' CHECK (status IN ('new','contacted','scheduled','done','cancelled')));
CREATE TABLE IF NOT EXISTS documents (
  id TEXT PRIMARY KEY, created_at TEXT NOT NULL, title TEXT NOT NULL,
  kind TEXT NOT NULL CHECK (kind IN ('report','document')),
  user_id TEXT REFERENCES users(id) ON DELETE CASCADE,          -- NULL = visible to all investors
  file_name TEXT NOT NULL, stored_name TEXT NOT NULL, mime TEXT NOT NULL, size INTEGER NOT NULL, uploaded_by TEXT NOT NULL);
CREATE INDEX IF NOT EXISTS documents_user_idx ON documents(user_id);
CREATE TABLE IF NOT EXISTS cameras (
  id TEXT PRIMARY KEY, created_at TEXT NOT NULL, name TEXT NOT NULL, description TEXT,
  upstream_url TEXT NOT NULL, active INTEGER NOT NULL DEFAULT 1, sort_order INTEGER NOT NULL DEFAULT 0);
CREATE TABLE IF NOT EXISTS settings (
  id TEXT PRIMARY KEY, created_at TEXT NOT NULL, key TEXT NOT NULL UNIQUE, value TEXT NOT NULL);
CREATE TABLE IF NOT EXISTS audit_log (
  id TEXT PRIMARY KEY, created_at TEXT NOT NULL, user_id TEXT NOT NULL, action TEXT NOT NULL, target TEXT NOT NULL);
`;

const g = globalThis as unknown as { __tgvdb?: Database.Database };
function conn() {
  if (!g.__tgvdb) {
    fs.mkdirSync(DATA_DIR, { recursive: true });
    const d = new Database(path.join(DATA_DIR, "app.db"));
    d.pragma("journal_mode = WAL");
    d.pragma("foreign_keys = ON");
    d.exec(DDL);
    // Migration: databases created before the new website lack these visit_requests columns.
    const have = new Set((d.prepare("PRAGMA table_info(visit_requests)").all() as { name: string }[]).map((c) => c.name));
    for (const col of ["organization", "locale"]) if (!have.has(col)) d.exec(`ALTER TABLE visit_requests ADD COLUMN ${col} TEXT`);
    g.__tgvdb = d;
  }
  return g.__tgvdb;
}

const cols = (t: Table) => {
  const c = COLS[t];
  if (!c) throw new Error(`Unknown table ${t}`);
  return c;
};
const check = (t: Table, keys: string[]) => {
  const c = cols(t);
  for (const k of keys) if (!(k in c)) throw new Error(`Unknown column ${t}.${k}`);
};
const enc = (v: any) => (typeof v === "boolean" ? (v ? 1 : 0) : v);
const dec = (t: Table, r: Row): Row => {
  const c = COLS[t];
  for (const k in r) if (c[k] === "bool") r[k] = !!r[k];
  return r;
};

function where(t: Table, filter: Row) {
  const keys = Object.keys(filter);
  check(t, keys);
  const parts = keys.map((k) => (filter[k] === null ? `${k} IS NULL` : `${k} = ?`));
  const params = keys.filter((k) => filter[k] !== null).map((k) => enc(filter[k]));
  return { sql: parts.length ? `WHERE ${parts.join(" AND ")}` : "", params };
}

function insertSync(t: Table, row: Row): Row {
  const full: Row = { id: randomUUID(), created_at: new Date().toISOString(), ...row };
  const keys = Object.keys(full).filter((k) => full[k] !== undefined);
  check(t, keys);
  conn().prepare(`INSERT INTO ${t} (${keys.join(",")}) VALUES (${keys.map(() => "?").join(",")})`).run(...keys.map((k) => enc(full[k])));
  return full;
}

// Same async API the rest of the app already uses.
export const db = {
  async list(t: Table, filter: Row = {}, limit?: number): Promise<Row[]> {
    const w = where(t, filter);
    const rows = conn()
      .prepare(`SELECT * FROM ${t} ${w.sql} ORDER BY created_at DESC, rowid DESC ${limit ? "LIMIT " + Math.floor(limit) : ""}`)
      .all(...w.params) as Row[];
    return rows.map((r) => dec(t, r));
  },
  async get(t: Table, id: string): Promise<Row | null> {
    return (await this.list(t, { id }, 1))[0] ?? null;
  },
  async find(t: Table, filter: Row): Promise<Row | null> {
    return (await this.list(t, filter, 1))[0] ?? null;
  },
  async count(t: Table): Promise<number> {
    cols(t);
    return (conn().prepare(`SELECT COUNT(*) n FROM ${t}`).get() as { n: number }).n;
  },
  async insert(t: Table, row: Row): Promise<Row> {
    return insertSync(t, row);
  },
  /** Atomic "only if the table is empty" insert (used for first-admin setup). Returns null if not empty. */
  async insertIfEmpty(t: Table, row: Row): Promise<Row | null> {
    return conn().transaction(() => {
      const n = (conn().prepare(`SELECT COUNT(*) n FROM ${t}`).get() as { n: number }).n;
      return n === 0 ? insertSync(t, row) : null;
    })();
  },
  async update(t: Table, id: string, patch: Row): Promise<void> {
    const keys = Object.keys(patch);
    if (!keys.length) return;
    check(t, keys);
    conn().prepare(`UPDATE ${t} SET ${keys.map((k) => `${k} = ?`).join(",")} WHERE id = ?`).run(...keys.map((k) => enc(patch[k])), id);
  },
  async remove(t: Table, id: string): Promise<void> {
    cols(t);
    conn().prepare(`DELETE FROM ${t} WHERE id = ?`).run(id);
  },
};
