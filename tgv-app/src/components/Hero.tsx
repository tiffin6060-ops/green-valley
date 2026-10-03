import HeroSlider from "./HeroSlider";
import { getLocale, getTranslations } from "next-intl/server";
import type { Locale } from "@/i18n/routing";
import { getAvailableHeroSlides, hasProgressSection } from "@/lib/content";

// Fixed min-height (no layout shift); the gradient is the fallback when no slide images exist.
// Mobile bottom padding grows from the template 70px to 90px only to make room for slider controls.
const sectionCls = (controls: boolean) =>
  `relative flex min-h-[600px] items-end overflow-hidden bg-[linear-gradient(120deg,#183b2c,#6f8063)] px-[6vw] pt-[70px] ${
    controls ? "pb-[90px]" : "pb-[70px]"
  } text-white min-[901px]:min-h-[690px] min-[901px]:px-[8vw] min-[901px]:pt-[8vw] min-[901px]:pb-[7vw]`;

export default async function Hero() {
  const [slides, hasProgress, t, tc, locale] = await Promise.all([
    getAvailableHeroSlides(),
    hasProgressSection(),
    getTranslations("hero"),
    getTranslations("common"),
    getLocale() as Promise<Locale>,
  ]);
  // Resolve per-locale alt text (fallback: generic "photo n") before passing to the client slider.
  const resolved = slides.map((s, i) => ({ ...s, alt: s.alt?.[locale] || t("slideAlt", { n: i + 1 }) }));

  // Dark overlay keeps the copy readable over the photos
  const overlay = (
    <div
      aria-hidden="true"
      className="pointer-events-none absolute inset-0 z-[1] bg-[radial-gradient(circle_at_78%_30%,rgba(255,255,255,.13),transparent_25%),linear-gradient(100deg,rgba(0,0,0,.6),rgba(0,0,0,.15))]"
    />
  );

  const content = (
    <div className="relative z-[2] max-w-[850px]">
      <p className="eyebrow eyebrow-light uppercase">{tc("location")}</p>
      <h1 className="display mb-[26px] text-[46px] min-[601px]:text-[clamp(42px,6vw,82px)]">
        {t("title1")}
        <br />
        <em className="font-semibold text-[#d7e5d2]">{t("title2")}</em>
      </h1>
      <p className="max-w-[650px] text-lg leading-[1.7] text-[#e9eee8]">
        {t("copy")}
      </p>
      <div className="mt-[30px] flex flex-col items-stretch gap-3 min-[601px]:flex-row min-[601px]:items-center">
        <a className="btn btn-primary" href="#investment">
          {t("ctaInvest")}
        </a>
        {hasProgress ? (
          <a className="btn btn-ghost" href="#progress">
            {t("ctaProgress")}
          </a>
        ) : (
          <a className="btn btn-ghost" href="#visit">
            {t("ctaVisit")}
          </a>
        )}
      </div>
      <p className="mt-[25px] text-[11px] text-[#d6ddd4]">{tc("disclaimer")}</p>
    </div>
  );

  if (slides.length === 0) {
    return (
      <section aria-label={t("aria")} className={sectionCls(false)}>
        {overlay}
        {content}
      </section>
    );
  }

  return (
    <HeroSlider slides={resolved} label={t("aria")} className={sectionCls(slides.length > 1)} overlay={overlay}>
      {content}
    </HeroSlider>
  );
}
