import type { ReactNode } from "react";
import { db } from "@/lib/db";
import { requireUser } from "@/lib/auth";
import { bdt } from "@/lib/format";
import ActionForm from "@/components/FormMsg";
import ConfirmDeleteForm from "@/components/ConfirmDeleteForm";
import { CATEGORIES, STAGES } from "@/lib/constants";
import { planGroups, planInfo } from "@/data/plans";
import {
  createInvestment, createInvestor, deleteInvestor, resetPassword, toggleActive, updateInvestment,
} from "@/app/(app)/admin/actions";

/** Package dropdown grouped by plan (Capital / Monthly). */
function PlanOptions() {
  return planGroups.map((g) => (
    <optgroup key={g.key} label={g.name}>
      {g.packages.map((p) => <option key={p.key} value={p.key}>{p.name} — {p.detail} ({p.value})</option>)}
    </optgroup>
  ));
}

/** Visible label + optional hint above a form control. */
function Field({ label, hint, required, children }: { label: string; hint?: string; required?: boolean; children: ReactNode }) {
  return (
    <label className="field">
      <span className="field-label">{label}{required && <b className="req"> *</b>}</span>
      {children}
      {hint && <span className="field-hint">{hint}</span>}
    </label>
  );
}

/** Small label above a control in the investment table. */
function Mini({ label, children }: { label: string; children: ReactNode }) {
  return <label className="mini-field"><span>{label}</span>{children}</label>;
}

export default async function Investors() {
  await requireUser(["admin"]);
  const [users, investments] = await Promise.all([db.list("users", { role: "investor" }), db.list("investments")]);
  return (
    <>
      <div className="panel-title">
        <small>INVESTORS</small><h2>Accounts & investments</h2>
        <p>
          <b>Step 1:</b> create the investor&apos;s login. <b>Step 2:</b> record the package they purchased.
          The investor then sees it on their dashboard. Fields marked <b className="req">*</b> are required.
        </p>
      </div>
      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit,minmax(320px,1fr))", gap: 20, alignItems: "start" }}>
        <ActionForm action={createInvestor} submit="Create account" className="panel-form" resetOnOk={false}>
          <h3>Step 1 · New investor account</h3>
          <Field label="Full name" required>
            <input name="name" placeholder="e.g. Md. Rahim Uddin" required />
          </Field>
          <Field label="Email" required hint="The investor logs in with this email.">
            <input name="email" type="email" placeholder="e.g. rahim@gmail.com" required />
          </Field>
          <Field label="Mobile number" hint="Optional. For your records.">
            <input name="mobile" placeholder="e.g. 01712345678" />
          </Field>
          <label className="check-row">
            <input name="send_email" type="checkbox" defaultChecked />
            <span>Email the login details to the investor<br /><small>A temporary password is created automatically. The investor must change it at first login.</small></span>
          </label>
        </ActionForm>

        <ActionForm action={createInvestment} submit="Record investment" className="panel-form">
          <h3>Step 2 · Record investment</h3>
          <Field label="Investor" required hint={users.length ? undefined : "Create the investor's account first (Step 1)."}>
            <select name="user_id" required defaultValue="">
              <option value="" disabled>Select investor…</option>
              {users.map((u) => <option key={u.id} value={u.id}>{u.name} ({u.email})</option>)}
            </select>
          </Field>
          <Field label="Package purchased" required>
            <select name="plan" required defaultValue="">
              <option value="" disabled>Select package…</option>
              <PlanOptions />
            </select>
          </Field>
          <Field label="Amount invested (BDT)" required hint="Total taka received for this package, e.g. 50000.">
            <input name="amount_bdt" type="number" min={1} placeholder="e.g. 50000" required />
          </Field>
          <Field label="Start date" hint="When the investment started. Leave empty to use today.">
            <input name="start_date" type="date" />
          </Field>
          <Field label="Farm category" hint="Which part of the farm this money goes to.">
            <select name="category" defaultValue="Cattle">{CATEGORIES.map((c) => <option key={c}>{c}</option>)}</select>
          </Field>
          <Field label="Stage" hint="Current progress. You can change it any time below.">
            <select name="stage" defaultValue="Onboarding">{STAGES.map((s) => <option key={s}>{s}</option>)}</select>
          </Field>
          <Field label="Next review date" hint="Optional. Shown to the investor as their next review.">
            <input name="next_review" type="date" />
          </Field>
        </ActionForm>
      </div>

      <h3 className="list-title">All investors ({users.length})</h3>
      {users.length === 0 ? <div className="empty">No investor accounts yet.</div> : users.map((u) => {
        const mine = investments.filter((i) => i.user_id === u.id);
        return (
          <section key={u.id} className="investor-block">
            <div className="investor-head">
              <div>
                <b>{u.name}</b> · {u.email} {u.mobile && `· ${u.mobile}`}{" "}
                <span className={`pill ${u.active ? "" : "off"}`}>{u.active ? "active" : "disabled"}</span>
                {u.must_change_password && <> <span className="pill warn">temp password</span></>}
              </div>
              <div className="inline-form">
                <form action={toggleActive}><input type="hidden" name="id" value={u.id} />
                  <button className="mini-btn" type="submit" title={u.active ? "Block login without deleting anything" : "Allow login again"}>
                    {u.active ? "Disable login" : "Enable login"}
                  </button></form>
                <ActionForm action={resetPassword} submit="Reset password" className="inline-form" resetOnOk={false}>
                  <input type="hidden" name="id" value={u.id} />
                  <label className="demo-note" style={{ display: "flex", gap: 4, alignItems: "center" }}>
                    <input name="send_email" type="checkbox" defaultChecked /> email it
                  </label>
                </ActionForm>
                <ConfirmDeleteForm
                  action={deleteInvestor}
                  id={u.id}
                  label="Delete investor"
                  confirmText={`Permanently delete ${u.name} (${u.email})?\n\nThis removes their login, ${mine.length} investment record(s), support tickets and personal documents. This cannot be undone.\n\nTo only block their login, use "Disable login" instead.`}
                />
              </div>
            </div>
            {mine.length === 0 ? <p className="demo-note">No investments recorded yet. Use Step 2 above.</p> : (
              <div className="table-scroll"><table className="data-table" style={{ marginTop: 10 }}>
                <thead><tr><th>Package</th><th>Amount</th><th>Update this investment (the investor sees these)</th></tr></thead>
                <tbody>{mine.map((i) => {
                  const p = planInfo(i.plan);
                  return (
                    <tr key={i.id}>
                      <td>
                        {p ? <><b>{p.planName.replace("Green Valley ", "")} · {p.name}</b><br /><span className="demo-note">{p.detail}</span></>
                          : <span className="pill warn">package not set</span>}
                        <br /><span className="demo-note">{i.category}</span>
                      </td>
                      <td>{bdt(i.amount_bdt)}</td>
                      <td>
                        <ActionForm action={updateInvestment} submit="Save" className="inline-form edit-row" resetOnOk={false}>
                          <input type="hidden" name="id" value={i.id} />
                          <Mini label="Package">
                            <select name="plan" defaultValue={i.plan ?? ""}>
                              <option value="">— not set —</option>
                              <PlanOptions />
                            </select>
                          </Mini>
                          <Mini label="Start date"><input name="start_date" type="date" defaultValue={i.start_date ?? ""} /></Mini>
                          <Mini label="Stage"><select name="stage" defaultValue={i.stage}>{STAGES.map((s) => <option key={s}>{s}</option>)}</select></Mini>
                          <Mini label="Paid out so far (BDT)"><input name="distributions_bdt" type="number" min={0} defaultValue={i.distributions_bdt} /></Mini>
                          <Mini label="Next review"><input name="next_review" type="date" defaultValue={i.next_review ?? ""} /></Mini>
                        </ActionForm>
                      </td>
                    </tr>
                  );
                })}
                </tbody>
              </table></div>
            )}
          </section>
        );
      })}
    </>
  );
}
