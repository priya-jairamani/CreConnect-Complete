const { Subscription, User, Campaign, Collaboration, BrandProfile, CreatorProfile } = require('../models');
const { Op } = require('sequelize');
const { PLANS, getPlan, getTierByPriceId } = require('../config/plans');
const { NotFoundError, ValidationError } = require('../utils/errors');
const { getEffectivePlan } = require('./entitlements.service');
const notificationsSvc = require('./notifications.service');
const stripe = require('../config/stripe');
const { FRONTEND_URL } = require('../config/env');

const STATUS_MAP = { active: 'ACTIVE', trialing: 'ACTIVE', past_due: 'PAST_DUE', unpaid: 'PAST_DUE', canceled: 'CANCELED' };

// This Stripe API version reports the billing period on the subscription item,
// not the subscription itself — fall back to the top-level field in case that
// ever changes back.
function periodWindow(stripeSub) {
  const item = stripeSub.items?.data?.[0];
  const start = stripeSub.current_period_start ?? item?.current_period_start;
  const end = stripeSub.current_period_end ?? item?.current_period_end;
  return { start: new Date(start * 1000), end: new Date(end * 1000) };
}

// Public-safe view of the plan catalog for a role — no Stripe secrets, just what the UI needs to render plan cards.
function listPlans(role) {
  return Object.entries(PLANS[role] ?? {}).map(([tier, p]) => ({
    tier,
    name: p.name,
    price: p.price,
    campaignLimit: p.campaignLimit ?? null,
    collabLimit: p.collabLimit ?? null,
    selfServe: !!p.stripePriceId,
  }));
}

async function getMyPlanSummary(userId, role) {
  const { tier, plan, periodStart, periodEnd } = await getEffectivePlan(userId, role);
  const sub = await Subscription.findOne({ where: { userId } });

  let used = 0;
  if (role === 'BRAND') {
    const brand = await BrandProfile.findOne({ where: { userId } });
    used = brand ? await Campaign.count({ where: { brandId: brand.id, createdAt: { [Op.gte]: periodStart } } }) : 0;
  } else {
    const creator = await CreatorProfile.findOne({ where: { userId } });
    used = creator ? await Collaboration.count({ where: { creatorId: creator.id, createdAt: { [Op.gte]: periodStart } } }) : 0;
  }

  return {
    tier,
    name: getPlan(role, tier)?.name ?? tier,
    price: getPlan(role, tier)?.price ?? null,
    status: sub?.status ?? 'ACTIVE',
    campaignLimit: plan.campaignLimit ?? null,
    collabLimit: plan.collabLimit ?? null,
    collabLimitPerCampaign: plan.collabLimitPerCampaign ?? null,
    aiEnabled: plan.aiEnabled,
    used,
    periodStart,
    periodEnd,
    cancelAtPeriodEnd: sub?.cancelAtPeriodEnd ?? false,
  };
}

async function createCheckoutSession(userId, role, tier) {
  const plan = getPlan(role, tier);
  if (!plan || !plan.stripePriceId) {
    throw new ValidationError(`${tier} is not available for self-serve checkout.`);
  }

  const user = await User.findByPk(userId);
  if (!user) throw new NotFoundError('User not found');

  let sub = await Subscription.findOne({ where: { userId } });

  // Already has an active paid subscription — swap the price on that same
  // subscription (with proration) instead of starting a second, parallel one.
  if (sub?.status === 'ACTIVE' && sub.stripeSubscriptionId) {
    const stripeSub = await stripe.subscriptions.retrieve(sub.stripeSubscriptionId);
    const itemId = stripeSub.items.data[0].id;
    const updated = await stripe.subscriptions.update(sub.stripeSubscriptionId, {
      items: [{ id: itemId, price: plan.stripePriceId }],
      proration_behavior: 'create_prorations',
    });
    const { start, end } = periodWindow(updated);
    await sub.update({
      planTier: tier,
      stripePriceId: plan.stripePriceId,
      currentPeriodStart: start,
      currentPeriodEnd: end,
      campaignLimit: plan.campaignLimit,
      collabLimit: plan.collabLimit,
      aiEnabled: plan.aiEnabled,
    });
    return { switched: true };
  }

  let customerId = sub?.stripeCustomerId;
  if (!customerId) {
    const customer = await stripe.customers.create({ email: user.email, metadata: { userId, role } });
    customerId = customer.id;
  }

  const returnPath = role === 'BRAND' ? '/brand/settings' : '/creator/payments';
  const session = await stripe.checkout.sessions.create({
    mode: 'subscription',
    customer: customerId,
    line_items: [{ price: plan.stripePriceId, quantity: 1 }],
    metadata: { userId, role, tier },
    success_url: `${FRONTEND_URL}${returnPath}?subscription=success`,
    cancel_url: `${FRONTEND_URL}${returnPath}?subscription=cancelled`,
  });

  return { url: session.url };
}

async function createBillingPortalSession(userId) {
  const sub = await Subscription.findOne({ where: { userId } });
  if (!sub?.stripeCustomerId) throw new NotFoundError('No billing account found yet — subscribe to a plan first.');

  const returnPath = sub.role === 'BRAND' ? '/brand/settings' : '/creator/payments';
  const portal = await stripe.billingPortal.sessions.create({
    customer: sub.stripeCustomerId,
    return_url: `${FRONTEND_URL}${returnPath}`,
  });
  return { url: portal.url };
}

// Webhook: checkout.session.completed, mode === 'subscription'
async function handleSubscriptionCheckoutCompleted(session) {
  const { userId, role, tier } = session.metadata ?? {};
  if (!userId || !role || !tier) return; // not one of our subscription checkouts

  const plan = getPlan(role, tier);
  const stripeSub = await stripe.subscriptions.retrieve(session.subscription);
  const { start, end } = periodWindow(stripeSub);

  const fields = {
    userId,
    role,
    planTier: tier,
    status: 'ACTIVE',
    stripeCustomerId: session.customer,
    stripeSubscriptionId: session.subscription,
    stripePriceId: plan.stripePriceId,
    currentPeriodStart: start,
    currentPeriodEnd: end,
    cancelAtPeriodEnd: false,
    campaignLimit: plan.campaignLimit,
    collabLimit: plan.collabLimit,
    aiEnabled: plan.aiEnabled,
    grantedByAdminId: null,
  };

  const existing = await Subscription.findOne({ where: { userId } });
  if (existing) await existing.update(fields);
  else await Subscription.create(fields);

  notificationsSvc.push([userId], `🎉 Your ${plan.name} plan is now active.`).catch(() => {});
}

// Webhook: customer.subscription.updated
async function handleSubscriptionUpdated(stripeSubscription) {
  const sub = await Subscription.findOne({ where: { stripeSubscriptionId: stripeSubscription.id } });
  if (!sub) return;

  const priceId = stripeSubscription.items?.data?.[0]?.price?.id;
  const newTier = priceId ? getTierByPriceId(sub.role, priceId) : null;
  const plan = newTier ? getPlan(sub.role, newTier) : null;
  const { start, end } = periodWindow(stripeSubscription);

  // Some Stripe API versions report a scheduled cancellation via the boolean
  // cancel_at_period_end, others via a cancel_at timestamp instead — check both.
  const cancelAtPeriodEnd = !!stripeSubscription.cancel_at_period_end || !!stripeSubscription.cancel_at;

  await sub.update({
    status: STATUS_MAP[stripeSubscription.status] ?? sub.status,
    currentPeriodStart: start,
    currentPeriodEnd: end,
    cancelAtPeriodEnd,
    ...(plan ? { planTier: newTier, stripePriceId: priceId, campaignLimit: plan.campaignLimit, collabLimit: plan.collabLimit, aiEnabled: plan.aiEnabled } : {}),
  });
}

// Webhook: customer.subscription.deleted
async function handleSubscriptionDeleted(stripeSubscription) {
  const sub = await Subscription.findOne({ where: { stripeSubscriptionId: stripeSubscription.id } });
  if (!sub) return;
  await sub.update({ status: 'CANCELED' });
  notificationsSvc.push([sub.userId], `Your subscription has ended — you're back on the free plan.`).catch(() => {});
}

// Webhook: invoice.payment_failed
async function handleInvoicePaymentFailed(invoice) {
  if (!invoice.subscription) return;
  const sub = await Subscription.findOne({ where: { stripeSubscriptionId: invoice.subscription } });
  if (!sub) return;
  await sub.update({ status: 'PAST_DUE' });
  notificationsSvc.push([sub.userId], `⚠ Your subscription payment failed — please update your billing details to avoid losing access.`).catch(() => {});
}

// Admin-only: manually provision (or edit) a custom Enterprise-tier subscription.
async function grantEnterpriseSubscription(adminUserId, targetUserId, role, { campaignLimit = null, collabLimit = null } = {}) {
  const user = await User.findByPk(targetUserId);
  if (!user) throw new NotFoundError('User not found');

  const fields = {
    userId: targetUserId,
    role,
    planTier: 'ENTERPRISE',
    status: 'ACTIVE',
    campaignLimit,
    collabLimit,
    aiEnabled: true,
    grantedByAdminId: adminUserId,
  };

  const existing = await Subscription.findOne({ where: { userId: targetUserId } });
  const sub = existing ? await existing.update(fields) : await Subscription.create(fields);

  notificationsSvc.push([targetUserId], `🎉 You've been upgraded to an Enterprise plan.`).catch(() => {});
  return sub;
}

module.exports = {
  listPlans,
  getMyPlanSummary,
  createCheckoutSession,
  createBillingPortalSession,
  handleSubscriptionCheckoutCompleted,
  handleSubscriptionUpdated,
  handleSubscriptionDeleted,
  handleInvoicePaymentFailed,
  grantEnterpriseSubscription,
};
