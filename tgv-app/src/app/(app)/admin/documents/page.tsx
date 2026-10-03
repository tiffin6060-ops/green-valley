import { db } from "@/lib/db";
import { requireUser } from "@/lib/auth";
import { dateOnly } from "@/lib/format";
import { ALLOWED_LABEL } from "@/lib/files";
import ActionForm from "@/components/FormMsg";
import { deleteDocument, uploadDocument } from "@/app/(app)/admin/actions";

export default async function AdminDocuments() {
  await requireUser(["staff", "admin"]);
  const [docs, users, log] = await Promise.all([db.list("documents"), db.list("users", { role: "investor" }), db.list("audit_log", { action: "download" })]);
  const who = (id: string | null) => (id ? users.find((u) => u.id === id)?.name ?? "Unknown" : "All investors");
  return (
    <>
      <div className="panel-title"><small>REPORTS & DOCUMENTS</small><h2>Upload for investors</h2>
        <p>Files are private. Investors can only download what is shared with all investors or assigned to them. Allowed: {ALLOWED_LABEL}.</p></div>
      <ActionForm action={uploadDocument} submit="Upload" className="panel-form">
        <input name="title" placeholder="Title (e.g. Q3 2026 Operations Report)" required />
        <select name="kind" defaultValue="report"><option value="report">Report</option><option value="document">Document (agreement, certificate…)</option></select>
        <select name="audience" defaultValue="all">
          <option value="all">Visible to ALL investors</option>
          {users.map((u) => <option key={u.id} value={u.id}>Only: {u.name} ({u.email})</option>)}
        </select>
        <input name="file" type="file" accept=".pdf,.png,.jpg,.jpeg,.docx,.xlsx" required />
      </ActionForm>
      {docs.length === 0 ? <div className="empty">Nothing uploaded yet.</div> : (
        <div className="table-scroll"><table className="data-table">
          <thead><tr><th>Title</th><th>Type</th><th>Shared with</th><th>Uploaded</th><th>Downloads</th><th></th></tr></thead>
          <tbody>{docs.map((d) => (
            <tr key={d.id}>
              <td><a href={`/files/${d.id}`} target="_blank" rel="noopener">{d.title}</a><br /><small style={{ color: "#667068" }}>{d.file_name} · {(d.size / 1024).toFixed(0)} KB</small></td>
              <td><span className="pill">{d.kind}</span></td><td>{who(d.user_id)}</td><td>{dateOnly(d.created_at)}</td>
              <td>{log.filter((l) => l.target === d.id).length}</td>
              <td><form action={deleteDocument}><input type="hidden" name="id" value={d.id} /><button className="mini-btn" type="submit">Delete</button></form></td>
            </tr>))}
          </tbody>
        </table></div>
      )}
    </>
  );
}
