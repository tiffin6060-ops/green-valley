import { db } from "@/lib/db";
import { requireUser } from "@/lib/auth";
import { dateOnly, dateTime } from "@/lib/format";
import { setVisitStatus } from "@/app/admin/actions";
import type { VisitRequest } from "@/lib/visit-store";

const STATUSES = ["new", "contacted", "scheduled", "done", "cancelled"];

export default async function AdminHome() {
  await requireUser(["staff", "admin"]);
  const [reqs, tickets, investors] = await Promise.all([
    db.list("visit_requests") as Promise<VisitRequest[]>,
    db.list("tickets", { status: "open" }),
    db.list("users", { role: "investor" }),
  ]);
  return (
    <>
      <div className="metric-grid" style={{ marginBottom: 24 }}>
        <article><small>New visit requests</small><strong>{reqs.filter((r) => r.status === "new").length}</strong><span>Need a call</span></article>
        <article><small>Open tickets</small><strong>{tickets.length}</strong><span>Awaiting reply</span></article>
        <article><small>Investors</small><strong>{investors.length}</strong><span>Accounts</span></article>
        <article><small>All requests</small><strong>{reqs.length}</strong><span>Total</span></article>
      </div>
      <div className="panel-title"><small>VISIT REQUESTS</small><h2>From the website</h2></div>
      {reqs.length === 0 ? <div className="empty">No visit requests yet.</div> : (
        <div className="table-scroll"><table className="data-table">
          <thead><tr><th>Received</th><th>Name</th><th>Contact</th><th>Interest</th><th>Visit</th><th>Message</th><th>Status</th></tr></thead>
          <tbody>{reqs.map((r) => (
            <tr key={r.id}>
              <td>{dateTime(r.created_at)}</td>
              <td>{r.full_name}</td>
              <td><a href={`tel:${r.mobile}`}>{r.mobile}</a><br />{r.email}</td>
              <td>{r.interest ?? "—"}</td>
              <td>{dateOnly(r.visit_date)}<br />{r.guests ? `${r.guests} guest(s)` : ""}</td>
              <td style={{ maxWidth: 240 }}>{r.message}</td>
              <td>
                <form action={setVisitStatus} className="inline-form">
                  <input type="hidden" name="id" value={r.id} />
                  <select name="status" defaultValue={r.status}>{STATUSES.map((s) => <option key={s}>{s}</option>)}</select>
                  <button type="submit">Save</button>
                </form>
              </td>
            </tr>))}
          </tbody>
        </table></div>
      )}
    </>
  );
}
