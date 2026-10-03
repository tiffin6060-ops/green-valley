import Link from "next/link";
import { useTranslations } from "next-intl";

export default function FinalCTA() {
  const t = useTranslations("cta");
  return (
    <section id="contact" className="px-5 py-[120px] text-center">
      <p className="eyebrow">{t("eyebrow")}</p>
      <h2 className="display mb-[26px] text-[clamp(45px,6vw,72px)]">
        {t("title1")}
        <br />
        {t("title2")}
      </h2>
      <p className="mx-auto my-0 max-w-[650px] leading-[1.7] text-muted">{t("text")}</p>
      <div className="mt-[30px] flex flex-col items-center justify-center gap-3 min-[601px]:flex-row">
        <a className="btn btn-dark" href="#visit">
          {t("book")}
        </a>
        <Link href="/portal" className="btn btn-outline-dark">
          {t("portal")}
        </Link>
      </div>
    </section>
  );
}
