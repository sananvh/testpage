# Test link on Render (free, straight from GitHub)

The repo includes `render.yaml`, so Render can build and run the full site (admin, forms, AI assistant) from GitHub.

## One-time setup (about 10 minutes)
1. Go to https://render.com and **sign up with GitHub** (the account that owns `sananvh/testpage`).
2. Click **New → Blueprint**, allow Render to access the `testpage` repository and select it.
3. Render reads `render.yaml` and asks for a few values:
   - `ADMIN_PASSWORD`: choose a long password (admin login is `admin@cyberpoint.az`).
   - `ANTHROPIC_API_KEY`: optional; leave empty to run the assistant in basic mode.
   - `SMTP_HOST`, `SMTP_USER`, `SMTP_PASS`: optional; leave empty and form requests still appear in the admin inbox.
4. Click **Apply**. The first build takes about 5–8 minutes.
5. Your link appears at the top of the service page, e.g. `https://cyberpoint-test.onrender.com`
   (Render adds a few letters if that name is taken). Admin: `<link>/admin`.

Every push to `main` on GitHub redeploys automatically.

## Good to know (free plan)
- The site **sleeps after 15 minutes without visitors**; the next visit takes 30–60 seconds to wake it.
- The disk is temporary: admin edits, uploads and inbox entries **reset on every redeploy or restart**, back to the built-in content. Fine for review, not for production (use the VPS + Docker setup for that).
- `NOINDEX=1` is set, so Google and other crawlers are told not to index the test copy. Remove it only on the real production site.
- Links in the sitemap, Open Graph and schema use the Render address automatically (`RENDER_EXTERNAL_URL`); set `SITE_URL` to override it.
