"use server";
import { headers } from "next/headers";
import { redirect } from "next/navigation";
import { z } from "zod";
import { db } from "@/lib/db";
import {
  clearThrottle, createFirstAdmin, hasUsers, seedDemoData, endSession, getPasswordHash, requireUser, setPassword, startSession, throttled, verifyPassword,
} from "@/lib/auth";

export type FormState = { ok: boolean; message: string; email?: string };

const loginSchema = z.object({ email: z.string().trim().toLowerCase().email(), password: z.string().min(1).max(200) });

export async function login(_p: FormState, fd: FormData): Promise<FormState> {
  const parsed = loginSchema.safeParse(Object.fromEntries(fd));
  const rawEmail = String(fd.get("email") ?? "");
  const generic = { ok: false, message: "Incorrect email or password.", email: rawEmail };
  if (!parsed.success) return generic;
  const { email, password } = parsed.data;

  const ip = (await headers()).get("x-forwarded-for")?.split(",")[0]?.trim() ?? "local";
  const key = `${ip}|${email}`;
  if (throttled(key)) return { ok: false, message: "Too many attempts. Please wait 15 minutes and try again.", email: rawEmail };

  if (!(await hasUsers())) redirect("/setup");
  const user = await db.find("users", { email });
  // Always run a hash comparison so timing does not reveal whether the email exists.
  const hash = user ? await getPasswordHash(user.id) : null;
  const ok = hash ? await verifyPassword(password, hash) : (await verifyPassword(password, "scrypt$00$00"), false);
  if (!user || !ok || !user.active) return generic;

  clearThrottle(key);
  await startSession({ id: user.id, role: user.role, name: user.name });
  redirect(user.role === "investor" ? (user.must_change_password ? "/portal/account?force=1" : "/portal") : "/admin");
}

export async function logout() {
  await endSession();
  redirect("/login");
}

const pwSchema = z.object({
  current: z.string().min(1),
  next: z.string().min(8, "New password must be at least 8 characters").max(200),
  confirm: z.string(),
}).refine((d) => d.next === d.confirm, { message: "Passwords do not match", path: ["confirm"] });

export async function changePassword(_p: FormState, fd: FormData): Promise<FormState> {
  const u = await requireUser();
  const parsed = pwSchema.safeParse(Object.fromEntries(fd));
  if (!parsed.success) return { ok: false, message: parsed.error.issues[0].message };
  const hash = await getPasswordHash(u.id);
  if (!hash || !(await verifyPassword(parsed.data.current, hash)))
    return { ok: false, message: "Current password is incorrect." };
  await setPassword(u.id, parsed.data.next);
  await db.update("users", u.id, { must_change_password: false });
  return { ok: true, message: "Password updated." };
}

const setupSchema = z.object({
  name: z.string().trim().min(2).max(100),
  email: z.string().trim().toLowerCase().email(),
  password: z.string().min(10, "Password must be at least 10 characters").max(200),
  confirm: z.string(),
}).refine((d) => d.password === d.confirm, { message: "Passwords do not match", path: ["confirm"] });

export async function setupAdmin(_p: FormState, fd: FormData): Promise<FormState> {
  if (await hasUsers()) redirect("/login");
  const parsed = setupSchema.safeParse(Object.fromEntries(fd));
  if (!parsed.success) return { ok: false, message: parsed.error.issues[0].message, email: String(fd.get("email") ?? "") };
  const admin = await createFirstAdmin(parsed.data.name, parsed.data.email, parsed.data.password);
  if (!admin) redirect("/login");
  if (fd.get("demo") === "on" && process.env.NODE_ENV !== "production") await seedDemoData();
  await startSession({ id: admin.id, role: admin.role, name: admin.name });
  redirect("/admin");
}
