import type { Localized, ProgressVideo } from "@/data/content";
import { parseYouTubeId, youtubeThumbnail } from "./youtube";

/** What the page renders: a YouTube facade, a self-hosted file, or nothing (null). */
export type ResolvedProgressVideo =
  | { kind: "youtube"; id: string; poster: string; title: Localized; caption: Localized; date: string }
  | { kind: "file"; video: ProgressVideo };

type Files = {
  /** true if the local path exists (or is an http URL) */
  exists: (src: string | undefined) => boolean;
  /** adds a content version to a local path */
  version: (src: string) => string;
};

/**
 * Pure resolver (file access injected, so it can be unit-tested).
 *  - "youtube": needs a valid video ID, otherwise null (block hidden). The poster is the local
 *    file if present, else YouTube's thumbnail (proxied by next/image).
 *  - "file": needs the MP4 to exist, otherwise null.
 */
export function resolveProgressVideo(config: ProgressVideo, files: Files): ResolvedProgressVideo | null {
  if (config.provider === "youtube") {
    const id = parseYouTubeId(config.youtubeUrl);
    if (!id) return null;
    const poster = files.exists(config.poster) ? files.version(config.poster) : youtubeThumbnail(id);
    return { kind: "youtube", id, poster, title: config.title, caption: config.caption, date: config.date };
  }

  if (!files.exists(config.src)) return null;
  return {
    kind: "file",
    video: {
      ...config,
      src: files.version(config.src),
      poster: files.exists(config.poster) ? files.version(config.poster) : "",
      captions: config.captions
        ? Object.fromEntries(
            Object.entries(config.captions)
              .filter(([, src]) => files.exists(src))
              .map(([locale, src]) => [locale, files.version(src!)]),
          )
        : undefined,
    },
  };
}
