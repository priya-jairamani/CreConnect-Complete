const { Op, fn, col } = require('sequelize');
const {
  User, CreatorProfile, BrandProfile, Campaign, Report, AuditLog,
  Ticket, Payment, Collaboration, Subscription, PlatformSetting, CreatorMedia,
  Notification, UserNotification,
} = require('../models');
const { NotFoundError, AppError } = require('../utils/errors');
const { parsePagination } = require('../utils/pagination');
const notificationsSvc = require('./notifications.service');
const { getPlan } = require('../config/plans');
const { normalizeUploadUrl } = require('../utils/media');
const { computeTrustScoresForUsers } = require('../utils/trustScore');
const { Verification } = require('../models');

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

  const userIds = rows.map((u) => u.id);
  const verificationRows = userIds.length
    ? await Verification.findAll({ where: { userId: userIds } })
    : [];

  const items = computeTrustScoresForUsers(rows, verificationRows);
  return { items, total: count, page, limit };
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
  return notificationsSvc.push(userIds, message, aud, 'ANNOUNCEMENT');
}

const AUDIENCE_MAP = {
  ALL: 'ALL',
  CREATORS: 'CREATORS',
  CREATOR: 'CREATORS',
  BRANDS: 'BRANDS',
  BRAND: 'BRANDS',
  ADMINS: 'ADMINS',
  ADMIN: 'ADMINS',
};

function normalizeAudience(audience) {
  const key = String(audience || 'ALL').toUpperCase();
  return AUDIENCE_MAP[key] || 'ALL';
}

function audienceUserFilter(audience) {
  const aud = normalizeAudience(audience);
  if (aud === 'CREATORS') return { role: 'CREATOR' };
  if (aud === 'BRANDS') return { role: 'BRAND' };
  if (aud === 'ADMINS') return { role: 'ADMIN' };
  return {};
}

async function listNotifications(query) {
  const { offset, limit, page } = parsePagination(query);
  const where = {};
  if (query.status) where.status = query.status.toUpperCase();
  if (query.audience) where.audience = normalizeAudience(query.audience);

  const { rows, count } = await Notification.findAndCountAll({
    where,
    offset,
    limit,
    order: [['createdAt', 'DESC']],
  });

  const items = await Promise.all(rows.map(async (n) => {
    const recipientCount = await UserNotification.count({ where: { notificationId: n.id } });
    return { ...n.toJSON(), recipientCount };
  }));

  return { items, total: count, page, limit };
}

async function listFailedNotifications(query) {
  return listNotifications({ ...query, status: 'FAILED' });
}

async function pushNotification({ message, audience, type, deliveryMode, scheduledAt }) {
  const msg = (message || '').trim();
  if (!msg) throw new AppError('Message is required', 400);

  const aud = normalizeAudience(audience);
  const notifType = (type || 'ANNOUNCEMENT').toUpperCase();

  if (String(deliveryMode || '').toUpperCase() === 'SCHEDULED' && scheduledAt) {
    return Notification.create({
      message: msg,
      type: notifType,
      audience: aud,
      deliveryMode: 'SCHEDULED',
      scheduledAt: new Date(scheduledAt),
      status: 'PENDING',
    });
  }

  const users = await User.findAll({ where: audienceUserFilter(aud), attributes: ['id'] });
  const userIds = users.map((u) => u.id);
  return notificationsSvc.push(userIds, msg, aud, notifType);
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
      {
        model: User,
        as: 'reporter',
        attributes: ['id', 'email', 'role', 'status', 'createdAt'],
        required: false,
        include: [
          { model: CreatorProfile, as: 'creatorProfile', attributes: ['displayName'], required: false },
          { model: BrandProfile,   as: 'brandProfile',   attributes: ['companyName'], required: false },
        ],
      },
      { model: User, as: 'assignedAdmin', attributes: ['email'], required: false },
    ],
  });

  return { items: rows, total: count, page, limit };
}

async function createTicket(adminId, { subject, description, category, priority }) {
  return Ticket.create({ subject, description, category, priority, reporterId: adminId });
}

async function updateTicket(id, { status, assignedAdminId, priority }) {
  const ticket = await Ticket.findByPk(id);
  if (!ticket) throw new NotFoundError('Ticket not found');
  const updates = {};
  if (status)          updates.status = status.toUpperCase();
  if (assignedAdminId) updates.assignedAdminId = assignedAdminId;
  if (priority)        updates.priority = priority.toUpperCase();
  if (updates.status === 'RESOLVED' || updates.status === 'CLOSED') updates.resolvedAt = new Date();
  await ticket.update(updates);
  return ticket.reload({
    include: [
      {
        model: User,
        as: 'reporter',
        attributes: ['id', 'email', 'role', 'status', 'createdAt'],
        include: [
          { model: CreatorProfile, as: 'creatorProfile', attributes: ['displayName'], required: false },
          { model: BrandProfile,   as: 'brandProfile',   attributes: ['companyName'], required: false },
        ],
      },
      { model: User, as: 'assignedAdmin', attributes: ['email'], required: false },
    ],
  });
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

/* ── Creator content moderation (creator_media) ─────────────────────── */

const CONTENT_INCLUDE = [{
  model: CreatorProfile,
  as: 'creator',
  attributes: ['id', 'displayName', 'username', 'avatarUrl'],
  include: [{ model: User, as: 'user', attributes: ['id', 'email'] }],
}];

function serializeContentItem(row) {
  const json = row.toJSON ? row.toJSON() : row;
  const creator = json.creator;
  return {
    id:           json.id,
    title:        json.title,
    description:  json.description,
    type:         json.fileType || json.contentType || 'media',
    platform:     json.platform,
    status:       json.moderationStatus,
    moderationStatus: json.moderationStatus,
    fileUrl:      normalizeUploadUrl(json.fileUrl),
    thumbnailUrl: normalizeUploadUrl(json.thumbnailUrl || json.fileUrl),
    fileType:     json.fileType,
    visibility:   json.visibility,
    createdAt:    json.createdAt,
    creator: creator ? {
      id: creator.id,
      displayName: creator.displayName,
      username: creator.username,
      avatarUrl: normalizeUploadUrl(creator.avatarUrl),
      email: creator.user?.email,
      user: creator.user,
      creatorProfile: { displayName: creator.displayName, username: creator.username },
    } : null,
  };
}

async function listContent(query) {
  const { offset, limit, page } = parsePagination(query);
  const where = {};
  if (query.status && query.status !== 'all') {
    where.moderationStatus = query.status.toUpperCase();
  }

  const creatorWhere = {};
  if (query.q) {
    creatorWhere[Op.or] = [
      { displayName: { [Op.iLike]: `%${query.q}%` } },
      { username: { [Op.iLike]: `%${query.q}%` } },
    ];
  }

  const { rows, count } = await CreatorMedia.findAndCountAll({
    where,
    offset,
    limit,
    order: [['createdAt', 'DESC']],
    include: [{
      ...CONTENT_INCLUDE[0],
      where: Object.keys(creatorWhere).length ? creatorWhere : undefined,
      required: !!query.q,
    }],
    distinct: true,
  });

  return { items: rows.map(serializeContentItem), total: count, page, limit };
}

async function moderateContent(id, action) {
  const item = await CreatorMedia.findByPk(id);
  if (!item) throw new NotFoundError('Content not found');

  const statusMap = {
    approve: 'APPROVED', approved: 'APPROVED',
    reject: 'REJECTED', rejected: 'REJECTED',
    pending: 'PENDING',
  };
  const moderationStatus = statusMap[String(action || '').toLowerCase()];
  if (!moderationStatus) throw new AppError('Invalid moderation action', 400);

  await item.update({ moderationStatus });
  const reloaded = await item.reload({ include: CONTENT_INCLUDE });
  return serializeContentItem(reloaded);
}

module.exports = {
  listUsers, updateUserStatus, listCampaigns, listReports, resolveReport, announce, getAuditLogs,
  listTickets, createTicket, updateTicket,
  listPayments, listSubscriptions, markPaymentDisputed, resolvePaymentDispute, getRevenueSummary,
  getSettings, updateSettings,
  listContent, moderateContent,
  listNotifications, listFailedNotifications, pushNotification,
};
