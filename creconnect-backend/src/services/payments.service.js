const { Payment, Collaboration, BrandProfile, CreatorProfile, Campaign } = require('../models');
const { NotFoundError, ForbiddenError } = require('../utils/errors');
const { parsePagination } = require('../utils/pagination');
const notificationsSvc = require('./notifications.service');

async function createEscrow(collaborationId, userId) {
  const collab = await Collaboration.findByPk(collaborationId, {
    include: [
      { model: BrandProfile,   as: 'brand'   },
      { model: CreatorProfile, as: 'creator' },
      { model: Campaign,       as: 'campaign', attributes: ['title'] },
    ],
  });
  if (!collab) throw new NotFoundError('Collaboration not found');
  if (collab.brand.userId !== userId) throw new ForbiddenError('Only the brand can create escrow');

  const payment = await Payment.create({ collaborationId, amountPKR: collab.offerAmountPKR, status: 'ESCROW' });

  // Notify the creator that payment has been secured
  if (collab.creator?.userId) {
    const brandName     = collab.brand?.companyName ?? 'The brand';
    const campaignTitle = collab.campaign?.title    ?? 'your collaboration';
    const amount        = collab.offerAmountPKR ? `PKR ${collab.offerAmountPKR.toLocaleString('en-PK')}` : 'Payment';
    notificationsSvc.createForUser(
      collab.creator.userId,
      `🔒 ${brandName} secured ${amount} in escrow for "${campaignTitle}". Deliver your content to get paid!`,
      'PAYMENT_RECEIVED'
    ).catch(() => {});
  }

  return payment;
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

  await payment.update({ status: 'RELEASED', releasedAt: new Date() });

  // Notify the creator
  const creator = payment.collaboration?.creator;
  if (creator?.userId) {
    const brandName     = payment.collaboration.brand?.companyName ?? 'The brand';
    const campaignTitle = payment.collaboration.campaign?.title    ?? 'your collaboration';
    const amount        = payment.amountPKR ? `PKR ${payment.amountPKR.toLocaleString('en-PK')}` : 'Payment';
    notificationsSvc.createForUser(
      creator.userId,
      `💰 ${amount} released by ${brandName} for "${campaignTitle}". Check your Payments tab.`,
      'PAYMENT_RELEASED'
    ).catch(() => {});
  }

  return payment;
}

async function getHistory(userId, role, query) {
  const { offset, limit, page } = parsePagination(query);
  const collabWhere = {};

  if (role === 'BRAND') {
    const brand = await BrandProfile.findOne({ where: { userId } });
    if (brand) collabWhere.brandId = brand.id;
  } else if (role === 'CREATOR') {
    const creator = await CreatorProfile.findOne({ where: { userId } });
    if (creator) collabWhere.creatorId = creator.id;
  }

  const { rows, count } = await Payment.findAndCountAll({
    offset,
    limit,
    order: [['createdAt', 'DESC']],
    include: [{
      model: Collaboration,
      as: 'collaboration',
      where: collabWhere,
      required: true,
      include: [{ model: Campaign, as: 'campaign', attributes: ['title'] }],
    }],
  });

  return { items: rows, total: count, page, limit };
}

module.exports = { createEscrow, releasePayment, getHistory };
