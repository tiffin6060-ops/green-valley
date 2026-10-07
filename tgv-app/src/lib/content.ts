/**
 * Async content loaders.
 * - Hero + progress video: static data in src/data/content.ts.
 * - Progress updates: published rows of the database table `project_updates` (managed in Admin → Updates).
 * Server-only (uses fs via ./media and the SQLite database).
 */
import {
  heroSlides,
  progressVideo,
  banner,
  type HeroSlide,
  type ProgressVideo,
  type Banner,
} from "@/data/content";
import { db } from "@/lib/db";
import { mediaExists, versioned } from "./media";
import { resolveProgressVideo, type ResolvedProgressVideo } from "./progressVideo";

export type ProgressUpdate = { id: string; date: string; title: string; text: string; percent: number };

export async function getHeroSlides(): Promise<HeroSlide[]> {
  return heroSlides;
}

export async function getProgressVideo(): Promise<ProgressVideo> {
  return progressVideo;
}

/** Published project updates, newest first (the admin panel controls what is published). */
export async function getPublishedUpdates(limit = 4): Promise<ProgressUpdate[]> {
  try {
    const rows = await db.list("project_updates", { published: true }, limit);
    return rows.map((r) => ({
      id: String(r.id),
      date: String(r.created_at).slice(0, 10),
      title: String(r.title),
      text: String(r.body),
      percent: Math.min(100, Math.max(0, Number(r.progress_pct) || 0)),
    }));
  } catch (err) {
    console.error("[content] could not load project updates", err);
    return [];
  }
}

/** Hero slides whose image actually exists, with content-versioned URLs (see versioned()). */
export async function getAvailableHeroSlides(): Promise<HeroSlide[]> {
  return (await getHeroSlides())
    .filter((s) => mediaExists(s.src))
    .map((s) => ({
      ...s,
      src: versioned(s.src),
      // Small-screen poster versions are optional: drop any whose file is missing (falls back to src).
      tabletSrc: mediaExists(s.tabletSrc) ? versioned(s.tabletSrc) : undefined,
      mobileSrc: mediaExists(s.mobileSrc) ? versioned(s.mobileSrc) : undefined,
    }));
}

/** The progress video, resolved for rendering (valid YouTube ID or existing file), else null. */
export async function getAvailableProgressVideo(): Promise<ResolvedProgressVideo | null> {
  return resolveProgressVideo(await getProgressVideo(), { exists: mediaExists, version: versioned });
}

/** The Progress section (and its nav link / hero CTA) shows if there is a video or any published update. */
export async function hasProgressSection(): Promise<boolean> {
  const [video, list] = await Promise.all([getAvailableProgressVideo(), getPublishedUpdates(1)]);
  return video !== null || list.length > 0;
}
export async function getBanner(): Promise<Banner | null> {
  if (!mediaExists(banner.src)) return null;
  return { ...banner, src: versioned(banner.src) };
}