import type { Metadata } from "next";
import Link from "next/link";
import { setRequestLocale } from "next-intl/server";
import LegalPage from "@/components/LegalPage";
import { localePath, type Locale } from "@/i18n/routing";
import { legalMetadata } from "@/lib/seo";
import { site } from "@/data/content";

// The header reads live data (published updates), so render per request like the home page.
export const dynamic = "force-dynamic";

export function generateMetadata({ params }: PageProps<"/[locale]/terms">): Promise<Metadata> {
  return legalMetadata(params, "terms", "/terms");
}

export default async function TermsPage({ params }: PageProps<"/[locale]/terms">) {
  const locale = (await params).locale as Locale;
  setRequestLocale(locale);
  return (
    <LegalPage title="Terms of Use">
      <p>By using this website you agree to these terms. If you do not agree, please do not use the website.</p>

      <h2>Information only — not an offer or advice</h2>
      <p>
        This website gives general information about the {site.name} farming and agro-tourism project so that you can
        decide whether to learn more. Nothing on this website is:
      </p>
      <ul>
        <li>an offer to sell, or a request for an offer to buy, any investment, share or security;</li>
        <li>financial, investment, legal or tax advice;</li>
        <li>a promise or guarantee of any return, profit, income or repayment.</li>
      </ul>
      <p>
        Any participation in the project will only be made under separate written agreements, after you have reviewed
        the full terms, risks and documents. You should get independent professional advice before making any
        decision.
      </p>

      <h2>No guaranteed returns</h2>
      <p>
        Any figures, examples or illustrations on this website are for explanation only. They are not forecasts and are
        not guaranteed. Past or projected performance is not a reliable indicator of future results. You could lose
        some or all of any money you commit. Please read our{" "}
        <Link className="underline" href={localePath(locale, "/risk-disclosure")}>Risk Disclosure</Link>.
      </p>

      <h2>Accuracy of information</h2>
      <p>
        We try to keep the information accurate and up to date, but some details (for example project area, timelines,
        categories and terms) are still being finalised and may change without notice. Items marked “To verify” are not
        confirmed.
      </p>

      <h2>Farm visits</h2>
      <p>
        Submitting a visit request does not guarantee a visit. Visits are by appointment and subject to safety rules and
        biosecurity requirements on site. Visitors are responsible for their own safety and must follow staff
        instructions.
      </p>

      <h2>Use of the website</h2>
      <ul>
        <li>Do not misuse the website, submit false information or try to interfere with its operation.</li>
        <li>Content, logos and images on this website belong to {site.name} or its licensors and may not be copied for commercial use without permission.</li>
      </ul>

      <h2>Liability</h2>
      <p>
        To the extent permitted by law, we are not liable for any loss arising from your use of, or reliance on, this
        website.
      </p>

      <h2>Governing law</h2>
      <p>These terms are governed by the laws of Bangladesh. {/* TODO: confirm governing law / venue */}</p>

      <h2>Privacy</h2>
      <p>
        How we handle personal information is explained in our <Link className="underline" href={localePath(locale, "/privacy")}>Privacy Policy</Link>.
      </p>
    </LegalPage>
  );
}
