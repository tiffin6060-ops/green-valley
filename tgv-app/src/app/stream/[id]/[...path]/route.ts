import { db } from "@/lib/db";
import { getUser } from "@/lib/auth";

export const dynamic = "force-dynamic";

// Authenticated pass-through to the camera gateway (MediaMTX / go2rtc / NVR HLS).
// The gateway address and any credentials stay on the server; the browser only ever sees /stream/<id>/...
const TYPES: Record<string, string> = {
  m3u8: "application/vnd.apple.mpegurl", ts: "video/mp2t", m4s: "video/mp4", mp4: "video/mp4",
  cmfv: "video/mp4", cmfa: "audio/mp4", aac: "audio/aac", m4a: "audio/mp4", mp3: "audio/mpeg",
};

export async function GET(req: Request, ctx: { params: Promise<{ id: string; path: string[] }> }) {
  const user = await getUser();
  if (!user) return new Response("Unauthorized", { status: 401 });

  const { id, path } = await ctx.params;
  const cam = await db.get("cameras", id);
  if (!cam || (!cam.active && user.role === "investor")) return new Response("Not found", { status: 404 });

  const rel = path.join("/");
  const ext = rel.split(".").pop()?.toLowerCase() ?? "";
  if (!/^[\w\-./]+$/.test(rel) || path.some((s) => s === ".." || s === "." || s === "") || !TYPES[ext])
    return new Response("Bad request", { status: 400 });

  let target: URL;
  const upstream = new URL(cam.upstream_url);
  if (rel === "live.m3u8") {
    target = upstream; // reserved name = the camera's main playlist
  } else {
    const baseDir = new URL("./", upstream);
    target = new URL(rel, baseDir);
    if (!target.href.startsWith(baseDir.href)) return new Response("Bad request", { status: 400 });
    const qs = new URL(req.url).search;
    if (qs && /^\?[\w=&%.\-]*$/.test(qs)) target.search = qs;
  }

  let res: Response;
  try {
    const range = req.headers.get("range");
    res = await fetch(target, { signal: AbortSignal.timeout(10_000), cache: "no-store", headers: range ? { Range: range } : {} });
  } catch {
    return new Response("Camera unavailable", { status: 502 });
  }
  if (!res.ok && res.status !== 206) return new Response("Camera unavailable", { status: res.status === 404 ? 404 : 502 });

  const headers: Record<string, string> = {
    "Content-Type": TYPES[ext],
    "Cache-Control": "private, no-store",
    "X-Content-Type-Options": "nosniff",
  };
  for (const h of ["content-length", "content-range", "accept-ranges"]) { const v = res.headers.get(h); if (v) headers[h] = v; }
  return new Response(res.body, { status: res.status, headers });
}
