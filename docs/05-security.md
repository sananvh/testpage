# Security — audit results, fixes and server settings

Penetration test of the code and a running production build (November 2026). Every finding below
was reproduced, fixed and re-tested with the same attack.

| # | Severity | Finding | Fix |
|---|---|---|---|
| 1 | Critical | Next.js 15.5.4 / React 19.1.1 with published advisories incl. unauthenticated RCE (React Server Components) | Next.js 15.5.29, React 19.1.10; Swiper 12, Nodemailer 10, sharp/postcss pinned via `overrides`. `npm audit`: 0 vulnerabilities |
| 2 | High | Rate limits read the visitor-controlled first `X-Forwarded-For` entry (login brute force, form spam, AI cost) | Real IP from the proxy-appended entry (`src/lib/security.ts`), per-account login lockout (10 failures / 15 min), daily caps, bounded limiter memory |
| 3 | Medium | No request size limit on `/api/forms` and `/api/assistant` (30 MB accepted) | Hard caps: 6 MB forms, 16 KB assistant (413 / rejected before parsing) |
| 4 | Medium | Admin cookie valid after logout / password change | Server-side sessions (hashed random tokens): logout, password change and user removal revoke them; 2 h idle and 12 h absolute timeout |
| 5 | Medium | Assistant accepted forged history, chat overwrite, unlimited tool use | History kept on the server and append-only; 40 messages per conversation, 20 per 10 min per conversation, daily AI cap (`ASSISTANT_DAILY_LIMIT`), max 1500 output tokens; consultation tool limited per visitor, conversation and day |
| 6 | Low | No Content-Security-Policy | Nonce-based CSP on every page incl. admin (`src/middleware.ts`) |
| 7 | Low | AI replies could link `//external` and `data:` URLs | Only `/page` and `https://` links are clickable |
| 8 | Low | SVG logo filter bypassable with entities | Allow-list check on raw and entity-decoded SVG (no scripts, links, animations, external refs); CSP on `/brand/live` stays |
| 9 | Low | Login timing revealed valid admin emails | Same work for unknown emails (dummy hash check) |
| 12 | Bug | `Permissions-Policy: microphone=()` blocked the assistant's voice mode | `microphone=(self)` |

Passed: SQL injection, stored XSS (forms, chats, news, site texts, JSON-LD), path traversal, admin access
control, CSRF (Next.js origin check), open redirect, Host-header injection, email header injection,
upload type checks, secrets in Git, Docker user/ports.

## Two-factor login (admin panel)

- Required for every admin. After the password, the panel opens only with a 6-digit code from an
  authenticator app (TOTP, RFC 6238: Google Authenticator, Microsoft Authenticator, Authy, 1Password…).
- First login of each admin: QR code (or manual key) → confirm with a code → 10 single-use backup codes,
  shown once. New codes can be created under *Hesab və istifadəçilər* (old ones stop working).
- Protection: a code works only once (replay protection); 5 wrong codes cancel the login and the account
  cools down for 15 minutes; the password step alone gives no access to the panel or CV downloads; the
  session token is replaced when the login completes; sessions from before 2FA no longer open the panel.
- Lost phone: log in with a backup code, or ask another admin to press **2FA sıfırla** next to your
  account — you then set it up again at the next login (all your sessions are ended).
- Emergency (every admin locked out), on the server:

```bash
docker compose exec web node -e "const {DatabaseSync}=require('node:sqlite');new DatabaseSync('/app/data/cyberpoint.db').prepare(\"UPDATE users SET totp_enabled=0, totp_secret='', backup_codes='[]' WHERE email=?\").run('admin@cyberpoint.az')"
```

  That admin sets up two-factor login again at the next login.

## Nginx (VPS) — required settings

```nginx
server {
    listen 443 ssl http2;
    server_name cyberpoint.az www.cyberpoint.az;
    # ssl_certificate ... (certbot)

    client_max_body_size 8m;                 # CV uploads up to 5 MB; larger bodies stop at Nginx

    location / {
        proxy_pass http://127.0.0.1:3000;
        proxy_http_version 1.1;
        proxy_set_header Host $host;
        proxy_set_header X-Forwarded-Proto $scheme;
        # The app reads the LAST X-Forwarded-For entry (TRUSTED_PROXY_HOPS=1), which Nginx appends:
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_buffering off;                 # AI assistant streams its answers
    }

    # Optional, recommended: admin panel only from the office / VPN
    # location /admin { allow 203.0.113.10; deny all; proxy_pass http://127.0.0.1:3000; ...same headers... }
}
```

- Keep the app port private (docker-compose binds `127.0.0.1:3000`); otherwise visitors could reach it
  directly and choose their own `X-Forwarded-For`.
- If Cloudflare is put in front of Nginx, set `TRUSTED_PROXY_HOPS=2` or `CLIENT_IP_HEADER=cf-connecting-ip`.
- Recommended next steps outside the code: regular backups of the
  `cyberpoint-data` volume, `npm audit` / dependency updates monthly.
