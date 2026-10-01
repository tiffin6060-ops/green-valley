import Link from "next/link";
import { redirect } from "next/navigation";
import { getUser, hasUsers } from "@/lib/auth";
import LoginForm from "@/components/LoginForm";

export const metadata = { title: "Sign in — Trishal Green Valley" };
export const dynamic = "force-dynamic";

export default async function LoginPage() {
  if (!(await hasUsers())) redirect("/setup");
  const u = await getUser();
  if (u) redirect(u.role === "investor" ? "/portal" : "/admin");
  return (
    <main className="auth-wrap">
      <div className="auth-card">
        <p className="eyebrow">TRISHAL GREEN VALLEY</p>
        <h1>Sign in</h1>
        <LoginForm />
        <p style={{ fontSize: 12, color: "#667068", marginTop: 20 }}>
          Accounts are created by the project team after onboarding. <Link href="/#visit" style={{ color: "#123f2d", fontWeight: 700 }}>Request a visit</Link>
        </p>
        <p style={{ fontSize: 12, marginTop: 8 }}><Link href="/">← Back to website</Link></p>
      </div>
    </main>
  );
}
