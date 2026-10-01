import { notFound } from "next/navigation";
import { listVisitRequests, storageMode } from "@/lib/visit-store";

export const dynamic = "force-dynamic";

// Development-only viewer. Replaced by the protected admin panel in Part 2.
export default async function DevRequests() {
  if (process.env.NODE_ENV === "production") notFound();
  const rows = await listVisitRequests();
  return (
    <main style={{ padding: 40, maxWidth: 1100, margin: "0 auto" }}>
      <p className="eyebrow">DEV ONLY · STORAGE: {storageMode().toUpperCase()}</p>
      <h1 style={{ fontFamily: "Playfair Display" }}>Visit requests ({rows.length})</h1>
      <table className="dev-table">
        <thead><tr><th>When</th><th>Name</th><th>Mobile</th><th>Email</th><th>Interest</th><th>Visit</th><th>Guests</th><th>Message</th></tr></thead>
        <tbody>
          {rows.map((r) => (
            <tr key={r.id}>
              <td>{new Date(r.created_at).toLocaleString("en-GB", { timeZone: "Asia/Dhaka" })}</td>
              <td>{r.full_name}</td><td>{r.mobile}</td><td>{r.email}</td><td>{r.interest}</td>
              <td>{r.visit_date}</td><td>{r.guests}</td><td>{r.message}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </main>
  );
}
