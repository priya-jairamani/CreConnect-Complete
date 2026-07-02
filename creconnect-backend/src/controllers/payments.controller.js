const svc = require('../services/payments.service');
const stripe = require('../config/stripe');
const { STRIPE_WEBHOOK_SECRET } = require('../config/env');
const { ok, created, paginated } = require('../utils/response');

const createEscrow = async (req, res, next) => {
  try { created(res, await svc.createEscrow(req.params.collabId, req.user.id), 'Redirecting to payment'); } catch (e) { next(e); }
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

  if (event.type === 'checkout.session.completed') {
    try {
      await svc.confirmEscrow(event.data.object);
    } catch (err) {
      console.error('[Webhook] confirmEscrow failed:', err.message);
      // Return 200 so Stripe does not keep retrying — log for manual review
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
