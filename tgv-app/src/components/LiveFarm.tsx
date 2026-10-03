import Link from "next/link";
import { getTranslations } from "next-intl/server";
import SectionHead from "./SectionHead";
import { getSetting } from "@/lib/settings";
import { parsePublicVideo, type PublicVideo } from "@/lib/video";

/** Public farm video (set in Admin → Live & Video) next to a locked "investor access only" CCTV card. */
export default async function LiveFarm() {
  const t = await getTranslations("live");
  let video: PublicVideo | null = null;
  try {
    const v = await getSetting("public_video_url");
    video = v ? parsePublicVideo(v) : null;
  } catch (err) {
    console.error("[live] could not read the public video setting", err);
  }

  return (
    <section id="live" className="section bg-surface">
      <SectionHead eyebrow={t("eyebrow")} title={t("title")}>
        {t("intro")}
      </SectionHead>
      <div className="grid grid-cols-1 gap-6 min-[901px]:grid-cols-[1.6fr_1fr]">
        <div className="relative aspect-video overflow-hidden bg-black">
          {video?.kind === "iframe" && (
            <iframe
              src={video.src}
              title={t("videoTitle")}
              loading="lazy"
              referrerPolicy="strict-origin-when-cross-origin"
              allow="accelerometer; encrypted-media; gyroscope; picture-in-picture; fullscreen"
              allowFullScreen
              className="absolute inset-0 size-full border-0"
            />
          )}
          {video?.kind === "mp4" && (
            <video src={video.src} controls preload="metadata" playsInline className="absolute inset-0 size-full object-cover" />
          )}
          {!video && (
            <div className="absolute inset-0 grid place-items-center bg-[linear-gradient(135deg,#d7ded2,#8da088)] px-6 text-center text-[11px] tracking-[2px] text-white dark:bg-[linear-gradient(135deg,#2c3d32,#1a2a20)]">
              <span>{t("noVideo")}</span>
            </div>
          )}
        </div>
        <aside className="flex flex-col items-start justify-center gap-3 border border-line bg-card p-[30px]">
          <span aria-hidden className="text-3xl">
            🔒
          </span>
          <small className="text-[10px] font-bold tracking-[1.5px] text-brand">{t("lockEyebrow")}</small>
          <h3 className="font-display text-[26px]">{t("lockTitle")}</h3>
          <p className="leading-[1.6] text-muted">{t("lockText")}</p>
          <Link className="btn btn-dark mt-2" href="/portal/live">
            {t("signIn")}
          </Link>
        </aside>
      </div>
    </section>
  );
}
