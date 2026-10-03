import { defineRouting } from "next-intl/routing";

export const routing = defineRouting({
  locales: ["en", "bn"],
  defaultLocale: "en",
  // English at "/", Bangla at "/bn".
  localePrefix: "as-needed",
  // Predictable, SEO-stable URLs: never redirect based on Accept-Language or cookie.
  localeDetection: false,
  // Remember the visitor's choice for a year (set by the proxy and the language toggle).
  localeCookie: { name: "NEXT_LOCALE", maxAge: 60 * 60 * 24 * 365, sameSite: "lax" },
});

export type Locale = (typeof routing.locales)[number];

/** "/" + "#visit" -> "/bn#visit" etc. */
export function localePath(locale: Locale, path: string = "/", hash = ""): string {
  const clean = path === "/" ? "" : path;
  const base = locale === routing.defaultLocale ? clean || "/" : `/${locale}${clean}`;
  return `${base}${hash}`;
}
