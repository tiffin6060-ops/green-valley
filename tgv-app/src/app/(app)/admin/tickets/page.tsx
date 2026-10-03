import { db } from "@/lib/db";
import { requireUser } from "@/lib/auth";
import { dateOnly } from "@/lib/format";
import { replyTicket } from "@/app/(app)/admin/actions";

export default async function AdminTickets() {
  await requireUser(["staff", "admin"]);
  const [tickets, users] = await Promise.all([db.list("tickets"), db.list("users")]);
  const name = (id: string) => users.find((u) => u.id === id)?.name ?? "Unknown";
  return (
    <>
      <div className="panel-title"><small>SUPPORT</small><h2>Investor tickets</h2></div>
      {tickets.length === 0 ? <div className="empty">No tickets.</div> : tickets.map((t) => (
        <article className="ticket" key={t.id}>
          <small style={{ color: "#667068" }}>{name(t.user_id)} · {dateOnly(t.created_at)} · {t.category} · <span className={`pill ${t.status === "open" ? "warn" : ""}`}>{t.status}</span></small>
          <h3 style={{ margin: "6px 0" }}>{t.subject}</h3>
          <p style={{ margin: 0, lineHeight: 1.6 }}>{t.message}</p>
          <form action={replyTicket} className="inline-form" style={{ marginTop: 12 }}>
            <input type="hidden" name="id" value={t.id} />
            <input name="reply" defaultValue={t.reply ?? ""} placeholder="Write a reply" style={{ flex: 1, minWidth: 220 }} />
            <label style={{ fontSize: 12 }}><input type="checkbox" name="close" style={{ width: "auto", margin: "0 4px 0 0" }} />Close</label>
            <button type="submit">Send</button>
          </form>
        </article>
      ))}
    </>
  );
}
