"use client";
import { useActionState } from "react";
import { submitVisitRequest, type VisitState } from "@/app/actions";
import { interestOptions } from "@/data/site";

const initial: VisitState = { ok: false, message: "" };

export default function VisitForm() {
  const [state, action, pending] = useActionState(submitVisitRequest, initial);
  const err = (k: string) => state.errors?.[k] && <small className="field-error">{state.errors[k]}</small>;

  if (state.ok) return <div className="form-success"><h3>Request received ✓</h3><p>{state.message}</p></div>;

  return (
    <form action={action} noValidate>
      <div className="form-row">
        <div><input name="full_name" required placeholder="Full name" />{err("full_name")}</div>
        <div><input name="mobile" required placeholder="Mobile number (01XXXXXXXXX)" inputMode="tel" />{err("mobile")}</div>
      </div>
      <div className="form-row">
        <div><input name="email" type="email" placeholder="Email (optional)" />{err("email")}</div>
        <select name="interest" defaultValue="">
          <option value="">Investment interest</option>
          {interestOptions.map((o) => <option key={o}>{o}</option>)}
        </select>
      </div>
      <div className="form-row">
        <div><input name="visit_date" type="date" />{err("visit_date")}</div>
        <div><input name="guests" type="number" min={1} max={50} placeholder="Number of guests" />{err("guests")}</div>
      </div>
      <textarea name="message" placeholder="Message / questions" />
      <input name="website" tabIndex={-1} autoComplete="off" aria-hidden="true" className="hp" />
      <button className="btn primary" type="submit" disabled={pending}>{pending ? "Sending…" : "Request Farm Visit"}</button>
      {state.message && !state.ok && <p className="form-status">{state.message}</p>}
    </form>
  );
}
