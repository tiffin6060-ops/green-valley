import type { Metadata } from "next";
import Link from "next/link";
import { setRequestLocale } from "next-intl/server";
import LegalPage from "@/components/LegalPage";
import { localePath, type Locale } from "@/i18n/routing";
import { legalMetadata } from "@/lib/seo";
import { contact, site } from "@/data/content";

// The header reads live data (published updates), so render per request like the home page.
export const dynamic = "force-dynamic";

export function generateMetadata({ params }: PageProps<"/[locale]/privacy">): Promise<Metadata> {
  return legalMetadata(params, "privacy", "/privacy");
}

export default async function PrivacyPage({ params }: PageProps<"/[locale]/privacy">) {
  const locale = (await params).locale as Locale;
  setRequestLocale(locale);
  return (
    <LegalPage title="Privacy Policy">
      <p>
        This policy explains what personal information {site.name} (“we”, “us”) collects through this website, why we
        collect it and how we handle it.
      </p>

      <h2>What we collect</h2>
      <p>When you submit the farm-visit request form we collect:</p>
      <ul>
        <li>your name and mobile number;</li>
        <li>your email address, if you provide it;</li>
        <li>your area of interest, preferred visit date, number of guests and any message you write;</li>
        <li>the IP address the request came from and the time it was sent (used to prevent spam and abuse).</li>
      </ul>
      <p>
        We also use privacy-friendly website analytics (Vercel Analytics) to count page views. It does not use
        cookies and does not identify you personally.
      </p>

      <h2>How we use it</h2>
      <ul>
        <li>to contact you about your visit request and arrange the visit;</li>
        <li>to answer the questions you send us;</li>
        <li>to protect the website from spam and misuse.</li>
      </ul>
      <p>We do not sell your personal information, and we do not use it for unrelated marketing without your consent.</p>

      <h2>Who processes it</h2>
      <p>
        Form submissions are emailed to our team using an email delivery provider (Resend) and stored in a secure
        database (MongoDB Atlas). The website is hosted by Vercel. These providers process data on our behalf and may
        store it outside Bangladesh.
      </p>

      <h2>How long we keep it</h2>
      <p>
        We keep visit requests only as long as needed to handle your enquiry and any follow-up, after which they are
        deleted. {/* TODO: confirm retention period */}
      </p>

      <h2>Your choices</h2>
      <p>
        You can ask us to show, correct or delete the information we hold about you by contacting us
        {contact.email ? (
          <>
            {" "}at <a className="underline" href={`mailto:${contact.email}`}>{contact.email}</a>
          </>
        ) : (
          " using the contact details in the website footer"
        )}
        .
      </p>

      <h2>Changes</h2>
      <p>
        We may update this policy. The date at the top shows when it last changed. See also our{" "}
        <Link className="underline" href={localePath(locale, "/terms")}>Terms of Use</Link> and{" "}
        <Link className="underline" href={localePath(locale, "/risk-disclosure")}>Risk Disclosure</Link>.
      </p>
    </LegalPage>
  );
}
