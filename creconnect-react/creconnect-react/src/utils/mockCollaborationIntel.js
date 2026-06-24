/**
 * Deterministic "estimated" collaboration-intelligence generators.
 *
 * The backend exposes collaborations/applications with only their core
 * fields (status, budget, deadline, brand/campaign refs). These helpers
 * derive realistic, stable-per-collaboration datasets — kanban stage,
 * progress, payments, timeline, deliverables, contract, performance,
 * messages, documents, and AI insights — from a seed string (the
 * collaboration id), so the Collaboration System can render a rich
 * workspace today and swap to live data later without changing shape.
 */

import { seededRandom } from './mockAnalytics';
import { formatPKR } from './formatters';
import {
  KANBAN_STAGES, PRIORITIES, ASSIGNED_MANAGERS, PAYMENT_STATUSES,
  DELIVERABLE_TYPES, APPROVAL_STATUSES, CONTRACT_TYPES, HEALTH_LABELS,
} from '@/constants/collaborationOptions';

const MONTHS = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
const DAY_MS = 86_400_000;

function collabSeed(item = {}) {
  return item.id ?? `${item.brandName ?? 'brand'}-${item.campaignTitle ?? 'campaign'}`;
}

/**
 * Maps a collaboration/application's raw backend status into one of the
 * 8 kanban pipeline stages. PENDING applications are split between
 * "Applied" and "Under Review", and ACTIVE collaborations are split
 * across "Approved" / "In Progress" / "Content Review" — all seeded so
 * the split is stable per item.
 */
export function getKanbanStage(item = {}) {
  const seed = collabSeed(item);
  const rand = seededRandom(`${seed}-stage`);

  switch (item.rawStatus) {
    case 'INVITATION':
      return 'Invitation Received';
    case 'PENDING':
      return rand() < 0.5 ? 'Applied' : 'Under Review';
    case 'REJECTED':
    case 'WITHDRAWN':
      return 'Cancelled';
    case 'ACCEPTED':
      return 'Approved';
    case 'ACTIVE': {
      const r = rand();
      if (r < 0.34) return 'Approved';
      if (r < 0.67) return 'In Progress';
      return 'Content Review';
    }
    case 'COMPLETED':
      return 'Completed';
    case 'CANCELLED':
    case 'DISPUTED':
      return 'Cancelled';
    default:
      return 'Applied';
  }
}

const STAGE_PROGRESS_RANGE = {
  'Invitation Received': [0, 0],
  'Applied': [0, 0],
  'Under Review': [0, 5],
  'Approved': [10, 30],
  'In Progress': [35, 80],
  'Content Review': [70, 95],
  'Completed': [100, 100],
  'Cancelled': [0, 45],
};

/**
 * Core per-collaboration metrics: match score, progress, priority,
 * assigned manager, payment status, last activity, and the
 * Collaboration Health Score (with label) blended from communication,
 * deadlines, approvals, performance, and payment factors.
 */
export function getCollaborationIntel(item = {}) {
  const seed = collabSeed(item);
  const rand = seededRandom(`${seed}-collab-intel`);
  const stage = getKanbanStage(item);

  const matchScore = Math.round(65 + rand() * 34);
  const [pMin, pMax] = STAGE_PROGRESS_RANGE[stage] ?? [0, 100];
  const progress = pMin === pMax ? pMin : Math.round(pMin + rand() * (pMax - pMin));
  const priority = PRIORITIES[Math.floor(rand() * PRIORITIES.length)];
  const assignedManager = ASSIGNED_MANAGERS[Math.floor(rand() * ASSIGNED_MANAGERS.length)];
  const lastActivityHours = Math.round(1 + rand() * 96);

  let paymentStatus;
  if (stage === 'Completed') paymentStatus = rand() < 0.7 ? 'Completed' : 'Released';
  else if (['In Progress', 'Content Review'].includes(stage)) paymentStatus = rand() < 0.5 ? 'Processing' : 'Pending';
  else if (stage === 'Approved') paymentStatus = 'Pending';
  else paymentStatus = PAYMENT_STATUSES[Math.floor(rand() * PAYMENT_STATUSES.length)];

  const communication = Math.round(60 + rand() * 40);
  const deadlines = Math.round(55 + rand() * 45);
  const approvals = Math.round(60 + rand() * 40);
  const performance = Math.round(60 + rand() * 40);
  const paymentScore = Math.round(60 + rand() * 40);

  let healthScore = Math.round((communication + deadlines + approvals + performance + paymentScore) / 5);
  if (stage === 'Cancelled') healthScore = Math.min(healthScore, 45);

  let healthLabel;
  if (healthScore >= 85) healthLabel = HEALTH_LABELS[0]; // Excellent
  else if (healthScore >= 70) healthLabel = HEALTH_LABELS[1]; // Good
  else if (healthScore >= 50) healthLabel = HEALTH_LABELS[2]; // At Risk
  else healthLabel = HEALTH_LABELS[3]; // Needs Attention

  return {
    stage, matchScore, progress, priority, assignedManager, lastActivityHours, paymentStatus,
    healthScore, healthLabel,
    healthFactors: { communication, deadlines, approvals, performance, paymentScore },
  };
}

const TIMELINE_EVENTS = [
  'Invitation Sent', 'Accepted', 'Contract Signed', 'Content Submitted',
  'Review Requested', 'Approved', 'Payment Released', 'Completed',
];

const STAGE_STEP_COUNT = {
  'Invitation Received': 1,
  'Applied': 1,
  'Under Review': 2,
  'Approved': 3,
  'In Progress': 4,
  'Content Review': 6,
  'Completed': 8,
  'Cancelled': null, // randomized
};

/**
 * Visual project timeline — which milestones are complete (with
 * timestamps) vs. still pending, derived from the kanban stage.
 */
export function getCollaborationTimeline(item = {}) {
  const seed = collabSeed(item);
  const rand = seededRandom(`${seed}-timeline`);
  const stage = getKanbanStage(item);
  const start = new Date(item.createdAt ?? Date.now() - 30 * DAY_MS).getTime();

  let stepsDone = STAGE_STEP_COUNT[stage];
  if (stepsDone == null) stepsDone = 1 + Math.floor(rand() * 3);

  return TIMELINE_EVENTS.map((label, i) => {
    const done = i < stepsDone;
    return {
      key: label,
      label,
      done,
      cancelled: stage === 'Cancelled' && i === stepsDone,
      date: done ? new Date(start + i * (2 + rand() * 3) * DAY_MS).toISOString() : null,
    };
  });
}

const DELIVERABLE_TITLES = {
  Reel: ['Unboxing Reel', 'Product Demo Reel', 'Behind-the-Scenes Reel'],
  Story: ['Story Series — Day 1', 'Story Series — Day 2', 'Swipe-Up Story'],
  Post: ['Feed Post — Hero Shot', 'Feed Post — Lifestyle', 'Carousel Post'],
  Video: ['YouTube Review Video', 'Tutorial Video', 'Long-Form Walkthrough'],
  Livestream: ['Launch Day Livestream', 'Q&A Livestream'],
  'UGC Content': ['UGC Clip Pack', 'UGC Testimonial'],
};

const FEEDBACK_SAMPLES = [
  'Looks great — just tighten up the intro by a few seconds.',
  'Love the styling! Can you add the discount code in the caption?',
  'Please re-shoot with better lighting on the product.',
  'Perfect, approved as-is.',
  'Can you swap the background music to something more upbeat?',
];

/**
 * Per-deliverable status, dates, approval workflow state, feedback, and
 * revision count for the Deliverable Management & Content Review sections.
 */
export function getDeliverables(item = {}) {
  const seed = collabSeed(item);
  const rand = seededRandom(`${seed}-deliverables`);
  const stage = getKanbanStage(item);
  const start = new Date(item.createdAt ?? Date.now() - 30 * DAY_MS).getTime();
  const count = 2 + Math.floor(rand() * 3);

  const isEarlyStage = ['Invitation Received', 'Applied', 'Under Review', 'Approved'].includes(stage);

  return Array.from({ length: count }, (_, i) => {
    const type = DELIVERABLE_TYPES[Math.floor(rand() * DELIVERABLE_TYPES.length)];
    const titles = DELIVERABLE_TITLES[type];
    const title = titles[Math.floor(rand() * titles.length)];
    const dueDate = new Date(start + (10 + i * 7 + rand() * 5) * DAY_MS).toISOString();

    let approvalStatus;
    if (stage === 'Completed') approvalStatus = 'Approved';
    else if (stage === 'Cancelled') approvalStatus = rand() < 0.5 ? 'Rejected' : 'Draft';
    else if (isEarlyStage) approvalStatus = 'Draft';
    else if (stage === 'Content Review') approvalStatus = APPROVAL_STATUSES[1 + Math.floor(rand() * 3)]; // Submitted, Needs Revision, Approved
    else approvalStatus = i === 0 ? 'Approved' : APPROVAL_STATUSES[Math.floor(rand() * APPROVAL_STATUSES.length)];

    const status = approvalStatus === 'Approved' ? 'Completed' : (approvalStatus === 'Draft' ? 'Not Started' : 'In Review');
    const submissionDate = approvalStatus === 'Draft' ? null : new Date(start + (8 + i * 7) * DAY_MS).toISOString();
    const revisionCount = approvalStatus === 'Needs Revision' ? 1 + Math.floor(rand() * 2) : (approvalStatus === 'Approved' ? Math.floor(rand() * 2) : 0);
    const feedback = approvalStatus === 'Draft' ? null : FEEDBACK_SAMPLES[Math.floor(rand() * FEEDBACK_SAMPLES.length)];

    return {
      id: `${seed}-deliverable-${i}`,
      type, title, status, dueDate, submissionDate, approvalStatus, feedback, revisionCount,
    };
  });
}

/**
 * Contract status, type, signed/expiry dates, and payment terms for the
 * Contract Center.
 */
export function getContract(item = {}) {
  const seed = collabSeed(item);
  const rand = seededRandom(`${seed}-contract`);
  const stage = getKanbanStage(item);
  const start = new Date(item.createdAt ?? Date.now() - 30 * DAY_MS).getTime();

  const isSigned = !['Invitation Received', 'Applied', 'Under Review'].includes(stage);
  const status = stage === 'Cancelled' ? 'Voided' : (isSigned ? 'Signed' : 'Pending Signature');
  const type = CONTRACT_TYPES[Math.floor(rand() * CONTRACT_TYPES.length)];
  const signedDate = isSigned ? new Date(start + 3 * DAY_MS).toISOString() : null;
  const expiryDate = new Date(start + (90 + Math.floor(rand() * 90)) * DAY_MS).toISOString();
  const upfrontPct = [0, 25, 50][Math.floor(rand() * 3)];
  const paymentTerms = upfrontPct > 0
    ? `${upfrontPct}% upfront, ${100 - upfrontPct}% on completion & approval`
    : '100% on completion & approval (escrow protected)';

  return { status, type, signedDate, expiryDate, paymentTerms };
}

/**
 * Financial breakdown — budget, paid/pending/escrow amounts, expected
 * payout date, and milestone-level statuses for the Payment Center.
 */
export function getPaymentBreakdown(item = {}, intel) {
  const seed = collabSeed(item);
  const rand = seededRandom(`${seed}-payments`);
  const i = intel ?? getCollaborationIntel(item);
  const budget = item.budget ?? 0;
  const start = new Date(item.createdAt ?? Date.now() - 30 * DAY_MS).getTime();

  const paidFraction = i.progress >= 100 ? 1 : (i.progress / 100) * (0.5 + rand() * 0.4);
  const paid = Math.round((budget * paidFraction) / 100) * 100;
  const escrow = i.progress > 0 && i.progress < 100 ? Math.round((budget * 0.3) / 100) * 100 : 0;
  const pending = Math.max(0, budget - paid - escrow);
  const expectedPayout = new Date(start + (45 + Math.floor(rand() * 30)) * DAY_MS).toISOString();

  const milestoneCount = 2 + Math.floor(rand() * 2);
  const milestoneAmount = Math.round((budget / milestoneCount) / 100) * 100;
  const milestones = Array.from({ length: milestoneCount }, (_, idx) => {
    const fraction = (idx + 1) / milestoneCount;
    let status;
    if (i.progress / 100 >= fraction) status = 'Released';
    else if (i.progress / 100 >= fraction - (1 / milestoneCount) * 0.5) status = 'Processing';
    else status = 'Pending';
    return {
      id: `${seed}-milestone-${idx}`,
      label: idx === milestoneCount - 1 ? 'Final Payment' : `Milestone ${idx + 1}`,
      amount: idx === milestoneCount - 1 ? budget - milestoneAmount * (milestoneCount - 1) : milestoneAmount,
      status,
      date: new Date(start + (20 + idx * 20) * DAY_MS).toISOString(),
    };
  });

  return { budget, paid, pending, escrow, expectedPayout, paymentDate: expectedPayout, milestones };
}

/**
 * Campaign performance metrics + 6-month series for the Campaign
 * Performance / Earnings Analytics charts.
 */
export function getPerformanceMetrics(item = {}) {
  const seed = collabSeed(item);
  const rand = seededRandom(`${seed}-performance`);
  const now = new Date();

  const reach = Math.round(20000 + rand() * 480000);
  const impressions = Math.round(reach * (1.3 + rand() * 0.8));
  const views = Math.round(reach * (0.6 + rand() * 0.5));
  const clicks = Math.round(views * (0.02 + rand() * 0.06));
  const engagement = Math.round((2 + rand() * 7) * 10) / 10;
  const conversions = Math.round(clicks * (0.05 + rand() * 0.15));
  const roi = Math.round(80 + rand() * 160);

  let baseReach = Math.round(reach * 0.5);
  let baseEngagement = Math.max(1, engagement - 2);
  let baseFollowers = Math.round(1000 + rand() * 4000);

  const series = Array.from({ length: 6 }, (_, idx) => {
    const i = 5 - idx;
    const d = new Date(now.getFullYear(), now.getMonth() - i, 1);
    baseReach = Math.max(2000, Math.round(baseReach * (0.95 + rand() * 0.25)));
    baseEngagement = Math.max(1, Math.round((baseEngagement * (0.95 + rand() * 0.2)) * 10) / 10);
    baseFollowers = Math.round(baseFollowers * (1 + rand() * 0.08));
    return {
      month: MONTHS[d.getMonth()],
      reach: baseReach,
      engagement: baseEngagement,
      followers: baseFollowers,
    };
  });

  return { reach, impressions, views, clicks, engagement, conversions, roi, series };
}

/**
 * AI-style collaboration insights for the AI Collaboration Insights
 * section + Copilot tab.
 */
export function getCollaborationAIInsights(item = {}, intel, performance) {
  const seed = collabSeed(item);
  const rand = seededRandom(`${seed}-ai-insights`);
  const i = intel ?? getCollaborationIntel(item);
  const p = performance ?? getPerformanceMetrics(item);

  const vsAverage = Math.round(-10 + rand() * 40);
  const insights = [
    vsAverage >= 0
      ? `This campaign is outperforming your average by ${vsAverage}%.`
      : `This campaign is ${Math.abs(vsAverage)}% below your typical performance — consider a follow-up post to boost reach.`,
    'Video content is generating the highest engagement for this collaboration.',
    `${item.brandName ?? 'This brand'} has a ${85 + Math.floor(rand() * 14)}% payment reliability score based on past collaborations.`,
  ];

  if (i.healthScore >= 85) {
    insights.push('This collaboration is in excellent health — communication, deadlines, and approvals are all on track.');
  } else if (i.healthScore < 50) {
    insights.push('This collaboration needs attention — check for overdue deliverables or pending messages.');
  }

  if (p.roi >= 150) {
    insights.push(`At an estimated ${p.roi}% ROI, this is one of your highest-performing partnerships.`);
  }

  insights.push(`Best next step: ${['follow up on the latest deliverable', 'confirm the upcoming deadline with the brand', 'request feedback on your last submission', 'share performance results to strengthen the relationship'][Math.floor(rand() * 4)]}.`);

  return insights;
}

const SENDER_NAMES = ['Brand Team', 'Campaign Manager', 'You'];
const MESSAGE_SAMPLES = [
  'Hi! Excited to kick off this collaboration 🎉',
  'Just sent over the brand guidelines and product samples tracking number.',
  'Here’s the first draft — let me know your thoughts!',
  'Looks great, just one small revision needed on the caption.',
  'Approved! This is ready to go live.',
  'Payment for the first milestone has been released.',
  '@you can you confirm the posting date for next week?',
  'Voice note: quick thoughts on the latest cut 🎙️',
];

/**
 * Collaboration-specific message thread + activity feed for the
 * Communication Hub.
 */
export function getMessages(item = {}, count = 6) {
  const seed = collabSeed(item);
  const rand = seededRandom(`${seed}-messages`);
  const start = new Date(item.createdAt ?? Date.now() - 20 * DAY_MS).getTime();

  return Array.from({ length: count }, (_, i) => {
    const fromMe = i % 3 === 2;
    const text = MESSAGE_SAMPLES[(i + Math.floor(rand() * 2)) % MESSAGE_SAMPLES.length];
    const hasAttachment = rand() < 0.25;
    const isVoiceNote = text.startsWith('Voice note');
    return {
      id: `${seed}-msg-${i}`,
      sender: fromMe ? 'You' : (item.brandName ?? SENDER_NAMES[Math.floor(rand() * 2)]),
      fromMe,
      text,
      time: new Date(start + i * (1 + rand() * 2) * DAY_MS).toISOString(),
      attachment: hasAttachment ? 'campaign-asset.jpg' : null,
      isVoiceNote,
      pinned: i === 1,
      mentions: text.includes('@you') ? ['you'] : [],
    };
  });
}

/**
 * Brand activity feed (separate from direct messages) for the
 * Communication Hub's activity log.
 */
export function getActivityFeed(item = {}, intel) {
  const seed = collabSeed(item);
  const rand = seededRandom(`${seed}-activity`);
  const i = intel ?? getCollaborationIntel(item);
  const stage = getKanbanStage(item);
  const start = new Date(item.createdAt ?? Date.now() - 20 * DAY_MS).getTime();

  const events = [
    `Collaboration moved to "${stage}"`,
    `${item.brandName ?? 'Brand'} viewed your latest submission`,
    `Payment status updated to "${i.paymentStatus}"`,
    'New message received',
  ];

  return events.map((text, idx) => ({
    id: `${seed}-feed-${idx}`,
    text,
    time: new Date(start + (idx + 1) * (3 + rand() * 4) * DAY_MS).toISOString(),
  })).reverse();
}

const DOCUMENT_NAMES = {
  'Campaign Assets': ['Product Photos.zip', 'Logo Pack.zip', 'Raw Footage.mp4'],
  'Brand Guidelines': ['Brand Style Guide.pdf', 'Tone of Voice Doc.pdf'],
  'Contracts': ['Collaboration Agreement.pdf', 'Usage Rights Addendum.pdf'],
  'Submitted Content': ['Draft v1.mp4', 'Final Caption Copy.docx', 'Cover Image.png'],
};

/**
 * Media vault contents organized by folder, for the File Management section.
 */
export function getDocuments(item = {}) {
  const seed = collabSeed(item);
  const rand = seededRandom(`${seed}-documents`);
  const start = new Date(item.createdAt ?? Date.now() - 20 * DAY_MS).getTime();

  const docs = [];
  Object.entries(DOCUMENT_NAMES).forEach(([folder, names]) => {
    const n = 1 + Math.floor(rand() * names.length);
    for (let i = 0; i < n; i++) {
      docs.push({
        id: `${seed}-doc-${folder}-${i}`,
        name: names[i],
        folder,
        size: `${(0.2 + rand() * 12).toFixed(1)} MB`,
        date: new Date(start + (5 + i * 4) * DAY_MS).toISOString(),
      });
    }
  });
  return docs;
}

const SYNTHETIC_BRAND_NAMES = ['Lumina Skincare', 'Pulse Sportswear', 'Nimbus Tech', 'Verve Foods', 'Atlas Travel Co.', 'Glow Beauty Lab'];
const SYNTHETIC_CAMPAIGN_TYPES = ['Sponsored Post', 'Product Review', 'Video Integration', 'UGC Content'];

/**
 * Synthetic "brand-initiated invitation" cards — the backend doesn't yet
 * have a distinct invitation flow (creators apply to campaigns), so a
 * small seeded set fills the "Invitation Received" pipeline column for
 * demo purposes. Marked `isSynthetic: true`.
 */
export function getSyntheticInvitations(count = 3) {
  const rand = seededRandom('synthetic-invitations');
  return Array.from({ length: count }, (_, i) => {
    const brandName = SYNTHETIC_BRAND_NAMES[i % SYNTHETIC_BRAND_NAMES.length];
    const campaignType = SYNTHETIC_CAMPAIGN_TYPES[Math.floor(rand() * SYNTHETIC_CAMPAIGN_TYPES.length)];
    const budget = Math.round((15000 + rand() * 60000) / 500) * 500;
    const createdAt = new Date(Date.now() - (1 + Math.floor(rand() * 5)) * DAY_MS).toISOString();
    return {
      id: `synthetic-inv-${i}`,
      isSynthetic: true,
      rawStatus: 'INVITATION',
      brandName,
      brandLogo: null,
      industry: 'General',
      campaignTitle: `${campaignType} — ${brandName}`,
      campaignType,
      budget,
      deadline: new Date(Date.now() + (14 + i * 5) * DAY_MS).toISOString(),
      createdAt,
    };
  });
}

const NOTIFICATION_TEMPLATES = [
  { key: 'review', icon: '🔍', test: (i, deliverables) => deliverables.some((d) => d.approvalStatus === 'Submitted'), text: (item) => `${item.brandName}: Content needs review.` },
  { key: 'revision', icon: '✏️', test: (i, deliverables) => deliverables.some((d) => d.approvalStatus === 'Needs Revision'), text: (item) => `${item.brandName}: Revision requested.` },
  { key: 'payment', icon: '💸', test: (i) => ['Released', 'Completed'].includes(i.paymentStatus), text: (item) => `${item.brandName}: Payment released.` },
  { key: 'contract', icon: '📝', test: (i, d, contract) => contract.status === 'Signed', text: (item) => `${item.brandName}: Contract signed.` },
];

/**
 * Cross-collaboration notification feed for the Notifications Panel.
 */
export function getCollaborationNotifications(items = []) {
  const notifications = [];
  items.forEach((item) => {
    const seed = collabSeed(item);
    const rand = seededRandom(`${seed}-notifications`);
    const intel = getCollaborationIntel(item);
    const deliverables = getDeliverables(item);
    const contract = getContract(item);

    NOTIFICATION_TEMPLATES.forEach((tpl) => {
      if (tpl.test(intel, deliverables, contract)) {
        notifications.push({
          id: `${seed}-notif-${tpl.key}`,
          icon: tpl.icon,
          text: tpl.text(item),
          hoursAgo: Math.round(1 + rand() * 72),
          item,
        });
      }
    });
  });

  return notifications.sort((a, b) => a.hoursAgo - b.hoursAgo);
}

/**
 * Aggregate KPI counts for the Collaboration Dashboard.
 */
export function getCollaborationSummary(items = []) {
  let activeCollaborations = 0;
  let pendingInvitations = 0;
  let awaitingApproval = 0;
  let completedCampaigns = 0;
  let totalEarnings = 0;
  let upcomingDeadlines = 0;
  const now = Date.now();

  items.forEach((item) => {
    const stage = getKanbanStage(item);
    const intel = getCollaborationIntel(item);

    if (['Approved', 'In Progress', 'Content Review'].includes(stage)) activeCollaborations += 1;
    if (stage === 'Invitation Received') pendingInvitations += 1;
    if (['Under Review', 'Content Review'].includes(stage)) awaitingApproval += 1;
    if (stage === 'Completed') completedCampaigns += 1;

    const payment = getPaymentBreakdown(item, intel);
    totalEarnings += payment.paid;

    if (item.deadline) {
      const diff = new Date(item.deadline).getTime() - now;
      if (diff > 0 && diff <= 7 * DAY_MS && !['Completed', 'Cancelled'].includes(stage)) {
        upcomingDeadlines += 1;
      }
    }
  });

  return {
    activeCollaborations, pendingInvitations, awaitingApproval, completedCampaigns,
    totalEarnings: formatPKR(totalEarnings), totalEarningsRaw: totalEarnings, upcomingDeadlines,
  };
}

export { KANBAN_STAGES };
