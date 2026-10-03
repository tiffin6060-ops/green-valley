import { z } from "zod";
import { interestOptions } from "@/data/content";
import { routing } from "@/i18n/routing";

/**
 * Bangladesh mobile, loose check: optional +88/88 prefix, then 01[3-9] + 8 digits.
 * Spaces, dashes, dots and brackets are ignored.
 */
const BD_MOBILE = /^(?:\+?88)?01[3-9]\d{8}$/;

/**
 * Shared by the client form and the /api/visit route.
 * Error messages are message KEYS (messages/*.json "visit.errors.<key>"), translated on the client.
 */
export const visitSchema = z.object({
  name: z.string().trim().min(2, "nameMin").max(100, "nameMax"),
  phone: z
    .string()
    .trim()
    .transform((v) => v.replace(/[\s\-().]/g, ""))
    .refine((v) => BD_MOBILE.test(v), "phone"),
  /** Profession / company. Field name is "organization" because "company" is the spam honeypot. */
  organization: z.string().trim().max(150, "organizationMax").optional().default(""),
  email: z.union([z.literal(""), z.email("email").max(200, "emailMax")], "email").optional().default(""),
  interest: z.enum(interestOptions, "interest"),
  preferredDate: z
    .union([z.literal(""), z.iso.date("date")], "date")
    .optional()
    .default(""),
  guests: z.coerce.number("guestsRequired").int("guestsInt").min(1, "guestsMin").max(50, "guestsMax"),
  message: z.string().trim().max(1000, "messageMax").optional().default(""),
  /** Page language the visitor used; saved with the lead and shown in the staff email. */
  locale: z.enum(routing.locales).optional().default(routing.defaultLocale),
});

export type VisitInput = z.input<typeof visitSchema>;
export type Visit = z.output<typeof visitSchema>;

/** Field -> error key (see messages "visit.errors"). */
export type FieldErrors = Partial<Record<keyof Visit, string>>;

const ERROR_KEYS = new Set([
  "nameMin", "nameMax", "phone", "email", "emailMax", "organizationMax", "interest", "date",
  "guestsRequired", "guestsInt", "guestsMin", "guestsMax", "messageMax",
]);

/** First error key per field (unknown Zod messages fall back to "invalid"). */
export function fieldErrors(error: z.ZodError): FieldErrors {
  const out: FieldErrors = {};
  for (const issue of error.issues) {
    const key = issue.path[0] as keyof Visit | undefined;
    if (key && !out[key]) out[key] = ERROR_KEYS.has(issue.message) ? issue.message : "invalid";
  }
  return out;
}
