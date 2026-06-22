# CraftContinent — Deployment & Ops Handover

**Created 2026-06-22** (surfaced during an unrelated MerriMor server migration). This is the
ground-truth of where CraftContinent actually lives and runs, so this session can act.

## Where everything is (verified live 2026-06-22)
- **Live host:** `62.84.181.200` — serves the production site. `https://app.craftcontinent.com`
  and `https://craftcontinent.com` → **200** ("Crafts Continent | Authentic African Artisan
  Marketplace"). This is a **standalone server** (not shared with MerriMor).
- **This repo** (`crafts-frontend`, Next.js 16) is the frontend. Baked config: Dockerfile
  `ENV NEXT_PUBLIC_API_URL=https://api.craftcontinent.com/api/v1`. No `.env`, no compose.
- **Media:** Cloudflare R2 — `media.craftcontinent.com` (CNAME → `public.r2.dev`).
- **Email:** Mailjet (SPF `ip4:38.242.202.236` + spf.mailjet.com, DKIM, DMARC `p=none`).
- **DNS/TLS:** Cloudflare zone `craftcontinent.com` (id `6d2c851768ab9cdd50382a68338360fc`),
  all records proxied (orange), SSL mode **Full**. CF terminates TLS; origin is plain.

## DNS records (craftcontinent.com)
| Record | Value |
|---|---|
| `craftcontinent.com`, `www`, `app`, `api`, `*` (A) | `62.84.181.200` (proxied) |
| `media` (CNAME) | `public.r2.dev` (R2) |
| TXT | SPF / DMARC / Mailjet DKIM |

## ⚠️ Things to verify / fix
1. **`api.craftcontinent.com` (62.84.181.200) returns 404 at `/`.** The frontend calls
   `https://api.craftcontinent.com/api/v1`. Confirm the backend is actually up under that
   path — a 404 at root may be normal (no `/` route) or may mean the API isn't deployed.
   Test: `curl -s https://api.craftcontinent.com/api/v1/...` against a real endpoint.
2. **Orphaned `crafts-frontend` container on an old MerriMor box** (`64.227.176.139`, port
   3002, up ~3 months, with nginx vhost + `/opt/crafts-frontend`). **No DNS routes to it**
   (DNS points at `62.84.181.200`), so it's dead. Safe to retire once confirmed nothing
   falls back to it. `ssh -i ~/.ssh/id_ed25519 root@64.227.176.139` then
   `docker rm -f crafts-frontend; rm /etc/nginx/sites-enabled/crafts-frontend; nginx -s reload`.

## What I do NOT know (you'll need to fill in)
- **SSH access / credentials for `62.84.181.200`** (the real Craft host) — not available to
  the MerriMor session. How does this repo deploy to it? CI? manual `docker build` + run?
  There's no `.github/workflows` deploy visible in this repo — check.
- Backup/health/monitoring story for `62.84.181.200`.

## Local clones of this repo
- `/Users/project/work/personal/workspaces/crafts/crafts-frontend` (this one)
- `/Users/project/work/personal/github/nserekoallan/crafts-frontend`

## Access notes
- A **Zone-scoped Cloudflare token** (DNS + SSL) for the `craftcontinent.com` zone is needed
  for any DNS/cert work — it's a **different zone** from merrimor.com.
- CraftContinent is fully independent of the MerriMor migration; nothing about Craft was
  changed during it (a no-op container briefly built on the new MerriMor box was removed).
