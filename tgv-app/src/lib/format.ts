export const bdt = (n: number | string | null | undefined) => "৳" + Number(n ?? 0).toLocaleString("en-IN");
export const dateOnly = (d?: string | null) =>
  d ? new Date(d).toLocaleDateString("en-GB", { day: "2-digit", month: "short", year: "numeric", timeZone: "Asia/Dhaka" }) : "—";
export const dateTime = (d?: string | null) =>
  d ? new Date(d).toLocaleString("en-GB", { timeZone: "Asia/Dhaka" }) : "—";

import type { Locale } from "@/i18n/routing";

const MONTHS = ["JAN", "FEB", "MAR", "APR", "MAY", "JUN", "JUL", "AUG", "SEP", "OCT", "NOV", "DEC"];

/**
 * "2026-09-29" -> "29 SEP 2026" (en) / "২৯ সেপ্টেম্বর ২০২৬" (bn).
 * English is built by hand: Intl's en-GB now prints "Sept", which doesn't match the template.
 * Falls back to the raw string if unparseable.
 */
export function formatDate(iso: string, locale: Locale = "en") {
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return iso;
  if (locale === "bn") {
    return new Intl.DateTimeFormat("bn-BD", { day: "numeric", month: "long", year: "numeric", timeZone: "UTC" }).format(d);
  }
  return `${String(d.getUTCDate()).padStart(2, "0")} ${MONTHS[d.getUTCMonth()]} ${d.getUTCFullYear()}`;
}

/** Locale digits: 32 -> "32" (en) / "৩২" (bn). */
export function formatNumber(n: number, locale: Locale = "en") {
  return new Intl.NumberFormat(locale === "bn" ? "bn-BD" : "en-US").format(n);
}
