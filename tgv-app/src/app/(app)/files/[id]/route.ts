import { db } from "@/lib/db";
import { getUser } from "@/lib/auth";
import { isInline, readStored } from "@/lib/files";

export const dynamic = "force-dynamic";

// Every download is authenticated and authorised here. Files are never served as static assets.
export async function GET(_req: Request, ctx: { params: Promise<{ id: string }> }) {
  const user = await getUser();
  if (!user) return new Response("Unauthorized", { status: 401 });

  const { id } = await ctx.params;
  const doc = await db.get("documents", id);
  const allowed = doc && (user.role !== "investor" || doc.user_id === null || doc.user_id === user.id);
  if (!doc || !allowed) return new Response("Not found", { status: 404 }); // same answer for "missing" and "not yours"

  let data: Buffer;
  try { data = await readStored(doc.stored_name); } catch { return new Response("Not found", { status: 404 }); }

  await db.insert("audit_log", { user_id: user.id, action: "download", target: doc.id });
  return new Response(new Uint8Array(data), {
    headers: {
      "Content-Type": doc.mime,
      "Content-Length": String(data.length),
      "Content-Disposition": `${isInline(doc.mime) ? "inline" : "attachment"}; filename*=UTF-8''${encodeURIComponent(doc.file_name)}`,
      "X-Content-Type-Options": "nosniff",
      "Content-Security-Policy": "sandbox; default-src 'none'",
      "Cache-Control": "private, no-store",
    },
  });
}
