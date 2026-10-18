import Link from "next/link";
import { db } from "@/lib/db";
import { requireUser } from "@/lib/auth";
import { bdt, dateOnly } from "@/lib/format";
import { planInfo } from "@/data/plans";

export const metadata = { title: "Dashboard — Trishal Green Valley" };

export default async function Dashboard() {
  const u = await requireUser(["investor"]);
  const inv = await db.list("investments", { user_id: u.id });
  const active = inv.filter((i) => i.status === "active");
  const total = inv.reduce((s, i) => s + Number(i.amount_bdt), 0);
  const dist = inv.reduce((s, i) => s + Number(i.distributions_bdt), 0);
  const today = new Date().toISOString().slice(0, 10);
  const next = active.map((i) => i.next_review).filter((d) => d && d >= today).sort()[0];
  const latest = (await db.list("project_updates", { published: true }, 1))[0];
  const packages = [...new Set(active.map((i) => planInfo(i.plan)).filter((p) => p !== null).map((p) => `${p.planName.replace("Green Valley ", "")} · ${p.name}`))];

  return (
    <>
      <div className="metric-grid">
        <article><small>Total Investment</small><strong>{bdt(total)}</strong><span>{inv.length} record(s)</span></article>
        <article><small>My Package</small><strong>{packages.length || "—"}</strong><span>{packages.join(", ") || "Not assigned yet"}</span></article>
        <article><small>Distribution Received</small><strong>{bdt(dist)}</strong><span>As recorded by the team</span></article>
        <article><small>Next Review</small><strong>{next ? dateOnly(next) : "—"}</strong><span>Scheduled</span></article>
      </div>
      <div className="portal-grid">
        <article className="portal-card">
          <small>LATEST PROJECT UPDATE</small>
          {latest ? (
            <>
              <h2>{latest.title}</h2>
              <p>{latest.body}</p>
              <p style={{ fontSize: 12 }}>{dateOnly(latest.created_at)} · Progress {latest.progress_pct}%</p>
            </>
          ) : <p>No updates published yet.</p>}
        </article>
        <article className="portal-card">
          <small>QUICK ACCESS</small>
          <h2>Your tools</h2>
          <div className="quick-links">
            <Link href="/portal/investment"><button>My Investment →</button></Link>
            <Link href="/portal/updates"><button>Project Updates →</button></Link>
            <Link href="/portal/support"><button>Support →</button></Link>
          </div>
        </article>
      </div>
    </>
  );
}
