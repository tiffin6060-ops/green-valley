"use server";
import { revalidatePath } from "next/cache";
import { z } from "zod";
import { db } from "@/lib/db";
import { requireUser } from "@/lib/auth";
import type { FormState } from "@/app/(app)/auth-actions";

const schema = z.object({
  category: z.enum(["Investment", "Report", "Document", "Technical", "Other"]),
  subject: z.string().trim().min(3, "Subject is too short").max(120),
  message: z.string().trim().min(5, "Please describe your question").max(2000),
});

export async function createTicket(_p: FormState, fd: FormData): Promise<FormState> {
  const u = await requireUser(["investor"]);
  const parsed = schema.safeParse(Object.fromEntries(fd));
  if (!parsed.success) return { ok: false, message: parsed.error.issues[0].message };
  await db.insert("tickets", { user_id: u.id, ...parsed.data, status: "open", reply: null });
  revalidatePath("/portal/support");
  return { ok: true, message: "Ticket submitted. Our team will reply here." };
}
