const { Verification, User } = require('../models');
const { NotFoundError } = require('../utils/errors');

async function getStatus(userId) {
  const rows = await Verification.findAll({
    where:  { userId },
    order:  [['submittedAt', 'DESC']],
  });
  // Return one entry per type (latest)
  const latest = {};
  rows.forEach((r) => {
    if (!latest[r.type]) latest[r.type] = r;
  });
  return Object.values(latest).map((r) => ({
    type:            r.type,
    status:          r.status.toLowerCase(),
    submittedAt:     r.submittedAt,
    reviewedAt:      r.reviewedAt,
    expiresAt:       r.expiresAt,
    rejectionReason: r.rejectionReason,
  }));
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
    data:   { fullName, nicNumber, frontDocumentId, backDocumentId, frontUrl, backUrl },
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
  const v = await Verification.findByPk(verificationId);
  if (!v) throw new NotFoundError('Verification not found');
  await v.update({ status: status.toUpperCase(), reviewedAt: new Date(), reviewedBy, rejectionReason: rejectionReason || null });
  return v;
}

module.exports = { getStatus, getHistory, submitNIC, submitBusiness, submitDomain, submitSocial, review };
