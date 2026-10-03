import { useLocale, useTranslations } from "next-intl";
import { stats } from "@/data/content";
import type { Locale } from "@/i18n/routing";
import { formatNumber } from "@/lib/format";

const cols: Record<number, string> = {
  1: "min-[601px]:grid-cols-1",
  2: "min-[601px]:grid-cols-2",
  3: "min-[601px]:grid-cols-3",
  4: "min-[601px]:grid-cols-2 min-[901px]:grid-cols-4",
};

export default function Stats() {
  const t = useTranslations("stats");
  const locale = useLocale() as Locale;
  const verified = stats.filter((s) => s.verified);
  if (verified.length === 0) return null;
  const single = verified.length === 1;

  return (
    <section aria-label={t("aria")} className="bg-surface-2 px-[7vw] pt-[42px] pb-[28px]">
      <dl className={`grid grid-cols-1 gap-5 ${cols[Math.min(verified.length, 4)]} ${single ? "text-center" : ""}`}>
        {verified.map((s) => (
          <div
            key={s.key}
            className="flex flex-col-reverse border-b border-line-strong pb-[15px] last:border-0 min-[601px]:border-r min-[601px]:border-b-0 min-[601px]:pr-5 min-[601px]:pb-0"
          >
            <dt>
              <span className="text-xs text-muted">{t(s.key)}</span>
            </dt>
            <dd className="font-display text-[40px] text-brand">
              {typeof s.value === "number" ? formatNumber(s.value, locale) : t(s.value)}
              {s.suffix}
            </dd>
          </div>
        ))}
      </dl>
    </section>
  );
}
