import { requireUser } from "@/lib/auth";
import ActionForm from "@/components/FormMsg";
import { changePassword } from "@/app/auth-actions";

export default async function AdminAccount() {
  const u = await requireUser(["staff", "admin"]);
  return (
    <>
      <div className="panel-title"><small>ACCOUNT</small><h2>Your account</h2><p>{u.name} · {u.email} · {u.role}</p></div>
      <ActionForm action={changePassword} submit="Update password" className="panel-form">
        <h3>Change password</h3>
        <input name="current" type="password" placeholder="Current password" autoComplete="current-password" required />
        <input name="next" type="password" placeholder="New password (8+ characters)" autoComplete="new-password" required />
        <input name="confirm" type="password" placeholder="Confirm new password" autoComplete="new-password" required />
      </ActionForm>
    </>
  );
}
