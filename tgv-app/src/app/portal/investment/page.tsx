import { db } from "@/lib/db";
import { requireUser } from "@/lib/auth";
import { bdt, dateOnly } from "@/lib/format";

export default async function MyInvestment() {
  const u = await requireUser(["investor"]);
  const inv = await db.list("investments", { user_id: u.id });
  return (
    <>
      <div className="panel-title"><small>MY INVESTMENT</small><h2>Investment overview</h2></div>
      {inv.length === 0 ? <div className="empty">No investment records are linked to your account yet.</div> :
        inv.map((i) => (
          <div key={i.id} style={{ marginBottom: 14 }}>
            <div className="investment-flow">
              <div><small>INVESTMENT</small><strong>{bdt(i.amount_bdt)}</strong></div><i>→</i>
              <div><small>CATEGORY</small><strong>{i.category}</strong></div><i>→</i>
              <div><small>STAGE</small><strong>{i.stage}</strong></div><i>→</i>
              <div><small>NEXT REVIEW</small><strong>{dateOnly(i.next_review)}</strong></div>
            </div>
            <p className="demo-note">Distributions received: {bdt(i.distributions_bdt)} · Status: {i.status}</p>
          </div>
        ))}
    </>
  );
}
