// Turns an admin-entered link into a SAFE embed. The raw input is never rendered: we extract an ID / validate
// and rebuild the URL ourselves, so only YouTube, Vimeo or a plain https .mp4 can ever appear on the page.
export type PublicVideo = { kind: "iframe" | "mp4"; src: string; label: string };

export function parsePublicVideo(input: string): PublicVideo | null {
  let u: URL;
  try { u = new URL(input.trim()); } catch { return null; }
  if (u.protocol !== "https:" && u.protocol !== "http:") return null;
  const host = u.hostname.replace(/^www\.|^m\./, "");

  if (host === "youtube.com" || host === "youtu.be") {
    const id =
      host === "youtu.be" ? u.pathname.slice(1).split("/")[0]
      : u.searchParams.get("v") ?? u.pathname.match(/^\/(?:embed|shorts|live)\/([\w-]{11})/)?.[1] ?? "";
    if (/^[\w-]{11}$/.test(id ?? "")) return { kind: "iframe", src: `https://www.youtube-nocookie.com/embed/${id}?rel=0`, label: "YouTube" };
    return null;
  }
  if (host === "vimeo.com") {
    const id = u.pathname.match(/^\/(\d+)/)?.[1];
    return id ? { kind: "iframe", src: `https://player.vimeo.com/video/${id}`, label: "Vimeo" } : null;
  }
  if (u.protocol === "https:" && /\.mp4$/i.test(u.pathname)) return { kind: "mp4", src: u.toString(), label: "MP4" };
  return null;
}
