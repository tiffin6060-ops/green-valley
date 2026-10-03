import Shell from "@/components/Shell";
import { requireUser } from "@/lib/auth";

export const dynamic = "force-dynamic";
const nav = [
  { href: "/portal", label: "Dashboard" },
  { href: "/portal/investment", label: "My Investment" },
  { href: "/portal/updates", label: "Project Updates" },
  { href: "/portal/live", label: "Live Farm" },
  { href: "/portal/reports", label: "Reports" },
  { href: "/portal/documents", label: "Documents" },
  { href: "/portal/support", label: "Support" },
  { href: "/portal/account", label: "Account" },
];

export default async function PortalLayout({ children }: { children: React.ReactNode }) {
  const user = await requireUser(["investor"]);
  return <Shell user={user} nav={nav} label="INVESTOR PORTAL">{children}</Shell>;
}
