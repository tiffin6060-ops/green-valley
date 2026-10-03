"use client";

import { useLocale, useTranslations } from "next-intl";
import { usePathname } from "@/i18n/navigation";
import { localePath, routing, type Locale } from "@/i18n/routing";

/**
 * Shows the OTHER language ("বাংলা" on English pages, "EN" on Bangla pages).
 * Switching keeps the current path and #section (the theme lives in localStorage, so it
 * carries over) and remembers the choice in the NEXT_LOCALE cookie.
 */
export default function LanguageToggle({ className = "", onNavigate }: { className?: string; onNavigate?: () => void }) {
  const t = useTranslations("nav");
  const locale = useLocale() as Locale;
  const pathname = usePathname(); // locale-less, e.g. "/privacy"
  const other: Locale = routing.locales.find((l) => l !== locale) ?? routing.defaultLocale;
  const href = localePath(other, pathname);

  return (
    <a
      href={href}
      hrefLang={other}
      aria-label={t("otherLanguageLabel")}
      title={t("otherLanguageLabel")}
      onClick={(e) => {
        e.preventDefault();
        document.cookie = `NEXT_LOCALE=${other}; path=/; max-age=31536000; samesite=lax`;
        onNavigate?.();
        // Full navigation so <html lang>, fonts and metadata switch cleanly; keep the #hash.
        window.location.assign(href + window.location.hash);
      }}
      className={`grid h-10 min-w-10 shrink-0 place-items-center border border-line px-2.5 text-[13px] font-semibold text-ink hover:border-brand hover:text-brand focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-brand ${className}`}
    >
      <span lang={other}>{t("otherLanguage")}</span>
    </a>
  );
}
