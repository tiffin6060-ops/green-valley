import "server-only";
import { db } from "@/lib/db";

export type VisitRequest = {
  id: string; full_name: string; mobile: string; email: string | null; interest: string | null;
  visit_date: string | null; guests: number | null; message: string | null;
  status: "new" | "contacted" | "scheduled" | "done" | "cancelled"; created_at: string;
};

export async function saveVisitRequest(input: Omit<VisitRequest, "id" | "status" | "created_at">) {
  await db.insert("visit_requests", { ...input, status: "new" });
}
export async function listVisitRequests() {
  return (await db.list("visit_requests")) as VisitRequest[];
}
