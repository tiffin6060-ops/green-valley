import Image from "next/image";
import { useTranslations } from "next-intl";
import { categories, masterplan } from "@/data/content";

export default function Ecosystem() {
  const t = useTranslations("ecosystem");
  const hasMap = Boolean(masterplan.src);

  return (
    <section
      id="ecosystem"
      aria-label={t("aria")}
      className={`grid grid-cols-1 gap-6 px-[6vw] pb-[75px] min-[901px]:px-[8vw] min-[901px]:pb-[110px] ${
        hasMap ? "min-[901px]:grid-cols-[1.2fr_.8fr]" : ""
      }`}
    >
      {hasMap && (
        <div className="relative min-h-[420px] overflow-hidden bg-[linear-gradient(145deg,#d8e3d4,#9db09a)] min-[601px]:min-h-[540px]">
          <Image
            src={masterplan.src}
            alt={t("masterplanAlt")}
            fill
            sizes="(max-width: 900px) 100vw, 60vw"
            className="object-cover"
          />
        </div>
      )}
      <ul
        className={`grid grid-cols-1 gap-3 min-[601px]:grid-cols-2 ${
          hasMap ? "" : "min-[901px]:grid-cols-5"
        }`}
      >
        {categories.map((c) => (
          <li
            key={c.key}
            className="flex min-h-[120px] flex-col justify-between border border-line p-6 transition duration-200 hover:-translate-y-0.5 hover:bg-surface-2"
          >
            <span className="text-2xl" aria-hidden="true">
              {c.icon}
            </span>
            <b className="text-[13px]">{t(`categories.${c.key}`)}</b>
          </li>
        ))}
      </ul>
    </section>
  );
}
