"use client";

import Link from "next/link";
import { useLocale, useTranslations } from "next-intl";
import { useState } from "react";
import Brand from "./Brand";
import LanguageToggle from "./LanguageToggle";
import ThemeToggle from "./ThemeToggle";
import { localePath, type Locale } from "@/i18n/routing";

type Props = { showProgress: boolean };

export default function Header({ showProgress }: Props) {
  const t = useTranslations("nav");
  const tt = useTranslations("theme");
  const locale = useLocale() as Locale;
  const home = (hash: string) => localePath(locale, "/", hash);
  const links = [
    { href: home("#project"), label: t("project") },
    { href: home("#investment"), label: t("investment") },
    ...(showProgress ? [{ href: home("#progress"), label: t("progress") }] : []),
    { href: home("#live"), label: t("live") },
    { href: home("#about"), label: t("about") },
    { href: home("#contact"), label: t("contact") },
  ];
  const [open, setOpen] = useState(false);
  const close = () => setOpen(false);

  return (
    <header className="sticky top-0 z-20 flex h-[82px] items-center justify-between border-b border-line bg-overlay px-[18px] min-[601px]:px-[5vw]">
      <Link href={home("#home")} aria-label={t("home")} onClick={close}>
        <Brand />
      </Link>

      <button
        type="button"
        className="cursor-pointer border-0 bg-transparent p-2 text-2xl min-[1201px]:hidden"
        aria-label={open ? t("closeMenu") : t("openMenu")}
        aria-expanded={open}
        aria-controls="site-nav"
        onClick={() => setOpen((o) => !o)}
      >
        {open ? "✕" : "☰"}
      </button>

      <nav
        id="site-nav"
        aria-label={t("main")}
        className={`${open ? "flex" : "hidden"} absolute top-[82px] right-0 left-0 flex-col items-stretch gap-[18px] border-b border-line bg-bg p-5 text-[13px] font-semibold whitespace-nowrap min-[1201px]:static min-[1201px]:flex min-[1201px]:flex-row min-[1201px]:items-center min-[1201px]:gap-[26px] min-[1201px]:border-0 min-[1201px]:p-0`}
      >
        {links.map((l) => (
          <Link key={l.href} href={l.href} onClick={close} className="hover:text-brand">
            {l.label}
          </Link>
        ))}
        <Link href={home("#visit")} onClick={close} className="border border-brand px-[15px] py-[11px] text-center">
          {t("bookVisit")}
        </Link>
        <Link
          href="/portal"
          onClick={close}
          className="border border-brand bg-brand px-[15px] py-[11px] text-center text-white hover:opacity-90"
        >
          {t("investorLogin")}
        </Link>
        <div className="flex items-center gap-2">
          <LanguageToggle onNavigate={close} />
          <ThemeToggle labels={{ toDark: tt("toDark"), toLight: tt("toLight"), generic: tt("generic") }} />
        </div>
      </nav>
    </header>
  );
}
