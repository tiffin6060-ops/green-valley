import Link from "next/link";
import { useLocale, useTranslations } from "next-intl";
import { FullLogo } from "./Brand";
import { contact } from "@/data/content";
import { localePath, type Locale } from "@/i18n/routing";

export default function Footer() {
  const t = useTranslations("footer");
  const tc = useTranslations("common");
  const locale = useLocale() as Locale;
  const year = new Date().getFullYear();
  // Locale digits, no thousands separator ("২০২৬", not "২,০২৬").
  const yearText = new Intl.NumberFormat(locale === "bn" ? "bn-BD" : "en-US", { useGrouping: false }).format(year);

  return (
    <footer className="grid grid-cols-1 gap-[30px] border-t border-white/5 bg-sec-footer px-[8vw] py-[50px] text-[11px] text-[#aab5ad] min-[601px]:grid-cols-3 [&_p]:m-0">
      <div className="space-y-4">
        {/* The footer is dark in both themes, so it always uses the white-text logo. */}
        <FullLogo variant="on-dark" width={150} />
        <p>{tc("tagline")}</p>
      </div>

      <address className="space-y-0.5 not-italic [&_a]:inline-flex [&_a]:min-h-6 [&_a]:items-center">
        <p className="footer-heading font-bold tracking-[2px] text-white">{t("contact")}</p>
        {contact.phone && (
          <p>
            <a className="hover:text-white" href={`tel:${contact.phone.replace(/[^\d+]/g, "")}`}>
              {contact.phone}
            </a>
          </p>
        )}
        {contact.email && (
          <p>
            <a className="hover:text-white" href={`mailto:${contact.email}`}>
              {contact.email}
            </a>
          </p>
        )}
        {/* TODO(client): full postal address (messages footer.address) */}
        <p>{t("address")}</p>
        <p>
          <Link className="underline hover:text-white" href={localePath(locale, "/", "#visit")}>
            {t("requestVisit")}
          </Link>
        </p>
      </address>

      <nav aria-label={t("legalNav")} className="space-y-0.5 [&_a]:inline-flex [&_a]:min-h-6 [&_a]:items-center">
        <p className="footer-heading font-bold tracking-[2px] text-white">{t("legal")}</p>
        <p>
          <Link className="hover:text-white" href={localePath(locale, "/privacy")}>
            {t("privacy")}
          </Link>
        </p>
        <p>
          <Link className="hover:text-white" href={localePath(locale, "/terms")}>
            {t("terms")}
          </Link>
        </p>
        <p>
          <Link className="hover:text-white" href={localePath(locale, "/risk-disclosure")}>
            {t("risk")}
          </Link>
        </p>
      </nav>

      <div className="space-y-2 border-t border-white/10 pt-6 text-[11px] min-[601px]:col-span-3">
        <p>
          {tc("disclaimer")} {tc("notOffer")}
        </p>
        <p>{tc("rights", { year: yearText, name: tc("brandName") })}</p>
      </div>
    </footer>
  );
}
