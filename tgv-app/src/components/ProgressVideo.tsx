"use client";

import { useLocale, useTranslations } from "next-intl";
import { useEffect, useRef, useState } from "react";
import type { ProgressVideo as Video } from "@/data/content";
import type { Locale } from "@/i18n/routing";
import { formatDate } from "@/lib/format";

/**
 * Click-to-play progress video with sound. Not autoplayed, not muted.
 * Pauses automatically when scrolled out of view.
 */
export default function ProgressVideo({ video }: { video: Video }) {
  const t = useTranslations("progress.video");
  const locale = useLocale() as Locale;
  const ref = useRef<HTMLVideoElement>(null);
  const [playing, setPlaying] = useState(false);
  const [failed, setFailed] = useState(false);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const io = new IntersectionObserver(
      ([entry]) => {
        if (!entry.isIntersecting && !el.paused) el.pause();
      },
      { threshold: 0.25 },
    );
    io.observe(el);
    return () => io.disconnect();
  }, []);

  function play() {
    const el = ref.current;
    if (!el) return;
    el.muted = false;
    el.play().catch(() => {
      // Playback refused (rare after a tap); native controls remain available.
    });
  }

  const title = video.title[locale];
  const caption = video.caption[locale];
  const captionsSrc = video.captions?.[locale];
  const label = title || t("label");
  const hasCaption = Boolean(title || caption || video.date);

  return (
    <figure className="m-0">
      <div className="relative aspect-video overflow-hidden bg-[linear-gradient(135deg,#d7ded2,#8da088)]">
        {failed ? (
          <p className="absolute inset-0 m-0 grid place-items-center p-6 text-center text-sm text-white">{t("error")}</p>
        ) : (
          <>
            {/* Captions <track> is added when a .vtt file is configured in content.ts. */}
            <video
              ref={ref}
              className="absolute inset-0 size-full bg-black object-cover"
              src={video.src}
              poster={video.poster || undefined}
              controls
              playsInline
              preload="metadata"
              aria-label={label}
              onPlay={() => setPlaying(true)}
              onPause={() => setPlaying(false)}
              onEnded={() => setPlaying(false)}
              onError={() => setFailed(true)}
            >
              {captionsSrc && <track kind="captions" src={captionsSrc} srcLang={locale} label={t("captions")} default />}
            </video>
            {!playing && (
              <button
                type="button"
                onClick={play}
                aria-label={t("play", { label })}
                className="group absolute top-1/2 left-1/2 grid size-20 -translate-x-1/2 -translate-y-1/2 cursor-pointer place-items-center rounded-full border border-white/70 bg-deep/70 text-white backdrop-blur-sm transition hover:scale-105 hover:bg-deep/85 focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-white min-[601px]:size-24"
              >
                <svg aria-hidden="true" viewBox="0 0 24 24" className="ml-1 size-9 fill-current min-[601px]:size-10">
                  <path d="M8 5.14v13.72a1 1 0 0 0 1.52.85l11.1-6.86a1 1 0 0 0 0-1.7L9.52 4.29A1 1 0 0 0 8 5.14Z" />
                </svg>
              </button>
            )}
          </>
        )}
      </div>
      {hasCaption && (
        <figcaption className="mt-5">
          {video.date && (
            <small className="text-[10px] tracking-[1px] text-muted">
              <time dateTime={video.date}>{formatDate(video.date, locale)}</time>
            </small>
          )}
          {title && <h3 className="my-1 font-display text-[27px]">{title}</h3>}
          {caption && <p className="leading-[1.6] text-muted">{caption}</p>}
        </figcaption>
      )}
    </figure>
  );
}
