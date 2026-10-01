# Trishal Green Valley — Part 4: Public Farm Video + Login-Protected Live CCTV

Next.js 15 · TypeScript · SQLite. **No keys, no env variables, no external services.**
Everything the site stores lives in one folder: `./data` (database, uploaded files, auto-generated session secret).

## Run
```bash
npm install
npm run dev
```
Open http://localhost:3000 → you are sent to **/setup** to create the admin account (works only once).
In dev, tick "Add demo investor & sample data" (demo@example.com / Demo12345!).

## Test checklist (Part 4)
1. Admin → **Live & Video** → paste a YouTube link → Save. Open the home page → "Live Farm" section shows the video to anyone (private window) with a locked "Investor access only" card.
2. Try saving a bad link (`javascript:…`, random site) → rejected. Only YouTube, Vimeo or an https .mp4 are accepted.
3. To try CCTV without cameras, make a fake one: any HLS test stream on your machine works. Real cameras: follow **GATEWAY.md**.
4. Add a camera (address is the internal MediaMTX HLS address). Click **Preview**.
5. Sign in as an investor → **Live Farm** shows the camera. In a private window (not signed in), `/stream/<id>/live.m3u8` returns 401.
6. Admin → **Hide** the camera → investors no longer see it and its stream URL returns 404.

Earlier parts still work: documents vault (`Reports & Documents`), investors, updates, tickets, backup (`npm run backup`).

## Earlier changes (Part 3)
- Supabase removed. Storage = SQLite (`data/app.db`). Same features, nothing to sign up for.
- Session secret is generated automatically (`data/.auth-secret`). First admin is created on `/setup` (no env password).
- Forms keep what you typed after an error.

## Security model (sized for a small private investor group, no payments)
- Passwords: salted scrypt, stored in a separate table. Sessions: signed HttpOnly cookie (Secure in production), 8 h; account disable takes effect immediately.
- Files: never public. Every download goes through `/files/<id>`, which checks login + ownership, logs the download, and sends `nosniff` + CSP sandbox headers. Upload allowlist (PDF/PNG/JPG/DOCX/XLSX), magic-byte check, 15 MB cap, random stored filenames.
- Live video: the stream is only reachable through `/stream/<id>/...`, which requires login, checks the camera is active, whitelists file types, blocks path traversal, and never exposes the gateway address or camera passwords. Each visit to the Live page is logged.
- Login throttling: 5 tries / 15 min per IP+email (in memory — fine for a single server).
- Not included on purpose: 2FA, email verification, virus scanning. Add if the audience grows.

## Deploy (small VPS, ~$5/month — NOT Vercel, it has no persistent disk)
```bash
# on the server (Ubuntu), Node 20+
git clone <your repo> && cd tgv-app        # or upload the folder
npm ci && npm run build
npm i -g pm2 && pm2 start "npm run start" --name tgv && pm2 save && pm2 startup
```
Put **Caddy** in front for automatic HTTPS (`yourdomain.com { reverse_proxy localhost:3000 }`).
Then open `https://yourdomain.com/setup` **immediately** and create the admin.
Never use `npm run dev` on the server.

## Back up (important)
`npm run backup` (run daily via cron) then copy `./backups` off the server. Losing `./data` = losing all records and files.

## Still to replace before launch
"To verify" figures, masterplan and farm photos, operator/legal text, contact details, Privacy / Terms / Risk pages.

## Roadmap
Part 5 farm operations (herd/pond records → investor reports) · Part 6 legal pages, SEO, polish before launch
