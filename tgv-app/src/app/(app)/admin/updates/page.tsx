import { db } from "@/lib/db";
import { requireUser } from "@/lib/auth";
import { dateOnly } from "@/lib/format";
import ActionForm from "@/components/FormMsg";
import { deleteUpdate, postUpdate, togglePublish } from "@/app/(app)/admin/actions";

export default async function AdminUpdates() {
  await requireUser(["staff", "admin"]);
  const list = await db.list("project_updates");
  return (
    <>
      <div className="panel-title"><small>PROJECT UPDATES</small><h2>Post an update</h2>
        <p>Published updates appear in the investor portal and on the public website timeline. Only post verified, factual progress.</p></div>
      <ActionForm action={postUpdate} submit="Save update" className="panel-form">
        <input name="title" placeholder="Title" required />
        <textarea name="body" placeholder="What happened? Keep it factual." required />
        <input name="progress_pct" type="number" min={0} max={100} placeholder="Overall progress % (0–100)" required />
        <label style={{ display: "block", margin: "0 0 14px", fontSize: 13 }}>
          <input type="checkbox" name="published" style={{ width: "auto", marginRight: 8 }} />Publish immediately
        </label>
      </ActionForm>
      {list.map((x) => (
        <article className="ticket" key={x.id}>
          <small style={{ color: "#667068" }}>{dateOnly(x.created_at)} · {x.progress_pct}% · <span className={`pill ${x.published ? "" : "warn"}`}>{x.published ? "published" : "draft"}</span></small>
          <h3 style={{ margin: "6px 0" }}>{x.title}</h3>
          <p style={{ margin: "0 0 12px", lineHeight: 1.6 }}>{x.body}</p>
          <div className="inline-form">
            <form action={togglePublish}><input type="hidden" name="id" value={x.id} /><button type="submit">{x.published ? "Unpublish" : "Publish"}</button></form>
            <form action={deleteUpdate}><input type="hidden" name="id" value={x.id} /><button type="submit">Delete</button></form>
          </div>
        </article>
      ))}
    </>
  );
}
