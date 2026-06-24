/**
 * Fallback API responses used when the backend is unreachable and the
 * current session is a local demo account (see demoAccounts.js). These let
 * every page render real-looking content — or at least an empty/loading-free
 * state — instead of an error screen.
 */

const DEMO_CREATOR_PROFILE = {
  id: 'demo-creator-1',
  userId: 'demo-creator-1',
  username: 'laibakhan',
  displayName: 'Laiba Khan',
  email: 'laiba@creconnect.com',
  bio: 'Lifestyle & beauty content creator based in Lahore, sharing daily routines, product reviews, and travel diaries.',
  avatarUrl: '',
  location: 'Lahore, Pakistan',
  niche: 'Beauty & Lifestyle',
  isVerified: true,
  availability: 'Available',
  languages: ['English', 'Urdu'],
  contentStyle: ['Reels', 'Tutorials', 'Vlogs'],
  websiteUrl: '',
  platforms: [
    { id: 'p1', platform: 'Instagram', handle: '@laibakhan', followerCount: 85000, engagementRate: 4.2 },
    { id: 'p2', platform: 'TikTok', handle: '@laibakhan', followerCount: 132000, engagementRate: 6.1 },
    { id: 'p3', platform: 'YouTube', handle: 'Laiba Khan', followerCount: 24000, engagementRate: 3.5 },
  ],
  metrics: {
    totalFollowers: 241000,
    avgEngagementRate: 4.6,
    activeCollaborations: 2,
  },
};

const DEMO_BRAND_PROFILE = {
  id: 'demo-brand-1',
  companyName: 'TechWave',
  brandName: 'TechWave',
  tagline: 'Innovating everyday tech for everyone.',
  industry: 'Technology',
  description: 'TechWave designs and markets consumer electronics and smart-home gadgets across Pakistan.',
  foundedYear: '2018',
  companySize: '51-200',
  location: 'Karachi, Pakistan',
  website: 'https://techwave.example.com',
  logoUrl: '',
  brandColor: '#6d5cff',
  isVerified: true,
  user: { email: 'techwave@creconnect.com' },
};

const DEMO_CREATOR_STATS = { totalEarnings: 285000, completedCollaborations: 14, avgRating: 4.7 };
const DEMO_BRAND_STATS = { totalCampaigns: 8, activeCollaborations: 3, totalSpend: 540000 };

const DEMO_CREATOR_ANALYTICS = {
  metrics: { activeCollaborations: 2 },
  platforms: DEMO_CREATOR_PROFILE.platforms.map((p) => ({
    followerCount: p.followerCount,
    engagementRate: p.engagementRate,
  })),
  earningsSeries: [12000, 18000, 15000, 22000, 19000, 26000, 24000].map((amount) => ({ amount })),
};

const DEMO_BRAND_ANALYTICS = {
  metrics: {
    totalCampaigns: 8,
    activeCollaborations: 3,
    pendingOffers: 2,
    messagesWaiting: 5,
    totalSpend: 540000,
    totalReach: 1850000,
  },
  spendSeries: [40000, 55000, 48000, 62000, 58000, 71000, 67000].map((amount) => ({ amount })),
  reachSeries: [180000, 210000, 195000, 240000, 225000, 260000, 250000].map((value) => ({ value })),
};

const EMPTY_LIST = { data: [], pagination: { total: 0, page: 1, limit: 20 } };

const SPECIFIC_MOCKS = [
  // ── Creator profile & stats ───────────────────────────────────
  { method: 'get', pattern: /\/creators\/me$/, data: DEMO_CREATOR_PROFILE },
  { method: 'get', pattern: /\/creators\/me\/stats$/, data: DEMO_CREATOR_STATS },
  { method: 'get', pattern: /\/creators\/me\/collaborations/, data: EMPTY_LIST },
  { method: 'get', pattern: /\/creators\/me\/offers/, data: [] },
  { method: 'get', pattern: /\/creators\/me\/applications/, data: [] },
  { method: 'get', pattern: /\/creators\/me\/media/, data: [] },
  { method: 'get', pattern: /\/creators\/me\/platforms/, data: [] },
  { method: 'get', pattern: /\/creators\/[^/]+$/, data: { ...DEMO_CREATOR_PROFILE, collaborations: [], reviews: [] } },

  // ── Brand profile & stats ─────────────────────────────────────
  { method: 'get', pattern: /\/brands\/me$/, data: DEMO_BRAND_PROFILE },
  { method: 'get', pattern: /\/brands\/me\/stats$/, data: DEMO_BRAND_STATS },
  { method: 'get', pattern: /\/brands\/me\/campaigns/, data: EMPTY_LIST },
  { method: 'get', pattern: /\/brands\/me\/collaborations/, data: EMPTY_LIST },
  { method: 'get', pattern: /\/brands\/me\/applications/, data: EMPTY_LIST },
  { method: 'get', pattern: /\/brands\/list/, data: EMPTY_LIST },
  { method: 'get', pattern: /\/brands\/me\/media/, data: [] },

  // ── Analytics ─────────────────────────────────────────────────
  { method: 'get', pattern: /\/analytics\/creator$/, data: DEMO_CREATOR_ANALYTICS },
  { method: 'get', pattern: /\/analytics\/brand$/, data: DEMO_BRAND_ANALYTICS },
  { method: 'get', pattern: /\/analytics\/admin$/, data: { metrics: {} } },

  // ── Campaigns ─────────────────────────────────────────────────
  { method: 'get', pattern: /\/campaigns\/[^/]+\/applications/, data: { data: [] } },
  { method: 'get', pattern: /\/campaigns$/, data: EMPTY_LIST },
  { method: 'get', pattern: /\/campaigns\//, data: null },

  // ── Messages ──────────────────────────────────────────────────
  { method: 'get', pattern: /\/messages\/unread-count/, data: { count: 0 } },
  { method: 'get', pattern: /\/messages\/conversations\/[^/]+\/messages/, data: { data: [] } },
  { method: 'get', pattern: /\/messages\/conversations/, data: { data: [] } },

  // ── Notifications ─────────────────────────────────────────────
  { method: 'get', pattern: /\/notifications\/unread-count/, data: { count: 0 } },
  { method: 'get', pattern: /\/notifications/, data: [] },
  { method: 'post', pattern: /\/notifications\/self/, data: {} },

  // ── Matching ──────────────────────────────────────────────────
  { method: 'get', pattern: /\/matching\/recommended/, data: [] },
  { method: 'get', pattern: /\/matching\/campaign\//, data: [] },

  // ── Search ────────────────────────────────────────────────────
  { method: 'get', pattern: /\/search\//, data: EMPTY_LIST },

  // ── Payments ──────────────────────────────────────────────────
  { method: 'get', pattern: /\/payments\/history/, data: EMPTY_LIST },

  // ── Verification ─────────────────────────────────────────────
  { method: 'get', pattern: /\/verification\/status/, data: { verifications: [] } },
  { method: 'get', pattern: /\/verification\/history/, data: [] },
  { method: 'post', pattern: /\/verification\//, data: { status: 'pending', submittedAt: new Date().toISOString() } },
  { method: 'post', pattern: /\/upload\/verification\//, data: { documentId: 'demo-doc', secureUrl: '' } },

  // ── Social platform ───────────────────────────────────────────
  { method: 'get', pattern: /\/social\/[^/]+\/auth-url/, data: { url: null, configured: false } },
  { method: 'get', pattern: /\/social\/platforms\/[^/]+\/posts/, data: [] },

  // ── Admin ─────────────────────────────────────────────────────
  { method: 'get', pattern: /\/admin\/(users|content|reports|audit-logs)/, data: EMPTY_LIST },
];

/**
 * Returns a mocked `{ data }` response for the given request, or `null` if
 * no fallback is defined for this method/url combination.
 */
export function getMockApiResponse(method, url) {
  const m = (method || 'get').toLowerCase();
  const path = url.split('?')[0];

  for (const mock of SPECIFIC_MOCKS) {
    if (mock.method === m && mock.pattern.test(path)) {
      return { data: mock.data };
    }
  }

  // Generic fallback: writes resolve to an empty object, unmatched reads to null
  if (m === 'get') return { data: null };
  return { data: {} };
}
