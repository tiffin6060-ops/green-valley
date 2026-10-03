import Shell from "@/components/Shell";
import { requireUser } from "@/lib/auth";

export const dynamic = "force-dynamic";

export default async function AdminLayout({ children }: { children: React.ReactNode }) {
  const user = await requireUser(["staff", "admin"]);
  const nav = [
    { href: "/admin", label: "Visit Requests" },
    ...(user.role === "admin" ? [{ href: "/admin/investors", label: "Investors" }, { href: "/admin/live", label: "Live & Video" }] : []),
    { href: "/admin/updates", label: "Project Updates" },
    { href: "/admin/documents", label: "Reports & Documents" },
    { href: "/admin/tickets", label: "Support Tickets" },
    { href: "/admin/account", label: "Account" },
  ];
  return <Shell user={user} nav={nav} label={user.role === "admin" ? "ADMIN PANEL" : "STAFF PANEL"}>{children}</Shell>;
}
