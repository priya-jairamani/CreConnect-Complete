const { Op } = require('sequelize');
const { Verification, User, CreatorProfile, BrandProfile } = require('../models');
const { NotFoundError } = require('../utils/errors');
const { parsePagination } = require('../utils/pagination');
const { normalizeUploadUrl } = require('../utils/media');
const { CLOUDINARY_CLOUD_NAME } = require('../config/env');
const { computeTrustScore } = require('../utils/trustScore');

const PLACEHOLDER = /^your_|^REPLACE_ME|^changeme|^xxx/i;

function resolveDocumentUrl(url, documentId) {
  const candidate = url || documentId;
  if (!candidate || candidate === '#') return null;

  const uploadsMatch = String(candidate).match(/(\/uploads\/[^\s?#]+)/i);
  if (uploadsMatch) return uploadsMatch[1];

  if (/^https?:\/\//i.test(candidate)) return candidate;

  if (CLOUDINARY_CLOUD_NAME && !PLACEHOLDER.test(CLOUDINARY_CLOUD_NAME)) {
    const publicId = String(candidate).replace(/^\/+/, '');
    if (!publicId.startsWith('uploads/')) {
      return `https://res.cloudinary.com/${CLOUDINARY_CLOUD_NAME}/image/upload/${publicId}`;
    }
  }
  return null;
}

function enrichVerificationData(data = {}) {
  const out = { ...data };
  out.frontImageUrl = resolveDocumentUrl(out.frontUrl, out.frontDocumentId);
  out.backImageUrl  = resolveDocumentUrl(out.backUrl, out.backDocumentId);
  return out;
}

function serializeForAdmin(record) {
  const json = record.toJSON ? record.toJSON() : record;
  return { ...json, data: enrichVerificationData(json.data || {}) };
}

async function getStatus(userId) {
  const user = await User.findByPk(userId, { attributes: ['id', 'role', 'emailVerified'] });
  const rows = await Verification.findAll({
    where:  { userId },
    order:  [['submittedAt', 'DESC']],
  });
  // Return one entry per type (latest)
  const latest = {};
  rows.forEach((r) => {
    if (!latest[r.type]) latest[r.type] = r;
  });
  const verifications = Object.values(latest).map((r) => ({
    type:            r.type,
    status:          r.status.toLowerCase(),
    submittedAt:     r.submittedAt,
    reviewedAt:      r.reviewedAt,
    expiresAt:       r.expiresAt,
    rejectionReason: r.rejectionReason,
  }));

  const trust = computeTrustScore({
    role: user?.role,
    verifications: rows,
    emailVerified: user?.emailVerified,
  });

  return { verifications, ...trust };
}

async function getHistory(userId) {
  return Verification.findAll({ where: { userId }, order: [['submittedAt', 'DESC']] });
}

async function submitNIC(userId, { fullName, nicNumber, frontDocumentId, backDocumentId, frontUrl, backUrl }) {
  // Upsert: replace any existing NIC submission for this user
  await Verification.destroy({ where: { userId, type: 'nic' } });
  return Verification.create({
    userId,
    type:   'nic',
    status: 'PENDING',
    data:   {
      fullName,
      nicNumber,
      frontDocumentId: normalizeUploadUrl(frontDocumentId),
      backDocumentId:  normalizeUploadUrl(backDocumentId),
      frontUrl:        normalizeUploadUrl(frontUrl),
      backUrl:         normalizeUploadUrl(backUrl),
    },
  });
}

async function submitBusiness(userId, data) {
  await Verification.destroy({ where: { userId, type: 'business' } });
  return Verification.create({ userId, type: 'business', status: 'PENDING', data });
}

async function submitDomain(userId, { domain }) {
  // Check if there's already an active challenge
  const existing = await Verification.findOne({ where: { userId, type: 'domain', status: 'PENDING' } });
  if (existing) return existing;
  const challengeToken = `cc-verify=${require('crypto').randomBytes(16).toString('hex')}`;
  return Verification.create({
    userId,
    type:   'domain',
    status: 'PENDING',
    data:   { domain, challengeToken },
  });
}

async function submitSocial(userId, { platform, profileUrl }) {
  await Verification.destroy({ where: { userId, type: `social_${platform.toLowerCase()}` } });
  return Verification.create({
    userId,
    type:   `social_${platform.toLowerCase()}`,
    status: 'PENDING',
    data:   { platform, profileUrl },
  });
}

// Admin: approve / reject a verification
async function review(verificationId, status, reviewedBy, rejectionReason) {
  const v = await Verification.findByPk(verificationId, {
    include: [{ model: User, as: 'user', attributes: ['id', 'role'] }],
  });
  if (!v) throw new NotFoundError('Verification not found');
  await v.update({ status: status.toUpperCase(), reviewedAt: new Date(), reviewedBy, rejectionReason: rejectionReason || null });

  if (status.toUpperCase() === 'VERIFIED' && v.user) {
    if (v.user.role === 'CREATOR') {
      await CreatorProfile.update({ isVerified: true }, { where: { userId: v.userId } });
    } else if (v.user.role === 'BRAND') {
      await BrandProfile.update({ isVerified: true }, { where: { userId: v.userId } });
    }
  }

  return serializeForAdmin(await v.reload({ include: USER_INCLUDE(null) }));
}

const USER_INCLUDE = (roleFilter) => [{
  model: User,
  as: 'user',
  attributes: ['id', 'email', 'role', 'status', 'createdAt'],
  required: !!roleFilter,
  ...(roleFilter ? { where: { role: roleFilter } } : {}),
  include: [
    { model: CreatorProfile, as: 'creatorProfile', attributes: ['displayName', 'username'] },
    { model: BrandProfile, as: 'brandProfile', attributes: ['companyName', 'industry'] },
  ],
}];

async function listForAdmin(query) {
  const { offset, limit, page } = parsePagination(query);
  const where = {};
  const roleFilter = query.role ? query.role.toUpperCase() : null;

  if (query.status) {
    const statuses = query.status.split(',').map((s) => s.trim().toUpperCase()).filter(Boolean);
    where.status = statuses.length === 1 ? statuses[0] : { [Op.in]: statuses };
  } else {
    where.status = { [Op.in]: ['PENDING', 'UNDER_REVIEW'] };
  }
  if (query.type === 'social') {
    where.type = { [Op.like]: 'social_%' };
  } else if (query.type) {
    where.type = query.type;
  }
  if (query.role) {
    // role filter applied via USER_INCLUDE where clause
  }

  const { rows, count } = await Verification.findAndCountAll({
    where,
    offset,
    limit,
    order: [['submittedAt', 'DESC']],
    include: USER_INCLUDE(roleFilter),
    distinct: true,
  });

  return { items: rows.map(serializeForAdmin), total: count, page, limit };
}

async function getById(id) {
  const v = await Verification.findByPk(id, { include: USER_INCLUDE(null) });
  if (!v) throw new NotFoundError('Verification not found');
  return serializeForAdmin(v);
}

async function approve(verificationId, reviewedBy) {
  return review(verificationId, 'VERIFIED', reviewedBy);
}

async function reject(verificationId, reviewedBy, rejectionReason) {
  return review(verificationId, 'REJECTED', reviewedBy, rejectionReason);
}

async function requestReupload(verificationId, reviewedBy, note) {
  return review(verificationId, 'REJECTED', reviewedBy, note || 'Please re-upload your documents.');
}

async function getTrustForUser(userId) {
  const user = await User.findByPk(userId, { attributes: ['role', 'emailVerified'] });
  if (!user) return { trustScore: 0, maxTrustScore: 0, breakdown: {} };
  const rows = await Verification.findAll({ where: { userId } });
  return computeTrustScore({
    role: user.role,
    verifications: rows,
    emailVerified: user.emailVerified,
  });
}

module.exports = {
  getStatus, getHistory, submitNIC, submitBusiness, submitDomain, submitSocial,
  listForAdmin, getById, approve, reject, requestReupload, review, getTrustForUser,
};
