# CreConnect Payments — How It Works & How to Test It

Reference doc for the Stripe-based escrow + creator payout system. Written so you can pick this back up later without re-deriving everything.

---

## 1. What exists

Two Stripe integrations, both in test mode:

1. **Escrow (Brand → Platform)** — a brand locks payment for a collaboration via **Stripe Checkout**. Money is charged to the platform's own Stripe balance.
2. **Payout (Platform → Creator)** — when the brand releases payment, the platform sends a **Stripe Connect transfer** to the creator's own connected Stripe account.

There is no subscription billing, no wallet/ledger, no refunds, and no admin payment dashboard wired to real data — this document only covers the escrow/payout flow described above.

---

## 2. Environment setup

All config lives in `creconnect-backend/.env`:

```
STRIPE_SECRET_KEY=sk_test_...
STRIPE_PUBLISHABLE_KEY=pk_test_...
STRIPE_WEBHOOK_SECRET=whsec_...
BACKEND_URL=https://<your-tunnel>.trycloudflare.com
```

- Keys come from **Stripe Dashboard → Developers → API keys** (test mode).
- `STRIPE_WEBHOOK_SECRET` comes from the webhook endpoint you register (see §4).
- **Stripe Connect must be enabled once** for your Stripe account before payouts work at all: go to `https://dashboard.stripe.com/test/connect/overview` → "Get started" → fill the short platform profile. Without this, `stripe.accounts.create` fails with *"You can only create new accounts if you've signed up for Connect."*

---

## 3. The full flow, end to end

### Escrow (brand pays)
1. Brand clicks **Lock Escrow** on an accepted collaboration → `POST /payments/escrow/:collabId` (`payments.service.js: createEscrow`).
2. Creates a `Payment` row (`status: PENDING`) and a Stripe **Checkout Session** (PKR currency), returns `checkoutUrl`.
3. Frontend hard-redirects the browser to `checkoutUrl`.
4. Brand pays with a test card.
5. Stripe fires `checkout.session.completed` → `POST /api/v1/payments/webhook` → `confirmEscrow()` sets `Payment.status = ESCROW`, mirrors `Collaboration.paymentStatus`, notifies both parties.
6. Brand is redirected back to `/brand/payments?escrow=success`.

### Payout onboarding (creator connects a payout account, one-time)
1. Creator opens **Payments** tab → sees a "Set up payouts" banner if not yet onboarded.
2. Clicks **Set up payouts** → `POST /creators/me/payouts/onboard` (`creators.service.js: startPayoutOnboarding`) → creates a Stripe Connect **Express** account (once) + a hosted onboarding link → redirects there.
3. Creator completes Stripe's onboarding form (test mode has autofill/test-value shortcuts).
4. Stripe redirects back to `/creator/payments?payouts=onboarded`.
5. Frontend calls `POST /creators/me/payouts/refresh` (`refreshPayoutStatus`), which asks Stripe directly whether the account is payout-enabled and updates `CreatorProfile.payoutsEnabled` + `stripeConnectAccountId`. **This direct check is the reliable path** — see §5 on why the webhook alone isn't enough.

### Release (creator gets paid)
1. Brand clicks **Release** → confirms in the themed modal → `POST /payments/release/:paymentId` (`releasePayment`).
2. Blocked with a clear error if the creator hasn't finished payout setup.
3. Calls `stripe.transfers.create(...)` to send funds to the creator's connected account (with an idempotency key tied to the payment, so a retry after a failure can't double-transfer).
4. Updates `Payment.status = RELEASED` and `Collaboration.paymentStatus` together in one DB transaction, and notifies the creator.

---

## 4. Webhook setup (needed for escrow confirmation)

Stripe needs a public URL to call. Locally that means a tunnel:

```powershell
cloudflared tunnel --url http://localhost:5000
```

This prints a random `https://xxxx.trycloudflare.com` URL **that changes every time the tunnel restarts**. Each time it changes:
1. Update `BACKEND_URL` in `.env` to the new URL.
2. In **Stripe Dashboard → Developers → Webhooks**, edit the endpoint's URL to `https://<new-url>/api/v1/payments/webhook` (editing the URL, rather than deleting/recreating the endpoint, keeps the same signing secret — no `.env` change needed in that case).
3. Make sure it's subscribed to `checkout.session.completed` (required) and `account.updated` (best-effort, see §5).
4. Restart the backend (`npm run dev`) so it picks up any `.env` changes.

The Stripe CLI (`stripe listen`) is the standard alternative to a tunnel and avoids the changing-URL problem, but on this machine Windows Defender flags the CLI binary as a false positive — if you want to try it again, you'd need to either restore it from quarantine or add an exclusion for wherever you install it.

---

## 5. Known limitations (read before assuming something's broken)

- **The `account.updated` webhook may never fire.** Some Stripe accounts deliver Connect account changes as newer "v2 events" (`v2.core.account[...]`), which aren't the same as the classic v1 `account.updated` webhook this app listens for. This is why `refreshPayoutStatus` (a direct "ask Stripe right now" check, triggered on the onboarding return-redirect and via the manual "Recheck status" button) is the dependable mechanism — not the webhook. If you ever see the webhook's `account.updated` branch never triggering in logs, that's expected, not a bug.
- **Currency mismatch, worked around with a placeholder rate.** Pakistan isn't a Stripe-supported settlement country, so PKR Checkout charges settle into the platform's **USD** balance (Stripe converts automatically). Payout transfers must request `usd`, and the code divides the PKR amount by a hardcoded `PLACEHOLDER_PKR_PER_USD = 280` in `payments.service.js` to approximate the right USD amount. This is explicitly a test-mode stand-in, not real FX handling — real rates move, and this doesn't update itself.
- **Test-mode balance quirk.** A normal test card (`4242 4242 4242 4242`) puts charge funds into *pending* balance, not *available* — transfers can only draw from *available*. Use test card `4000000000000077` when funding an escrow payment you intend to release soon after, since it deposits directly into available balance. Check actual balance anytime with:
  ```js
  // from creconnect-backend/
  node -e "require('./src/config/env'); require('./src/config/stripe').balance.retrieve().then(b => console.log(b))"
  ```
- **No real refunds, disputes, or wallet.** Release only sends money once; there's no reversal path in-app if something goes wrong after the fact (you'd handle that directly in the Stripe Dashboard).
- **A creator's Stripe Connect account ID is now excluded from their public profile response** (`getPublicProfile`) — don't reintroduce it there if the model gains more Stripe fields later.

---

## 6. Quick troubleshooting checklist

| Symptom | Likely cause |
|---|---|
| Escrow stays `PENDING` after paying | Webhook not reachable — check tunnel is up and Stripe Dashboard endpoint URL matches current tunnel URL |
| "Set up payouts" banner won't clear after onboarding | Click **Recheck status** — don't rely on the webhook (see §5) |
| Release fails: "insufficient available funds" | Test-mode pending vs. available balance — fund with card `4000000000000077` or check `stripe.balance.retrieve()` |
| Release fails: "creator has not finished setting up payouts" | Expected — creator must complete Stripe Connect onboarding first |
| `stripe.accounts.create` fails: "signed up for Connect" | One-time step missed — see §2 |
| Backend won't start after pulling `.env` changes | Restart the dev server — env vars are only read once at process start |
