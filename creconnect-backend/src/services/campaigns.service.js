const { Op } = require('sequelize');
const { Campaign, BrandProfile, Application, Collaboration, CreatorProfile, User } = require('../models');
const { NotFoundError, ForbiddenError } = require('../utils/errors');
const { parsePagination } = require('../utils/pagination');
const notificationsSvc = require('./notifications.service');
const entitlementsSvc = require('./entitlements.service');
const { logActivity } = require('../utils/activity');

async function create(userId, data) {
  const brand = await BrandProfile.findOne({ where: { userId } });
  if (!brand) throw new ForbiddenError('Only brands can create campaigns');
  await entitlementsSvc.canCreateCampaign(userId);
  const campaign = await Campaign.create({ ...data, brandId: brand.id });
  const result = await campaign.reload({ include: [{ model: BrandProfile, as: 'brand' }] });
  const isDraft = (data.status ?? 'PUBLISHED') === 'DRAFT';
  logActivity(userId, isDraft ? 'campaign.draft_created' : 'campaign.published', {
    entity: 'campaign', entityId: campaign.id,
    meta: { title: campaign.title, status: campaign.status },
  });
  return result;
}

async function list(query) {
  const { offset, limit, page } = parsePagination(query);
  const where = { status: query.status ? query.status.toUpperCase() : 'PUBLISHED' };
  if (query.niche)     where.niche     = query.niche.toUpperCase();
  if (query.objective) where.objective = query.objective.toUpperCase();
  if (query.q)         where.title     = { [Op.iLike]: `%${query.q}%` };
  if (query.brandId)   where.brandId   = query.brandId;

  const { rows, count } = await Campaign.findAndCountAll({
    where,
    offset,
    limit,
    order: [['createdAt', 'DESC']],
    include: [{ model: BrandProfile, as: 'brand', attributes: ['companyName', 'logoUrl', 'isVerified'] }],
  });

  return { items: rows, total: count, page, limit };
}

async function getById(id) {
  const campaign = await Campaign.findByPk(id, {
    include: [{ model: BrandProfile, as: 'brand' }],
  });
  if (!campaign) throw new NotFoundError('Campaign not found');
  return campaign;
}

async function update(id, userId, data) {
  const campaign = await _assertOwner(id, userId);
  await campaign.update(data);
  const result = await campaign.reload({ include: [{ model: BrandProfile, as: 'brand' }] });
  const action = data.status ? `campaign.status_changed` : 'campaign.updated';
  logActivity(userId, action, {
    entity: 'campaign', entityId: id,
    meta: { title: campaign.title, ...(data.status ? { status: data.status } : {}) },
  });
  return result;
}

async function remove(id, userId) {
  const campaign = await _assertOwner(id, userId);
  await campaign.destroy();
}

async function apply(campaignId, userId, note) {
  const creator  = await CreatorProfile.findOne({ where: { userId } });
  if (!creator) throw new ForbiddenError('Only creators can apply to campaigns');
  const campaign = await Campaign.findByPk(campaignId, {
    include: [{ model: BrandProfile, as: 'brand' }],
  });
  if (!campaign) throw new NotFoundError('Campaign not found');

  const app = await Application.create({ campaignId, creatorId: creator.id, note, status: 'PENDING' });

  // Notify the brand that a creator has applied
  if (campaign.brand?.userId) {
    const creatorName = creator.displayName || creator.username || 'A creator';
    notificationsSvc.createForUser(
      campaign.brand.userId,
      `📨 ${creatorName} applied to your campaign "${campaign.title}"`,
      'CAMPAIGN_INVITE'
    ).catch(() => {});
  }

  return app;
}

async function getApplications(campaignId, userId, query) {
  const { offset, limit, page } = parsePagination(query);
  await _assertOwner(campaignId, userId);

  const where = { campaignId };
  if (query.status) where.status = query.status.toUpperCase();

  const { rows, count } = await Application.findAndCountAll({
    where,
    offset,
    limit,
    order: [['createdAt', 'DESC']],
    include: [{ model: CreatorProfile, as: 'creator' }],
  });

  return { items: rows, total: count, page, limit };
}

async function respondToApplication(appId, action, userId) {
  const app = await Application.findByPk(appId, {
    include: [{ model: Campaign, as: 'campaign' }],
  });
  if (!app) throw new NotFoundError('Application not found');

  const brand = await BrandProfile.findOne({ where: { userId } });
  if (!brand || app.campaign.brandId !== brand.id) throw new ForbiddenError();

  const status = action === 'accept' ? 'ACCEPTED' : 'REJECTED';
  const creator = await CreatorProfile.findByPk(app.creatorId, { include: [{ model: User, as: 'user' }] });

  if (status === 'ACCEPTED') {
    await entitlementsSvc.canAcceptCreatorOnCampaign(app.campaignId, userId);
    if (creator?.userId) await entitlementsSvc.canAcceptCollaboration(creator.userId);
  }

  await app.update({ status });

  if (status === 'ACCEPTED') {
    await Collaboration.create({
      campaignId: app.campaignId,
      creatorId:  app.creatorId,
      brandId:    brand.id,
      status:     'ACCEPTED',
      stage:      'INQUIRY',
    });
  }

  // Notify the creator about their application result
  if (creator?.userId) {
    const campaignTitle = app.campaign?.title ?? 'your campaign application';
    const brandName     = brand?.companyName   ?? 'A brand';
    const msg = status === 'ACCEPTED'
      ? `🎉 ${brandName} accepted your application for "${campaignTitle}"! Head to Collaborations to get started.`
      : `${brandName} has reviewed your application for "${campaignTitle}" and decided to go in a different direction this time.`;
    const type = status === 'ACCEPTED' ? 'COLLAB_ACCEPTED' : 'COLLAB_REJECTED';
    notificationsSvc.createForUser(creator.userId, msg, type).catch(() => {});
  }

  logActivity(userId,
    status === 'ACCEPTED' ? 'collaboration.application_accepted' : 'collaboration.application_rejected',
    { entity: 'application', entityId: appId, meta: { campaign: app.campaign?.title, creator: creator?.displayName } }
  );

  return app;
}

async function withdrawApplication(appId, userId) {
  const creator = await CreatorProfile.findOne({ where: { userId } });
  if (!creator) throw new ForbiddenError('Only creators can withdraw applications');

  const app = await Application.findByPk(appId);
  if (!app) throw new NotFoundError('Application not found');
  if (app.creatorId !== creator.id) throw new ForbiddenError('Not your application');
  if (app.status !== 'PENDING') throw new ForbiddenError('Only pending applications can be withdrawn');

  await app.destroy();
  return { id: appId };
}

async function _assertOwner(campaignId, userId) {
  const campaign = await Campaign.findByPk(campaignId, {
    include: [{ model: BrandProfile, as: 'brand' }],
  });
  if (!campaign) throw new NotFoundError('Campaign not found');
  if (campaign.brand.userId !== userId) throw new ForbiddenError('Not your campaign');
  return campaign;
}

async function inviteCreator(campaignId, brandUserId, creatorProfileId) {
  const campaign = await _assertOwner(campaignId, brandUserId);
  const brand    = await BrandProfile.findOne({ where: { userId: brandUserId } });
  const creator  = await CreatorProfile.findByPk(creatorProfileId, { include: [{ model: User, as: 'user' }] });

  if (!creator) throw new NotFoundError('Creator not found');

  // Prevent duplicate invitations / applications
  const existing = await Application.findOne({ where: { campaignId, creatorId: creatorProfileId } });
  if (existing) {
    if (existing.status === 'INVITED') return existing; // already invited
    throw new Error('This creator has already applied or been invited to this campaign.');
  }

  // Create invitation as a real application record
  const app = await Application.create({
    campaignId,
    creatorId: creatorProfileId,
    status:    'INVITED',
    note:      `Invited by ${brand?.companyName ?? 'the brand'}`,
  });

  const brandName     = brand?.companyName ?? 'A brand';
  const campaignTitle = campaign?.title    ?? 'a campaign';

  // Notify the creator
  await notificationsSvc.createForUser(
    creator.userId,
    `🎉 ${brandName} invited you to join their campaign "${campaignTitle}". Open your Campaigns tab to accept or decline.`,
    'CAMPAIGN_INVITE',
  );

  logActivity(brandUserId, 'campaign.creator_invited', {
    entity: 'campaign', entityId: campaignId,
    meta: { campaign: campaignTitle, creator: creator.displayName },
  });

  return app;
}

async function creatorRespondToInvitation(appId, action, userId) {
  const creator = await CreatorProfile.findOne({ where: { userId } });
  if (!creator) throw new ForbiddenError('Only creators can respond to invitations');

  const app = await Application.findByPk(appId, {
    include: [{ model: Campaign, as: 'campaign' }],
  });
  if (!app) throw new NotFoundError('Invitation not found');
  if (app.creatorId !== creator.id) throw new ForbiddenError('Not your invitation');
  if (app.status !== 'INVITED') throw new Error('This invitation has already been responded to');

  const newStatus = action === 'accept' ? 'ACCEPTED' : 'REJECTED';
  const brand = await BrandProfile.findOne({ where: { id: app.campaign?.brandId } });

  if (newStatus === 'ACCEPTED') {
    await entitlementsSvc.canAcceptCollaboration(userId);
    if (brand?.userId) await entitlementsSvc.canAcceptCreatorOnCampaign(app.campaignId, brand.userId);
  }

  await app.update({ status: newStatus });

  if (newStatus === 'ACCEPTED') {
    // Create the collaboration record so the creator sees it in Active campaigns
    await Collaboration.findOrCreate({
      where: { campaignId: app.campaignId, creatorId: app.creatorId },
      defaults: {
        campaignId: app.campaignId,
        creatorId:  app.creatorId,
        brandId:    app.campaign?.brandId,
        status:     'ACCEPTED',
        stage:      'INQUIRY',
      },
    });
  }

  if (brand?.userId) {
    const creatorName = creator.displayName || creator.username || 'A creator';
    const msg = newStatus === 'ACCEPTED'
      ? `✅ ${creatorName} accepted your invitation to "${app.campaign?.title ?? 'your campaign'}"!`
      : `❌ ${creatorName} declined your invitation to "${app.campaign?.title ?? 'your campaign'}"`;
    await notificationsSvc.createForUser(brand.userId, msg, newStatus === 'ACCEPTED' ? 'COLLAB_ACCEPTED' : 'COLLAB_REJECTED');
  }

  return app;
}

module.exports = { create, list, getById, update, remove, apply, getApplications, respondToApplication, withdrawApplication, inviteCreator, creatorRespondToInvitation };
