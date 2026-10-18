import type { Metadata } from "next";
import { getTranslations, setRequestLocale } from "next-intl/server";
import InvestmentPlans from "@/components/InvestmentPlans";
import { localePath, routing, type Locale } from "@/i18n/routing";
import { ogLocale, pageAlternates } from "@/lib/seo";

export async function generateMetadata({ params }: PageProps<"/[locale]/invest">): Promise<Metadata> {
  const { locale } = await params;
  const loc = (routing.locales as readonly string[]).includes(locale) ? (locale as Locale) : routing.defaultLocale;
  const t = await getTranslations({ locale: loc, namespace: "plans" });
  return {
    title: t("metaTitle"),
    description: t("metaDescription"),
    alternates: pageAlternates(loc, "/invest"),
    openGraph: { locale: ogLocale(loc), url: localePath(loc, "/invest") },
  };
}

export default async function InvestPage({ params }: PageProps<"/[locale]/invest">) {
  setRequestLocale((await params).locale);
  return <InvestmentPlans />;
}
