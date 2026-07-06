/**
 * Maps rich admin mock datasets to the shapes returned by the live API.
 * Used when the presentation admin (admin@creconnect.pk) is signed in.
 */
import {
  EXECUTIVE_KPIS,
  PLATFORM_HEALTH,
  MARKETPLACE_ACTIVITY,
  REVENUE_SUMMARY,
  getGrowthSeries,
  getLiveFeed,
  TRUST_SAFETY,
} from './mockAdminDashboard';
import { CREATORS, BRANDS } from './mockUserIntelligence';
import { CAMPAIGNS } from './mockCampaignIntelligence';
import { REPORTS } from './mockTrustSafety';
import { TRANSACTIONS, PAYMENT_DISPUTES } from './mockRevenuePayments';
import { TICKETS } from './mockOperations';
import { SETTINGS_SCHEMA } from './mockSettings';

function paginate(items, url) {
  const params = new URLSearchParams((url || '').split('?')[1] || '');
  const page = Math.max(1, parseInt(params.get('page') || '1', 10));
  const limit = Math.max(1, parseInt(params.get('limit') || '20', 10));
  const start = (page - 1) * limit;
  const slice = items.slice(start, start + limit);
  const total = items.length;
  return {
    data: slice,
    meta: { page, limit, total, pages: Math.ceil(total / limit) || 0 },
  };
}

function creatorStatus(s) {
  if (s === 'suspended') return 'SUSPENDED';
  if (s === 'inactive') return 'PENDING';
  return 'APPROVED';
}

function mockUsers() {
  const creators = CREATORS.map((c) => ({
    id: c.id,
    email: c.email,
    role: 'CREATOR',
    status: creatorStatus(c.status),
    emailVerified: c.status !== 'inactive',
    createdAt: c.joinedAt,
    trustScore: c.status === 'suspended' ? 10 : 35,
    maxTrustScore: 80,
    creatorProfile: {
      displayName: c.name,
      username: (c.handle || '').replace('@', ''),
      niche: c.niche,
    },
  }));
  const brands = BRANDS.map((b) => ({
    id: b.id,
    email: b.email,
    role: 'BRAND',
    status: creatorStatus(b.status),
    emailVerified: b.status !== 'inactive',
    createdAt: b.joinedAt,
    trustScore: b.status === 'suspended' ? 10 : 45,
    maxTrustScore: 100,
    brandProfile: { companyName: b.name, industry: b.industry },
  }));
  return [...creators, ...brands];
}

const PIPELINE_STATUS = {
  draft: 'DRAFT',
  published: 'PUBLISHED',
  applications: 'PUBLISHED',
  selected: 'PUBLISHED',
  in_progress: 'PUBLISHED',
  under_review: 'PAUSED',
  completed: 'COMPLETED',
  archived: 'COMPLETED',
};

function mockCampaigns() {
  return CAMPAIGNS.map((c) => ({
    id: c.id,
    title: c.name,
    status: PIPELINE_STATUS[c.pipelineStage] || 'PUBLISHED',
    budgetPKR: c.budget,
    budgetType: 'FIXED',
    budgetMin: null,
    budgetMax: null,
    brand: { companyName: c.brand },
    createdAt: new Date(Date.now() - (c.age || 10) * 86400000).toISOString(),
  }));
}

function mockReportStatus(raw) {
  const s = (raw || '').toLowerCase();
  if (s === 'resolved') return 'RESOLVED';
  if (s === 'dismissed') return 'DISMISSED';
  return 'OPEN';
}

function mockUserFromInfo(info) {
  if (!info) return { email: 'unknown@demo.local' };
  const isCreator = info.type === 'Creator';
  const slug = (info.handle || info.name || 'user').replace(/^@/, '').toLowerCase().replace(/\s+/g, '');
  return {
    email: `${slug}@demo.local`,
    role: isCreator ? 'CREATOR' : 'BRAND',
    ...(isCreator
      ? { creatorProfile: { displayName: info.name } }
      : { brandProfile: { companyName: info.name } }),
  };
}

function mockReports() {
  return REPORTS.map((r) => ({
    id: r.id,
    status: mockReportStatus(r.status),
    violationType: r.category?.toUpperCase().replace(/\s+/g, '_') || 'OTHER',
    description: r.description,
    createdAt: r.createdDate,
    reporter: mockUserFromInfo(r.reporterInfo),
    reportedUser: mockUserFromInfo(r.reportedInfo),
  }));
}

const REPORT_LIST = mockReports();

function mockAnalytics() {
  const kpiMap = Object.fromEntries(EXECUTIVE_KPIS.map((k) => [k.id, k]));
  const activityMap = Object.fromEntries(MARKETPLACE_ACTIVITY.map((a) => [a.id, a]));
  const trustMap = Object.fromEntries(TRUST_SAFETY.map((t) => [t.id, t]));

  return {
    kpis: {
      totalUsers:      { value: kpiMap.totalUsers?.value ?? 0, changePct: 8.2 },
      activeCreators:  { value: kpiMap.activeCreators?.value ?? 0, changePct: 5.1 },
      activeBrands:    { value: kpiMap.activeBrands?.value ?? 0, changePct: 7.8 },
      activeCampaigns: { value: kpiMap.activeCampaigns?.value ?? 0, changePct: 10.3 },
      monthlyRevenue:  { value: kpiMap.monthlyRevenue?.value ?? 0 },
      gmv:             { value: REVENUE_SUMMARY.gmv },
    },
    platformHealth: PLATFORM_HEALTH,
    marketplaceActivityToday: {
      campaignsToday: activityMap.campaignsToday?.value ?? 0,
      collabsStarted: activityMap.collabsStarted?.value ?? 0,
      messagesToday: activityMap.messagesToday?.value ?? 0,
      paymentsReleasedToday: activityMap.paymentsReleased?.value ?? 0,
    },
    growthSeries: getGrowthSeries('30d'),
    revenue: REVENUE_SUMMARY,
    trustSafety: {
      pendingReports: trustMap.pendingReports?.value ?? 0,
      resolvedReports: 142,
      paymentDisputes: trustMap.paymentDisputes?.value ?? 0,
    },
    feed: getLiveFeed(20).map((e) => ({
      id: e.id,
      type: e.type === 'safety' ? 'report' : e.type.replace(/s$/, ''),
      text: e.text,
      timestamp: e.timestamp,
    })),
  };
}

function mockPayments() {
  return TRANSACTIONS.map((t) => ({
    id: t.id,
    amountPKR: t.amount,
    status: t.status?.toUpperCase() || 'RELEASED',
    disputeReason: null,
    createdAt: t.date,
    collaboration: {
      campaign: { title: t.campaign },
      creator: { creatorProfile: { displayName: t.creator } },
      brand: { brandProfile: { companyName: t.brand } },
    },
  }));
}

function mockSettings() {
  const out = {};
  for (const section of Object.values(SETTINGS_SCHEMA)) {
    for (const group of section) {
      for (const field of group.fields) {
        out[field.id] = field.value;
      }
    }
  }
  return out;
}

function filterUsers(users, url) {
  const params = new URLSearchParams((url || '').split('?')[1] || '');
  let list = users;
  const role = params.get('role');
  const status = params.get('status');
  const q = params.get('q')?.toLowerCase();
  if (role) list = list.filter((u) => u.role === role);
  if (status) list = list.filter((u) => u.status === status);
  if (q) {
    list = list.filter((u) =>
      `${u.email} ${u.creatorProfile?.displayName || ''} ${u.brandProfile?.companyName || ''}`.toLowerCase().includes(q)
    );
  }
  return list;
}

function filterCampaigns(campaigns, url) {
  const params = new URLSearchParams((url || '').split('?')[1] || '');
  const status = params.get('status');
  if (!status) return campaigns;
  return campaigns.filter((c) => c.status === status);
}

const USERS = mockUsers();
const CAMPAIGN_LIST = mockCampaigns();
function mockVerifications() {
  const now = Date.now();
  const day = 86400000;
  return [
    {
      id: 'ver-1',
      userId: 'u-c1',
      type: 'nic',
      status: 'PENDING',
      submittedAt: new Date(now - 2 * day).toISOString(),
      data: {
        fullName: 'Laiba Khan',
        nicNumber: '35202-1234567-1',
        frontUrl: 'https://placehold.co/640x400/1a1a2e/94a3b8?text=CNIC+Front',
        backUrl: 'https://placehold.co/640x400/1a1a2e/94a3b8?text=CNIC+Back',
        frontImageUrl: 'https://placehold.co/640x400/1a1a2e/94a3b8?text=CNIC+Front',
        backImageUrl: 'https://placehold.co/640x400/1a1a2e/94a3b8?text=CNIC+Back',
      },
      user: {
        id: 'u-c1',
        email: 'laiba.khan@example.com',
        role: 'CREATOR',
        status: 'APPROVED',
        creatorProfile: { displayName: 'Laiba Khan', username: 'laibak' },
      },
    },
    {
      id: 'ver-2',
      userId: 'u-b1',
      type: 'business',
      status: 'UNDER_REVIEW',
      submittedAt: new Date(now - 1 * day).toISOString(),
      data: { legalName: 'TechVault PK (Pvt) Ltd', registrationNumber: 'SECP-2021-44821', documentIds: ['doc-reg-1'] },
      user: {
        id: 'u-b1',
        email: 'ops@techvault.pk',
        role: 'BRAND',
        status: 'APPROVED',
        brandProfile: { companyName: 'TechVault PK', industry: 'Technology' },
      },
    },
    {
      id: 'ver-3',
      userId: 'u-b2',
      type: 'domain',
      status: 'PENDING',
      submittedAt: new Date(now - 5 * day).toISOString(),
      data: { domain: 'stylehouse.pk', challengeToken: 'cc-verify=abc123def456' },
      user: {
        id: 'u-b2',
        email: 'hello@stylehouse.pk',
        role: 'BRAND',
        status: 'APPROVED',
        brandProfile: { companyName: 'StyleHouse', industry: 'Fashion' },
      },
    },
    {
      id: 'ver-4',
      userId: 'u-c2',
      type: 'social_instagram',
      status: 'PENDING',
      submittedAt: new Date(now - 3 * day).toISOString(),
      data: { platform: 'Instagram', profileUrl: 'https://instagram.com/alihassan' },
      user: {
        id: 'u-c2',
        email: 'ali.hassan@example.com',
        role: 'CREATOR',
        status: 'APPROVED',
        creatorProfile: { displayName: 'Ali Hassan', username: 'alihassan' },
      },
    },
  ];
}

function filterVerifications(items, url) {
  const params = new URLSearchParams((url || '').split('?')[1] || '');
  let list = [...items];
  const status = params.get('status');
  if (status) {
    const allowed = status.split(',').map((s) => s.trim().toUpperCase());
    list = list.filter((v) => allowed.includes(v.status));
  } else {
    list = list.filter((v) => ['PENDING', 'UNDER_REVIEW'].includes(v.status));
  }
  const type = params.get('type');
  if (type === 'social') list = list.filter((v) => String(v.type).startsWith('social_'));
  else if (type) list = list.filter((v) => v.type === type);
  return list;
}

const VERIFICATION_LIST = mockVerifications();

function mockContent() {
  const now = Date.now();
  return [
    {
      id: 'cnt-1',
      title: 'Summer OOTD Reel',
      type: 'video',
      fileType: 'video',
      platform: 'INSTAGRAM',
      status: 'PENDING',
      moderationStatus: 'PENDING',
      fileUrl: 'https://placehold.co/640x800/1a1a2e/94a3b8?text=Reel+Preview',
      thumbnailUrl: 'https://placehold.co/640x800/1a1a2e/94a3b8?text=Reel+Preview',
      createdAt: new Date(now - 2 * 86400000).toISOString(),
      creator: {
        displayName: 'Laiba Khan',
        username: 'laibak',
        creatorProfile: { displayName: 'Laiba Khan', username: 'laibak' },
        email: 'laiba@example.com',
      },
    },
    {
      id: 'cnt-2',
      title: 'Tech Unboxing',
      type: 'photo',
      fileType: 'image',
      platform: 'YOUTUBE',
      status: 'APPROVED',
      moderationStatus: 'APPROVED',
      fileUrl: 'https://placehold.co/640x480/1a1a2e/94a3b8?text=Photo',
      thumbnailUrl: 'https://placehold.co/640x480/1a1a2e/94a3b8?text=Photo',
      createdAt: new Date(now - 5 * 86400000).toISOString(),
      creator: {
        displayName: 'Ali Hassan',
        username: 'alihassan',
        creatorProfile: { displayName: 'Ali Hassan', username: 'alihassan' },
        email: 'ali@example.com',
      },
    },
  ];
}

function filterContent(items, url) {
  const params = new URLSearchParams((url || '').split('?')[1] || '');
  let list = [...items];
  const status = params.get('status');
  if (status) list = list.filter((i) => i.status === status.toUpperCase());
  const q = params.get('q');
  if (q) {
    const needle = q.toLowerCase();
    list = list.filter((i) => {
      const name = i.creator?.displayName || i.creator?.email || '';
      return name.toLowerCase().includes(needle);
    });
  }
  return list;
}

const CONTENT_LIST = mockContent();

/**
 * @returns {{ data: unknown, meta?: object } | null}
 */
export function getAdminMockResponse(method, url) {
  const m = (method || 'get').toLowerCase();
  const path = (url || '').split('?')[0];

  if (m === 'get' && /\/analytics\/admin$/.test(path)) {
    return { data: mockAnalytics() };
  }

  if (m === 'get' && /\/admin\/users$/.test(path)) {
    return paginate(filterUsers(USERS, url), url);
  }

  if (m === 'get' && /\/admin\/verifications$/.test(path)) {
    return paginate(filterVerifications(VERIFICATION_LIST, url), url);
  }

  if (m === 'get' && /\/admin\/verifications\/[^/]+$/.test(path)) {
    const id = path.split('/').pop();
    const item = VERIFICATION_LIST.find((v) => v.id === id);
    return item ? { data: item } : { data: null };
  }

  if (m === 'get' && /\/admin\/campaigns$/.test(path)) {
    return paginate(filterCampaigns(CAMPAIGN_LIST, url), url);
  }

  if (m === 'get' && /\/admin\/reports$/.test(path)) {
    return paginate(REPORT_LIST, url);
  }

  if (m === 'get' && /\/admin\/payments$/.test(path)) {
    return paginate(mockPayments(), url);
  }

  if (m === 'get' && /\/admin\/subscriptions$/.test(path)) {
    return paginate([
      { id: 'sub-1', role: 'BRAND', planTier: 'PRO', status: 'ACTIVE' },
      { id: 'sub-2', role: 'CREATOR', planTier: 'PRO', status: 'ACTIVE' },
    ], url);
  }

  if (m === 'get' && /\/admin\/revenue$/.test(path)) {
    return {
      data: {
        ...REVENUE_SUMMARY,
        disputes: PAYMENT_DISPUTES.slice(0, 3),
        activeSubscriptions: 2,
      },
    };
  }

  if (m === 'get' && /\/admin\/tickets$/.test(path)) {
    return paginate(TICKETS, url);
  }

  if (m === 'get' && /\/admin\/settings$/.test(path)) {
    return { data: mockSettings() };
  }

  if (m === 'get' && /\/admin\/content$/.test(path)) {
    return paginate(filterContent(CONTENT_LIST, url), url);
  }

  if (m === 'get' && /\/admin\/audit-logs$/.test(path)) {
    return paginate([
      { id: 'log-1', action: 'USER_STATUS_UPDATED', entity: 'user', createdAt: new Date().toISOString() },
    ], url);
  }

  if (m === 'get' && /\/admin\/notifications\/failed$/.test(path)) {
    return paginate([
      {
        id: 'notif-fail-1',
        message: 'Payout system maintenance reminder',
        audience: 'CREATORS',
        type: 'SYSTEM',
        status: 'FAILED',
        recipientCount: 0,
        createdAt: new Date(Date.now() - 86400000).toISOString(),
      },
    ], url);
  }

  if (m === 'get' && /\/admin\/notifications$/.test(path)) {
    return paginate([
      {
        id: 'notif-1',
        message: 'Welcome to CreConnect — complete your profile to get discovered.',
        audience: 'ALL',
        type: 'ANNOUNCEMENT',
        status: 'SENT',
        recipientCount: 1284,
        createdAt: new Date(Date.now() - 3600000).toISOString(),
      },
      {
        id: 'notif-2',
        message: 'New escrow release workflow is now live for all brand accounts.',
        audience: 'BRANDS',
        type: 'SYSTEM',
        status: 'SENT',
        recipientCount: 312,
        createdAt: new Date(Date.now() - 86400000 * 2).toISOString(),
      },
      {
        id: 'notif-3',
        message: 'Scheduled maintenance Sunday 2am PKT — brief downtime expected.',
        audience: 'ALL',
        type: 'ANNOUNCEMENT',
        status: 'PENDING',
        recipientCount: 0,
        deliveryMode: 'SCHEDULED',
        scheduledAt: new Date(Date.now() + 86400000 * 3).toISOString(),
        createdAt: new Date(Date.now() - 86400000).toISOString(),
      },
    ], url);
  }

  if (m === 'post' && /\/admin\/notifications\/push$/.test(path)) {
    return { data: { id: `notif-${Date.now()}`, status: 'SENT', sent: true } };
  }

  if (m === 'post' && /\/admin\/announce$/.test(path)) {
    return { data: { sent: true } };
  }

  if (/^\/admin\//.test(path) && ['patch', 'post'].includes(m)) {
    return { data: { ok: true } };
  }

  return null;
}
