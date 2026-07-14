# Where to Change URLs (Cloudflare Tunnel / Local Dev)

Use this checklist whenever you restart **cloudflared** and get a **new** `*.trycloudflare.com` URL, or when deploying to a new backend domain.

---

## 1. Start the tunnel

```bash
cloudflared tunnel --url http://localhost:5000
```

Copy the printed URL, e.g.:

```text
https://YOUR-NEW-SUBDOMAIN.trycloudflare.com
```

Keep this process running while testing OAuth, Stripe webhooks, or social connects.

---

## 2. Update backend `.env` (required)

**File:** `creconnect-backend/.env`

| Variable | What to set | Used for |
|---|---|---|
| `BACKEND_URL` | `https://YOUR-NEW-SUBDOMAIN.trycloudflare.com` | Instagram/Facebook OAuth callbacks, Google OAuth callback, CORS |
| `FACEBOOK_CALLBACK_URL` | `https://YOUR-NEW-SUBDOMAIN.trycloudflare.com/api/v1/social/facebook/callback` | Reminder / Meta console copy-paste (code uses `BACKEND_URL`) |
| `FRONTEND_URL` | Usually leave as `http://localhost:3000` | Stripe success redirects, OAuth return to app |

Example:

```env
FRONTEND_URL=http://localhost:3000
BACKEND_URL=https://YOUR-NEW-SUBDOMAIN.trycloudflare.com
FACEBOOK_CALLBACK_URL=https://YOUR-NEW-SUBDOMAIN.trycloudflare.com/api/v1/social/facebook/callback
```

After changing `.env`, **restart the backend** (`npm run dev` in `creconnect-backend`).

---

## 3. Update external dashboards (required for OAuth / payments)

### Meta (Instagram + Facebook)

[developers.facebook.com](https://developers.facebook.com/) → your app → **Valid OAuth Redirect URIs**

Add/replace with:

```text
https://YOUR-NEW-SUBDOMAIN.trycloudflare.com/api/v1/social/instagram/callback
https://YOUR-NEW-SUBDOMAIN.trycloudflare.com/api/v1/social/facebook/callback
```

### Stripe webhooks

[dashboard.stripe.com/test/webhooks](https://dashboard.stripe.com/test/webhooks)

Set endpoint URL to:

```text
https://YOUR-NEW-SUBDOMAIN.trycloudflare.com/api/v1/payments/webhook
```

Keep the same signing secret in `.env` as `STRIPE_WEBHOOK_SECRET` (only the URL changes if you update an existing endpoint).

### Google Login (if enabled)

Google Cloud Console → OAuth client → Authorized redirect URIs:

```text
https://YOUR-NEW-SUBDOMAIN.trycloudflare.com/api/v1/auth/google/callback
```

Also set `GOOGLE_CLIENT_ID` / `GOOGLE_CLIENT_SECRET` in `.env`.

---

## 4. Frontend `.env` (usually no change)

**File:** `creconnect-react/creconnect-react/.env`

```env
VITE_API_BASE_URL=/api/v1
VITE_WS_URL=http://localhost:5000
```

In local Vite dev, `/api/v1` is proxied to `localhost:5000`. You do **not** need to put the cloudflared URL in the frontend for normal API calls — only the **backend** must be public for provider callbacks (Meta, Stripe, Google).

---

## 5. Derived callback URLs (no code edit needed)

These are built automatically from `BACKEND_URL` in code:

| Feature | Callback path |
|---|---|
| Instagram connect | `/api/v1/social/instagram/callback` |
| Facebook connect | `/api/v1/social/facebook/callback` |
| Google login | `/api/v1/auth/google/callback` |
| Stripe webhook | `/api/v1/payments/webhook` |

Full URL = `BACKEND_URL` + path above.

---

## Quick checklist

When the tunnel URL changes:

1. [ ] Start `cloudflared tunnel --url http://localhost:5000`
2. [ ] Paste new host into `BACKEND_URL` in `creconnect-backend/.env`
3. [ ] Update `FACEBOOK_CALLBACK_URL` to match (same host)
4. [ ] Restart backend
5. [ ] Update Meta redirect URIs
6. [ ] Update Stripe webhook URL
7. [ ] (If used) Update Google redirect URI
8. [ ] Smoke-test: health → `GET {BACKEND_URL}/api/v1/auth/health`

---

## Current values (update this section when you change them)

| Key | Value |
|---|---|
| Tunnel / `BACKEND_URL` | `https://take-ext-chambers-bench.trycloudflare.com` |
| Frontend | `http://localhost:3000` |
| Local API | `http://localhost:5000/api/v1` |
| Stripe webhook | `{BACKEND_URL}/api/v1/payments/webhook` |
| Instagram callback | `{BACKEND_URL}/api/v1/social/instagram/callback` |
| Facebook callback | `{BACKEND_URL}/api/v1/social/facebook/callback` |

Last updated: 2026-07-13
