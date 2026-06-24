/* ─────────────────────────────────────────────────────────────
   Mock data – mirrors the hardcoded content from the original
   static HTML prototype. Replace every value with real API
   responses once the Node.js backend is available.
   ───────────────────────────────────────────────────────────── */

export const MOCK_CREATORS = [
  {
    id: 'c1',
    displayName: 'Laiba Khan',
    username: '@laibakhan',
    niche: 'Fashion & Lifestyle',
    followerCount: 355000,
    engagementRate: 0.08,
    avatarInitials: 'LK',
    avatarColor: '#6a9ab0',
    rating: 4.8,
    isVerified: true,
    matchScore: 92,
    authenticityScore: 88,
    whyMatched: ['High engagement in Fashion niche', 'Target audience 18–28 F', 'Previous luxury brand collabs'],
    platforms: [
      { name: 'instagram', url: 'instagram.com/laibakhan', isConnected: true },
      { name: 'tiktok',    url: 'tiktok.com/laibakhan',   isConnected: true },
    ],
  },
  {
    id: 'c2',
    displayName: 'John Freak',
    username: '@johnfreak',
    niche: 'Gaming',
    followerCount: 301000,
    engagementRate: 0.075,
    avatarInitials: 'JF',
    avatarColor: '#3a6d8c',
    rating: 4.5,
    isVerified: true,
    matchScore: 85,
    authenticityScore: 91,
    whyMatched: ['Top gaming creator in your target market', '18–35 M audience', 'Consistent upload schedule'],
    platforms: [
      { name: 'youtube', url: 'youtube.com/johnfreak', isConnected: true },
    ],
  },
  {
    id: 'c3',
    displayName: 'Ayesha Hussain',
    username: '@ayeshahussain',
    niche: 'Beauty & Lifestyle',
    followerCount: 255000,
    engagementRate: 0.08,
    avatarInitials: 'AH',
    avatarColor: '#4d85a8',
    rating: 4.7,
    isVerified: true,
    matchScore: 89,
    authenticityScore: 85,
    whyMatched: ['Beauty niche alignment', 'High story completion rate', 'Authentic product reviews'],
    platforms: [
      { name: 'instagram', url: 'instagram.com/ayeshahussain', isConnected: true },
      { name: 'tiktok',    url: 'tiktok.com/ayeshahussain',   isConnected: true },
    ],
  },
  {
    id: 'c4',
    displayName: 'Syed Usman',
    username: '@syedusman',
    niche: 'Blogger',
    followerCount: 200000,
    engagementRate: 0.069,
    avatarInitials: 'SU',
    avatarColor: '#001f3f',
    rating: 4.3,
    isVerified: false,
    matchScore: 74,
    authenticityScore: 79,
    whyMatched: ['Long-form content expertise', 'SEO-optimised posts', 'Engaged newsletter subscribers'],
    platforms: [
      { name: 'youtube', url: 'youtube.com/syedusman', isConnected: true },
    ],
  },
  {
    id: 'c5',
    displayName: 'Ushna Khan',
    username: '@ushnakhan',
    niche: 'Fashion / Lifestyle',
    followerCount: 120000,
    engagementRate: 0.048,
    avatarInitials: 'UK',
    avatarColor: '#8db4c8',
    rating: 4.9,
    isVerified: true,
    matchScore: 96,
    authenticityScore: 93,
    whyMatched: ['Perfect niche fit for your campaign', 'Ultra-high authenticity score', 'Micro-influencer premium CPE'],
    platforms: [],
  },
  {
    id: 'c6',
    displayName: 'Junaid Afzal',
    username: '@junaidafzal',
    niche: 'Tech / Gaming',
    followerCount: 85000,
    engagementRate: 0.057,
    avatarInitials: 'JA',
    avatarColor: '#6a9ab0',
    rating: 4.6,
    isVerified: true,
    matchScore: 81,
    authenticityScore: 87,
    whyMatched: ['Tech-savvy audience', 'Strong review credibility', 'Cross-platform presence'],
    platforms: [],
  },
];

export const MOCK_CAMPAIGNS = [
  {
    id: 'camp1',
    title: 'Summer Collection',
    status: 'pending',
    budgetPKR: 240130,
    brandName: 'AL_KARAM CLOTHING',
    createdAt: '2024-05-01T00:00:00Z',
    deadline: '2024-08-31T00:00:00Z',
  },
  {
    id: 'camp2',
    title: 'New Product Launch',
    status: 'accepted',
    budgetPKR: 26000,
    brandName: 'UNIQUE HAIR CARE',
    createdAt: '2024-04-15T00:00:00Z',
    deadline: '2024-07-15T00:00:00Z',
  },
  {
    id: 'camp3',
    title: 'Brand Awareness',
    status: 'accepted',
    budgetPKR: 10000,
    brandName: 'BOLD BURGER',
    createdAt: '2024-03-01T00:00:00Z',
    deadline: '2024-06-30T00:00:00Z',
  },
  {
    id: 'camp4',
    title: 'Holiday Campaign',
    status: 'completed',
    budgetPKR: 10000,
    brandName: 'HANI TRAVELS',
    createdAt: '2023-12-01T00:00:00Z',
    deadline: '2024-01-15T00:00:00Z',
  },
];

export const MOCK_OFFERS = [
  {
    id: 'off1',
    brand: 'TechStyle Pro',
    description: 'Tech accessories collaboration – Content creation for new product line',
    amount: 1200,
    currency: 'USD',
    offerType: 'Sponsored Post',
    status: 'new',
  },
  {
    id: 'off2',
    brand: 'BeautyBox Monthly',
    description: 'Monthly subscription box review and unboxing video',
    amount: 800,
    currency: 'USD',
    offerType: 'Video Review',
    status: 'new',
  },
  {
    id: 'off3',
    brand: 'FashionForward',
    description: 'Spring collection showcase – Multiple posts required',
    amount: 1500,
    currency: 'USD',
    offerType: 'Campaign',
    status: 'pending',
    pendingMessage: 'Awaiting Brand Response',
  },
  {
    id: 'off4',
    brand: 'HealthHub',
    description: 'Wellness product partnership for Q1',
    amount: 2000,
    currency: 'USD',
    offerType: 'Long-term',
    status: 'pending',
    pendingMessage: 'Under Review',
  },
];

export const MOCK_CHATS = [
  { id: 'ch1', name: 'Brand Audionic',  initials: 'BA', lastMessage: 'Click to start chatting', time: 'now', active: true  },
  { id: 'ch2', name: "Men's Clothing",  initials: 'A',  lastMessage: 'Thanks for the mention!',           time: '1h'  },
  { id: 'ch3', name: 'Fashion Ladies',  initials: 'FM', lastMessage: 'When can we schedule the shoot?',   time: '3h'  },
  { id: 'ch4', name: 'Sveston Watches', initials: 'TB', lastMessage: 'Did you get the product?',          time: '5h'  },
  { id: 'ch5', name: 'Seena Shoes',     initials: 'SG', lastMessage: 'Can you send me the contract?',     time: '1d'  },
  { id: 'ch6', name: 'Famous O',        initials: 'BC', lastMessage: 'Your content was amazing!',         time: '2d'  },
];

export const MOCK_NOTIFICATIONS = [
  { id: 'n1', type: 'offer',   message: 'TechStyle Pro sent you a new collaboration offer', time: '10m'  },
  { id: 'n2', type: 'accept',  message: 'BeautyBox Monthly accepted your application',       time: '2h'   },
  { id: 'n3', type: 'message', message: "Brand Audionic sent you a message",                 time: '3h'   },
  { id: 'n4', type: 'system',  message: 'Your profile was reviewed and approved',            time: '1d'   },
];

export const MOCK_ADMIN_CREATORS = [
  { id: 'ac1', name: 'Nancy Lee',     initial: 'N', color: 'bg-green-500',  niche: 'Fitness', rating: '8/10',   status: 'approved' },
  { id: 'ac2', name: 'James Miller',  initial: 'J', color: 'bg-pink-500',   niche: 'Travel',  rating: '7/10',   status: 'pending'  },
  { id: 'ac3', name: 'Sarah Johnson', initial: 'S', color: 'bg-blue-500',   niche: 'Fashion', rating: '4.5/10', status: 'approved' },
];

export const MOCK_ADMIN_BRANDS = [
  { id: 'ab1', name: 'TechWave',   initial: 'T', color: 'bg-yellow-500', isVerified: true,  status: 'approved' },
  { id: 'ab2', name: 'FitGear Pro',initial: 'F', color: 'bg-purple-500', isVerified: true,  status: 'approved' },
  { id: 'ab3', name: 'EcoStyle',   initial: 'E', color: 'bg-orange-500', isVerified: false, status: 'pending'  },
];

export const MOCK_ADMIN_STATS = {
  totalCollaborations:  3000,
  activeCollaborations: 600,
  pendingRequests:      120,
  reportedUsers:        25,
};

export const MOCK_BRAND_STATS = {
  totalCampaigns:       5,
  activeCollaborations: 3,
  pendingOffers:        2,
  messagesWaiting:      4,
};

export const MOCK_CREATOR_STATS = {
  followers:        128000,
  engagementRate:   0.034,
  activeCampaigns:  6,
  pendingOffers:    5,
};

/* ── Time-series analytics (last 7 days) ── */
const DAYS = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];

export const MOCK_BRAND_ANALYTICS = {
  /* sparkline for creator reach stat card */
  reachSeries:       [28, 34, 30, 45, 52, 48, 60],
  /* campaign performance bar chart */
  campaignPerf: DAYS.map((day, i) => ({
    day,
    impressions: [1200, 1450, 1100, 1800, 2100, 1950, 2400][i],
    clicks:      [320,  410,  290,  520,  680,  590,  740][i],
  })),
  /* weekly spend line */
  spendSeries: DAYS.map((day, i) => ({
    day,
    spend: [4200, 5100, 3800, 6400, 7200, 6100, 8500][i],
  })),
  /* top niches breakdown */
  nicheBreakdown: [
    { niche: 'Fashion',   pct: 38 },
    { niche: 'Beauty',    pct: 24 },
    { niche: 'Tech',      pct: 18 },
    { niche: 'Lifestyle', pct: 12 },
    { niche: 'Food',      pct: 8  },
  ],
};

export const MOCK_CREATOR_ANALYTICS = {
  /* engagement sparkline */
  engagementSeries:  [2.8, 3.1, 2.9, 3.4, 3.7, 4.1, 4.5],
  /* post performance bar chart */
  postPerf: DAYS.map((day, i) => ({
    day,
    likes:    [420,  610,  380,  720,  880,  760,  950][i],
    comments: [38,   52,   29,   64,   91,   73,   108][i],
    shares:   [18,   27,   14,   33,   48,   39,   55][i],
  })),
  /* follower growth */
  followerGrowth: DAYS.map((day, i) => ({
    day,
    followers: [124200, 124800, 125100, 125700, 126400, 127100, 128000][i],
  })),
  /* platform split */
  platformSplit: [
    { platform: 'Instagram', pct: 52 },
    { platform: 'TikTok',    pct: 30 },
    { platform: 'YouTube',   pct: 18 },
  ],
};

export const MOCK_ADMIN_ANALYTICS = {
  /* platform growth line (last 6 months) */
  growth: ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun'].map((month, i) => ({
    month,
    brands:   [40,  62,  80,  110, 145, 180][i],
    creators: [110, 160, 210, 280, 350, 420][i],
  })),
  /* collab completion rate over months */
  collabRate: ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun'].map((month, i) => ({
    month,
    rate: [72, 75, 78, 80, 83, 86][i],
  })),
};
