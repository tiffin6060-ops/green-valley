import Image from "next/image";
import { useTranslations } from "next-intl";

/**
 * Header brand: the logo mark + live-text wordmark in site fonts.
 * (The stacked full logo is not used here: its tagline would be unreadable at header size.)
 * In dark theme the mark sits on a cream chip, because its dark-green rings and birds
 * lose contrast on dark backgrounds.
 */
export default function Brand() {
  const t = useTranslations("brand");
  return (
    <span className="flex items-center gap-[11px]">
      <span className="grid h-11 shrink-0 place-items-center dark:size-12 dark:rounded-full dark:bg-cream dark:p-1.5">
        <Image
          src="/brand/logo-mark-wide@2x.png"
          alt=""
          width={58}
          height={44}
          priority
          className="h-11 w-auto dark:h-8"
          style={{ width: "auto" }}
        />
      </span>
      <span className="flex flex-col leading-none whitespace-nowrap">
        <b className="brand-top text-[10px] tracking-[4px]">{t("top")}</b>
        <strong className="font-display text-[17px] text-brand">{t("main")}</strong>
        <small className="mt-1 hidden text-[8px] text-faint min-[601px]:block">
          {t("sub")}
        </small>
      </span>
    </span>
  );
}

/** Full stacked logo. `variant` forces one version; "auto" switches with the theme via CSS. */
export function FullLogo({
  variant = "auto",
  width = 180,
  className = "",
}: {
  variant?: "auto" | "on-light" | "on-dark";
  width?: number;
  className?: string;
}) {
  // Intrinsic aspect ratios of the generated files (scripts/prepare-logos.mjs).
  const light = { src: "/brand/logo-full-light@2x.png", w: 817, h: 965 };
  const dark = { src: "/brand/logo-full-dark@2x.png", w: 955, h: 1117 };
  const alt = useTranslations("common")("logoAlt");
  const img = (v: typeof light, cls: string) => (
    <Image
      src={v.src}
      alt={alt}
      width={width}
      height={Math.round((width * v.h) / v.w)}
      sizes={`${width}px`}
      className={`h-auto ${cls} ${className}`}
    />
  );
  if (variant === "on-light") return img(light, "");
  if (variant === "on-dark") return img(dark, "");
  // CSS-only switch: no theme read in JS, so no flash or hydration mismatch.
  return (
    <>
      {img(light, "block dark:hidden")}
      {img(dark, "hidden dark:block")}
    </>
  );
}
