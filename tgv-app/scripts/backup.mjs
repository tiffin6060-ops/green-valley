// Usage: npm run backup   -> copies the database + uploads + secret to ./backups/<timestamp>/
import Database from "better-sqlite3";
import fs from "fs";
import path from "path";

const data = path.join(process.cwd(), "data");
if (!fs.existsSync(path.join(data, "app.db"))) { console.error("No data/app.db found."); process.exit(1); }
const out = path.join(process.cwd(), "backups", new Date().toISOString().replace(/[:.]/g, "-"));
fs.mkdirSync(out, { recursive: true });
const db = new Database(path.join(data, "app.db"), { readonly: true });
await db.backup(path.join(out, "app.db")); // consistent snapshot even while the site is running
db.close();
if (fs.existsSync(path.join(data, "uploads"))) fs.cpSync(path.join(data, "uploads"), path.join(out, "uploads"), { recursive: true });
if (fs.existsSync(path.join(data, ".auth-secret"))) fs.copyFileSync(path.join(data, ".auth-secret"), path.join(out, ".auth-secret"));
console.log("Backup written to", out);
