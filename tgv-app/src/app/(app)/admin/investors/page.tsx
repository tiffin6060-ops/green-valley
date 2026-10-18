import { db } from "@/lib/db";
import { requireUser } from "@/lib/auth";
import { bdt } from "@/lib/format";
import ActionForm from "@/components/FormMsg";
import { CATEGORIES, STAGES } from "@/lib/constants";
import { planGroups, planInfo } from "@/data/plans";
import { createInvestment, createInvestor, resetPassword, toggleActive, updateInvestment } from "@/app/(app)/admin/actions";

/** Package dropdown grouped by plan (Capital / Monthly). */
function PlanOptions() {
  return planGroups.map((g) => (
    <optgroup key={g.key} label={g.name}>
      {g.packages.map((p) => <option key={p.key} value={p.key}>{p.name} — {p.detail} ({p.value})</option>)}
    </optgroup>
  ));
}

export default async function Investors() {
  await requireUser(["admin"]);
  const [users, investments] = await Promise.all([db.list("users", { role: "investor" }), db.list("investments")]);
  return (
    <>
      <div className="panel-title"><small>INVESTORS</small><h2>Accounts & investments</h2></div>
      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit,minmax(320px,1fr))", gap: 20 }}>
        <ActionForm action={createInvestor} submit="Create account" className="panel-form" resetOnOk={false}>
          <h3>New investor account</h3>
          <input name="name" placeholder="Full name" required />
          <input name="email" type="email" placeholder="Email" required />
          <input name="mobile" placeholder="Mobile (optional)" />
        </ActionForm>
        <ActionForm action={createInvestment} submit="Record investment" className="panel-form">
          <h3>Record investment</h3>
          <select name="user_id" required defaultValue="">
            <option value="" disabled>Select investor</option>
            {users.map((u) => <option key={u.id} value={u.id}>{u.name} ({u.email})</option>)}
          </select>
          <select name="plan" required defaultValue="">
            <option value="" disabled>Package purchased</option>
            <PlanOptions />
          </select>
          <select name="category" defaultValue="Cattle" title="Farm category">{CATEGORIES.map((c) => <option key={c}>{c}</option>)}</select>
          <input name="amount_bdt" type="number" min={1} placeholder="Amount (BDT)" required />
          <label className="demo-note">Start date<input name="start_date" type="date" /></label>
          <select name="stage" defaultValue="Onboarding">{STAGES.map((s) => <option key={s}>{s}</option>)}</select>
          <label className="demo-note">Next review<input name="next_review" type="date" /></label>
        </ActionForm>
      </div>

      {users.length === 0 ? <div className="empty">No investor accounts yet.</div> : users.map((u) => {
        const mine = investments.filter((i) => i.user_id === u.id);
        return (
          <section key={u.id} style={{ marginBottom: 28 }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", flexWrap: "wrap", gap: 10 }}>
              <div>
                <b>{u.name}</b> · {u.email} {u.mobile && `· ${u.mobile}`}{" "}
                <span className={`pill ${u.active ? "" : "off"}`}>{u.active ? "active" : "disabled"}</span>
                {u.must_change_password && <> <span className="pill warn">temp password</span></>}
              </div>
              <div className="inline-form">
                <form action={toggleActive}><input type="hidden" name="id" value={u.id} />
                  <button className="mini-btn" type="submit">{u.active ? "Disable" : "Enable"}</button></form>
                <ActionForm action={resetPassword} submit="Reset password" resetOnOk={false}>
                  <input type="hidden" name="id" value={u.id} />
                </ActionForm>
              </div>
            </div>
            {mine.length === 0 ? <p className="demo-note">No investments recorded.</p> : (
              <div className="table-scroll"><table className="data-table" style={{ marginTop: 10 }}>
                <thead><tr><th>Package</th><th>Category</th><th>Amount</th><th>Edit package · start date · stage · distributions · next review</th></tr></thead>
                <tbody>{mine.map((i) => (
                  <tr key={i.id}>
                    <td>{planInfo(i.plan) ? `${planInfo(i.plan)!.planName.replace("Green Valley ", "")} · ${planInfo(i.plan)!.name}` : <span className="pill warn">not set</span>}</td>
                    <td>{i.category}</td><td>{bdt(i.amount_bdt)}</td>
                    <td>
                      <ActionForm action={updateInvestment} submit="Save" className="inline-form" resetOnOk={false}>
                        <input type="hidden" name="id" value={i.id} />
                        <select name="plan" defaultValue={i.plan ?? ""} title="Package">
                          <option value="">— no package —</option>
                          <PlanOptions />
                        </select>
                        <input name="start_date" type="date" defaultValue={i.start_date ?? ""} title="Start date" />
                        <select name="stage" defaultValue={i.stage}>{STAGES.map((s) => <option key={s}>{s}</option>)}</select>
                        <input name="distributions_bdt" type="number" min={0} defaultValue={i.distributions_bdt} title="Distributions received (BDT)" />
                        <input name="next_review" type="date" defaultValue={i.next_review ?? ""} />
                      </ActionForm>
                    </td>
                  </tr>))}
                </tbody>
              </table></div>
            )}
          </section>
        );
      })}
    </>
  );
}
