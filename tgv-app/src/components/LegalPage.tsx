import { useLocale, useTranslations } from "next-intl";
import type { ReactNode } from "react";
import { legalLastUpdated } from "@/data/content";

/**
 * Legal pages are English-only drafts (not machine-translated). On /bn a Bangla notice
 * explains this, and the English body is marked lang="en" for screen readers.
 */
export default function LegalPage({ title, children }: { title: string; children: ReactNode }) {
  const t = useTranslations("legal");
  const locale = useLocale();
  return (
    <main className="px-[6vw] py-[60px] min-[901px]:px-[8vw] min-[901px]:py-[90px]">
      {locale !== "en" && (
        <p role="note" className="mx-auto mt-0 mb-6 max-w-[760px] border-l-4 border-brand bg-surface-2 px-4 py-3 text-base text-ink">
          {t("englishOnly")}
        </p>
      )}
      <div lang="en">
        <div
          role="note"
          className="mb-10 border border-note-line bg-note px-4 py-3 text-sm font-bold tracking-[1px] text-note-ink"
        >
          DRAFT - pending legal review
        </div>
        <article className="mx-auto max-w-[760px] leading-[1.75] text-ink-2 [&_h2]:mt-10 [&_h2]:mb-3 [&_h2]:font-display [&_h2]:text-2xl [&_h2]:text-ink [&_li]:mb-1.5 [&_p]:mb-4 [&_ul]:mb-4 [&_ul]:list-disc [&_ul]:pl-6">
          <p className="eyebrow">LEGAL</p>
          <h1 className="display mb-2 text-[clamp(36px,5vw,56px)] text-ink">{title}</h1>
          <p className="text-sm text-muted">Last updated: {legalLastUpdated}</p>
          {children}
        </article>
      </div>
    </main>
  );
}
