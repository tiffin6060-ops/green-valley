import { db } from "@/lib/db";
import { dateOnly } from "@/lib/format";

export default async function DocList({ userId, kind, title, label }: { userId: string; kind: "report" | "document"; title: string; label: string }) {
  const [mine, shared] = await Promise.all([db.list("documents", { kind, user_id: userId }), db.list("documents", { kind, user_id: null })]);
  const docs = [...mine, ...shared].sort((a, b) => String(b.created_at).localeCompare(String(a.created_at)));
  return (
    <>
      <div className="panel-title"><small>{label}</small><h2>{title}</h2></div>
      {docs.length === 0 ? <div className="empty">Nothing here yet.</div> : (
        <div className="doc-list">
          {docs.map((d) => (
            <div key={d.id}>
              <span>{d.title}<br /><small style={{ color: "#667068" }}>{dateOnly(d.created_at)} · {(d.size / 1024).toFixed(0)} KB</small></span>
              <a className="mini-btn" href={`/files/${d.id}`} target="_blank" rel="noopener">Open</a>
            </div>
          ))}
        </div>
      )}
    </>
  );
}
