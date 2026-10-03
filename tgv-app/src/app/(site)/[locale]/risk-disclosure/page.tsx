import type { Metadata } from "next";
import { setRequestLocale } from "next-intl/server";
import LegalPage from "@/components/LegalPage";
import type { Locale } from "@/i18n/routing";
import { legalMetadata } from "@/lib/seo";
import { site } from "@/data/content";

// The header reads live data (published updates), so render per request like the home page.
export const dynamic = "force-dynamic";

export function generateMetadata({ params }: PageProps<"/[locale]/risk-disclosure">): Promise<Metadata> {
  return legalMetadata(params, "risk", "/risk-disclosure");
}

const risks: { title: string; text: string }[] = [
  {
    title: "Livestock disease and animal health",
    text: "Cattle, dairy animals, goats, poultry and fish can be affected by disease outbreaks (for example foot-and-mouth disease, lumpy skin disease, avian influenza or fish disease). Outbreaks can cause deaths, lower production, treatment costs, movement restrictions or forced culling.",
  },
  {
    title: "Market price risk",
    text: "Prices for animals, milk, fish, eggs, feed, medicine and fuel change with supply, demand, seasons (including Eid demand) and imports. Lower sale prices or higher costs can reduce or eliminate profits.",
  },
  {
    title: "Weather and natural events",
    text: "Floods, heavy rain, drought, heatwaves, cyclones and other natural events can damage infrastructure, ponds, crops and animals, and disrupt operations and transport.",
  },
  {
    title: "Regulatory and legal risk",
    text: "Changes in laws, licences, taxes, land-use rules, environmental rules or investment regulations may affect how the project operates, what it costs, or whether certain participation structures are allowed.",
  },
  {
    title: "Liquidity risk",
    text: "Your money may be committed for a fixed cycle or a long period. There may be no way to exit early, no market to sell your interest, and payments may be delayed.",
  },
  {
    title: "Operator and counterparty risk",
    text: "Results depend on the skill, honesty and financial health of the operating companies and their staff. Poor management, disputes, fraud, insolvency or loss of key people can cause losses.",
  },
  {
    title: "Project and execution risk",
    text: "Construction, stocking and expansion may take longer or cost more than planned. Planned categories, facilities and monitoring may be changed, delayed or not delivered.",
  },
  {
    title: "Information risk",
    text: "Figures and illustrations on this website are not verified forecasts. Some information is still being finalised and may be incomplete or change.",
  },
];

export default async function RiskDisclosurePage({ params }: PageProps<"/[locale]/risk-disclosure">) {
  const locale = (await params).locale as Locale;
  setRequestLocale(locale);
  return (
    <LegalPage title="Risk Disclosure">
      <p>
        Agricultural projects carry real risks. Before you commit any money to {site.name} or any farming project, make
        sure you understand the risks below and can afford to lose the amount you commit.
      </p>
      <p>
        <strong>There are no guaranteed returns.</strong> Any illustrations of returns are examples only. You may get
        back less than you put in, or nothing at all.
      </p>

      <h2>Key risks</h2>
      <ul>
        {risks.map((r) => (
          <li key={r.title}>
            <strong>{r.title}.</strong> {r.text}
          </li>
        ))}
      </ul>

      <h2>Not an offer or advice</h2>
      <p>
        This website is information only. It is not an offer of investment and not financial, legal or tax advice. Any
        participation will be governed by separate written agreements. Read all documents carefully and get
        independent professional advice before deciding.
      </p>

      <h2>This list is not complete</h2>
      <p>
        Other risks may exist that are not listed here. Ask us any questions during your farm visit or due diligence.
      </p>
    </LegalPage>
  );
}
