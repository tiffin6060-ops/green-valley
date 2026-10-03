import { db } from "@/lib/db";
import { requireUser } from "@/lib/auth";
import CameraPlayer from "@/components/CameraPlayer";

export const metadata = { title: "Live Farm — Trishal Green Valley" };

export default async function Live() {
  const u = await requireUser(["investor"]);
  const cams = (await db.list("cameras", { active: true })).sort((a, b) => a.sort_order - b.sort_order);
  await db.insert("audit_log", { user_id: u.id, action: "view_live", target: "live" });
  return (
    <>
      <div className="panel-title"><small>LIVE FARM</small><h2>Live camera access</h2>
        <p>Streams are private to signed-in investors. If a camera shows offline, it reconnects automatically.</p></div>
      {cams.length === 0 ? <div className="empty">No cameras are available right now.</div> : (
        <div className="camera-grid">
          {cams.map((c) => (
            <article key={c.id}>
              <CameraPlayer id={c.id} name={c.name} />
              <h3>{c.name}</h3>
              {c.description && <p>{c.description}</p>}
            </article>
          ))}
        </div>
      )}
    </>
  );
}
