import fs from "fs";
import path from "path";
import crypto from "crypto";
import createNextIntlPlugin from "next-intl/plugin";

const withNextIntl = createNextIntlPlugin("./src/i18n/request.ts");

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

// CDN host for hero/progress media referenced by absolute URL (optional), e.g. "cdn.example.com".
const mediaHost = (process.env.NEXT_PUBLIC_MEDIA_HOST || "")
  .replace(/^https?:\/\//i, "")
  .replace(/\/.*$/, "")
  .trim();

/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  env: { AUTH_SECRET: authSecret() },
  serverExternalPackages: ["better-sqlite3"],
  experimental: { serverActions: { bodySizeLimit: "20mb" } },
  images: {
    // Media folders accept the ?v=<content hash> cache-buster added by lib/media.ts versioned();
    // every other local image must have no query string.
    localPatterns: [
      { pathname: "/hero/**" },
      { pathname: "/progress/**" },
      { pathname: "/updates/**" },
      { pathname: "/brand/**" },
      { pathname: "/**", search: "" },
    ],
    remotePatterns: [
      // YouTube video thumbnails (the facade poster); fetched by the server, never by the visitor's browser.
      { protocol: "https", hostname: "i.ytimg.com", pathname: "/vi/**", search: "" },
      ...(mediaHost ? [{ protocol: "https", hostname: mediaHost, pathname: "/**", search: "" }] : []),
    ],
  },
};
export default withNextIntl(nextConfig);
