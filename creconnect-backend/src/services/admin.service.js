const { Op } = require('sequelize');
const { User, CreatorProfile, BrandProfile, Campaign, Report, AuditLog } = require('../models');
const { NotFoundError } = require('../utils/errors');
const { parsePagination } = require('../utils/pagination');
const notificationsSvc = require('./notifications.service');

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

module.exports = { listUsers, updateUserStatus, listCampaigns, listReports, resolveReport, announce, getAuditLogs };
