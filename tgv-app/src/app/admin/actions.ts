"use server";
import { revalidatePath } from "next/cache";
import { z } from "zod";
import { db } from "@/lib/db";
import { generateTempPassword, requireUser, setPassword } from "@/lib/auth";
import { CATEGORIES, STAGES } from "@/lib/constants";
import { deleteStored, storeUpload } from "@/lib/files";
import { parsePublicVideo } from "@/lib/video";
import { clearSetting, setSetting } from "@/lib/settings";
import type { FormState } from "@/app/auth-actions";

const VISIT_STATUSES = ["new", "contacted", "scheduled", "done", "cancelled"];

// ---- staff + admin ----
export async function setVisitStatus(fd: FormData) {
  await requireUser(["staff", "admin"]);
  const id = String(fd.get("id")), status = String(fd.get("status"));
  if (!VISIT_STATUSES.includes(status)) return;
  await db.update("visit_requests", id, { status });
  revalidatePath("/admin");
}

const updateSchema = z.object({
  title: z.string().trim().min(3).max(120),
  body: z.string().trim().min(5).max(3000),
  progress_pct: z.coerce.number().int().min(0).max(100),
});
export async function postUpdate(_p: FormState, fd: FormData): Promise<FormState> {
  await requireUser(["staff", "admin"]);
  const parsed = updateSchema.safeParse(Object.fromEntries(fd));
  if (!parsed.success) return { ok: false, message: parsed.error.issues[0].message };
  await db.insert("project_updates", { ...parsed.data, published: fd.get("published") === "on" });
  revalidatePath("/admin/updates"); revalidatePath("/portal/updates"); revalidatePath("/");
  return { ok: true, message: "Update saved." };
}
export async function togglePublish(fd: FormData) {
  await requireUser(["staff", "admin"]);
  const id = String(fd.get("id"));
  const row = await db.get("project_updates", id);
  if (row) await db.update("project_updates", id, { published: !row.published });
  revalidatePath("/admin/updates"); revalidatePath("/portal/updates"); revalidatePath("/");
}
export async function deleteUpdate(fd: FormData) {
  await requireUser(["staff", "admin"]);
  await db.remove("project_updates", String(fd.get("id")));
  revalidatePath("/admin/updates"); revalidatePath("/portal/updates"); revalidatePath("/");
}

export async function replyTicket(fd: FormData) {
  await requireUser(["staff", "admin"]);
  const id = String(fd.get("id"));
  const reply = String(fd.get("reply") ?? "").trim().slice(0, 2000);
  const close = fd.get("close") === "on";
  if (!reply && !close) return;
  await db.update("tickets", id, { ...(reply ? { reply } : {}), status: close ? "closed" : "answered" });
  revalidatePath("/admin/tickets"); revalidatePath("/portal/support");
}

// ---- admin only ----
const investorSchema = z.object({
  name: z.string().trim().min(2).max(100),
  email: z.string().trim().toLowerCase().email(),
  mobile: z.string().trim().max(20).optional(),
});
export async function createInvestor(_p: FormState, fd: FormData): Promise<FormState> {
  await requireUser(["admin"]);
  const parsed = investorSchema.safeParse(Object.fromEntries(fd));
  if (!parsed.success) return { ok: false, message: parsed.error.issues[0].message };
  if (await db.find("users", { email: parsed.data.email })) return { ok: false, message: "That email already has an account." };
  const temp = generateTempPassword();
  const created = await db.insert("users", {
    ...parsed.data, mobile: parsed.data.mobile || null, role: "investor", active: true, must_change_password: true,
  });
  await setPassword(created.id, temp);
  revalidatePath("/admin/investors");
  return { ok: true, message: `Account created. Temporary password (shown once, share securely): ${temp}` };
}

export async function toggleActive(fd: FormData) {
  const me = await requireUser(["admin"]);
  const id = String(fd.get("id"));
  if (id === me.id) return; // never lock yourself out
  const row = await db.get("users", id);
  if (row) await db.update("users", id, { active: !row.active });
  revalidatePath("/admin/investors");
}

export async function resetPassword(_p: FormState, fd: FormData): Promise<FormState> {
  await requireUser(["admin"]);
  const id = String(fd.get("id"));
  const row = await db.get("users", id);
  if (!row) return { ok: false, message: "User not found." };
  const temp = generateTempPassword();
  await setPassword(id, temp);
  await db.update("users", id, { must_change_password: true });
  return { ok: true, message: `New temporary password for ${row.email}: ${temp}` };
}

const investmentSchema = z.object({
  user_id: z.string().min(1),
  category: z.enum(CATEGORIES as [string, ...string[]]),
  amount_bdt: z.coerce.number().int().min(1).max(10_000_000_000),
  stage: z.enum(STAGES as [string, ...string[]]),
  next_review: z.string().optional(),
});
export async function createInvestment(_p: FormState, fd: FormData): Promise<FormState> {
  await requireUser(["admin"]);
  const parsed = investmentSchema.safeParse(Object.fromEntries(fd));
  if (!parsed.success) return { ok: false, message: parsed.error.issues[0].message };
  const owner = await db.get("users", parsed.data.user_id);
  if (!owner || owner.role !== "investor") return { ok: false, message: "Select a valid investor." };
  await db.insert("investments", {
    ...parsed.data, next_review: parsed.data.next_review || null, distributions_bdt: 0, status: "active",
  });
  revalidatePath("/admin/investors");
  return { ok: true, message: "Investment recorded." };
}

const editSchema = z.object({
  id: z.string().min(1),
  stage: z.enum(STAGES as [string, ...string[]]),
  distributions_bdt: z.coerce.number().int().min(0).max(10_000_000_000),
  next_review: z.string().optional(),
});
export async function updateInvestment(fd: FormData) {
  await requireUser(["admin"]);
  const p = editSchema.safeParse(Object.fromEntries(fd));
  if (!p.success) return;
  await db.update("investments", p.data.id, {
    stage: p.data.stage, distributions_bdt: p.data.distributions_bdt, next_review: p.data.next_review || null,
    status: p.data.stage === "Closed" ? "closed" : "active",
  });
  revalidatePath("/admin/investors"); revalidatePath("/portal");
}

// ---- documents & reports (staff + admin) ----
const docSchema = z.object({
  title: z.string().trim().min(2, "Title is too short").max(150),
  kind: z.enum(["report", "document"]),
  audience: z.string().min(1), // "all" or an investor id
});
export async function uploadDocument(_p: FormState, fd: FormData): Promise<FormState> {
  const me = await requireUser(["staff", "admin"]);
  const parsed = docSchema.safeParse(Object.fromEntries(fd));
  if (!parsed.success) return { ok: false, message: parsed.error.issues[0].message };
  let user_id: string | null = null;
  if (parsed.data.audience !== "all") {
    const owner = await db.get("users", parsed.data.audience);
    if (!owner || owner.role !== "investor") return { ok: false, message: "Select a valid investor." };
    user_id = owner.id;
  }
  const file = fd.get("file");
  if (!(file instanceof File)) return { ok: false, message: "Choose a file to upload." };
  const stored = await storeUpload(file);
  if ("error" in stored) return { ok: false, message: stored.error };
  await db.insert("documents", {
    title: parsed.data.title, kind: parsed.data.kind, user_id, uploaded_by: me.id,
    file_name: stored.file_name, stored_name: stored.stored_name, mime: stored.mime, size: stored.size,
  });
  revalidatePath("/admin/documents"); revalidatePath("/portal/reports"); revalidatePath("/portal/documents");
  return { ok: true, message: "Uploaded." };
}
export async function deleteDocument(fd: FormData) {
  await requireUser(["staff", "admin"]);
  const doc = await db.get("documents", String(fd.get("id")));
  if (!doc) return;
  await db.remove("documents", doc.id);
  await deleteStored(doc.stored_name);
  revalidatePath("/admin/documents"); revalidatePath("/portal/reports"); revalidatePath("/portal/documents");
}

// ---- public video + cameras (admin only) ----
export async function savePublicVideo(_p: FormState, fd: FormData): Promise<FormState> {
  await requireUser(["admin"]);
  const raw = String(fd.get("url") ?? "").trim();
  if (!raw) { await clearSetting("public_video_url"); revalidatePath("/"); return { ok: true, message: "Public video removed." }; }
  if (!parsePublicVideo(raw)) return { ok: false, message: "Use a YouTube or Vimeo link, or a direct https link ending in .mp4." };
  await setSetting("public_video_url", raw);
  revalidatePath("/");
  return { ok: true, message: "Public video saved. It appears on the home page within a minute." };
}

const cameraSchema = z.object({
  name: z.string().trim().min(2).max(60),
  description: z.string().trim().max(200).optional(),
  upstream_url: z.string().trim().max(500),
  sort_order: z.coerce.number().int().min(0).max(999).default(0),
});
export async function createCamera(_p: FormState, fd: FormData): Promise<FormState> {
  await requireUser(["admin"]);
  const parsed = cameraSchema.safeParse(Object.fromEntries(fd));
  if (!parsed.success) return { ok: false, message: parsed.error.issues[0].message };
  let u: URL;
  try { u = new URL(parsed.data.upstream_url); } catch { return { ok: false, message: "Enter a valid stream address (http://…/index.m3u8)." }; }
  if (u.protocol !== "http:" && u.protocol !== "https:") return { ok: false, message: "Only http/https HLS addresses are supported." };
  if (u.username || u.password) return { ok: false, message: "Do not put a username/password in the address. Keep camera logins inside the stream gateway config." };
  if (!/\.m3u8$/i.test(u.pathname)) return { ok: false, message: "The address must end in .m3u8 (an HLS playlist)." };
  if (/^169\.254\./.test(u.hostname)) return { ok: false, message: "That address is not allowed." };
  await db.insert("cameras", { ...parsed.data, description: parsed.data.description || null, active: true });
  revalidatePath("/admin/live"); revalidatePath("/portal/live");
  return { ok: true, message: "Camera added." };
}
export async function toggleCamera(fd: FormData) {
  await requireUser(["admin"]);
  const id = String(fd.get("id")); const row = await db.get("cameras", id);
  if (row) await db.update("cameras", id, { active: !row.active });
  revalidatePath("/admin/live"); revalidatePath("/portal/live");
}
export async function deleteCamera(fd: FormData) {
  await requireUser(["admin"]);
  await db.remove("cameras", String(fd.get("id")));
  revalidatePath("/admin/live"); revalidatePath("/portal/live");
}
