"use client";

import { useTranslations } from "next-intl";
import { contact } from "@/data/content";

const telHref = (n: string) => `tel:${n.replace(/[^\d+]/g, "")}`;
const waHref = (n: string) => `https://wa.me/${n.replace(/\D/g, "")}`;

const pill =
  "flex min-w-0 flex-1 items-center justify-center gap-2 rounded-full border-2 border-[#d9b85c] " +
  "bg-[linear-gradient(#174a2e,#0d3420)] py-1 pr-3 pl-1 text-[13px] leading-tight font-bold whitespace-nowrap text-white " +
  "shadow-[0_4px_10px_rgba(10,40,20,.3)] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-white";
const icon = "grid size-6 flex-none place-items-center rounded-full";

/**
 * Hotline + WhatsApp buttons for the poster slide on phones. They sit directly above the hero
 * buttons, so the numbers stay readable and tappable however the poster artwork is laid out.
 */
export default function HeroContacts({ className = "" }: { className?: string }) {
  const t = useTranslations("hero");
  if (!contact.hotline && !contact.whatsapp) return null;

  return (
    <div className={`flex gap-2 ${className}`}>
      {contact.hotline && (
        <a href={telHref(contact.hotline)} className={pill}>
          <span aria-hidden="true" className={`${icon} bg-[#f2c94c] text-[#0d3420]`}>
            <svg viewBox="0 0 24 24" fill="currentColor" className="size-3.5">
              <path d="M6.6 10.8a15.1 15.1 0 0 0 6.6 6.6l2.2-2.2c.3-.3.7-.4 1-.2 1.1.4 2.3.6 3.6.6.6 0 1 .4 1 1V20c0 .6-.4 1-1 1A17 17 0 0 1 3 4c0-.6.4-1 1-1h3.5c.6 0 1 .4 1 1 0 1.3.2 2.5.6 3.6.1.3 0 .7-.2 1z" />
            </svg>
          </span>
          <span className="sr-only">{t("hotline")}: </span>
          <span className="truncate">{contact.hotline}</span>
        </a>
      )}
      {contact.whatsapp && (
        <a href={waHref(contact.whatsapp)} target="_blank" rel="noopener noreferrer" className={pill}>
          <span aria-hidden="true" className={`${icon} bg-[#25d366] text-white`}>
            <svg viewBox="0 0 24 24" fill="currentColor" className="size-3.5">
              <path d="M12 2a10 10 0 0 0-8.7 14.9L2 22l5.3-1.3A10 10 0 1 0 12 2z" />
            </svg>
          </span>
          <span className="sr-only">{t("whatsapp")}: </span>
          <span className="truncate">{contact.whatsapp}</span>
        </a>
      )}
    </div>
  );
}
