/* Investment plans shown on /invest (source: public/hero/banner.jpg).
 * Copy for each package: messages "plans.packages.<key>". The English `label`
 * here is what staff see in the request e-mail. */

export const planGroups = [
  {
    key: "capital",
    packages: [
      { key: "capital-1", label: "Capital Plan — Option 1 (3 months, profit 33%–36%, min ৳50,000)" },
      { key: "capital-2", label: "Capital Plan — Option 2 (6 months, profit 44%–48%, min ৳50,000)" },
      { key: "capital-3", label: "Capital Plan — Option 3 (monthly settlement, 24%–30%, min ৳50,000)" },
    ],
  },
  {
    key: "monthly",
    packages: [
      { key: "monthly-starter", label: "Monthly Plan — Starter (৳6,000/month, ৳36,000 over 6 months)" },
      { key: "monthly-builder", label: "Monthly Plan — Builder (৳9,000/month, ৳54,000 over 6 months)" },
      { key: "monthly-growth", label: "Monthly Plan — Growth (৳12,000/month, ৳72,000 over 6 months)" },
    ],
  },
] as const;

export const planKeys = [
  "capital-1", "capital-2", "capital-3", "monthly-starter", "monthly-builder", "monthly-growth",
] as const;

export type PlanKey = (typeof planKeys)[number];

export const planLabel = (key: PlanKey) =>
  planGroups.flatMap((g): readonly { key: string; label: string }[] => g.packages).find((p) => p.key === key)?.label ?? key;

/** Shown beside the request form (from the banner). Hotline is `contact.phone` in content.ts. */
export const planWhatsapp = "+880 1321-441133";
