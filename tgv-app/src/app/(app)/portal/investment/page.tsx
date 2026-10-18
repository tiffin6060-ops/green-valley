import { db } from "@/lib/db";
import { requireUser } from "@/lib/auth";
import { planInfo } from "@/data/plans";
import { bdt, dateOnly } from "@/lib/format";

export default async function MyInvestment() {
  const u = await requireUser(["investor"]);
  const inv = await db.list("investments", { user_id: u.id });
  return (
    <>
      <div className="panel-title"><small>MY INVESTMENT</small><h2>Investment overview</h2></div>
      {inv.length === 0 ? <div className="empty">No investment records are linked to your account yet.</div> :
        inv.map((i) => {
          const p = planInfo(i.plan);
          return (
            <div key={i.id} style={{ marginBottom: 22 }}>
              {p && (
                <article className="portal-card" style={{ marginBottom: 10 }}>
                  <small>YOUR PACKAGE</small>
                  <h2 style={{ margin: "8px 0 4px" }}>{p.planName} — {p.name}</h2>
                  <p style={{ margin: 0 }}>
                    <b>{p.detail}</b> · <b>{p.value}</b><br />
                    {p.planNote}
                  </p>
                </article>
              )}
              <div className="investment-flow">
                <div><small>INVESTMENT</small><strong>{bdt(i.amount_bdt)}</strong></div><i>→</i>
                <div><small>START DATE</small><strong>{dateOnly(i.start_date ?? i.created_at)}</strong></div><i>→</i>
                <div><small>STAGE</small><strong>{i.stage}</strong></div><i>→</i>
                <div><small>NEXT REVIEW</small><strong>{dateOnly(i.next_review)}</strong></div>
              </div>
              <p className="demo-note">
                Category: {i.category} · Distributions received: {bdt(i.distributions_bdt)} · Status: {i.status}
              </p>
            </div>
          );
        })}
    </>
  );
}
