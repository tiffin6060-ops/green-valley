// Recover admin access when the login is forgotten. Run on the machine that holds ./data.
//   npm run reset-admin                 -> lists admin/staff accounts (email, active)
//   npm run reset-admin -- <email>      -> sets a new temporary password for that account and prints it once
// The account is re-enabled and must choose a new password at next login.
// Same password format as src/lib/auth.ts (scrypt$salt$hash).
import Database from "better-sqlite3";
import { randomBytes, randomUUID, scryptSync } from "crypto";
import fs from "fs";
import path from "path";

const file = path.join(process.cwd(), "data", "app.db");
if (!fs.existsSync(file)) { console.error("No data/app.db found. Run this inside the app folder (where ./data is)."); process.exit(1); }
const db = new Database(file);

const email = process.argv[2]?.trim().toLowerCase();
const staff = db.prepare("SELECT id, email, name, role, active FROM users WHERE role IN ('admin','staff') ORDER BY role, email").all();

if (!email) {
  if (!staff.length) console.log("No admin accounts exist. Open /setup in the browser to create the first one.");
  else {
    console.log("Admin / staff accounts:");
    for (const u of staff) console.log(`  ${u.role.padEnd(5)}  ${u.email}  (${u.name})${u.active ? "" : "  [disabled]"}`);
    console.log("\nTo reset one:  npm run reset-admin -- <email>");
  }
  process.exit(0);
}

const user = staff.find((u) => u.email.toLowerCase() === email);
if (!user) { console.error(`No admin/staff account with email ${email}. Run without an email to list them.`); process.exit(1); }

const chars = "ABCDEFGHJKMNPQRSTUVWXYZabcdefghjkmnpqrstuvwxyz23456789";
const temp = Array.from(randomBytes(12), (x) => chars[x % chars.length]).join("");
const salt = randomBytes(16);
const hash = `scrypt$${salt.toString("hex")}$${scryptSync(temp, salt, 64).toString("hex")}`;

db.transaction(() => {
  const cred = db.prepare("SELECT id FROM credentials WHERE user_id = ?").get(user.id);
  if (cred) db.prepare("UPDATE credentials SET password_hash = ? WHERE id = ?").run(hash, cred.id);
  else db.prepare("INSERT INTO credentials (id, created_at, user_id, password_hash) VALUES (?, ?, ?, ?)").run(randomUUID(), new Date().toISOString(), user.id, hash);
  db.prepare("UPDATE users SET active = 1, must_change_password = 1 WHERE id = ?").run(user.id);
})();

console.log(`Password reset for ${user.email} (${user.role}).`);
console.log(`Temporary password: ${temp}`);
console.log("Log in at /login, then set a new password when asked.");
