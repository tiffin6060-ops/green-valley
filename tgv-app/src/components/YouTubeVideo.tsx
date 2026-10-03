"use client";

import Image from "next/image";
import { useLocale, useTranslations } from "next-intl";
import { useEffect, useRef, useState } from "react";
import type { Localized } from "@/data/content";
import type { Locale } from "@/i18n/routing";
import { formatDate } from "@/lib/format";
import { canOptimize } from "@/lib/mediaUrl";
import {
  YOUTUBE_EMBED_ORIGIN,
  YOUTUBE_PAUSE_MESSAGE,
  youtubeEmbedUrl,
  youtubeWatchUrl,
} from "@/lib/youtube";

type Props = { id: string; poster: string; title: Localized; caption: Localized; date: string };

/**
 * YouTube (unlisted) player behind a facade: only the poster and a play button are rendered,
 * and NOTHING is requested from YouTube until the visitor clicks. The click mounts a
 * youtube-nocookie iframe with autoplay; because it is a user gesture the video starts WITH
 * sound. Scrolling it out of view pauses it (postMessage, no YouTube API script).
 */
export default function YouTubeVideo({ id, poster, title, caption, date }: Props) {
  const t = useTranslations("progress.video");
  const locale = useLocale() as Locale;
  const boxRef = useRef<HTMLDivElement>(null);
  const frameRef = useRef<HTMLIFrameElement>(null);
  const [src, setSrc] = useState<string | null>(null);
  const [posterFailed, setPosterFailed] = useState(false);

  const heading = title[locale];
  const text = caption[locale];
  const label = heading || t("label");
  const hasCaption = Boolean(heading || text || date);

  // Pause when scrolled out of view. Does not auto-resume.
  useEffect(() => {
    const el = boxRef.current;
    if (!el) return;
    const io = new IntersectionObserver(
      ([entry]) => {
        if (!entry.isIntersecting) {
          frameRef.current?.contentWindow?.postMessage(YOUTUBE_PAUSE_MESSAGE, YOUTUBE_EMBED_ORIGIN);
        }
      },
      { threshold: 0.25 },
    );
    io.observe(el);
    return () => io.disconnect();
  }, []);

  return (
    <figure className="m-0">
      <div ref={boxRef} className="relative aspect-video overflow-hidden bg-[linear-gradient(135deg,#d7ded2,#8da088)] dark:bg-[linear-gradient(135deg,#2c3d32,#1a2a20)]">
        {src ? (
          <iframe
            ref={frameRef}
            src={src}
            title={label}
            className="absolute inset-0 size-full border-0"
            allow="autoplay; encrypted-media; picture-in-picture; fullscreen"
            allowFullScreen
            referrerPolicy="strict-origin-when-cross-origin"
          />
        ) : (
          <>
            {!posterFailed && (
              <Image
                src={poster}
                alt=""
                fill
                sizes="(max-width: 900px) 100vw, 60vw"
                unoptimized={!canOptimize(poster)}
                onError={() => setPosterFailed(true)}
                className="object-cover"
              />
            )}
            <button
              type="button"
              // The click is the user gesture that lets the embed autoplay with sound.
              onClick={() => setSrc(youtubeEmbedUrl(id, locale, window.location.origin))}
              aria-label={t("play", { label })}
              className="group absolute inset-0 grid cursor-pointer place-items-center bg-black/10 focus-visible:outline-2 focus-visible:-outline-offset-4 focus-visible:outline-white"
            >
              <span className="grid size-20 place-items-center rounded-full border border-white/70 bg-deep/70 text-white backdrop-blur-sm transition group-hover:scale-105 group-hover:bg-deep/85 min-[601px]:size-24">
                <svg aria-hidden="true" viewBox="0 0 24 24" className="ml-1 size-9 fill-current min-[601px]:size-10">
                  <path d="M8 5.14v13.72a1 1 0 0 0 1.52.85l11.1-6.86a1 1 0 0 0 0-1.7L9.52 4.29A1 1 0 0 0 8 5.14Z" />
                </svg>
              </span>
            </button>
          </>
        )}
      </div>

      <figcaption className="mt-5">
        {hasCaption && (
          <>
            {date && (
              <small className="text-[10px] tracking-[1px] text-muted">
                <time dateTime={date}>{formatDate(date, locale)}</time>
              </small>
            )}
            {heading && <h3 className="my-1 font-display text-[27px]">{heading}</h3>}
            {text && <p className="leading-[1.6] text-muted">{text}</p>}
          </>
        )}
        <a
          href={youtubeWatchUrl(id)}
          target="_blank"
          rel="noopener noreferrer"
          className="mt-2 inline-flex min-h-6 items-center text-xs font-semibold text-brand underline-offset-2 hover:underline"
        >
          {t("watch")} ↗
        </a>
      </figcaption>
    </figure>
  );
}
