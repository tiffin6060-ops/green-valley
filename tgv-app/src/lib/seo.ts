import { getTranslations } from "next-intl/server";
import { localePath, routing, type Locale } from "@/i18n/routing";

export const ogLocale = (locale: Locale) => (locale === "bn" ? "bn_BD" : "en_US");

/** Canonical + hreflang alternates (en, bn, x-default) for a page path like "/" or "/privacy". */
export function pageAlternates(locale: Locale, path: string) {
  const languages: Record<string, string> = Object.fromEntries(routing.locales.map((l) => [l, localePath(l, path)]));
  languages["x-default"] = localePath(routing.defaultLocale, path);
  return { canonical: localePath(locale, path), languages };
}

type LegalKey = "privacy" | "terms" | "risk";

/** Metadata for a legal page: localized title/description, canonical + hreflang. */
export async function legalMetadata(params: Promise<{ locale: string }>, key: LegalKey, path: string) {
  const { locale } = await params;
  const loc = (routing.locales as readonly string[]).includes(locale) ? (locale as Locale) : routing.defaultLocale;
  const t = await getTranslations({ locale: loc, namespace: "legal" });
  return {
    title: t(`metaTitles.${key}`),
    description: t(`descriptions.${key}`),
    alternates: pageAlternates(loc, path),
    openGraph: { locale: ogLocale(loc), url: localePath(loc, path) },
  };
}
