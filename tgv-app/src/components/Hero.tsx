import HeroSlider from "./HeroSlider";
import { getLocale, getTranslations } from "next-intl/server";
import type { Locale } from "@/i18n/routing";
import { getAvailableHeroSlides, hasProgressSection } from "@/lib/content";

/*
 * Image-first hero: every slide is shown bright and uncovered, with only the glass button bar
 * (bottom-left) and the slider controls on top.
 * - Phones (≤600px): 4:5 frame, button bar full width at the bottom, controls top-right.
 * - Tablets (601–1023px): 41:32 frame (matches the 1600×1250 tablet poster), controls top-right.
 * - Desktop (≥1024px): height = 33.34vw + 96px (min 480px); every slide, the poster included,
 *   fills it edge to edge (object-cover), with the button bar and controls along the bottom.
 * Fixed proportions per breakpoint, so changing slides never shifts the page.
 * The gradient is the fallback when no slide images exist.
 */
const sectionCls =
  "relative flex aspect-[4/5] items-end overflow-hidden bg-[linear-gradient(120deg,#183b2c,#6f8063)] px-4 pb-4 text-white " +
  "min-[601px]:aspect-[41/32] min-[601px]:px-[4vw] min-[601px]:pb-[4vw] " +
  "min-[1024px]:aspect-auto min-[1024px]:h-[max(480px,calc(33.34vw+96px))] min-[1024px]:px-[5vw] min-[1024px]:pb-[13px]";

const barCls =
  "flex w-full gap-2 rounded-xl border border-white/20 bg-[rgba(9,32,22,.55)] p-2 backdrop-blur-md backdrop-saturate-[1.2] " +
  "min-[601px]:w-auto min-[601px]:gap-3 min-[601px]:rounded-lg min-[601px]:p-3";

// Phones: two equal buttons sharing the bar's width; text may wrap to two lines (e.g. Bangla).
const btnCls = "flex-1 px-3 py-3 text-center leading-tight min-[601px]:flex-none min-[601px]:px-[22px] min-[601px]:py-[15px]";

export default async function Hero() {
  const [slides, hasProgress, t, locale] = await Promise.all([
    getAvailableHeroSlides(),
    hasProgressSection(),
    getTranslations("hero"),
    getLocale() as Promise<Locale>,
  ]);
  // Resolve per-locale alt text (fallback: generic "photo n") before passing to the client slider.
  const resolved = slides.map((s, i) => ({ ...s, alt: s.alt?.[locale] || t("slideAlt", { n: i + 1 }) }));

  const content = (
    <div className={barCls}>
      {/* The page's main heading: not shown (the images speak), but read by Google and screen readers. */}
      <h1 className="sr-only">
        {t("title1")} {t("title2")}
      </h1>
      <a className={`btn btn-primary ${btnCls}`} href="#investment">
        {t("ctaInvest")}
      </a>
      {hasProgress ? (
        <a className={`btn btn-ghost ${btnCls}`} href="#progress">
          {t("ctaProgress")}
        </a>
      ) : (
        <a className={`btn btn-ghost ${btnCls}`} href="#visit">
          {t("ctaVisit")}
        </a>
      )}
    </div>
  );

  if (slides.length === 0) {
    return (
      <section aria-label={t("aria")} className={sectionCls}>
        <div className="relative z-[2] w-full min-[601px]:w-auto">{content}</div>
      </section>
    );
  }

  return (
    <HeroSlider slides={resolved} label={t("aria")} className={sectionCls}>
      {content}
    </HeroSlider>
  );
}
