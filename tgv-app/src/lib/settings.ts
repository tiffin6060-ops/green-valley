import "server-only";
import { db } from "@/lib/db";

export async function getSetting(key: string): Promise<string | null> {
  return (await db.find("settings", { key }))?.value ?? null;
}
export async function setSetting(key: string, value: string) {
  const row = await db.find("settings", { key });
  if (row) await db.update("settings", row.id, { value });
  else await db.insert("settings", { key, value });
}
export async function clearSetting(key: string) {
  const row = await db.find("settings", { key });
  if (row) await db.remove("settings", row.id);
}
