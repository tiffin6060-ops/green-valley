import { db } from "@/lib/db";
import { requireUser } from "@/lib/auth";
import { dateOnly } from "@/lib/format";

export default async function Updates() {
  await requireUser(["investor"]);
  const list = await db.list("project_updates", { published: true });
  return (
    <>
      <div className="panel-title"><small>PROJECT UPDATES</small><h2>Latest from the farm</h2></div>
      {list.length === 0 ? <div className="empty">No updates published yet.</div> :
        list.map((x) => (
          <article className="ticket" key={x.id}>
            <small style={{ color: "#667068" }}>{dateOnly(x.created_at)} · Progress {x.progress_pct}%</small>
            <h3 style={{ margin: "6px 0" }}>{x.title}</h3>
            <p style={{ margin: 0, lineHeight: 1.6 }}>{x.body}</p>
            <div className="bar" style={{ marginTop: 12 }}><i style={{ width: `${x.progress_pct}%` }} /></div>
          </article>
        ))}
    </>
  );
}
