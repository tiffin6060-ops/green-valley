import { FullLogo } from "./Brand";
import { useTranslations } from "next-intl";
import { operatingModel } from "@/data/content";

export default function About() {
  const t = useTranslations("about");
  return (
    <section id="about" className="section grid grid-cols-1 gap-[9vw] min-[901px]:grid-cols-2">
      <div>
        <p className="eyebrow">{t("eyebrow")}</p>
        <h2 className="display text-[clamp(40px,5vw,65px)]">
          {t("title1")}
          <br />
          {t("title2")}
        </h2>
        <div className="mt-2 hidden min-[901px]:block">
          <FullLogo width={200} />
        </div>
      </div>
      <div>
        {operatingModel.map((key) => (
          <p key={key} className="border-b border-line py-[22px] leading-[1.6]">
            <b>{t(`roles.${key}.name`)}</b>
            <br />
            <span className="text-muted">{t(`roles.${key}.role`)}</span>
          </p>
        ))}
        <p className="bg-surface-2 p-[22px] text-xs leading-[1.6]">{t("notice")}</p>
      </div>
    </section>
  );
}
