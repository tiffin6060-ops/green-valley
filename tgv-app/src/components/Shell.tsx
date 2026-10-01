import Link from "next/link";
import SideNav from "@/components/SideNav";
import { logout } from "@/app/auth-actions";
import type { User } from "@/lib/auth";

export default function Shell({
  user, nav, label, children,
}: { user: User; nav: { href: string; label: string }[]; label: string; children: React.ReactNode }) {
  const initials = user.name.split(" ").map((w) => w[0]).slice(0, 2).join("").toUpperCase();
  return (
    <div className="portal-body">
      <aside className="sidebar">
        <Link className="brand portal-brand" href="/"><span className="brand-mark">GV</span><span><b>TRISHAL</b><strong>GREEN VALLEY</strong></span></Link>
        <SideNav items={nav} />
        <div className="side-user">{user.name}<br />{user.email}</div>
        <form action={logout}><button className="logout-btn" type="submit">Sign out</button></form>
        <Link className="back-site" href="/">← Public website</Link>
      </aside>
      <main className="portal-main">
        <header className="portal-top">
          <div><small>{label}</small><h1>Welcome, {user.name.split(" ")[0]}</h1></div>
          <div className="user-chip">{user.role} <span>{initials}</span></div>
        </header>
        {children}
      </main>
    </div>
  );
}

export function ComingSoon({ title, part, text }: { title: string; part: string; text: string }) {
  return (
    <div className="portal-card" style={{ maxWidth: 640 }}>
      <small>{part}</small>
      <h2>{title}</h2>
      <p>{text}</p>
    </div>
  );
}
