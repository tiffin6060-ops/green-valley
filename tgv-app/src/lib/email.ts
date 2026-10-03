import type { Visit } from "./visitSchema";

const escape = (s: string) =>
  s.replace(/[&<>"']/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" })[c]!);

/** True when staff e-mail notification is configured (RESEND_API_KEY + NOTIFY_EMAIL). Optional. */
export const emailConfigured = () => Boolean(process.env.RESEND_API_KEY && process.env.NOTIFY_EMAIL);

/** Sends the visit-request notification through Resend's REST API. Throws on failure. */
export async function sendVisitEmail(visit: Visit, ip: string): Promise<void> {
  const rows: [string, string][] = [
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
  ];
  const text = rows.map(([k, v]) => `${k}: ${v}`).join("\n");
  const html = `<h2>New farm visit request</h2><table cellpadding="6" style="border-collapse:collapse">${rows
    .map(([k, v]) => `<tr><td style="font-weight:bold;vertical-align:top">${k}</td><td style="white-space:pre-wrap">${escape(v)}</td></tr>`)
    .join("")}</table>`;

  const res = await fetch("https://api.resend.com/emails", {
    method: "POST",
    headers: { Authorization: `Bearer ${process.env.RESEND_API_KEY}`, "Content-Type": "application/json" },
    body: JSON.stringify({
      from: process.env.RESEND_FROM || "Trishal Green Valley <onboarding@resend.dev>",
      to: (process.env.NOTIFY_EMAIL ?? "").split(",").map((s) => s.trim()).filter(Boolean),
      reply_to: visit.email || undefined,
      subject: `New farm visit request — ${visit.name} (${visit.interest})`,
      text,
      html,
    }),
  });
  if (!res.ok) throw new Error(`Resend ${res.status}: ${(await res.text()).slice(0, 200)}`);
}
