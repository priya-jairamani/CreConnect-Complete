const { Op, fn, col } = require('sequelize');
const {
  User, CreatorProfile, BrandProfile, Campaign, Report, AuditLog,
  Ticket, Payment, Collaboration, Subscription, PlatformSetting,
} = require('../models');
const { NotFoundError } = require('../utils/errors');
const { parsePagination } = require('../utils/pagination');
const notificationsSvc = require('./notifications.service');
const { getPlan } = require('../config/plans');

async function listUsers(query) {
  const { offset, limit, page } = parsePagination(query);
  const where = {};
  if (query.role)   where.role   = query.role.toUpperCase();
  if (query.status) where.status = query.status.toUpperCase();
  if (query.q)      where.email  = { [Op.iLike]: `%${query.q}%` };

  const { rows, count } = await User.findAndCountAll({
    where,
    offset,
    limit,
    order: [['createdAt', 'DESC']],
    attributes: { exclude: ['passwordHash', 'emailToken', 'resetToken', 'resetTokenExp'] },
    include: [
      { model: CreatorProfile, as: 'creatorProfile', attributes: ['displayName', 'username'], required: false },
      { model: BrandProfile,   as: 'brandProfile',   attributes: ['companyName'],            required: false },
    ],
  });

  return { items: rows, total: count, page, limit };
}

async function updateUserStatus(id, status) {
  const user = await User.findByPk(id);
  if (!user) throw new NotFoundError('User not found');
  await user.update({ status: status.toUpperCase() });
  return user;
}

async function listCampaigns(query) {
  const { offset, limit, page } = parsePagination(query);
  const where = {};
  if (query.status) where.status = query.status.toUpperCase();

  const { rows, count } = await Campaign.findAndCountAll({
    where,
    offset,
    limit,
    order: [['createdAt', 'DESC']],
    include: [{ model: BrandProfile, as: 'brand', attributes: ['companyName'] }],
  });

  return { items: rows, total: count, page, limit };
}

async function listReports(query) {
  const { offset, limit, page } = parsePagination(query);
  const where = {};
  if (query.status) where.status = query.status.toUpperCase();

  const { rows, count } = await Report.findAndCountAll({
    where,
    offset,
    limit,
    order: [['createdAt', 'DESC']],
    include: [
      { model: User, as: 'reporter',     attributes: ['email', 'role'] },
      { model: User, as: 'reportedUser', attributes: ['email', 'role'] },
    ],
  });

  return { items: rows, total: count, page, limit };
}

async function resolveReport(id, action, resolution) {
  const report = await Report.findByPk(id);
  if (!report) throw new NotFoundError('Report not found');
  const status = action === 'resolve' ? 'RESOLVED' : 'DISMISSED';
  await report.update({ status, resolution, resolvedAt: new Date() });
  return report;
}

async function announce(message, audience) {
  const where = {};
  const aud = (audience || 'ALL').toUpperCase();
  if (aud === 'CREATORS')      where.role = 'CREATOR';
  else if (aud === 'BRANDS')   where.role = 'BRAND';
  else if (aud === 'ADMINS')   where.role = 'ADMIN';
  // 'ALL' → no role filter, every user receives it
  const users   = await User.findAll({ where, attributes: ['id'] });
  const userIds = users.map((u) => u.id);
  return notificationsSvc.push(userIds, message, aud);
}

async function getAuditLogs(query) {
  const { offset, limit, page } = parsePagination(query);
  const { rows, count } = await AuditLog.findAndCountAll({
    offset,
    limit,
    order: [['createdAt', 'DESC']],
    include: [{ model: User, as: 'user', attributes: ['email', 'role'], required: false }],
  });
  return { items: rows, total: count, page, limit };
}

/* ── Tickets (Operations) ────────────────────────────────────────────── */

async function listTickets(query) {
  const { offset, limit, page } = parsePagination(query);
  const where = {};
  if (query.status)   where.status   = query.status.toUpperCase();
  if (query.priority) where.priority = query.priority.toUpperCase();

  const { rows, count } = await Ticket.findAndCountAll({
    where,
    offset,
    limit,
    order: [['createdAt', 'DESC']],
    include: [
      { model: User, as: 'reporter',      attributes: ['email', 'role'], required: false },
      { model: User, as: 'assignedAdmin', attributes: ['email'],         required: false },
    ],
  });

  return { items: rows, total: count, page, limit };
}

async function createTicket(adminId, { subject, description, category, priority }) {
  return Ticket.create({ subject, description, category, priority, reporterId: adminId });
}

async function updateTicket(id, { status, assignedAdminId }) {
  const ticket = await Ticket.findByPk(id);
  if (!ticket) throw new NotFoundError('Ticket not found');
  const updates = {};
  if (status)          updates.status = status.toUpperCase();
  if (assignedAdminId) updates.assignedAdminId = assignedAdminId;
  if (updates.status === 'RESOLVED' || updates.status === 'CLOSED') updates.resolvedAt = new Date();
  await ticket.update(updates);
  return ticket;
}

/* ── Payments / Revenue ──────────────────────────────────────────────── */

async function listPayments(query) {
  const { offset, limit, page } = parsePagination(query);
  const where = {};
  if (query.status) where.status = query.status.toUpperCase();

  const { rows, count } = await Payment.findAndCountAll({
    where,
    offset,
    limit,
    order: [['createdAt', 'DESC']],
    include: [{
      model: Collaboration,
      as: 'collaboration',
      attributes: ['id', 'offerAmountPKR'],
      include: [
        { model: BrandProfile,   as: 'brand',   attributes: ['companyName'] },
        { model: CreatorProfile, as: 'creator', attributes: ['displayName', 'username'] },
      ],
    }],
  });

  return { items: rows, total: count, page, limit };
}

async function listSubscriptions(query) {
  const { offset, limit, page } = parsePagination(query);
  const where = {};
  if (query.status) where.status = query.status.toUpperCase();
  if (query.role)   where.role   = query.role.toUpperCase();

  const { rows, count } = await Subscription.findAndCountAll({
    where,
    offset,
    limit,
    order: [['createdAt', 'DESC']],
    include: [{ model: User, as: 'user', attributes: ['email'] }],
  });

  const items = rows.map((s) => ({ ...s.toJSON(), price: getPlan(s.role, s.planTier)?.price ?? 0 }));
  return { items, total: count, page, limit };
}

async function markPaymentDisputed(id, reason) {
  const payment = await Payment.findByPk(id);
  if (!payment) throw new NotFoundError('Payment not found');
  await payment.update({ status: 'DISPUTED', disputeReason: reason, disputedAt: new Date() });
  return payment;
}

async function resolvePaymentDispute(id, resolutionStatus) {
  const payment = await Payment.findByPk(id);
  if (!payment) throw new NotFoundError('Payment not found');
  const status = resolutionStatus === 'refund' ? 'ESCROW' : 'RELEASED';
  await payment.update({ status });
  return payment;
}

async function getRevenueSummary() {
  const [escrowAgg, releasedAgg, disputedRows, activeSubs] = await Promise.all([
    Payment.findOne({ where: { status: 'ESCROW' }, attributes: [[fn('SUM', col('amountPKR')), 'total']], raw: true }),
    Payment.findOne({ where: { status: { [Op.in]: ['RELEASED', 'PAID'] } }, attributes: [[fn('SUM', col('amountPKR')), 'total']], raw: true }),
    Payment.findAll({ where: { status: 'DISPUTED' }, attributes: ['id', 'amountPKR', 'disputeReason', 'disputedAt'], raw: true }),
    Subscription.findAll({ where: { status: 'ACTIVE' }, attributes: ['role', 'planTier'], raw: true }),
  ]);

  const escrowBalance   = parseFloat(escrowAgg?.total || 0);
  const creatorEarnings = parseFloat(releasedAgg?.total || 0);
  const disputedAmount  = disputedRows.reduce((sum, p) => sum + parseFloat(p.amountPKR || 0), 0);
  const gmv             = escrowBalance + creatorEarnings + disputedAmount;
  const platformRevenue = activeSubs.reduce((sum, s) => sum + (getPlan(s.role, s.planTier)?.price || 0), 0);

  return {
    gmv,
    platformRevenue,
    escrowBalance,
    creatorEarnings,
    brandSpend: gmv,
    disputes: disputedRows,
    activeSubscriptions: activeSubs.length,
  };
}

/* ── Settings ─────────────────────────────────────────────────────────── */

async function getSettings() {
  const rows = await PlatformSetting.findAll({ raw: true });
  return rows.reduce((acc, r) => { acc[r.key] = r.value; return acc; }, {});
}

async function updateSettings(updates, adminId) {
  const entries = Object.entries(updates || {});
  await Promise.all(entries.map(([key, value]) =>
    PlatformSetting.upsert({ key, value, updatedBy: adminId })
  ));
  return getSettings();
}

module.exports = {
  listUsers, updateUserStatus, listCampaigns, listReports, resolveReport, announce, getAuditLogs,
  listTickets, createTicket, updateTicket,
  listPayments, listSubscriptions, markPaymentDisputed, resolvePaymentDispute, getRevenueSummary,
  getSettings, updateSettings,
};
