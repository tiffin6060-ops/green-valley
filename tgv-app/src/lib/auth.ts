import "server-only";
import { cookies, headers } from "next/headers";
import { redirect } from "next/navigation";
import { randomBytes, scrypt as _scrypt, timingSafeEqual } from "crypto";
import { promisify } from "util";
import { db } from "@/lib/db";
import { COOKIE, SESSION_SECONDS, signSession, verifySession, type Role } from "@/lib/session-token";

const scrypt = promisify(_scrypt) as (pw: string, salt: Buffer, len: number) => Promise<Buffer>;

export type User = {
  id: string; email: string; name: string; mobile: string | null; role: Role;
  active: boolean; must_change_password: boolean; created_at: string;
};

export async function hashPassword(pw: string) {
  const salt = randomBytes(16);
  const hash = await scrypt(pw, salt, 64);
  return `scrypt$${salt.toString("hex")}$${hash.toString("hex")}`;
}
export async function verifyPassword(pw: string, stored: string) {
  const [alg, saltHex, hashHex] = stored.split("$");
  if (alg !== "scrypt" || !saltHex || !hashHex) return false;
  const expected = Buffer.from(hashHex, "hex");
  const actual = await scrypt(pw, Buffer.from(saltHex, "hex"), expected.length);
  return timingSafeEqual(actual, expected);
}

// Password hashes live in their own table so they are never loaded with ordinary user reads.
export async function getPasswordHash(userId: string): Promise<string | null> {
  return (await db.find("credentials", { user_id: userId }))?.password_hash ?? null;
}
export async function setPassword(userId: string, plain: string) {
  const password_hash = await hashPassword(plain);
  const existing = await db.find("credentials", { user_id: userId });
  if (existing) await db.update("credentials", existing.id, { password_hash });
  else await db.insert("credentials", { user_id: userId, password_hash });
}

export function generateTempPassword() {
  const chars = "ABCDEFGHJKMNPQRSTUVWXYZabcdefghjkmnpqrstuvwxyz23456789";
  const b = randomBytes(12);
  return Array.from(b, (x) => chars[x % chars.length]).join("");
}

export async function startSession(u: { id: string; role: Role; name: string }) {
  const token = await signSession({ sub: u.id, role: u.role, name: u.name });
  (await cookies()).set(COOKIE, token, {
    httpOnly: true, sameSite: "lax", secure: process.env.NODE_ENV === "production", path: "/", maxAge: SESSION_SECONDS,
  });
}
export async function endSession() { (await cookies()).delete(COOKIE); }

export async function getUser(): Promise<User | null> {
  const s = await verifySession((await cookies()).get(COOKIE)?.value);
  if (!s) return null;
  const row = await db.get("users", s.sub); // re-check DB so disabled users lose access immediately
  if (!row || !row.active) return null;
  return row as User;
}

export async function requireUser(roles?: Role[]): Promise<User> {
  const u = await getUser();
  if (!u) redirect("/login");
  if (roles && !roles.includes(u.role)) redirect(u.role === "investor" ? "/portal" : "/admin");
  if (u.must_change_password && u.role === "investor") {
    const path = (await headers()).get("x-pathname") ?? "";
    if (path !== "/portal/account") redirect("/portal/account?force=1");
  }
  return u;
}

// ---- login throttling (in-memory: per server instance; fine for one VPS, weak on serverless) ----
const attempts = new Map<string, { n: number; reset: number }>();
export function throttled(key: string, max = 5, windowMs = 15 * 60_000) {
  const now = Date.now();
  const a = attempts.get(key);
  if (!a || a.reset < now) { attempts.set(key, { n: 1, reset: now + windowMs }); return false; }
  a.n++;
  return a.n > max;
}
export function clearThrottle(key: string) { attempts.delete(key); }

// ---- first-run setup: the very first account becomes the admin (see /setup) ----
export async function hasUsers() { return (await db.count("users")) > 0; }

export async function createFirstAdmin(name: string, email: string, password: string): Promise<User | null> {
  const row = await db.insertIfEmpty("users", { email, name, mobile: null, role: "admin", active: true, must_change_password: false });
  if (!row) return null;
  await setPassword(row.id, password);
  return row as User;
}

export async function seedDemoData() {
  const inv = await db.insert("users", {
    email: "demo@example.com", name: "Demo Investor", mobile: "01700000000", role: "investor", active: true, must_change_password: false,
  });
  await setPassword(inv.id, "Demo12345!");
  await db.insert("investments", { user_id: inv.id, category: "Cattle", amount_bdt: 1000000, distributions_bdt: 0, stage: "Production", next_review: "2026-12-15", status: "active" });
  await db.insert("project_updates", { title: "Cattle shed development", body: "Demo update. Replace with a real, dated project update.", progress_pct: 72, published: true });
}
