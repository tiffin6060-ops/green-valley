import fs from "fs";
import path from "path";
import crypto from "crypto";

// No keys to manage: the session-signing secret is generated once and kept in data/.auth-secret.
// (Set AUTH_SECRET yourself only if you prefer to.) Back up the whole ./data folder.
function authSecret() {
  if (process.env.AUTH_SECRET && process.env.AUTH_SECRET.length >= 32) return process.env.AUTH_SECRET;
  const dir = path.join(process.cwd(), "data");
  const file = path.join(dir, ".auth-secret");
  try { const s = fs.readFileSync(file, "utf8").trim(); if (s.length >= 32) return s; } catch {}
  fs.mkdirSync(dir, { recursive: true });
  const s = crypto.randomBytes(32).toString("hex");
  fs.writeFileSync(file, s, { mode: 0o600 });
  return s;
}

/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  env: { AUTH_SECRET: authSecret() },
  serverExternalPackages: ["better-sqlite3"],
  experimental: { serverActions: { bodySizeLimit: "20mb" } },
};
export default nextConfig;
