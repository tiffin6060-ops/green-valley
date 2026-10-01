// Edge-safe (used by middleware). No node-only imports here.
import { SignJWT, jwtVerify } from "jose";

export type Role = "investor" | "staff" | "admin";
export type SessionPayload = { sub: string; role: Role; name: string };
export const COOKIE = "tgv_session";
export const SESSION_SECONDS = 60 * 60 * 8;

function secret() {
  const s = process.env.AUTH_SECRET;
  if (s && s.length >= 32) return new TextEncoder().encode(s);
  if (process.env.NODE_ENV === "production") throw new Error("AUTH_SECRET (32+ chars) is required in production");
  return new TextEncoder().encode("dev-only-insecure-secret-do-not-use-in-production!!");
}

export async function signSession(p: SessionPayload) {
  return new SignJWT({ role: p.role, name: p.name })
    .setProtectedHeader({ alg: "HS256" })
    .setSubject(p.sub)
    .setIssuedAt()
    .setExpirationTime(`${SESSION_SECONDS}s`)
    .sign(secret());
}

export async function verifySession(token?: string): Promise<SessionPayload | null> {
  if (!token) return null;
  try {
    const { payload } = await jwtVerify(token, secret(), { algorithms: ["HS256"] });
    return { sub: String(payload.sub), role: payload.role as Role, name: String(payload.name ?? "") };
  } catch {
    return null;
  }
}
