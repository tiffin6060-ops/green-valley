import Link from "next/link";
import SectionHead from "./SectionHead";
import { useTranslations } from "next-intl";
import { transparencyItems } from "@/data/content";

export default function Transparency() {
  const t = useTranslations("transparency");
  return (
    <section aria-label={t("aria")} className="bg-sec-deep px-[6vw] py-[75px] text-white min-[901px]:px-[8vw] min-[901px]:py-[110px]">
      <SectionHead light eyebrow={t("eyebrow")} title={t("title")}>
        {t("intro")}
      </SectionHead>
      <div className="mt-[45px] mb-[35px] grid grid-cols-1 gap-px bg-sec-deep-line min-[601px]:grid-cols-2 min-[901px]:grid-cols-4">
        {transparencyItems.map((key, i) => (
          <article key={key} className="bg-sec-deep p-8">
            <b className="text-[#9fb6a5]">{String(i + 1).padStart(2, "0")}</b>
            <h3 className="my-[22px] font-display text-[22px]">{t(`items.${key}.title`)}</h3>
            <p className="text-[13px] leading-[1.6] text-[#b9c7bd]">{t(`items.${key}.text`)}</p>
          </article>
        ))}
      </div>
      <Link href="/portal" className="btn bg-white text-deep">
        {t("portal")}
      </Link>
    </section>
  );
}
