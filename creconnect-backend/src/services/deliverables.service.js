const { Deliverable, Collaboration, BrandProfile, CreatorProfile, Campaign } = require('../models');
const { NotFoundError, ForbiddenError, ValidationError } = require('../utils/errors');
const notificationsSvc = require('./notifications.service');

const COLLAB_INCLUDE = [
  { model: BrandProfile,   as: 'brand' },
  { model: CreatorProfile, as: 'creator' },
  { model: Campaign,       as: 'campaign', attributes: ['title'] },
];

async function _loadCollabForUser(collaborationId, userId) {
  const collab = await Collaboration.findByPk(collaborationId, { include: COLLAB_INCLUDE });
  if (!collab) throw new NotFoundError('Collaboration not found');

  const isCreator = collab.creator?.userId === userId;
  const isBrand   = collab.brand?.userId === userId;
  if (!isCreator && !isBrand) throw new ForbiddenError('Not part of this collaboration');

  return { collab, isCreator, isBrand };
}

const VALID_TYPES = ['REEL', 'POST', 'STORY', 'VIDEO', 'LIVESTREAM'];

async function submit(collaborationId, creatorUserId, { note, link, type }) {
  const { collab, isCreator } = await _loadCollabForUser(collaborationId, creatorUserId);
  if (!isCreator) throw new ForbiddenError('Only the creator can submit deliverables');
  if (collab.status !== 'ACCEPTED') throw new ForbiddenError('Collaboration is not active');
  if (!note || !note.trim()) throw new ValidationError('A short note describing the submission is required');
  if (type && !VALID_TYPES.includes(type)) throw new ValidationError('Invalid deliverable type');

  const deliverable = await Deliverable.create({
    collaborationId,
    submittedBy: creatorUserId,
    type: type || null,
    note: note.trim(),
    link: link || null,
    status: 'SUBMITTED',
  });

  // First submission (or resubmission) — reflect it on the shared stage indicator
  await collab.update({ stage: 'DELIVERED' });

  if (collab.brand?.userId) {
    const creatorName   = collab.creator?.displayName || collab.creator?.username || 'The creator';
    const campaignTitle = collab.campaign?.title ?? 'your campaign';
    notificationsSvc.push(
      [collab.brand.userId],
      `📤 ${creatorName} submitted a deliverable for "${campaignTitle}" — ready for your review.`
    ).catch(() => {});
  }

  return deliverable;
}

async function respond(deliverableId, brandUserId, action, feedback) {
  const deliverable = await Deliverable.findByPk(deliverableId, {
    include: [{ model: Collaboration, as: 'collaboration', include: COLLAB_INCLUDE }],
  });
  if (!deliverable) throw new NotFoundError('Deliverable not found');

  const collab = deliverable.collaboration;
  if (collab.brand?.userId !== brandUserId) throw new ForbiddenError('Only the brand can review deliverables');
  if (deliverable.status !== 'SUBMITTED') throw new ForbiddenError('This deliverable has already been reviewed');

  const status = action === 'approve' ? 'APPROVED' : 'REVISION_REQUESTED';
  await deliverable.update({ status, feedback: feedback || null });
  await collab.update({ stage: status === 'APPROVED' ? 'COMPLETED' : 'IN_PROGRESS' });

  if (collab.creator?.userId) {
    const brandName     = collab.brand?.companyName ?? 'The brand';
    const campaignTitle = collab.campaign?.title ?? 'your campaign';
    const msg = status === 'APPROVED'
      ? `✅ ${brandName} approved your deliverable for "${campaignTitle}"!`
      : `✏️ ${brandName} requested a revision on your deliverable for "${campaignTitle}".`;
    notificationsSvc.push([collab.creator.userId], msg).catch(() => {});
  }

  return deliverable;
}

async function list(collaborationId, userId) {
  await _loadCollabForUser(collaborationId, userId);
  return Deliverable.findAll({ where: { collaborationId }, order: [['createdAt', 'DESC']] });
}

module.exports = { submit, respond, list };
