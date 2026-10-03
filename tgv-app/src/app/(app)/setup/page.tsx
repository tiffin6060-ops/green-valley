import { redirect } from "next/navigation";
import { hasUsers } from "@/lib/auth";
import ActionForm from "@/components/FormMsg";
import { setupAdmin } from "@/app/(app)/auth-actions";

export const metadata = { title: "Setup — Trishal Green Valley" };
export const dynamic = "force-dynamic";

export default async function Setup() {
  if (await hasUsers()) redirect("/login");
  const dev = process.env.NODE_ENV !== "production";
  return (
    <main className="auth-wrap">
      <div className="auth-card">
        <p className="eyebrow">FIRST-TIME SETUP</p>
        <h1>Create the admin account</h1>
        <p style={{ fontSize: 13, color: "#667068", lineHeight: 1.6, marginTop: -8 }}>
          This page works only once, while no accounts exist. Do it right after deploying.
        </p>
        <ActionForm action={setupAdmin} submit="Create admin & continue" resetOnOk={false}>
          <input name="name" placeholder="Your name" required />
          <input name="email" type="email" placeholder="Email" autoComplete="username" required />
          <input name="password" type="password" placeholder="Password (10+ characters)" autoComplete="new-password" required />
          <input name="confirm" type="password" placeholder="Confirm password" autoComplete="new-password" required />
          {dev && (
            <label style={{ display: "block", fontSize: 13, margin: "0 0 14px" }}>
              <input type="checkbox" name="demo" style={{ width: "auto", marginRight: 8 }} />Add demo investor &amp; sample data (dev only)
            </label>
          )}
        </ActionForm>
      </div>
    </main>
  );
}
