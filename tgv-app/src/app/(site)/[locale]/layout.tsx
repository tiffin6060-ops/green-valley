import type { Metadata, Viewport } from "next";
import { DM_Sans, Noto_Sans_Bengali, Noto_Serif_Bengali, Playfair_Display } from "next/font/google";
import { notFound } from "next/navigation";
import { hasLocale, NextIntlClientProvider } from "next-intl";
import { getTranslations, setRequestLocale } from "next-intl/server";
import Footer from "@/components/Footer";
import Header from "@/components/Header";
import ThemeProvider from "@/components/ThemeProvider";
import { site } from "@/data/content";
import { routing } from "@/i18n/routing";
import { hasProgressSection } from "@/lib/content";
import { pageAlternates, ogLocale } from "@/lib/seo";
import "../globals.css";

const dmSans = DM_Sans({
  variable: "--font-dm-sans",
  subsets: ["latin"],
  weight: ["400", "500", "600", "700"],
  display: "swap",
});

const playfair = Playfair_Display({
  variable: "--font-playfair",
  subsets: ["latin"],
  weight: ["600", "700"],
  display: "swap",
});

// Bengali fonts: not preloaded, and their CSS variables are only set on /bn,
// so English pages never download them.
const notoSansBengali = Noto_Sans_Bengali({
  variable: "--font-noto-sans-bengali",
  subsets: ["bengali"],
  weight: ["400", "500", "600", "700"],
  display: "swap",
  preload: false,
});

const notoSerifBengali = Noto_Serif_Bengali({
  variable: "--font-noto-serif-bengali",
  subsets: ["bengali"],
  weight: ["600", "700"],
  display: "swap",
  preload: false,
});

// The site reads live data (admin updates, farm video) from the database, so render per request.
export const dynamic = "force-dynamic";

export function generateStaticParams() {
  return routing.locales.map((locale) => ({ locale }));
}

export async function generateMetadata({ params }: LayoutProps<"/[locale]">): Promise<Metadata> {
  const { locale } = await params;
  if (!hasLocale(routing.locales, locale)) return {};
  const t = await getTranslations({ locale, namespace: "meta" });
  const title = t("title");
  const description = t("description");
  return {
    metadataBase: new URL(site.url),
    title: { default: title, template: `%s | ${t("siteName")}` },
    description,
    applicationName: t("siteName"),
    alternates: pageAlternates(locale, "/"),
    openGraph: {
      type: "website",
      locale: ogLocale(locale),
      alternateLocale: routing.locales.filter((l) => l !== locale).map(ogLocale),
      url: pageAlternates(locale, "/").canonical,
      siteName: t("siteName"),
      title,
      description,
      images: [{ url: "/og.jpg", width: 1200, height: 630, alt: t("ogAlt") }],
    },
    twitter: { card: "summary_large_image", title, description, images: ["/og.jpg"] },
    robots: { index: true, follow: true },
  };
}

export const viewport: Viewport = {
  colorScheme: "light dark",
  themeColor: [
    { media: "(prefers-color-scheme: light)", color: "#ffffff" },
    { media: "(prefers-color-scheme: dark)", color: "#0c1410" },
  ],
};

export default async function LocaleLayout({ children, params }: LayoutProps<"/[locale]">) {
  const { locale } = await params;
  if (!hasLocale(routing.locales, locale)) notFound();
  setRequestLocale(locale);

  const showProgress = await hasProgressSection();
  const fontVars = [
    dmSans.variable,
    playfair.variable,
    ...(locale === "bn" ? [notoSansBengali.variable, notoSerifBengali.variable] : []),
  ].join(" ");

  return (
    // suppressHydrationWarning: next-themes sets the theme class on <html> before hydration.
    <html lang={locale} data-scroll-behavior="smooth" className={fontVars} suppressHydrationWarning>
      <body>
        <NextIntlClientProvider>
          <ThemeProvider>
            <Header showProgress={showProgress} />
            {children}
            <Footer />
          </ThemeProvider>
        </NextIntlClientProvider>
      </body>
    </html>
  );
}
