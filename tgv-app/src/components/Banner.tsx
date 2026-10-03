import Image from "next/image";
import { getLocale } from "next-intl/server";
import type { Locale } from "@/i18n/routing";
import { getBanner } from "@/lib/content";
import { canOptimize } from "@/lib/mediaUrl";

export default async function Banner() {
  const [b, locale] = await Promise.all([getBanner(), getLocale() as Promise<Locale>]);
  if (!b) return null;
  const alt = b.alt[locale] || b.alt.en;
  const img = (
    <Image
      src={b.src}
      alt={alt}
      width={1600}
      height={533}
      sizes="100vw"
      priority
      unoptimized={!canOptimize(b.src)}
      className="h-auto w-full"
    />
  );
  return (
    <section aria-label={alt} className="bg-[#eaf3e4]">
      {b.href ? <a href={b.href} className="block">{img}</a> : img}
    </section>
  );
}