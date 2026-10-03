import { createHash } from "node:crypto";
import fs from "node:fs";
import path from "node:path";
import { isRemoteUrl } from "./mediaUrl";

const publicDir = path.join(process.cwd(), "public");

function localFile(src: string): string | null {
  if (!src.startsWith("/")) return null;
  const file = path.join(publicDir, decodeURIComponent(src.split(/[?#]/)[0]));
  return file.startsWith(publicDir + path.sep) ? file : null; // no path traversal
}

/**
 * Server-only. True if `src` is an http(s) URL, or a local path that exists under /public.
 * Pages are prerendered, so this runs at build time and missing files are skipped
 * instead of rendering broken media.
 */
export function mediaExists(src: string | undefined): src is string {
  if (!src) return false;
  if (isRemoteUrl(src)) return true;
  const file = localFile(src);
  if (!file) return false;
  try {
    // Build-time check for prerendered pages; ignore for output tracing (would bundle all of /public).
    return fs.statSync(/*turbopackIgnore: true*/ file).isFile();
  } catch {
    return false;
  }
}

/**
 * Appends a content version (?v=<hash of size+mtime>) to a local media path.
 *
 * Why: the next/image optimiser caches by URL only (and browsers cache /_next/image
 * for hours), so replacing /public/hero/slide-1.jpg with a new photo kept serving the
 * old optimised image. A versioned URL changes whenever the file does.
 * Allowed by images.localPatterns in next.config.ts.
 */
export function versioned(src: string): string {
  if (isRemoteUrl(src) || src.includes("?")) return src;
  const file = localFile(src);
  if (!file) return src;
  try {
    const st = fs.statSync(/*turbopackIgnore: true*/ file);
    const v = createHash("sha1").update(`${st.size}:${st.mtimeMs}`).digest("hex").slice(0, 10);
    return `${src}?v=${v}`;
  } catch {
    return src;
  }
}
