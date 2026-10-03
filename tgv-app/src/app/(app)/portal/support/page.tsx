import { db } from "@/lib/db";
import { requireUser } from "@/lib/auth";
import { dateOnly } from "@/lib/format";
import ActionForm from "@/components/FormMsg";
import { createTicket } from "@/app/(app)/portal/actions";

export default async function Support() {
  const u = await requireUser(["investor"]);
  const tickets = await db.list("tickets", { user_id: u.id });
  return (
    <>
      <div className="panel-title"><small>SUPPORT</small><h2>Investor support</h2></div>
      <ActionForm action={createTicket} submit="Submit ticket" className="panel-form">
        <h3>New ticket</h3>
        <select name="category" defaultValue="Investment">
          {["Investment", "Report", "Document", "Technical", "Other"].map((c) => <option key={c}>{c}</option>)}
        </select>
        <input name="subject" placeholder="Subject" required />
        <textarea name="message" placeholder="Write your question" required />
      </ActionForm>
      {tickets.map((t) => (
        <article className="ticket" key={t.id}>
          <small style={{ color: "#667068" }}>{dateOnly(t.created_at)} · {t.category} · <span className={`pill ${t.status === "open" ? "warn" : ""}`}>{t.status}</span></small>
          <h3 style={{ margin: "6px 0" }}>{t.subject}</h3>
          <p style={{ margin: 0, lineHeight: 1.6 }}>{t.message}</p>
          {t.reply && <div className="reply"><b>Team reply:</b> {t.reply}</div>}
        </article>
      ))}
    </>
  );
}
