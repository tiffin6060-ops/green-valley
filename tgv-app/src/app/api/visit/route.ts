import { NextResponse } from "next/server";
import { emailConfigured, sendVisitEmail } from "@/lib/email";
import { rateLimit } from "@/lib/rateLimit";
import { saveVisitRequest } from "@/lib/visit-store";
import { fieldErrors, visitSchema } from "@/lib/visitSchema";

export const runtime = "nodejs";

function clientIp(req: Request): string {
  const fwd = req.headers.get("x-forwarded-for");
  return fwd?.split(",")[0]?.trim() || req.headers.get("x-real-ip") || "unknown";
}

export async function POST(req: Request) {
  let body: Record<string, unknown>;
  try {
    const parsed = await req.json();
    if (!parsed || typeof parsed !== "object" || Array.isArray(parsed)) throw new Error("not an object");
    body = parsed as Record<string, unknown>;
  } catch {
    return NextResponse.json({ ok: false, code: "invalid", error: "Invalid request." }, { status: 400 });
  }

  // 1. Honeypot: bots fill the hidden "company" field. Pretend success, do nothing.
  if (typeof body.company === "string" && body.company.trim() !== "") {
    return NextResponse.json({ ok: true });
  }

  // 2. Rate limit (in-memory, per instance — see lib/rateLimit.ts).
  const ip = clientIp(req);
  const limit = rateLimit(ip);
  if (!limit.ok) {
    return NextResponse.json(
      { ok: false, code: "rateLimited", error: "Too many requests. Please try again in a few minutes." },
      { status: 429, headers: { "Retry-After": String(limit.retryAfter) } },
    );
  }

  const result = visitSchema.safeParse(body);
  if (!result.success) {
    return NextResponse.json(
      {
        ok: false,
        code: "checkFields",
        error: "Please check the highlighted fields.",
        // Message keys (messages "visit.errors.<key>"), translated by the client.
        fieldErrors: fieldErrors(result.error),
      },
      { status: 400 },
    );
  }
  const visit = result.data;

  // 3. Save to the database (system of record; the admin panel reads from here).
  try {
    await saveVisitRequest({
      full_name: visit.name,
      mobile: visit.phone,
      email: visit.email || null,
      interest: visit.interest,
      visit_date: visit.preferredDate || null,
      guests: visit.guests,
      message: visit.message || null,
      organization: visit.organization || null,
      locale: visit.locale,
    });
  } catch (err) {
    console.error("[visit] database save failed", err);
    return NextResponse.json(
      {
        ok: false,
        code: "sendFailed",
        error: "Sorry, we couldn't send your request right now. Please try again shortly or contact us directly.",
      },
      { status: 500 },
    );
  }

  // 4. Optional staff e-mail. Only when RESEND_API_KEY + NOTIFY_EMAIL are set; a failure never fails the request.
  if (emailConfigured()) {
    try {
      await sendVisitEmail(visit, ip);
    } catch (err) {
      console.error("[visit] e-mail notification failed (request was saved)", err);
    }
  }

  // 5. Done.
  return NextResponse.json({ ok: true });
}
