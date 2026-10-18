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

  return (
    <>
      <div className="metric-grid">
        <article><small>Total Investment</small><strong>{bdt(total)}</strong><span>{inv.length} record(s)</span></article>
        <article><small>Active Packages</small><strong>{active.length}</strong><span>{inv.length - active.length} closed</span></article>
        <article><small>Distribution Received</small><strong>{bdt(dist)}</strong><span>As recorded by the team</span></article>
        <article><small>Next Review</small><strong>{next ? dateOnly(next) : "—"}</strong><span>Scheduled</span></article>
      </div>

      <div className="panel-title" style={{ margin: "34px 0 14px" }}><small>MY PACKAGES</small><h2>Packages you have invested in</h2></div>
      {inv.length === 0 ? (
        <div className="empty">No packages are linked to your account yet. Our team will add them once your investment is confirmed.</div>
      ) : (
        <div className="package-grid">
          {inv.map((i) => {
            const p = planInfo(i.plan);
            return (
              <article key={i.id} className="portal-card package-card">
                <div className="package-head">
                  <small>{p ? p.planName.toUpperCase() : i.category.toUpperCase()}</small>
                  <span className={`pill ${i.status === "active" ? "" : "off"}`}>{i.status}</span>
                </div>
                <h3>{p ? p.name : i.category}</h3>
                {p && <p className="package-terms">{p.detail} · {p.value}</p>}
                <dl>
                  <div><dt>Invested</dt><dd>{bdt(i.amount_bdt)}</dd></div>
                  <div><dt>Start date</dt><dd>{dateOnly(i.start_date ?? i.created_at)}</dd></div>
                  <div><dt>Stage</dt><dd>{i.stage}</dd></div>
                  <div><dt>Distributions</dt><dd>{bdt(i.distributions_bdt)}</dd></div>
                  <div><dt>Next review</dt><dd>{dateOnly(i.next_review)}</dd></div>
                </dl>
              </article>
            );
          })}
        </div>
      )}

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
