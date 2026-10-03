import type { MetadataRoute } from "next";
import { site } from "@/data/content";
import { localePath, routing } from "@/i18n/routing";

const PAGES: { path: string; changeFrequency: "weekly" | "yearly"; priority: number }[] = [
  { path: "/", changeFrequency: "weekly", priority: 1 },
  { path: "/privacy", changeFrequency: "yearly", priority: 0.3 },
  { path: "/terms", changeFrequency: "yearly", priority: 0.3 },
  { path: "/risk-disclosure", changeFrequency: "yearly", priority: 0.3 },
];

/** Every page in both locales, each listing its hreflang alternates. */
export default function sitemap(): MetadataRoute.Sitemap {
  const now = new Date();
  const abs = (p: string) => `${site.url}${p === "/" ? "" : p}`;
  return PAGES.flatMap(({ path, changeFrequency, priority }) => {
    const languages = Object.fromEntries(routing.locales.map((l) => [l, abs(localePath(l, path))]));
    return routing.locales.map((locale) => ({
      url: abs(localePath(locale, path)) || site.url,
      lastModified: now,
      changeFrequency,
      priority,
      alternates: { languages: { ...languages, "x-default": abs(localePath(routing.defaultLocale, path)) } },
    }));
  });
}
