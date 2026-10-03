import Link from "next/link";
import { useLocale, useTranslations } from "next-intl";
import { localePath, type Locale } from "@/i18n/routing";

export default function NotFound() {
  const t = useTranslations("notFound");
  const locale = useLocale() as Locale;
  return (
    <main className="section text-center">
      <h1 className="display text-[clamp(36px,5vw,56px)]">{t("title")}</h1>
      <p className="text-muted">{t("text")}</p>
      <Link className="btn btn-dark mt-6" href={localePath(locale, "/")}>
        {t("home")}
      </Link>
    </main>
  );
}
