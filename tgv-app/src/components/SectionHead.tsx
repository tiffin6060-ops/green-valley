import type { ReactNode } from "react";

type Props = { eyebrow: string; title: ReactNode; children: ReactNode; light?: boolean };

export default function SectionHead({ eyebrow, title, children, light = false }: Props) {
  return (
    <div className="mb-[50px] block items-end justify-between gap-[60px] min-[901px]:flex">
      <div>
        {/* Light (transparency) variant matches the template: muted eyebrow, larger heading. */}
        <p className={`eyebrow ${light ? "text-[#b9c7bd]" : ""}`}>{eyebrow}</p>
        <h2 className={`display ${light ? "text-[clamp(42px,6vw,82px)]" : "text-[clamp(40px,5vw,65px)]"}`}>{title}</h2>
      </div>
      <p className={`max-w-[520px] leading-[1.7] ${light ? "text-[#b9c7bd]" : "text-muted"}`}>
        {children}
      </p>
    </div>
  );
}
