/** Client-safe YouTube helpers (no network access, no YouTube scripts). */

const ID_RE = /^[A-Za-z0-9_-]{11}$/;
const HOSTS = new Set([
  "youtu.be",
  "youtube.com",
  "www.youtube.com",
  "m.youtube.com",
  "music.youtube.com",
  "youtube-nocookie.com",
  "www.youtube-nocookie.com",
]);

export const YOUTUBE_EMBED_ORIGIN = "https://www.youtube-nocookie.com";
/** Thumbnail host (proxied through next/image, so visitors' browsers never contact it). */
export const YOUTUBE_THUMB_HOST = "i.ytimg.com";

export const isYouTubeId = (s: string) => ID_RE.test(s);

/**
 * Extracts the 11-character video ID from:
 *   https://youtu.be/ID, https://www.youtube.com/watch?v=ID, /embed/ID, /shorts/ID, /live/ID,
 *   (with or without protocol/www, extra query parameters or a start time) or a bare ID.
 * Returns null for empty or invalid input (including look-alike domains).
 */
export function parseYouTubeId(input: string | null | undefined): string | null {
  const raw = (input ?? "").trim();
  if (!raw) return null;
  if (ID_RE.test(raw)) return raw;

  let url: URL;
  try {
    url = new URL(/^[a-z][a-z0-9+.-]*:\/\//i.test(raw) ? raw : `https://${raw}`);
  } catch {
    return null;
  }
  if (url.protocol !== "https:" && url.protocol !== "http:") return null;
  const host = url.hostname.toLowerCase();
  if (!HOSTS.has(host)) return null;

  const segments = url.pathname.split("/").filter(Boolean);
  let candidate: string | undefined;
  if (host === "youtu.be") {
    candidate = segments[0];
  } else if (segments[0] === "watch") {
    candidate = url.searchParams.get("v") ?? undefined;
  } else if (["embed", "shorts", "live", "v"].includes(segments[0])) {
    candidate = segments[1];
  }
  return candidate && ID_RE.test(candidate) ? candidate : null;
}

export const youtubeThumbnail = (id: string) => `https://${YOUTUBE_THUMB_HOST}/vi/${id}/hqdefault.jpg`;
export const youtubeWatchUrl = (id: string) => `https://www.youtube.com/watch?v=${id}`;

/** Privacy-enhanced embed URL. Autoplay is allowed because it is only built after a click. */
export function youtubeEmbedUrl(id: string, locale: string, origin: string) {
  const q = [
    "autoplay=1",
    "rel=0",
    "modestbranding=1",
    "playsinline=1",
    "enablejsapi=1",
    `hl=${encodeURIComponent(locale)}`,
    `origin=${encodeURIComponent(origin)}`,
  ].join("&");
  return `${YOUTUBE_EMBED_ORIGIN}/embed/${id}?${q}`;
}

/** postMessage payload that pauses an embed with enablejsapi=1, without loading the IFrame API script. */
export const YOUTUBE_PAUSE_MESSAGE = JSON.stringify({ event: "command", func: "pauseVideo", args: "" });
