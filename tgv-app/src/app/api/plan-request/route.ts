import { NextResponse } from "next/server";
import { planEmailConfigured, sendPlanRequestEmail } from "@/lib/email";
import { planFieldErrors, planRequestSchema } from "@/lib/planSchema";
import { rateLimit } from "@/lib/rateLimit";

export const runtime = "nodejs";

function clientIp(req: Request): string {
  const fwd = req.headers.get("x-forwarded-for");
  return fwd?.split(",")[0]?.trim() || req.headers.get("x-real-ip") || "unknown";
}

const sendFailed = () =>
  NextResponse.json(
    { ok: false, code: "sendFailed", error: "Sorry, we couldn't send your request right now. Please try again shortly or contact us directly." },
    { status: 500 },
  );

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

  // 2. Rate limit (in-memory, per instance — see lib/rateLimit.ts). Separate bucket from the visit form.
  const ip = clientIp(req);
  const limit = rateLimit(`plan:${ip}`);
  if (!limit.ok) {
    return NextResponse.json(
      { ok: false, code: "rateLimited", error: "Too many requests. Please try again in a few minutes." },
      { status: 429, headers: { "Retry-After": String(limit.retryAfter) } },
    );
  }

  const result = planRequestSchema.safeParse(body);
  if (!result.success) {
    return NextResponse.json(
      { ok: false, code: "checkFields", error: "Please check the highlighted fields.", fieldErrors: planFieldErrors(result.error) },
      { status: 400 },
    );
  }

  // 3. E-mail is the only delivery channel, so a missing key or failed send must fail the request
  //    (otherwise the investor would think we received it).
  if (!planEmailConfigured()) {
    console.error("[plan-request] RESEND_API_KEY is not set — cannot e-mail the request", { ...result.data, ip });
    return sendFailed();
  }
  try {
    await sendPlanRequestEmail(result.data, ip);
  } catch (err) {
    console.error("[plan-request] e-mail failed", err, { ...result.data, ip });
    return sendFailed();
  }

  return NextResponse.json({ ok: true });
}
