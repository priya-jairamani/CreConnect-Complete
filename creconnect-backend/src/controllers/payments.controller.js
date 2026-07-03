const svc = require('../services/payments.service');
const creatorsSvc = require('../services/creators.service');
const subscriptionsSvc = require('../services/subscriptions.service');
const stripe = require('../config/stripe');
const { STRIPE_WEBHOOK_SECRET } = require('../config/env');
const { ok, created, paginated } = require('../utils/response');

const createEscrow = async (req, res, next) => {
  try { created(res, await svc.createEscrow(req.params.collabId, req.user.id), 'Redirecting to payment'); } catch (e) { next(e); }
};

// One-time charges (escrow) and recurring subscriptions both fire checkout.session.completed —
// distinguish by session.mode rather than needing a separate event type per flow.
const WEBHOOK_HANDLERS = {
  'checkout.session.completed': (session) =>
    session.mode === 'subscription' ? subscriptionsSvc.handleSubscriptionCheckoutCompleted(session) : svc.confirmEscrow(session),
  'account.updated': (account) => creatorsSvc.syncPayoutStatus(account),
  'customer.subscription.updated': (sub) => subscriptionsSvc.handleSubscriptionUpdated(sub),
  'customer.subscription.deleted': (sub) => subscriptionsSvc.handleSubscriptionDeleted(sub),
  'invoice.payment_failed': (invoice) => subscriptionsSvc.handleInvoicePaymentFailed(invoice),
};

// Stripe calls this directly (no auth) — route is mounted with a raw body parser
const handleWebhook = async (req, res) => {
  const signature = req.headers['stripe-signature'];
  let event;
  try {
    event = stripe.webhooks.constructEvent(req.body, signature, STRIPE_WEBHOOK_SECRET);
  } catch (err) {
    return res.status(400).send(`Webhook Error: ${err.message}`);
  }

  const handler = WEBHOOK_HANDLERS[event.type];
  if (handler) {
    try {
      await handler(event.data.object);
    } catch (err) {
      // Return 200 so Stripe does not keep retrying — log for manual review
      console.error(`[Webhook] ${event.type} handler failed:`, err.message);
    }
  }

  res.json({ received: true });
};

const releasePayment = async (req, res, next) => {
  try { ok(res, await svc.releasePayment(req.params.paymentId, req.user.id), 'Payment released'); } catch (e) { next(e); }
};

const getHistory = async (req, res, next) => {
  try {
    const { items, total, page, limit } = await svc.getHistory(req.user.id, req.user.role, req.query);
    paginated(res, items, { page, limit, total });
  } catch (e) { next(e); }
};

module.exports = { createEscrow, handleWebhook, releasePayment, getHistory };
