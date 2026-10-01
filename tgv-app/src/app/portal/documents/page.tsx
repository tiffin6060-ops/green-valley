import { requireUser } from "@/lib/auth";
import DocList from "@/components/DocList";

export default async function Page() {
  const u = await requireUser(["investor"]);
  return <DocList userId={u.id} kind="document" title="Document vault" label="DOCUMENT VAULT" />;
}
