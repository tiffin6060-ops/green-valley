"use server";
import { z } from "zod";
import { saveVisitRequest } from "@/lib/visit-store";

export type VisitState = { ok: boolean; message: string; errors?: Record<string, string> };

const schema = z.object({
  full_name: z.string().trim().min(2, "Please enter your full name").max(100),
  // Bangladesh mobile: 01XXXXXXXXX or +8801XXXXXXXXX
  mobile: z
    .string()
    .trim()
    .transform((v) => v.replace(/[\s-]/g, ""))
    .pipe(z.string().regex(/^(\+?88)?01[3-9]\d{8}$/, "Enter a valid Bangladesh mobile number")),
  email: z.union([z.literal(""), z.string().trim().email("Enter a valid email")]).optional(),
  interest: z.string().max(50).optional(),
  visit_date: z.string().optional(),
  guests: z.string().optional(),
  message: z.string().trim().max(1000).optional(),
  website: z.string().max(0).optional(), // honeypot: must stay empty
});

export async function submitVisitRequest(_prev: VisitState, formData: FormData): Promise<VisitState> {
  const parsed = schema.safeParse(Object.fromEntries(formData));
  if (!parsed.success) {
    const errors: Record<string, string> = {};
    for (const i of parsed.error.issues) errors[String(i.path[0])] = i.message;
    // Honeypot tripped: pretend success, store nothing.
    if (errors.website) return { ok: true, message: "Thank you. We will contact you shortly." };
    return { ok: false, message: "Please fix the highlighted fields.", errors };
  }
  const d = parsed.data;
  if (d.visit_date && new Date(d.visit_date) < new Date(new Date().toDateString())) {
    return { ok: false, message: "Please fix the highlighted fields.", errors: { visit_date: "Choose a future date" } };
  }
  const guests = d.guests ? Number(d.guests) : null;
  if (guests !== null && (!Number.isInteger(guests) || guests < 1 || guests > 50)) {
    return { ok: false, message: "Please fix the highlighted fields.", errors: { guests: "Guests must be 1–50" } };
  }
  try {
    await saveVisitRequest({
      full_name: d.full_name,
      mobile: d.mobile,
      email: d.email || null,
      interest: d.interest && d.interest !== "Investment interest" ? d.interest : null,
      visit_date: d.visit_date || null,
      guests,
      message: d.message || null,
    });
  } catch (e) {
    console.error("visit request save failed", e);
    return { ok: false, message: "Something went wrong on our side. Please call us or try again shortly." };
  }
  return { ok: true, message: "Thank you. Your visit request was received and our team will contact you shortly." };
}
