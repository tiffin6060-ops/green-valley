"use client";

import { useTranslations } from "next-intl";
import { useState } from "react";
import SectionHead from "./SectionHead";
import { opportunities } from "@/data/content";

export default function Opportunities() {
  const t = useTranslations("opportunities");
  const [showAll, setShowAll] = useState(false);
  const list = showAll ? opportunities : opportunities.slice(0, 3);

  return (
    <section id="investment" className="section bg-surface">
      <SectionHead eyebrow={t("eyebrow")} title={t("title")}>
        {t("intro")}
      </SectionHead>

      <div className="grid grid-cols-1 gap-[18px] min-[601px]:grid-cols-2 min-[901px]:grid-cols-3">
        {list.map((o) => (
          <article key={o.key} className="flex min-h-[310px] flex-col border border-line bg-card p-[30px]">
            <span className="text-[10px] font-bold tracking-[1.5px] text-brand">{t(`tags.${o.tag}`)}</span>
            <h3 className="mt-[18px] mb-2.5 font-display text-[30px]">{t(`items.${o.key}.title`)}</h3>
            <p className="leading-[1.6] text-muted">{t(`items.${o.key}.text`)}</p>
            <div className="mt-auto flex justify-between gap-3 border-t border-line pt-[18px] text-[11px]">
              <span>{t(`items.${o.key}.amount`)}</span>
              <span>{t(`items.${o.key}.cycle`)}</span>
            </div>
          </article>
        ))}
      </div>

      {!showAll && opportunities.length > 3 && (
        <div className="mt-[35px] text-center">
          <button type="button" className="btn btn-dark" onClick={() => setShowAll(true)}>
            {t("viewAll")}
          </button>
        </div>
      )}
      <p className="mt-6 text-center text-[11px] text-muted">{t("note")}</p>
    </section>
  );
}
