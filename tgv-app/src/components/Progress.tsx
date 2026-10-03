import { useLocale, useTranslations } from "next-intl";
import ProgressVideo from "./ProgressVideo";
import YouTubeVideo from "./YouTubeVideo";
import SectionHead from "./SectionHead";
import type { Locale } from "@/i18n/routing";
import { getAvailableProgressVideo, getPublishedUpdates, type ProgressUpdate } from "@/lib/content";
import { formatDate, formatNumber } from "@/lib/format";
import type { ResolvedProgressVideo } from "@/lib/progressVideo";

function VideoBlock({ video }: { video: ResolvedProgressVideo }) {
  if (video.kind === "youtube") {
    return <YouTubeVideo id={video.id} poster={video.poster} title={video.title} caption={video.caption} date={video.date} />;
  }
  return <ProgressVideo video={video.video} />;
}

/** Latest published update as a headline with its progress bar (from Admin → Updates). */
function Feature({ update }: { update: ProgressUpdate }) {
  const t = useTranslations("progress");
  const locale = useLocale() as Locale;
  return (
    <>
      <div className="mt-5 flex items-end justify-between">
        <div>
          <small className="text-[smaller]">{t("feature.label")}</small>
          <h3 className="my-1 font-display text-[27px]">{update.title}</h3>
        </div>
        {update.percent > 0 && <strong className="text-[32px] text-brand">{formatNumber(update.percent, locale)}%</strong>}
      </div>
      {update.percent > 0 && (
        <div
          role="progressbar"
          aria-label={update.title || t("barLabel")}
          aria-valuemin={0}
          aria-valuemax={100}
          aria-valuenow={update.percent}
          className="h-1 bg-track"
        >
          <i className="block h-full bg-brand" style={{ width: `${update.percent}%` }} />
        </div>
      )}
    </>
  );
}

function TimelineItem({ u }: { u: ProgressUpdate }) {
  const locale = useLocale() as Locale;
  return (
    <article className="relative border-l border-line-strong pb-7 pl-7 before:absolute before:top-1 before:-left-[5px] before:size-[9px] before:rounded-full before:bg-brand">
      <time dateTime={u.date} className="text-[10px] tracking-[1px] text-muted">
        {formatDate(u.date, locale)}
      </time>
      <h3 className="my-2 text-[1.17em]">{u.title}</h3>
      <p className="whitespace-pre-line leading-[1.5] text-muted">{u.text}</p>
    </article>
  );
}

function ProgressSection({ video, updates }: { video: ResolvedProgressVideo | null; updates: ProgressUpdate[] }) {
  const t = useTranslations("progress");
  const hasLeft = Boolean(video || updates.length);
  return (
    <section id="progress" className="section">
      <SectionHead eyebrow={t("eyebrow")} title={t("title")}>
        {t("intro")}
      </SectionHead>
      <div className={`grid grid-cols-1 gap-[50px] ${hasLeft && updates.length > 0 ? "min-[901px]:grid-cols-[1.2fr_.8fr]" : ""}`}>
        {hasLeft && (
          <div>
            {video && <VideoBlock video={video} />}
            {updates[0] && <Feature update={updates[0]} />}
          </div>
        )}
        {updates.length > 0 && (
          <div>
            {updates.map((u) => (
              <TimelineItem key={u.id} u={u} />
            ))}
          </div>
        )}
      </div>
    </section>
  );
}

/** Video (optional) + latest published update with bar on the left, dated timeline on the right. */
export default async function Progress() {
  const [video, updates] = await Promise.all([getAvailableProgressVideo(), getPublishedUpdates()]);
  if (!video && updates.length === 0) return null;
  return <ProgressSection video={video} updates={updates} />;
}
