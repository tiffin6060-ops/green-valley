import nodemailer from "nodemailer";
import { planLabel } from "@/data/plans";
import type { PlanRequest } from "./planSchema";
import type { Visit } from "./visitSchema";

const escape = (s: string) =>
  s.replace(/[&<>"']/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" })[c]!);

/** True when staff e-mail notification is configured (Gmail or RESEND_API_KEY, plus NOTIFY_EMAIL). Optional. */
export const emailConfigured = () =>
  Boolean((gmailConfigured() || process.env.RESEND_API_KEY) && process.env.NOTIFY_EMAIL);

/** Package requests go here unless PLAN_NOTIFY_EMAIL overrides it (comma-separated for several). */
const PLAN_NOTIFY_DEFAULT = "trishalgreenvalley@gmail.com";

/** Free option: send through a Gmail account using an App Password (GMAIL_USER + GMAIL_APP_PASSWORD). */
const gmailConfigured = () => Boolean(process.env.GMAIL_USER && process.env.GMAIL_APP_PASSWORD);

/** True when package-request e-mail can be sent (Gmail, or Resend with only RESEND_API_KEY). */
export const planEmailConfigured = () => gmailConfigured() || Boolean(process.env.RESEND_API_KEY);

const recipients = (list: string) => list.split(",").map((s) => s.trim()).filter(Boolean);

/** Sends a key/value table as a staff e-mail. Throws on failure. */
async function sendTable(opts: { to: string[]; subject: string; heading: string; rows: [string, string][]; replyTo?: string }) {
  const text = opts.rows.map(([k, v]) => `${k}: ${v}`).join("\n");
  const html = `<h2>${escape(opts.heading)}</h2><table cellpadding="6" style="border-collapse:collapse">${opts.rows
    .map(([k, v]) => `<tr><td style="font-weight:bold;vertical-align:top">${k}</td><td style="white-space:pre-wrap">${escape(v)}</td></tr>`)
    .join("")}</table>`;
  await sendMail({ to: opts.to, subject: opts.subject, text, html, replyTo: opts.replyTo });
}

/** Sends one e-mail through Gmail if configured, otherwise Resend. Throws on failure. */
async function sendMail(opts: { to: string[]; subject: string; text: string; html: string; replyTo?: string }) {
  const { text, html } = opts;
  if (gmailConfigured()) {
    const transport = nodemailer.createTransport({
      service: "gmail",
      auth: { user: process.env.GMAIL_USER, pass: process.env.GMAIL_APP_PASSWORD?.replace(/\s/g, "") },
    });
    await transport.sendMail({
      from: `"Trishal Green Valley" <${process.env.GMAIL_USER}>`,
      to: opts.to,
      replyTo: opts.replyTo || undefined,
      subject: opts.subject,
      text,
      html,
    });
    return;
  }

  const res = await fetch("https://api.resend.com/emails", {
    method: "POST",
    headers: { Authorization: `Bearer ${process.env.RESEND_API_KEY}`, "Content-Type": "application/json" },
    body: JSON.stringify({
      from: process.env.RESEND_FROM || "Trishal Green Valley <onboarding@resend.dev>",
      to: opts.to,
      reply_to: opts.replyTo || undefined,
      subject: opts.subject,
      text,
      html,
    }),
  });
  if (!res.ok) throw new Error(`Resend ${res.status}: ${(await res.text()).slice(0, 200)}`);
}

/** Sends the visit-request notification. Throws on failure. */
export async function sendVisitEmail(visit: Visit, ip: string): Promise<void> {
  await sendTable({
    to: recipients(process.env.NOTIFY_EMAIL ?? ""),
    subject: `New farm visit request — ${visit.name} (${visit.interest})`,
    heading: "New farm visit request",
    replyTo: visit.email,
    rows: [
      ["Name", visit.name],
      ["Phone", visit.phone],
      ["Email", visit.email || "—"],
      ["Profession / company", visit.organization || "—"],
      ["Interest", visit.interest],
      ["Preferred date", visit.preferredDate || "—"],
      ["Guests", String(visit.guests)],
      ["Message", visit.message || "—"],
      ["Visitor language", visit.locale === "bn" ? "Bangla (bn)" : "English (en)"],
      ["Submitted", new Date().toISOString()],
      ["IP", ip],
    ],
  });
}

/** Sends an investment package request from /invest. Throws on failure. */
export async function sendPlanRequestEmail(req: PlanRequest, ip: string): Promise<void> {
  const pkg = planLabel(req.plan);
  await sendTable({
    to: recipients(process.env.PLAN_NOTIFY_EMAIL || PLAN_NOTIFY_DEFAULT),
    subject: `New investment request — ${req.name} (${pkg.split(" (")[0]})`,
    heading: "New investment package request",
    replyTo: req.email,
    rows: [
      ["Full name", req.name],
      ["Email", req.email],
      ["Contact number", req.phone],
      ["Package", pkg],
      ["Message", req.message || "—"],
      ["Visitor language", req.locale === "bn" ? "Bangla (bn)" : "English (en)"],
      ["Submitted", new Date().toISOString()],
      ["IP", ip],
    ],
  });
}

/**
 * Sends an investor their portal login (new account or password reset). Throws on failure.
 * The password is temporary: the portal makes them choose a new one at first login.
 */
export async function sendInvestorCredentialsEmail(opts: {
  to: string; name: string; password: string; loginUrl: string; reason: "new" | "reset";
}): Promise<void> {
  const intro =
    opts.reason === "new"
      ? "Your Trishal Green Valley investor portal account is ready. In the portal you can see the packages you have invested in, project updates, reports and documents."
      : "Your Trishal Green Valley investor portal password has been reset.";
  const security =
    "For your security you will be asked to set a new password the first time you log in. Do not share this password with anyone.";
  const contactLine = `If you did not expect this e-mail, please contact us at ${PLAN_NOTIFY_DEFAULT}.`;
  const text = [
    `Dear ${opts.name},`, "", intro, "",
    `Login page: ${opts.loginUrl}`, `Email: ${opts.to}`, `Temporary password: ${opts.password}`, "",
    security, "", contactLine, "", "Trishal Green Valley",
  ].join("\n");
  const html = `<div style="font-family:Arial,sans-serif;font-size:15px;line-height:1.6;color:#172019;max-width:560px">
<p>Dear ${escape(opts.name)},</p>
<p>${escape(intro)}</p>
<table cellpadding="8" style="border-collapse:collapse;background:#f5f3eb;border:1px solid #dfe3dd">
<tr><td style="font-weight:bold">Login page</td><td><a href="${escape(opts.loginUrl)}">${escape(opts.loginUrl)}</a></td></tr>
<tr><td style="font-weight:bold">Email</td><td>${escape(opts.to)}</td></tr>
<tr><td style="font-weight:bold">Temporary password</td><td style="font-family:monospace;font-size:16px">${escape(opts.password)}</td></tr>
</table>
<p>${escape(security)}</p>
<p style="color:#667068;font-size:13px">${escape(contactLine)}</p>
<p>Trishal Green Valley</p></div>`;
  await sendMail({
    to: [opts.to],
    subject: opts.reason === "new" ? "Your Trishal Green Valley investor portal login" : "Your new Trishal Green Valley portal password",
    text,
    html,
  });
}
