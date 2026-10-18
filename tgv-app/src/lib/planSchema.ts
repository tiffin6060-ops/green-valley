import { z } from "zod";
import { planKeys } from "@/data/plans";
import { routing } from "@/i18n/routing";

/** Optional message limit, in words (plus a character cap so one huge "word" can't slip through). */
export const MAX_MESSAGE_WORDS = 500;
export const MAX_MESSAGE_CHARS = 4000;
export const countWords = (s: string) => s.trim().split(/\s+/).filter(Boolean).length;

/** Phone, loose check so investors abroad can apply too: optional "+", then 7–15 digits. */
const PHONE = /^\+?\d{7,15}$/;

/**
 * Shared by the /invest form and the /api/plan-request route.
 * Error messages are message KEYS (messages "plans.form.errors.<key>"), translated on the client.
 */
export const planRequestSchema = z.object({
  name: z.string().trim().min(2, "nameMin").max(100, "nameMax"),
  email: z.email("email").max(200, "emailMax"),
  phone: z
    .string()
    .trim()
    .transform((v) => v.replace(/[\s\-().]/g, ""))
    .refine((v) => PHONE.test(v), "phone"),
  plan: z.enum(planKeys, "plan"),
  message: z
    .string()
    .trim()
    .max(MAX_MESSAGE_CHARS, "messageMax")
    .refine((v) => countWords(v) <= MAX_MESSAGE_WORDS, "messageMax")
    .optional()
    .default(""),
  locale: z.enum(routing.locales).optional().default(routing.defaultLocale),
});

export type PlanRequest = z.output<typeof planRequestSchema>;
export type PlanFieldErrors = Partial<Record<keyof PlanRequest, string>>;

const ERROR_KEYS = new Set(["nameMin", "nameMax", "email", "emailMax", "phone", "plan", "messageMax"]);

/** First error key per field (unknown Zod messages fall back to "invalid"). */
export function planFieldErrors(error: z.ZodError): PlanFieldErrors {
  const out: PlanFieldErrors = {};
  for (const issue of error.issues) {
    const key = issue.path[0] as keyof PlanRequest | undefined;
    if (key && !out[key]) out[key] = ERROR_KEYS.has(issue.message) ? issue.message : "invalid";
  }
  return out;
}
