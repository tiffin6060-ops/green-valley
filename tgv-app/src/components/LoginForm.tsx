"use client";
import { useActionState } from "react";
import { login, type FormState } from "@/app/(app)/auth-actions";

export default function LoginForm() {
  const [state, act, pending] = useActionState<FormState, FormData>(login, { ok: false, message: "" });
  return (
    <form action={act}>
      <input name="email" type="email" placeholder="Email" autoComplete="username" defaultValue={state.email} key={state.email} required />
      <input name="password" type="password" placeholder="Password" autoComplete="current-password" required />
      <button className="btn dark" type="submit" disabled={pending}>{pending ? "Signing in…" : "Sign in"}</button>
      {state.message && <p className="msg-err" role="status">{state.message}</p>}
    </form>
  );
}
