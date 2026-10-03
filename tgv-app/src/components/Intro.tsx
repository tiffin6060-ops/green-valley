import { useTranslations } from "next-intl";

export default function Intro() {
  const t = useTranslations("intro");
  return (
    <section
      id="project"
      className="section grid grid-cols-1 items-end gap-[10vw] min-[901px]:grid-cols-[1.1fr_.9fr]"
    >
      <div>
        <p className="eyebrow">{t("eyebrow")}</p>
        <h2 className="display text-[clamp(40px,5vw,65px)]">
          {t("title1")}
          <br />
          {t("title2")}
        </h2>
      </div>
      <div>
        <p className="text-xl leading-[1.7] text-ink-2">{t("lead")}</p>
        <a className="mt-4 inline-block font-bold text-brand hover:underline" href="#ecosystem">
          {t("link")}
        </a>
      </div>
    </section>
  );
}
