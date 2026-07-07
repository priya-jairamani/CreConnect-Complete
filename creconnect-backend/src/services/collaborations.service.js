const { Op } = require('sequelize');
const {
  Collaboration, Deliverable, Payment, Conversation, Message,
  Campaign, CreatorProfile, BrandProfile,
} = require('../models');
const { NotFoundError, ForbiddenError } = require('../utils/errors');

function paymentEventTitle(status) {
  const map = {
    PENDING:  'Payment initiated',
    ESCROW:   'Funds held in escrow',
    RELEASED: 'Payment released to creator',
    PAID:     'Payment completed',
    DISPUTED: 'Payment disputed',
  };
  return map[status] || 'Payment update';
}

function buildTimeline(collab, deliverables, payments) {
  const events = [];
  const creatorName = collab.creator?.displayName || collab.creator?.username || 'Creator';
  const brandName = collab.brand?.companyName || 'Brand';
  const campaignTitle = collab.campaign?.title || 'Campaign';

  events.push({
    id: `${collab.id}-created`,
    type: 'milestone',
    title: 'Collaboration created',
    description: `Partnership opened for "${campaignTitle}"`,
    at: collab.createdAt,
    icon: '🤝',
  });

  if (collab.status === 'ACCEPTED' || collab.status === 'COMPLETED') {
    events.push({
      id: `${collab.id}-accepted`,
      type: 'milestone',
      title: 'Collaboration accepted',
      description: `${brandName} and ${creatorName} are working together`,
      at: collab.updatedAt,
      icon: '✅',
    });
  }

  const stageLabels = {
    NEGOTIATION: 'Moved to negotiation',
    CONTRACTED:  'Contract agreed',
    IN_PROGRESS: 'Work in progress',
    DELIVERED:   'Content delivered for review',
    COMPLETED:   'Pipeline stage completed',
  };
  if (collab.stage && stageLabels[collab.stage]) {
    events.push({
      id: `${collab.id}-stage-${collab.stage}`,
      type: 'stage',
      title: stageLabels[collab.stage],
      description: `Stage: ${collab.stage.replace(/_/g, ' ')}`,
      at: collab.updatedAt,
      icon: '📌',
    });
  }

  if (collab.endDate) {
    events.push({
      id: `${collab.id}-deadline`,
      type: 'deadline',
      title: 'Campaign deadline',
      description: 'Final delivery date for this collaboration',
      at: collab.endDate,
      icon: '📅',
    });
  }

  deliverables.forEach((d) => {
    events.push({
      id: `${d.id}-submitted`,
      type: 'deliverable',
      title: d.type ? `${d.type} submitted` : 'Deliverable submitted',
      description: d.note,
      at: d.createdAt,
      icon: '📤',
      meta: { link: d.link, status: d.status },
    });
    if (d.status === 'APPROVED' || d.status === 'REVISION_REQUESTED') {
      events.push({
        id: `${d.id}-reviewed`,
        type: 'deliverable',
        title: d.status === 'APPROVED' ? 'Deliverable approved' : 'Revision requested',
        description: d.feedback || (d.status === 'APPROVED' ? 'Brand approved this submission' : 'Brand requested changes'),
        at: d.updatedAt,
        icon: d.status === 'APPROVED' ? '✅' : '✏️',
      });
    }
  });

  payments.forEach((p) => {
    events.push({
      id: `${p.id}-payment`,
      type: 'payment',
      title: paymentEventTitle(p.status),
      description: `PKR ${Number(p.amountPKR || 0).toLocaleString('en-PK')}`,
      at: p.releasedAt || p.updatedAt || p.createdAt,
      icon: '💰',
      meta: { status: p.status },
    });
  });

  if (collab.status === 'COMPLETED') {
    events.push({
      id: `${collab.id}-completed`,
      type: 'milestone',
      title: 'Collaboration completed',
      description: `"${campaignTitle}" marked complete`,
      at: collab.updatedAt,
      icon: '🏁',
    });
  }

  if (collab.status === 'REJECTED') {
    events.push({
      id: `${collab.id}-rejected`,
      type: 'milestone',
      title: 'Collaboration declined',
      description: 'This partnership was not accepted',
      at: collab.updatedAt,
      icon: '❌',
    });
  }

  return events
    .filter((e) => e.at)
    .sort((a, b) => new Date(a.at) - new Date(b.at));
}

function buildAnalytics(collab, deliverables) {
  const campaign = collab.campaign || {};
  const required = {
    REEL:       campaign.reels       || 0,
    POST:       campaign.posts       || 0,
    STORY:      campaign.stories     || 0,
    VIDEO:      campaign.videos      || 0,
    LIVESTREAM: campaign.livestreams || 0,
  };
  const totalRequired = Object.values(required).reduce((s, n) => s + n, 0);
  const approved = deliverables.filter((d) => d.status === 'APPROVED').length;
  const pending = deliverables.filter((d) => d.status === 'SUBMITTED').length;
  const revision = deliverables.filter((d) => d.status === 'REVISION_REQUESTED').length;

  const byType = Object.entries(required)
    .map(([type, count]) => ({
      type,
      required: count,
      submitted: deliverables.filter((d) => d.type === type).length,
      approved: deliverables.filter((d) => d.type === type && d.status === 'APPROVED').length,
    }))
    .filter((r) => r.required > 0);

  return {
    totalRequired,
    submitted: deliverables.length,
    approved,
    pendingReview: pending,
    revisionsRequested: revision,
    completionPct: totalRequired > 0 ? Math.min(100, Math.round((approved / totalRequired) * 100)) : (approved > 0 ? 100 : 0),
    byType,
  };
}

function buildContract(collab) {
  const c = collab.campaign || {};
  return {
    campaignTitle:  c.title,
    description:    c.description,
    objective:      c.objective,
    requirements:   c.requirements,
    offerAmountPKR: collab.offerAmountPKR,
    offerType:      collab.offerType,
    budgetType:     c.budgetType,
    budgetPKR:      c.budgetPKR,
    startDate:      collab.startDate || c.startDate,
    endDate:        collab.endDate || c.deadline,
    deliverables: {
      reels: c.reels, posts: c.posts, stories: c.stories, videos: c.videos, livestreams: c.livestreams,
    },
    platforms: c.platforms || [],
    status: collab.status,
    stage:  collab.stage,
  };
}

function parseAttachments(raw) {
  if (!raw) return [];
  try {
    if (raw.startsWith('[')) return JSON.parse(raw);
    return [raw];
  } catch {
    return [raw];
  }
}

async function getDetail(collaborationId, userId) {
  const collab = await Collaboration.findByPk(collaborationId, {
    include: [
      { model: Campaign, as: 'campaign' },
      { model: BrandProfile, as: 'brand', attributes: ['id', 'userId', 'companyName', 'logoUrl', 'industry', 'website'] },
      { model: CreatorProfile, as: 'creator', attributes: ['id', 'userId', 'displayName', 'username', 'avatarUrl'] },
    ],
  });
  if (!collab) throw new NotFoundError('Collaboration not found');

  const isCreator = collab.creator?.userId === userId;
  const isBrand   = collab.brand?.userId === userId;
  if (!isCreator && !isBrand) throw new ForbiddenError('Not part of this collaboration');

  const [deliverables, payments, conversation] = await Promise.all([
    Deliverable.findAll({ where: { collaborationId }, order: [['createdAt', 'DESC']] }),
    Payment.findAll({ where: { collaborationId }, order: [['createdAt', 'ASC']] }),
    Conversation.findOne({ where: { creatorId: collab.creatorId, brandId: collab.brandId } }),
  ]);

  const documents = deliverables
    .filter((d) => d.link)
    .map((d) => ({
      id: d.id,
      name: d.type ? `${d.type} deliverable` : 'Deliverable link',
      url: d.link,
      source: 'deliverable',
      at: d.createdAt,
    }));

  if (conversation) {
    const msgs = await Message.findAll({
      where: { conversationId: conversation.id, attachment: { [Op.ne]: null } },
      order: [['createdAt', 'DESC']],
      limit: 30,
    });
    msgs.forEach((m) => {
      parseAttachments(m.attachment).forEach((url, i) => {
        if (url) {
          documents.push({
            id: `${m.id}-${i}`,
            name: 'Chat attachment',
            url,
            source: 'message',
            at: m.createdAt,
          });
        }
      });
    });
  }

  documents.sort((a, b) => new Date(b.at) - new Date(a.at));

  return {
    collaboration: collab,
    deliverables,
    payments,
    timeline: buildTimeline(collab, deliverables, payments),
    conversationId: conversation?.id ?? null,
    analytics: buildAnalytics(collab, deliverables),
    contract: buildContract(collab),
    documents,
    partner: isCreator
      ? { userId: collab.brand.userId, name: collab.brand.companyName, avatarUrl: collab.brand.logoUrl, role: 'BRAND' }
      : { userId: collab.creator.userId, name: collab.creator.displayName || collab.creator.username, avatarUrl: collab.creator.avatarUrl, role: 'CREATOR' },
  };
}

module.exports = { getDetail };
