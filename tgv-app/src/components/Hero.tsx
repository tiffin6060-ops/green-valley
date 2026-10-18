import HeroSlider from "./HeroSlider";
import { getLocale, getTranslations } from "next-intl/server";
import type { Locale } from "@/i18n/routing";
import { getAvailableHeroSlides } from "@/lib/content";

/*
 * Image-first hero: every slide is shown bright and uncovered, with only the slider controls on top
 * (top-right on phones, bottom-right from 768px).
 * The hero is 75% of the screen height on every device (the height never depends on the slide,
 * so changing slides never shifts the page).
 * Photos fill the hero (object-cover); posters are fitted so their text is never covered (see
 * HeroSlider's PosterImage). The gradient is the fallback when no slide images exist.
 */
const sectionCls =
  "relative flex h-[75svh] min-h-[420px] items-end overflow-hidden bg-[linear-gradient(120deg,#183b2c,#6f8063)] px-4 pb-4 text-white " +
  "min-[601px]:px-[4vw] min-[601px]:pb-6 min-[1024px]:px-[5vw]";

export default async function Hero() {
  const [slides, t, locale] = await Promise.all([
    getAvailableHeroSlides(),
    getTranslations("hero"),
    getLocale() as Promise<Locale>,
  ]);
  // Resolve per-locale alt text (fallback: generic "photo n") before passing to the client slider.
  const resolved = slides.map((s, i) => ({ ...s, alt: s.alt?.[locale] || t("slideAlt", { n: i + 1 }) }));

  // No buttons over the hero (the images speak). The page's main heading stays for Google and screen readers.
  const content = (
    <h1 className="sr-only">
      {t("title1")} {t("title2")}
    </h1>
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
