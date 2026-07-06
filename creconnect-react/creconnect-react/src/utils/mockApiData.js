/**
 * Fallback API responses used when the backend is unreachable and the
 * current session is a local demo account (see demoAccounts.js). These let
 * every page render real-looking content instead of an error screen.
 */

/* ── Helpers ─────────────────────────────────────────────────────────── */
const daysAgo   = (n) => new Date(Date.now() - n * 86_400_000).toISOString();
const daysAhead = (n) => new Date(Date.now() + n * 86_400_000).toISOString().slice(0, 10);

/* ── Creator profile ─────────────────────────────────────────────────── */
const DEMO_CREATOR_PROFILE = {
  id: 'demo-creator-1',
  userId: 'demo-creator-1',
  username: 'laibakhan',
  displayName: 'Laiba Khan',
  email: 'laiba@creconnect.com',
  bio: 'Lifestyle & beauty content creator based in Lahore 🌸 Sharing daily routines, honest product reviews, travel diaries & beauty tips. Partnered with 14+ brands.',
  avatarUrl: '',
  location: 'Lahore, Pakistan',
  niche: 'Beauty & Lifestyle',
  isVerified: true,
  availability: 'Available',
  languages: ['English', 'Urdu'],
  contentStyle: ['Reels', 'Tutorials', 'Vlogs', 'Reviews'],
  websiteUrl: 'https://laibakhan.pk',
  platforms: [
    { id: 'p1', platform: 'Instagram', handle: '@laibakhan.pk',  followerCount: 85000,  engagementRate: 4.2, verified: true  },
    { id: 'p2', platform: 'TikTok',    handle: '@laibakhan',     followerCount: 132000, engagementRate: 6.1, verified: true  },
    { id: 'p3', platform: 'YouTube',   handle: 'Laiba Khan',     followerCount: 24000,  engagementRate: 3.5, verified: false },
  ],
  metrics: { totalFollowers: 241000, avgEngagementRate: 4.6, activeCollaborations: 2 },
};

/* ── Brand profile ───────────────────────────────────────────────────── */
const DEMO_BRAND_PROFILE = {
  id: 'demo-brand-1',
  companyName: 'TechWave',
  brandName: 'TechWave',
  tagline: 'Innovating everyday tech for everyone.',
  industry: 'Technology',
  description: 'TechWave designs and markets consumer electronics and smart-home gadgets across Pakistan. We partner with creators who share our passion for making technology accessible to all.',
  foundedYear: '2018',
  companySize: '51–200',
  location: 'Karachi, Pakistan',
  website: 'https://techwave.example.com',
  logoUrl: '',
  brandColor: '#6d5cff',
  isVerified: true,
  user: { email: 'techwave@creconnect.com' },
};

/* ── Stats ───────────────────────────────────────────────────────────── */
const DEMO_CREATOR_STATS = { totalEarnings: 285000, completedCollaborations: 14, avgRating: 4.7 };
const DEMO_BRAND_STATS   = { totalCampaigns: 8, activeCollaborations: 3, totalSpend: 540000 };

/* ── Analytics ───────────────────────────────────────────────────────── */
const DEMO_CREATOR_ANALYTICS = {
  metrics: { activeCollaborations: 2, totalFollowers: 241000, avgEngagementRate: 4.6 },
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

/* ── Campaigns ───────────────────────────────────────────────────────── */
const DEMO_CAMPAIGNS = [
  {
    id: 'c1', title: 'Summer Tech Unboxing',
    description: 'Unbox and review our new SmartHub Pro device on Instagram Reels and TikTok. Show setup, features, and day-to-day use. Authentic reactions preferred!',
    objective: 'AWARENESS', niche: 'TECH', platforms: ['INSTAGRAM', 'TIKTOK'],
    budgetType: 'FIXED', budgetPKR: 75000, reels: 2, posts: 1, stories: 3, videos: 0, livestreams: 0,
    status: 'PUBLISHED', applications: 12, createdAt: daysAgo(5),
    brand: { companyName: 'TechWave', logoUrl: '' },
  },
  {
    id: 'c2', title: 'Ramadan Beauty Routine',
    description: 'Create a full Ramadan morning/evening skincare routine featuring our new moisturiser line. Authentic storytelling and real skin results preferred.',
    objective: 'ENGAGEMENT', niche: 'BEAUTY', platforms: ['INSTAGRAM', 'YOUTUBE'],
    budgetType: 'RANGE', budgetPKR: 50000, reels: 1, posts: 2, stories: 5, videos: 1, livestreams: 0,
    status: 'PUBLISHED', applications: 28, createdAt: daysAgo(8),
    brand: { companyName: 'GlowUp Cosmetics', logoUrl: '' },
  },
  {
    id: 'c3', title: 'Fit Life 30-Day Challenge',
    description: '30-day fitness challenge content series promoting our new protein supplement. Daily workout clips + honest supplement review at the end of the challenge.',
    objective: 'SALES', niche: 'FITNESS', platforms: ['TIKTOK', 'INSTAGRAM'],
    budgetType: 'FIXED', budgetPKR: 90000, reels: 4, posts: 2, stories: 10, videos: 0, livestreams: 0,
    status: 'PUBLISHED', applications: 7, createdAt: daysAgo(3),
    brand: { companyName: 'FitFuel Pakistan', logoUrl: '' },
  },
  {
    id: 'c4', title: 'Home Decor Spring Collection',
    description: 'Showcase our spring home decor collection in your living space. Lifestyle shots, a short tour video, and honest thoughts on quality and style.',
    objective: 'AWARENESS', niche: 'LIFESTYLE', platforms: ['INSTAGRAM'],
    budgetType: 'FIXED', budgetPKR: 45000, reels: 2, posts: 3, stories: 4, videos: 0, livestreams: 0,
    status: 'PUBLISHED', applications: 19, createdAt: daysAgo(12),
    brand: { companyName: 'Casa Living', logoUrl: '' },
  },
  {
    id: 'c5', title: 'Food Photography Campaign',
    description: 'Create drool-worthy food content featuring our new restaurant menu items. Must be a food/lifestyle creator with strong aesthetic sense.',
    objective: 'ENGAGEMENT', niche: 'FOOD', platforms: ['INSTAGRAM', 'TIKTOK'],
    budgetType: 'FIXED', budgetPKR: 35000, reels: 3, posts: 2, stories: 5, videos: 0, livestreams: 0,
    status: 'PUBLISHED', applications: 34, createdAt: daysAgo(1),
    brand: { companyName: 'Zaiqa Bites', logoUrl: '' },
  },
];

const BRAND_CAMPAIGNS_LIST = DEMO_CAMPAIGNS.slice(0, 3).map((c) => ({ ...c, brandId: 'demo-brand-1' }));

/* ── Collaborations ──────────────────────────────────────────────────── */
const DEMO_COLLABORATIONS = [
  {
    id: 'col1', status: 'ACTIVE',
    campaign: { id: 'c1', title: 'Summer Tech Unboxing', niche: 'TECH' },
    creator: { displayName: 'Laiba Khan', username: 'laibakhan', avatarUrl: '' },
    brand: { companyName: 'TechWave', logoUrl: '' },
    agreedAmount: 75000, startDate: daysAgo(10), dueDate: daysAhead(5),
    deliverables: { reels: 2, posts: 1, stories: 3 }, createdAt: daysAgo(10),
  },
  {
    id: 'col2', status: 'ACTIVE',
    campaign: { id: 'c2', title: 'Ramadan Beauty Routine', niche: 'BEAUTY' },
    creator: { displayName: 'Laiba Khan', username: 'laibakhan', avatarUrl: '' },
    brand: { companyName: 'GlowUp Cosmetics', logoUrl: '' },
    agreedAmount: 50000, startDate: daysAgo(7), dueDate: daysAhead(3),
    deliverables: { reels: 1, posts: 2, stories: 5, videos: 1 }, createdAt: daysAgo(7),
  },
  {
    id: 'col3', status: 'COMPLETED',
    campaign: { id: 'c_old', title: 'Winter Skincare Campaign', niche: 'BEAUTY' },
    creator: { displayName: 'Laiba Khan', username: 'laibakhan', avatarUrl: '' },
    brand: { companyName: 'PureSkin', logoUrl: '' },
    agreedAmount: 60000, startDate: daysAgo(45), dueDate: daysAgo(20),
    deliverables: { reels: 2, posts: 2, stories: 6 }, createdAt: daysAgo(45),
  },
  {
    id: 'col4', status: 'PENDING',
    campaign: { id: 'c3', title: 'Fit Life 30-Day Challenge', niche: 'FITNESS' },
    creator: { displayName: 'Laiba Khan', username: 'laibakhan', avatarUrl: '' },
    brand: { companyName: 'FitFuel Pakistan', logoUrl: '' },
    agreedAmount: 90000, startDate: null, dueDate: null,
    deliverables: { reels: 4, posts: 2, stories: 10 }, createdAt: daysAgo(2),
  },
];

const BRAND_COLLABS = [
  {
    id: 'bcol1', status: 'ACTIVE',
    campaign: { id: 'c1', title: 'Summer Tech Unboxing', niche: 'TECH' },
    creator: { id: 'cr2', displayName: 'Ahmed Raza', username: 'ahmedraza', avatarUrl: '', niche: 'TECH' },
    brand: { companyName: 'TechWave', logoUrl: '' },
    agreedAmount: 75000, startDate: daysAgo(10), dueDate: daysAhead(5),
    deliverables: { reels: 2, posts: 1, stories: 3 }, createdAt: daysAgo(10),
  },
  {
    id: 'bcol2', status: 'ACTIVE',
    campaign: { id: 'c2', title: 'Ramadan Beauty Routine', niche: 'BEAUTY' },
    creator: { id: 'cr3', displayName: 'Sara Malik', username: 'saramalik', avatarUrl: '', niche: 'BEAUTY' },
    brand: { companyName: 'TechWave', logoUrl: '' },
    agreedAmount: 50000, startDate: daysAgo(7), dueDate: daysAhead(3),
    deliverables: { reels: 1, posts: 2, stories: 5 }, createdAt: daysAgo(7),
  },
  {
    id: 'bcol3', status: 'PENDING',
    campaign: { id: 'c1', title: 'Summer Tech Unboxing', niche: 'TECH' },
    creator: { id: 'cr4', displayName: 'Usman Khan', username: 'usmankhan', avatarUrl: '', niche: 'TECH' },
    brand: { companyName: 'TechWave', logoUrl: '' },
    agreedAmount: 75000, startDate: null, dueDate: null,
    deliverables: { reels: 2, posts: 1, stories: 3 }, createdAt: daysAgo(1),
  },
];

/* ── Messages / Conversations ────────────────────────────────────────── */
const DEMO_CONVERSATIONS = [
  {
    id: 'conv1',
    brand: { userId: 'demo-brand-1', companyName: 'TechWave', logoUrl: '' },
    creator: { userId: 'demo-creator-1', displayName: 'Laiba Khan', username: 'laibakhan', avatarUrl: '' },
    lastMessage: 'Looking forward to seeing the unboxing video! 🚀',
    updatedAt: daysAgo(0.3), unreadCount: 2, unread: 2,
  },
  {
    id: 'conv2',
    brand: { userId: 'b2', companyName: 'GlowUp Cosmetics', logoUrl: '' },
    creator: { userId: 'demo-creator-1', displayName: 'Laiba Khan', username: 'laibakhan', avatarUrl: '' },
    lastMessage: 'Your Ramadan routine content is absolutely stunning 🌙',
    updatedAt: daysAgo(1), unreadCount: 1, unread: 1,
  },
  {
    id: 'conv3',
    brand: { userId: 'b3', companyName: 'FitFuel Pakistan', logoUrl: '' },
    creator: { userId: 'demo-creator-1', displayName: 'Laiba Khan', username: 'laibakhan', avatarUrl: '' },
    lastMessage: 'Deal! I\'ll send you the content plan by tomorrow 💪',
    updatedAt: daysAgo(2), unreadCount: 0, unread: 0,
  },
];

const BRAND_CONVERSATIONS = [
  {
    id: 'bconv1',
    brand: { userId: 'demo-brand-1', companyName: 'TechWave', logoUrl: '' },
    creator: { userId: 'cr2', displayName: 'Ahmed Raza', username: 'ahmedraza', avatarUrl: '' },
    lastMessage: 'Sure! I\'ll have the first reel ready by Friday 🎬',
    updatedAt: daysAgo(0.1), unreadCount: 2, unread: 2,
  },
  {
    id: 'bconv2',
    brand: { userId: 'demo-brand-1', companyName: 'TechWave', logoUrl: '' },
    creator: { userId: 'cr3', displayName: 'Sara Malik', username: 'saramalik', avatarUrl: '' },
    lastMessage: 'The brief looks great, I love the concept. Let\'s do it! 🌸',
    updatedAt: daysAgo(0.5), unreadCount: 1, unread: 1,
  },
  {
    id: 'bconv3',
    brand: { userId: 'demo-brand-1', companyName: 'TechWave', logoUrl: '' },
    creator: { userId: 'cr4', displayName: 'Bilal Hassan', username: 'bilalh', avatarUrl: '' },
    lastMessage: 'Hi! I saw your campaign and I\'m very interested.',
    updatedAt: daysAgo(2), unreadCount: 0, unread: 0,
  },
];

const CONV1_MESSAGES = [
  { id: 'm1', conversationId: 'bconv1', senderId: 'demo-brand-1', content: 'Hi Ahmed! We loved your tech review style. Would you be interested in our SmartHub Pro unboxing campaign?', createdAt: daysAgo(3) },
  { id: 'm2', conversationId: 'bconv1', senderId: 'cr2',          content: 'Absolutely! TechWave is a brand I really respect. What are the deliverables and budget?', createdAt: daysAgo(3) },
  { id: 'm3', conversationId: 'bconv1', senderId: 'demo-brand-1', content: '2 Reels on Instagram + 1 TikTok video. Budget is Rs 75,000 and you get to keep the device!', createdAt: daysAgo(2) },
  { id: 'm4', conversationId: 'bconv1', senderId: 'cr2',          content: 'That sounds amazing! Send me the campaign brief and I\'ll start planning the content 📱', createdAt: daysAgo(2) },
  { id: 'm5', conversationId: 'bconv1', senderId: 'demo-brand-1', content: 'Brief sent to your email! We need the first reel before Friday. Does that work?', createdAt: daysAgo(1) },
  { id: 'm6', conversationId: 'bconv1', senderId: 'cr2',          content: 'Sure! I\'ll have the first reel ready by Friday 🎬', createdAt: daysAgo(0.1) },
];

const CREATOR_CONV_MESSAGES = [
  { id: 'cm1', conversationId: 'conv1', senderId: 'demo-brand-1', content: 'Hi Laiba! We\'d love to collaborate with you on our SmartHub Pro launch 🚀', createdAt: daysAgo(5) },
  { id: 'cm2', conversationId: 'conv1', senderId: 'demo-creator-1', content: 'Hi TechWave team! I\'d love to. SmartHub Pro looks amazing — I\'ve been following you for a while!', createdAt: daysAgo(5) },
  { id: 'cm3', conversationId: 'conv1', senderId: 'demo-brand-1', content: 'We\'d need 2 Reels and 3 Stories. Budget is Rs 75,000 + a device to keep. Interested?', createdAt: daysAgo(4) },
  { id: 'cm4', conversationId: 'conv1', senderId: 'demo-creator-1', content: 'Definitely! Can I see the campaign brief first? I want to make sure I can deliver what you\'re looking for.', createdAt: daysAgo(4) },
  { id: 'cm5', conversationId: 'conv1', senderId: 'demo-brand-1', content: 'Of course! Brief attached. Key points: authentic unboxing, show smart home integration, keep it natural. Looking forward to seeing the unboxing video! 🚀', createdAt: daysAgo(3) },
];

/* ── Notifications ────────────────────────────────────────────────────── */
const BRAND_NOTIFICATIONS = [
  { id: 'n1', message: 'Ahmed Raza applied to your "Summer Tech Unboxing" campaign', type: 'APPLICATION', isRead: false, createdAt: daysAgo(0.2) },
  { id: 'n2', message: 'Sara Malik sent you a message: "The brief looks great, I love the concept!"', type: 'MESSAGE', isRead: false, createdAt: daysAgo(0.5) },
  { id: 'n3', message: 'Your collaboration with Ahmed Raza is now Active', type: 'COLLABORATION', isRead: false, createdAt: daysAgo(1) },
  { id: 'n4', message: '3 new creators applied to your "Ramadan Beauty Routine" campaign', type: 'APPLICATION', isRead: true, createdAt: daysAgo(2) },
  { id: 'n5', message: 'Your campaign "Fit Life 30-Day Challenge" is now live and visible to creators', type: 'SYSTEM', isRead: true, createdAt: daysAgo(3) },
  { id: 'n6', message: 'Collaboration with PureSkin has been completed. Don\'t forget to leave a review!', type: 'COLLABORATION', isRead: true, createdAt: daysAgo(5) },
];

const CREATOR_NOTIFICATIONS = [
  { id: 'cn1', message: 'TechWave sent you a collaboration offer for "Summer Tech Unboxing" — Rs 75,000', type: 'OFFER', isRead: false, createdAt: daysAgo(0.1) },
  { id: 'cn2', message: 'GlowUp Cosmetics: "Your Ramadan routine content is absolutely stunning 🌙"', type: 'MESSAGE', isRead: false, createdAt: daysAgo(1) },
  { id: 'cn3', message: 'Rs 60,000 payment has been released for the "Winter Skincare Campaign"', type: 'PAYMENT', isRead: false, createdAt: daysAgo(2) },
  { id: 'cn4', message: 'FitFuel Pakistan accepted your application for "Fit Life 30-Day Challenge"', type: 'COLLABORATION', isRead: true, createdAt: daysAgo(3) },
  { id: 'cn5', message: 'PureSkin left you a 5-star review: "Exceptional content quality and professionalism!"', type: 'REVIEW', isRead: true, createdAt: daysAgo(5) },
  { id: 'cn6', message: 'Your CreConnect profile has been verified ✓', type: 'SYSTEM', isRead: true, createdAt: daysAgo(10) },
];

/* ── Reviews ─────────────────────────────────────────────────────────── */
const CREATOR_REVIEWS = [
  { id: 'r1', brand: { companyName: 'PureSkin', logoUrl: '' }, rating: 5, comment: 'Laiba delivered absolutely stunning content! Her storytelling made our skincare products come to life. Professional, creative, and a joy to work with. 100% recommended!', createdAt: daysAgo(20) },
  { id: 'r2', brand: { companyName: 'FashionHouse PK', logoUrl: '' }, rating: 5, comment: 'Outstanding work on our Eid collection campaign. The reels got 200K+ views and drove significant traffic to our store. Laiba truly understands her audience.', createdAt: daysAgo(35) },
  { id: 'r3', brand: { companyName: 'OrganicEats', logoUrl: '' }, rating: 4, comment: 'Great collaboration! Laiba\'s food content was beautiful and authentic. Her followers engaged really well with our product. Will definitely work together again.', createdAt: daysAgo(60) },
];

/* ── Brands list (creator browse) ────────────────────────────────────── */
const BRANDS_LIST = [
  { id: 'demo-brand-1', companyName: 'TechWave',         industry: 'Technology',      logoUrl: '', description: 'Innovating everyday tech for everyone.',              isVerified: true,  activeCampaigns: 3, avgRating: 4.9, location: 'Karachi, Pakistan'   },
  { id: 'b2',           companyName: 'GlowUp Cosmetics',  industry: 'Beauty',          logoUrl: '', description: 'Pakistan\'s leading clean beauty brand.',             isVerified: true,  activeCampaigns: 3, avgRating: 4.8, location: 'Lahore, Pakistan'    },
  { id: 'b3',           companyName: 'FitFuel Pakistan',  industry: 'Fitness & Health', logoUrl: '', description: 'Premium sports nutrition and supplements.',           isVerified: true,  activeCampaigns: 2, avgRating: 4.6, location: 'Karachi, Pakistan'   },
  { id: 'b4',           companyName: 'Casa Living',       industry: 'Home & Decor',    logoUrl: '', description: 'Contemporary home furnishings & lifestyle products.',  isVerified: true,  activeCampaigns: 1, avgRating: 4.7, location: 'Islamabad, Pakistan' },
  { id: 'b5',           companyName: 'Zaiqa Bites',       industry: 'Food & Beverage', logoUrl: '', description: 'Authentic Pakistani flavours, modern presentation.',   isVerified: false, activeCampaigns: 2, avgRating: 4.5, location: 'Lahore, Pakistan'    },
];

/* ── AI-matched creators ─────────────────────────────────────────────── */
const MATCHING_CREATORS = [
  { id: 'cr2', displayName: 'Ahmed Raza',   username: 'ahmedraza', niche: 'TECH',      matchScore: 92, followerCount: 120000, engagementRate: 5.1, platforms: ['Instagram', 'TikTok'],    avatarUrl: '', location: 'Karachi' },
  { id: 'cr3', displayName: 'Sara Malik',   username: 'saramalik', niche: 'BEAUTY',    matchScore: 87, followerCount: 95000,  engagementRate: 4.8, platforms: ['Instagram', 'YouTube'],   avatarUrl: '', location: 'Lahore'  },
  { id: 'cr5', displayName: 'Bilal Hassan', username: 'bilalh',    niche: 'TECH',      matchScore: 81, followerCount: 78000,  engagementRate: 4.3, platforms: ['TikTok', 'Instagram'],   avatarUrl: '', location: 'Lahore'  },
  { id: 'cr6', displayName: 'Hira Baig',    username: 'hirabaig',  niche: 'LIFESTYLE', matchScore: 76, followerCount: 65000,  engagementRate: 5.5, platforms: ['Instagram', 'TikTok'],   avatarUrl: '', location: 'Islamabad' },
];

/* ── Payments ────────────────────────────────────────────────────────── */
const PAYMENT_HISTORY = [
  { id: 'pay1', amount: 60000, status: 'RELEASED',  description: 'Winter Skincare Campaign — PureSkin',     createdAt: daysAgo(20) },
  { id: 'pay2', amount: 45000, status: 'RELEASED',  description: 'Eid Fashion Campaign — FashionHouse PK', createdAt: daysAgo(35) },
  { id: 'pay3', amount: 32000, status: 'RELEASED',  description: 'Organic Recipe Series — OrganicEats',    createdAt: daysAgo(60) },
];

/* ── Convenience wrappers ────────────────────────────────────────────── */
const list = (data, total) => ({ data, pagination: { total: total ?? data.length, page: 1, limit: 20 } });

import { getAdminMockResponse } from './mockAdminApiResponses';

/* ════════════════════════════════════════════════════════════════════════ */
const SPECIFIC_MOCKS = [
  // ── Creator profile & stats ─────────────────────────────────────────
  { method: 'get', pattern: /\/creators\/me\/platforms$/,     data: DEMO_CREATOR_PROFILE.platforms },
  { method: 'get', pattern: /\/creators\/me\/stats$/,         data: DEMO_CREATOR_STATS },
  { method: 'get', pattern: /\/creators\/me\/collaborations/, data: list(DEMO_COLLABORATIONS) },
  { method: 'get', pattern: /\/creators\/me\/offers/,         data: [
    { id: 'col1', status: 'APPLIED', note: 'I love tech content — would be perfect for this unboxing!', createdAt: daysAgo(10),
      campaign: { id: 'c1', title: 'Summer Tech Unboxing', budgetPKR: 75000, brand: { companyName: 'TechWave', logoUrl: '' } } },
    { id: 'col4', status: 'APPLIED', note: 'Fitness content is my passion — 30-day challenge is right up my alley!', createdAt: daysAgo(2),
      campaign: { id: 'c3', title: 'Fit Life 30-Day Challenge', budgetPKR: 90000, brand: { companyName: 'FitFuel Pakistan', logoUrl: '' } } },
  ] },
  { method: 'get', pattern: /\/creators\/me\/applications/,   data: list([{ ...DEMO_COLLABORATIONS[3], status: 'APPLIED' }]) },
  { method: 'get', pattern: /\/creators\/me\/reviews/,        data: CREATOR_REVIEWS },
  { method: 'get', pattern: /\/creators\/me\/media/,          data: [] },
  { method: 'get', pattern: /\/creators\/me$/,                data: DEMO_CREATOR_PROFILE },
  { method: 'get', pattern: /\/creators\/[^/]+$/,             data: { ...DEMO_CREATOR_PROFILE, collaborations: DEMO_COLLABORATIONS, reviews: CREATOR_REVIEWS } },

  // ── Brand profile & stats ────────────────────────────────────────────
  { method: 'get', pattern: /\/brands\/me\/stats$/,           data: DEMO_BRAND_STATS },
  { method: 'get', pattern: /\/brands\/me\/campaigns/,        data: list(BRAND_CAMPAIGNS_LIST) },
  { method: 'get', pattern: /\/brands\/me\/collaborations/,   data: list(BRAND_COLLABS) },
  { method: 'get', pattern: /\/brands\/me\/applications/,     data: list([]) },
  { method: 'get', pattern: /\/brands\/me\/media/,            data: [] },
  { method: 'get', pattern: /\/brands\/me$/,                  data: DEMO_BRAND_PROFILE },
  { method: 'get', pattern: /\/brands\/list/,                 data: list(BRANDS_LIST) },
  { method: 'get', pattern: /\/brands\/[^/]+$/,               data: DEMO_BRAND_PROFILE },

  // ── Analytics ────────────────────────────────────────────────────────
  { method: 'get', pattern: /\/analytics\/creator$/,          data: DEMO_CREATOR_ANALYTICS },
  { method: 'get', pattern: /\/analytics\/brand$/,            data: DEMO_BRAND_ANALYTICS },

  // ── Campaigns ────────────────────────────────────────────────────────
  { method: 'get', pattern: /\/campaigns\/[^/]+\/applications/, data: list([]) },
  { method: 'get', pattern: /\/campaigns$/,                   data: list(DEMO_CAMPAIGNS) },
  { method: 'get', pattern: /\/campaigns\//,                  data: DEMO_CAMPAIGNS[0] },

  // ── Messages ─────────────────────────────────────────────────────────
  { method: 'get', pattern: /\/messages\/unread-count/,       data: { count: 3 } },
  { method: 'get', pattern: /\/messages\/conversations\/bconv1\/messages/, data: list(CONV1_MESSAGES) },
  { method: 'get', pattern: /\/messages\/conversations\/conv1\/messages/,  data: list(CREATOR_CONV_MESSAGES) },
  { method: 'get', pattern: /\/messages\/conversations\/[^/]+\/messages/,  data: list([]) },
  { method: 'get', pattern: /\/messages\/conversations/,      data: list([...DEMO_CONVERSATIONS, ...BRAND_CONVERSATIONS]) },

  // ── Notifications ─────────────────────────────────────────────────── (role-agnostic: page context handles which to show)
  { method: 'get', pattern: /\/notifications\/unread-count/,  data: { count: 3 } },
  { method: 'get', pattern: /\/notifications$/,               data: [...BRAND_NOTIFICATIONS, ...CREATOR_NOTIFICATIONS] },
  { method: 'post', pattern: /\/notifications\/self/,         data: {} },

  // ── AI matching ──────────────────────────────────────────────────────
  { method: 'get', pattern: /\/ai\/matches\/brand\//,         data: MATCHING_CREATORS.map(c => ({ ...c, creatorId: c.id, creator: c })) },
  { method: 'get', pattern: /\/ai\/matches\/creator\//,       data: [] },
  { method: 'post', pattern: /\/ai\/feedback/,                data: {} },
  { method: 'post', pattern: /\/ai\/run/,                     data: { message: 'Engine run complete', matches: 42 } },

  // ── Matching ─────────────────────────────────────────────────────────
  { method: 'get', pattern: /\/matching\/recommended/,        data: MATCHING_CREATORS },
  { method: 'get', pattern: /\/matching\//,                   data: [] },

  // ── Copilot ───────────────────────────────────────────────────────────
  { method: 'post', pattern: /\/copilot\/chat/,               data: { message: 'I can see you have 3 active collaborations! Your top recommended creator Ahmed Raza has a 92/100 AI match score. Would you like me to draft a campaign brief or analyse your campaign performance?' } },

  // ── Search ───────────────────────────────────────────────────────────
  { method: 'get', pattern: /\/search\//,                     data: list(BRANDS_LIST) },

  // ── Payments ─────────────────────────────────────────────────────────
  { method: 'get', pattern: /\/payments\/history/,            data: list(PAYMENT_HISTORY) },

  // ── Verification ─────────────────────────────────────────────────────
  { method: 'get', pattern: /\/verification\/status/,         data: { verifications: [] } },
  { method: 'get', pattern: /\/verification\/history/,        data: [] },
  { method: 'post', pattern: /\/verification\//,              data: { status: 'pending', submittedAt: new Date().toISOString() } },
  { method: 'post', pattern: /\/upload\/verification\//,      data: { documentId: 'demo-doc', secureUrl: '' } },

  // ── Social platform ───────────────────────────────────────────────────
  { method: 'get', pattern: /\/social\/[^/]+\/auth-url/,      data: { url: null, configured: false } },
  { method: 'get', pattern: /\/social\/platforms\/[^/]+\/posts/, data: [] },

];

/**
 * Returns a mocked `{ data }` response for the given request, or `null` if
 * no fallback is defined for this method/url combination.
 */
export function getMockApiResponse(method, url) {
  const m    = (method || 'get').toLowerCase();
  const path = url.split('?')[0];

  const adminMock = getAdminMockResponse(method, url);
  if (adminMock) return adminMock;

  for (const mock of SPECIFIC_MOCKS) {
    if (mock.method === m && mock.pattern.test(path)) {
      return { data: mock.data };
    }
  }

  // Generic fallback: writes resolve to an empty object, unmatched reads to null
  if (m === 'get') return { data: null };
  return { data: {} };
}
