/* Investment plans shown on /invest (source: public/hero/banner.jpg).
 * Public-site copy for each package: messages "plans.packages.<key>". The English fields
 * here are used where there is no translation: the request e-mail, the admin panel and
 * the investor portal (both English-only). */

export const planGroups = [
  {
    key: "capital",
    name: "Green Valley Capital Plan",
    note: "One-time investment · minimum ৳50,000",
    packages: [
      { key: "capital-1", name: "Option 1", detail: "3 months", value: "Profit 33%–36%" },
      { key: "capital-2", name: "Option 2", detail: "6 months", value: "Profit 44%–48%" },
      { key: "capital-3", name: "Option 3", detail: "Monthly settlement", value: "24%–30%" },
    ],
  },
  {
    key: "monthly",
    name: "Green Valley Monthly Plan",
    note: "Monthly contribution · 6 / 12 month term",
    packages: [
      { key: "monthly-starter", name: "Starter", detail: "৳6,000 / month", value: "৳36,000 total in 6 months" },
      { key: "monthly-builder", name: "Builder", detail: "৳9,000 / month", value: "৳54,000 total in 6 months" },
      { key: "monthly-growth", name: "Growth", detail: "৳12,000 / month", value: "৳72,000 total in 6 months" },
    ],
  },
] as const;

export const planKeys = [
  "capital-1", "capital-2", "capital-3", "monthly-starter", "monthly-builder", "monthly-growth",
] as const;

export type PlanKey = (typeof planKeys)[number];

export type PlanInfo = { key: string; name: string; detail: string; value: string; planName: string; planNote: string };

/** English details for a package key, or null for an unknown/empty key. */
export function planInfo(key: string | null | undefined): PlanInfo | null {
  for (const g of planGroups) {
    for (const p of g.packages as readonly { key: string; name: string; detail: string; value: string }[]) {
      if (p.key === key) return { ...p, planName: g.name, planNote: g.note };
    }
  }
  return null;
}

/** e.g. "Capital Plan — Option 1 (3 months, Profit 33%–36%)". */
export const planLabel = (key: string) => {
  const p = planInfo(key);
  return p ? `${p.planName.replace("Green Valley ", "")} — ${p.name} (${p.detail}, ${p.value})` : key;
};

/** Shown beside the request form (from the banner). Hotline is `contact.phone` in content.ts. */
export const planWhatsapp = "+880 1321-441133";
