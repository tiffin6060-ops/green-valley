import { requireUser } from "@/lib/auth";
import ActionForm from "@/components/FormMsg";
import { changePassword } from "@/app/(app)/auth-actions";

export default async function Account({ searchParams }: { searchParams: Promise<{ force?: string }> }) {
  const u = await requireUser(["investor"]);
  const { force } = await searchParams;
  return (
    <>
      <div className="panel-title"><small>ACCOUNT</small><h2>Your account</h2>
        <p>{u.name} · {u.email}{u.mobile ? ` · ${u.mobile}` : ""}</p></div>
      {(force || u.must_change_password) && <div className="demo-banner">Please set a new password before continuing.</div>}
      <ActionForm action={changePassword} submit="Update password" className="panel-form">
        <h3>Change password</h3>
        <input name="current" type="password" placeholder="Current password" autoComplete="current-password" required />
        <input name="next" type="password" placeholder="New password (8+ characters)" autoComplete="new-password" required />
        <input name="confirm" type="password" placeholder="Confirm new password" autoComplete="new-password" required />
      </ActionForm>
    </>
  );
}
