/** Client-safe helpers for media URLs (no fs access here). */

export const isRemoteUrl = (src: string) => /^https?:\/\//i.test(src);

/** Host allowed for next/image optimisation (see next.config.ts), e.g. "cdn.example.com". */
export const mediaHost = (process.env.NEXT_PUBLIC_MEDIA_HOST || "")
  .replace(/^https?:\/\//i, "")
  .replace(/\/.*$/, "")
  .trim()
  .toLowerCase();

/**
 * Whether next/image may optimise this src. Local paths always; remote URLs only on
 * NEXT_PUBLIC_MEDIA_HOST (or YouTube thumbnails) — anything else is passed through `unoptimized` so a
 * misconfigured host never breaks the page.
 */
export function canOptimize(src: string): boolean {
  if (!isRemoteUrl(src)) return true;
  try {
    const host = new URL(src).hostname.toLowerCase();
    return host === "i.ytimg.com" || (mediaHost !== "" && host === mediaHost);
  } catch {
    return false;
  }
}
