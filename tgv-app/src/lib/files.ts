import "server-only";
import fs from "fs/promises";
import path from "path";
import { randomUUID } from "crypto";
import { DATA_DIR } from "@/lib/db";

export const UPLOAD_DIR = path.join(DATA_DIR, "uploads");
export const MAX_BYTES = 15 * 1024 * 1024;

// Allowlist: extension -> served mime type + magic-byte check. Anything else is rejected.
const TYPES: Record<string, { mime: string; magic: (b: Buffer) => boolean }> = {
  pdf: { mime: "application/pdf", magic: (b) => b.subarray(0, 5).toString("latin1") === "%PDF-" },
  png: { mime: "image/png", magic: (b) => b.subarray(0, 8).equals(Buffer.from([0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a])) },
  jpg: { mime: "image/jpeg", magic: (b) => b[0] === 0xff && b[1] === 0xd8 && b[2] === 0xff },
  jpeg: { mime: "image/jpeg", magic: (b) => b[0] === 0xff && b[1] === 0xd8 && b[2] === 0xff },
  docx: { mime: "application/vnd.openxmlformats-officedocument.wordprocessingml.document", magic: (b) => b[0] === 0x50 && b[1] === 0x4b },
  xlsx: { mime: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet", magic: (b) => b[0] === 0x50 && b[1] === 0x4b },
};
export const ALLOWED_LABEL = "PDF, PNG, JPG, DOCX, XLSX (max 15 MB)";
const INLINE = new Set(["application/pdf", "image/png", "image/jpeg"]);
export const isInline = (mime: string) => INLINE.has(mime);

export async function storeUpload(file: File): Promise<{ stored_name: string; mime: string; size: number; file_name: string } | { error: string }> {
  if (!file || file.size === 0) return { error: "Choose a file to upload." };
  if (file.size > MAX_BYTES) return { error: "File is larger than 15 MB." };
  const ext = (file.name.split(".").pop() ?? "").toLowerCase();
  const t = TYPES[ext];
  if (!t) return { error: `File type not allowed. Use ${ALLOWED_LABEL}.` };
  const buf = Buffer.from(await file.arrayBuffer());
  if (!t.magic(buf)) return { error: "File content does not match its extension." };
  await fs.mkdir(UPLOAD_DIR, { recursive: true });
  const stored_name = `${randomUUID()}.${ext}`; // never derived from user input
  await fs.writeFile(path.join(UPLOAD_DIR, stored_name), buf, { mode: 0o600 });
  const safeName = file.name.replace(/[^\w.\- ()]/g, "_").slice(0, 120);
  return { stored_name, mime: t.mime, size: buf.length, file_name: safeName };
}

export async function readStored(stored_name: string) {
  if (!/^[0-9a-f-]{36}\.[a-z]{3,4}$/.test(stored_name)) throw new Error("bad stored name");
  return fs.readFile(path.join(UPLOAD_DIR, stored_name));
}
export async function deleteStored(stored_name: string) {
  if (!/^[0-9a-f-]{36}\.[a-z]{3,4}$/.test(stored_name)) return;
  await fs.rm(path.join(UPLOAD_DIR, stored_name), { force: true });
}
