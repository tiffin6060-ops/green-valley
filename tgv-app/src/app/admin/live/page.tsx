import { db } from "@/lib/db";
import { requireUser } from "@/lib/auth";
import { getSetting } from "@/lib/settings";
import { parsePublicVideo } from "@/lib/video";
import ActionForm from "@/components/FormMsg";
import PreviewToggle from "@/components/PreviewToggle";
import { createCamera, deleteCamera, savePublicVideo, toggleCamera } from "@/app/admin/actions";

export default async function AdminLive() {
  await requireUser(["admin"]);
  const [video, cams] = await Promise.all([getSetting("public_video_url"), db.list("cameras")]);
  const parsed = video ? parsePublicVideo(video) : null;
  return (
    <>
      <div className="panel-title"><small>PUBLIC VIDEO</small><h2>Home page video</h2>
        <p>Shown to every visitor in the “Live Farm” section. Paste a YouTube or Vimeo link (an unlisted YouTube video is easiest for large files), or a direct https .mp4 link. Leave empty to remove.</p></div>
      <ActionForm action={savePublicVideo} submit="Save video" className="panel-form" resetOnOk={false}>
        <input name="url" defaultValue={video ?? ""} placeholder="https://www.youtube.com/watch?v=…" />
        {parsed && <p className="demo-note">Currently: {parsed.label}</p>}
      </ActionForm>

      <div className="panel-title" style={{ marginTop: 36 }}><small>LIVE CCTV</small><h2>Cameras (login required)</h2>
        <p>Investors only see cameras marked active. Add the <b>internal</b> HLS address from your stream gateway (see GATEWAY.md); it is never sent to browsers.</p></div>
      <ActionForm action={createCamera} submit="Add camera" className="panel-form">
        <h3>Add camera</h3>
        <input name="name" placeholder="Name (e.g. Cattle Shed)" required />
        <input name="description" placeholder="Short description (optional)" />
        <input name="upstream_url" placeholder="http://127.0.0.1:8888/cattle/index.m3u8" required />
        <input name="sort_order" type="number" min={0} max={999} placeholder="Order (0 = first)" />
      </ActionForm>
      {cams.length === 0 ? <div className="empty">No cameras yet.</div> : (
        <div className="table-scroll"><table className="data-table">
          <thead><tr><th>Camera</th><th>Gateway address (private)</th><th>Status</th><th>Actions</th></tr></thead>
          <tbody>{cams.sort((a, b) => a.sort_order - b.sort_order).map((c) => (
            <tr key={c.id}>
              <td><b>{c.name}</b><br /><small style={{ color: "#667068" }}>{c.description}</small></td>
              <td style={{ wordBreak: "break-all", maxWidth: 260 }}>{c.upstream_url}</td>
              <td><span className={`pill ${c.active ? "" : "off"}`}>{c.active ? "active" : "hidden"}</span></td>
              <td>
                <div className="inline-form">
                  <form action={toggleCamera}><input type="hidden" name="id" value={c.id} /><button type="submit">{c.active ? "Hide" : "Show"}</button></form>
                  <form action={deleteCamera}><input type="hidden" name="id" value={c.id} /><button type="submit">Delete</button></form>
                </div>
                <div style={{ marginTop: 8 }}><PreviewToggle id={c.id} name={c.name} /></div>
              </td>
            </tr>))}
          </tbody>
        </table></div>
      )}
    </>
  );
}
