const { Op } = require('sequelize');
const { Payment, Collaboration, BrandProfile, CreatorProfile, Campaign } = require('../models');
const { NotFoundError, ForbiddenError, ValidationError, ConflictError } = require('../utils/errors');
const { parsePagination } = require('../utils/pagination');
const notificationsSvc = require('./notifications.service');
const stripe = require('../config/stripe');
const { FRONTEND_URL } = require('../config/env');

const PAYMENT_INCLUDE = [{
  model: Collaboration,
  as: 'collaboration',
  include: [
    { model: BrandProfile,   as: 'brand'   },
    { model: CreatorProfile, as: 'creator' },
    { model: Campaign,       as: 'campaign', attributes: ['title'] },
  ],
}];

async function createEscrow(collaborationId, userId) {
  const collab = await Collaboration.findByPk(collaborationId, {
    include: [
      { model: BrandProfile,   as: 'brand'   },
      { model: CreatorProfile, as: 'creator' },
      { model: Campaign,       as: 'campaign', attributes: ['title', 'budgetPKR'] },
    ],
  });
  if (!collab) throw new NotFoundError('Collaboration not found');
  if (collab.status !== 'ACCEPTED') throw new ForbiddenError('Escrow can only be created for accepted collaborations');
  if (collab.brand.userId !== userId) throw new ForbiddenError('Only the brand can create escrow');

  // Use offer amount; fall back to campaign budget so amount is never 0
  const amount = collab.offerAmountPKR || collab.campaign?.budgetPKR || 0;
  if (!amount || amount <= 0) throw new ValidationError('Collaboration has no payment amount set. Set an offer amount before locking escrow.');
  const campaignTitle = collab.campaign?.title ?? 'your collaboration';
  const payment = await Payment.create({ collaborationId, amountPKR: amount, status: 'PENDING' });

  const session = await stripe.checkout.sessions.create({
    mode: 'payment',
    payment_method_types: ['card'],
    line_items: [{
      price_data: {
        currency: 'pkr',
        product_data: { name: `Escrow — ${campaignTitle}` },
        unit_amount: Math.round(amount * 100),
      },
      quantity: 1,
    }],
    metadata: { paymentId: payment.id, collaborationId },
    success_url: `${FRONTEND_URL}/brand/payments?escrow=success`,
    cancel_url: `${FRONTEND_URL}/brand/payments?escrow=cancelled`,
  });

  // Temporarily hold the Checkout Session id so the webhook can find this payment;
  // it's replaced by the real PaymentIntent id once the session completes.
  await payment.update({ stripePaymentId: session.id });

  return { payment, checkoutUrl: session.url };
}

// Called from the Stripe webhook once the brand completes Checkout
async function confirmEscrow(session) {
  const payment = await Payment.findOne({
    where: { stripePaymentId: session.id },
    include: PAYMENT_INCLUDE,
  });
  if (!payment || payment.status !== 'PENDING') return;

  await payment.update({ status: 'ESCROW', stripePaymentId: session.payment_intent });

  // Mirror status on the collaboration so creator's page reflects it
  await payment.collaboration.update({ paymentStatus: 'ESCROW' });

  const creator       = payment.collaboration?.creator;
  const brand         = payment.collaboration?.brand;
  const campaignTitle = payment.collaboration.campaign?.title ?? 'your collaboration';
  const displayAmt    = payment.amountPKR ? `PKR ${Number(payment.amountPKR).toLocaleString('en-PK')}` : 'Payment';

  // Notify creator — payment is secured, time to deliver
  if (creator?.userId) {
    const brandName = brand?.companyName ?? 'The brand';
    notificationsSvc.push(
      [creator.userId],
      `🔒 ${brandName} secured ${displayAmt} in escrow for "${campaignTitle}". Deliver your content to get paid!`
    ).catch(() => {});
  }

  // Notify brand — Stripe confirmed, escrow is live
  if (brand?.userId) {
    notificationsSvc.push(
      [brand.userId],
      `✅ Your payment of ${displayAmt} for "${campaignTitle}" is now in escrow. Creator has been notified to start work.`
    ).catch(() => {});
  }
}

async function releasePayment(paymentId, userId) {
  const payment = await Payment.findByPk(paymentId, {
    include: [{
      model: Collaboration,
      as: 'collaboration',
      include: [
        { model: BrandProfile,   as: 'brand'   },
        { model: CreatorProfile, as: 'creator' },
        { model: Campaign,       as: 'campaign', attributes: ['title'] },
      ],
    }],
  });
  if (!payment) throw new NotFoundError('Payment not found');
  if (payment.collaboration.brand.userId !== userId) throw new ForbiddenError();
  if (payment.status !== 'ESCROW') throw new ConflictError('Payment can only be released when it is in escrow');

  await payment.update({ status: 'RELEASED', releasedAt: new Date() });

  // Mirror status on the collaboration so creator's page reflects it
  await payment.collaboration.update({ paymentStatus: 'RELEASED' });

  const creator       = payment.collaboration?.creator;
  const brand         = payment.collaboration?.brand;
  const campaignTitle = payment.collaboration.campaign?.title ?? 'your collaboration';
  const displayAmt    = payment.amountPKR ? `PKR ${Number(payment.amountPKR).toLocaleString('en-PK')}` : 'Payment';

  // Notify creator — money is released
  if (creator?.userId) {
    const brandName = brand?.companyName ?? 'The brand';
    notificationsSvc.push(
      [creator.userId],
      `💰 ${displayAmt} has been released by ${brandName} for "${campaignTitle}". Check your Payments tab.`
    ).catch(() => {});
  }

  return payment;
}

async function getHistory(userId, role, query) {
  const { offset, limit, page } = parsePagination(query);

  if (role === 'BRAND') {
    const brand = await BrandProfile.findOne({ where: { userId } });
    if (!brand) return { items: [], total: 0, page, limit };

    const { rows, count } = await Payment.findAndCountAll({
      offset, limit,
      order: [['createdAt', 'DESC']],
      include: [{
        model: Collaboration,
        as: 'collaboration',
        where: { brandId: brand.id },
        required: true,
        include: [{ model: Campaign, as: 'campaign', attributes: ['title'] }],
      }],
    });
    return { items: rows, total: count, page, limit };
  }

  if (role === 'CREATOR') {
    const creator = await CreatorProfile.findOne({ where: { userId } });
    if (!creator) return { items: [], total: 0, page, limit };

    // Two-step: find collab IDs first, then payments — avoids Sequelize JOIN ambiguity
    const creatorCollabs = await Collaboration.findAll({
      where: { creatorId: creator.id },
      attributes: ['id'],
      raw: true,
    });
    const collabIds = creatorCollabs.map(c => c.id);
    if (!collabIds.length) return { items: [], total: 0, page, limit };

    const { rows, count } = await Payment.findAndCountAll({
      where: { collaborationId: { [Op.in]: collabIds } },
      offset, limit,
      order: [['createdAt', 'DESC']],
      include: [{
        model: Collaboration,
        as: 'collaboration',
        include: [{ model: Campaign, as: 'campaign', attributes: ['title'] }],
      }],
    });
    return { items: rows, total: count, page, limit };
  }

  return { items: [], total: 0, page, limit };
}

module.exports = { createEscrow, confirmEscrow, releasePayment, getHistory };
