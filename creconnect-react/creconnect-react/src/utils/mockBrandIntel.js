/**
 * Deterministic "estimated" brand-intelligence generators.
 *
 * The backend doesn't yet expose brand trust/performance analytics, open
 * campaigns, payment history, or creator-fit scoring. These helpers derive
 * realistic, stable-per-brand datasets from a seed string (brand id/name)
 * so the Brand Discovery workspace can render rich cards and portfolios
 * today and swap to live data later without changing shape.
 */

import { seededRandom } from './mockAnalytics';
import { formatPKR } from './formatters';

const MONTHS = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];

const BUDGET_TIERS = [
  { label: 'Low', min: 5000, max: 25000 },
  { label: 'Medium', min: 25000, max: 75000 },
  { label: 'High', min: 75000, max: 200000 },
  { label: 'Enterprise', min: 200000, max: 600000 },
];

const CAMPAIGN_TYPES = ['Sponsored Post', 'Product Review', 'Video Integration', 'Brand Ambassadorship', 'Giveaway', 'UGC Content', 'Event Coverage'];
const NICHES = ['Fashion', 'Beauty', 'Fitness', 'Food', 'Tech', 'Travel', 'Gaming', 'Lifestyle', 'Finance', 'Education'];
const DELIVERABLES = ['1 Instagram Reel', '2 Feed Posts', '3 Stories', '1 TikTok Video', '1 YouTube Video', '1 Unboxing Video', 'Story Series + Highlight'];
const REQUIREMENTS = ['Min. 10K followers', 'Min. 5% engagement rate', 'Audience based in Pakistan', 'Prior brand collab experience', 'Video content required', 'Verified account'];

function brandSeed(brand) {
  return brand?.id ?? brand?.companyName ?? 'brand';
}

/**
 * Core intelligence metrics for a single brand: scores, rates, budgets,
 * and the derived opportunity badges shown on Brand Cards 2.0.
 */
export function getBrandIntel(brand = {}) {
  const seed = brandSeed(brand);
  const rand = seededRandom(`${seed}-brand-intel`);

  const matchScore = Math.round(60 + rand() * 38);
  const trustScore = Math.round(65 + rand() * 33);
  const responseRate = Math.round(70 + rand() * 29);
  const avgResponseTimeHours = Math.round(1 + rand() * 23);
  const campaignSuccessRate = Math.round(65 + rand() * 33);
  const tier = BUDGET_TIERS[Math.floor(rand() * BUDGET_TIERS.length)];
  const avgBudget = Math.round((tier.min + rand() * (tier.max - tier.min)) / 500) * 500;
  const activeCampaigns = Math.round(rand() * 6);
  const completedCollaborations = Math.round(8 + rand() * 140);
  const creatorRating = Math.round((3.6 + rand() * 1.4) * 10) / 10;
  const satisfactionScore = Math.round(70 + rand() * 28);
  const growthRate = Math.round((rand() * 40 - 5) * 10) / 10;
  const totalCreatorsHired = Math.round(completedCollaborations * (0.4 + rand() * 0.3));
  const repeatCollaborations = Math.round(totalCreatorsHired * (0.15 + rand() * 0.35));

  const badges = [];
  if (growthRate >= 18) badges.push({ key: 'trending', icon: '🔥', label: 'Trending', variant: 'danger' });
  if (matchScore >= 88) badges.push({ key: 'highMatch', icon: '⭐', label: 'High Match', variant: 'brand' });
  if (avgBudget >= 75000) badges.push({ key: 'highBudget', icon: '💰', label: 'High Budget', variant: 'success' });
  if (growthRate >= 12 && activeCampaigns >= 3) badges.push({ key: 'fastGrowing', icon: '🚀', label: 'Fast Growing', variant: 'accent' });
  if (creatorRating >= 4.6 && satisfactionScore >= 88) badges.push({ key: 'topRated', icon: '🏆', label: 'Top Rated', variant: 'warning' });
  if (avgResponseTimeHours <= 4) badges.push({ key: 'fastResponse', icon: '⚡', label: 'Fast Response', variant: 'neutral' });

  return {
    matchScore, trustScore, responseRate, avgResponseTimeHours, campaignSuccessRate,
    avgBudget, budgetTier: tier.label, activeCampaigns, completedCollaborations,
    creatorRating, satisfactionScore, growthRate, totalCreatorsHired, repeatCollaborations,
    badges,
  };
}

/**
 * Time-series performance data for the Brand Performance section:
 * campaign growth, creator acquisition, monthly spending, collaboration trends.
 */
export function getBrandPerformanceSeries(brand = {}, months = 6) {
  const seed = brandSeed(brand);
  const rand = seededRandom(`${seed}-brand-performance`);
  const now = new Date();
  const series = [];

  let campaigns = Math.round(2 + rand() * 4);
  let creators = Math.round(5 + rand() * 15);
  let spend = Math.round(20000 + rand() * 40000);

  for (let i = months - 1; i >= 0; i--) {
    const d = new Date(now.getFullYear(), now.getMonth() - i, 1);
    campaigns = Math.max(1, Math.round(campaigns * (0.9 + rand() * 0.35)));
    creators = Math.max(2, Math.round(creators * (0.9 + rand() * 0.35)));
    spend = Math.max(5000, Math.round(spend * (0.85 + rand() * 0.4)));
    const collabRate = Math.round(60 + rand() * 35);
    series.push({
      month: MONTHS[d.getMonth()],
      campaigns,
      creators,
      spend,
      collabRate,
    });
  }
  return series;
}

/**
 * Open campaigns shown in "Active Opportunities".
 */
export function getOpenCampaigns(brand = {}, count) {
  const seed = brandSeed(brand);
  const rand = seededRandom(`${seed}-open-campaigns`);
  const n = count ?? Math.max(1, Math.round(rand() * 4));
  const niche = brand.industry ?? NICHES[Math.floor(rand() * NICHES.length)];

  return Array.from({ length: n }, (_, i) => {
    const type = CAMPAIGN_TYPES[Math.floor(rand() * CAMPAIGN_TYPES.length)];
    const budgetMin = Math.round((5000 + rand() * 60000) / 500) * 500;
    const budgetMax = budgetMin + Math.round((10000 + rand() * 40000) / 500) * 500;
    const days = Math.round(7 + rand() * 30);
    const niches = [niche, NICHES[Math.floor(rand() * NICHES.length)]].filter((v, idx, arr) => arr.indexOf(v) === idx);
    return {
      id: `${seed}-camp-${i}`,
      title: `${type} — ${brand.companyName ?? 'Brand'} ${niche} Campaign`,
      budgetMin,
      budgetMax,
      timeline: `${days} days`,
      requirements: [REQUIREMENTS[i % REQUIREMENTS.length], REQUIREMENTS[(i + 2) % REQUIREMENTS.length]],
      deliverables: [DELIVERABLES[i % DELIVERABLES.length], DELIVERABLES[(i + 3) % DELIVERABLES.length]],
      niches,
    };
  });
}

/**
 * "Why this brand matches you" creator-fit analysis.
 */
export function getCreatorFitAnalysis(brand = {}) {
  const seed = brandSeed(brand);
  const rand = seededRandom(`${seed}-creator-fit`);
  return [
    { key: 'audienceOverlap', label: 'Audience Overlap', value: Math.round(70 + rand() * 28), desc: 'Your followers match this brand’s target audience demographics.' },
    { key: 'industryAlignment', label: 'Industry Alignment', value: Math.round(75 + rand() * 24), desc: 'Your content niche aligns closely with this brand’s category.' },
    { key: 'budgetCompatibility', label: 'Budget Compatibility', value: Math.round(65 + rand() * 33), desc: 'Their typical campaign budgets fit your usual rate range.' },
    { key: 'campaignSimilarity', label: 'Previous Campaign Similarity', value: Math.round(70 + rand() * 28), desc: 'Past campaigns resemble collaborations you’ve completed before.' },
  ];
}

/**
 * Past-campaign gallery for the brand portfolio.
 */
export function getCampaignGallery(brand = {}, count = 4) {
  const seed = brandSeed(brand);
  const rand = seededRandom(`${seed}-campaign-gallery`);
  const niche = brand.industry ?? NICHES[Math.floor(rand() * NICHES.length)];

  return Array.from({ length: count }, (_, i) => {
    const type = CAMPAIGN_TYPES[Math.floor(rand() * CAMPAIGN_TYPES.length)];
    const reach = Math.round(20000 + rand() * 480000);
    const engagement = Math.round((2 + rand() * 7) * 10) / 10;
    return {
      id: `${seed}-gallery-${i}`,
      title: `${niche} ${type}`,
      creators: Math.round(2 + rand() * 18),
      reach,
      engagement,
      result: `+${Math.round(8 + rand() * 40)}% engagement vs. brand average`,
    };
  });
}

/**
 * Creators this brand has worked with most.
 */
export function getTopCreatorsWorkedWith(brand = {}, count = 4) {
  const seed = brandSeed(brand);
  const rand = seededRandom(`${seed}-top-creators`);
  const names = ['Ayesha Khan', 'Bilal Ahmed', 'Sara Malik', 'Hamza Raza', 'Fatima Noor', 'Omar Siddiqui', 'Zara Iqbal', 'Hassan Tariq'];

  return Array.from({ length: count }, (_, i) => {
    const niche = NICHES[Math.floor(rand() * NICHES.length)];
    return {
      id: `${seed}-creator-${i}`,
      name: names[(i * 2 + Math.floor(rand() * 2)) % names.length],
      niche,
      result: `+${Math.round(10 + rand() * 50)}% reach growth`,
      collaborations: Math.round(1 + rand() * 8),
    };
  });
}

/**
 * Creator testimonials + satisfaction trend for the Reviews section.
 */
export function getBrandReviews(brand = {}, count = 3) {
  const seed = brandSeed(brand);
  const rand = seededRandom(`${seed}-brand-reviews`);
  const names = ['Ayesha K.', 'Bilal A.', 'Sara M.', 'Hamza R.', 'Fatima N.', 'Omar S.'];
  const comments = [
    'Clear briefs, fast approvals, and payment landed exactly on time.',
    'Great brand to work with — responsive team and fair budgets.',
    'Smooth collaboration from start to finish. Would work with them again.',
    'Took a bit longer to respond at first, but the campaign itself was well organized.',
    'One of the best brand experiences I’ve had — highly professional.',
  ];

  const reviews = Array.from({ length: count }, (_, i) => ({
    id: `${seed}-review-${i}`,
    creator: names[(i + Math.floor(rand() * 2)) % names.length],
    rating: Math.round((3.8 + rand() * 1.2) * 10) / 10,
    comment: comments[Math.floor(rand() * comments.length)],
  }));

  const satisfactionTrend = Array.from({ length: 6 }, (_, i) => ({
    month: MONTHS[(new Date().getMonth() - 5 + i + 12) % 12],
    value: Math.round(72 + rand() * 25),
  }));

  return { reviews, satisfactionTrend };
}

/**
 * Payment-reliability trust dashboard.
 */
export function getPaymentReliability(brand = {}) {
  const seed = brandSeed(brand);
  const rand = seededRandom(`${seed}-payment-reliability`);
  const completionRate = Math.round(85 + rand() * 15);
  const avgPayoutDays = Math.round(1 + rand() * 9);
  const disputes = Math.round(rand() * 3);
  const escrowProtected = Math.round(60 + rand() * 40);

  const badges = [];
  if (completionRate >= 95) badges.push({ key: 'trustedPayer', icon: '🛡️', label: 'Trusted Payer', variant: 'success' });
  if (avgPayoutDays <= 3) badges.push({ key: 'fastPayer', icon: '⚡', label: 'Fast Payer', variant: 'brand' });
  if (completionRate >= 97 && disputes === 0) badges.push({ key: 'premiumBrand', icon: '💎', label: 'Premium Brand', variant: 'accent' });

  return { completionRate, avgPayoutDays, disputes, escrowProtected, badges };
}

/**
 * AI-style insight strings for the Brand Portfolio AI Insights section.
 */
export function getBrandAIInsights(brand = {}, intel) {
  const seed = brandSeed(brand);
  const rand = seededRandom(`${seed}-brand-ai-insights`);
  const niche = brand.industry ?? NICHES[Math.floor(rand() * NICHES.length)];
  const otherNiche = NICHES.filter((n) => n !== niche)[Math.floor(rand() * (NICHES.length - 1))];
  const overlap = Math.round(70 + rand() * 25);
  const videoLift = Math.round(20 + rand() * 30);

  const insights = [
    `This brand performs best with ${niche} creators — ${Math.round(60 + rand() * 30)}% of their top campaigns were in this niche.`,
    `Video campaigns generate ${videoLift}% higher engagement than static posts for this brand.`,
    `Your audience overlaps ${overlap}% with their target market.`,
  ];

  if (intel?.responseRate >= 90) {
    insights.push(`This brand responds to ${intel.responseRate}% of creator applications — well above the platform average.`);
  }
  if (intel?.growthRate >= 10) {
    insights.push(`This brand has grown its campaign volume by ${intel.growthRate}% over the last 6 months.`);
  }
  insights.push(`Creators who pitched with ${otherNiche.toLowerCase()}-style content saw lower response rates from this brand — lead with ${niche.toLowerCase()} angles.`);

  return insights;
}

const COMPANY_SIZES = ['Startup (1-10)', 'Growing (11-50)', 'Mid-size (51-200)', 'Enterprise (200+)'];
const HQ_CITIES = ['Lahore, Pakistan', 'Karachi, Pakistan', 'Islamabad, Pakistan', 'Dubai, UAE', 'Remote / Global'];

/**
 * Static company-profile facts for the Overview section.
 */
export function getBrandMeta(brand = {}) {
  const seed = brandSeed(brand);
  const rand = seededRandom(`${seed}-brand-meta`);

  const companySize = COMPANY_SIZES[Math.floor(rand() * COMPANY_SIZES.length)];
  const foundedYear = 2008 + Math.floor(rand() * 17);
  const headquarters = brand.location || HQ_CITIES[Math.floor(rand() * HQ_CITIES.length)];

  const verificationBadges = [];
  if (brand.isVerified) verificationBadges.push({ key: 'identity', icon: '✓', label: 'Identity Verified' });
  if (rand() > 0.4) verificationBadges.push({ key: 'payment', icon: '💳', label: 'Payment Verified' });
  if (rand() > 0.5) verificationBadges.push({ key: 'business', icon: '🏢', label: 'Registered Business' });

  return { companySize, foundedYear, headquarters, verificationBadges };
}

function pickSubset(rand, pool, minCount = 1) {
  const shuffled = [...pool].sort(() => rand() - 0.5);
  const count = Math.max(minCount, Math.round(rand() * pool.length));
  return shuffled.slice(0, count);
}

/**
 * Deterministic "what this brand supports" tags, used to power Advanced
 * Filters (audience size, languages, campaign types, creator requirements)
 * that the backend doesn't yet expose per-brand.
 */
export function getBrandFilterTags(brand = {}) {
  const seed = brandSeed(brand);
  const rand = seededRandom(`${seed}-filter-tags`);
  return {
    audienceSizes: pickSubset(rand, AUDIENCE_SIZES_POOL, 2),
    languages: pickSubset(rand, LANGUAGES_POOL, 1),
    campaignTypes: pickSubset(rand, CAMPAIGN_TYPES, 2),
    creatorRequirements: pickSubset(rand, REQUIREMENTS, 2),
  };
}

const AUDIENCE_SIZES_POOL = ['Nano (1K-10K)', 'Micro (10K-50K)', 'Mid (50K-200K)', 'Macro (200K-1M)', 'Mega (1M+)'];
const LANGUAGES_POOL = ['English', 'Urdu', 'Punjabi', 'Arabic', 'Hindi'];

const HOURS_IN_DAY = 24;

/**
 * "Brand Credit Score" — a single 0-100 trustworthiness score blending
 * trust, response, and success signals into a letter grade for quick scanning.
 */
export function getBrandCreditScore(brand = {}, intel) {
  const i = intel ?? getBrandIntel(brand);
  const responseTimeScore = Math.max(0, 100 - Math.min(i.avgResponseTimeHours, HOURS_IN_DAY) * 4);
  const score = Math.round(
    i.trustScore * 0.35 + i.campaignSuccessRate * 0.3 + i.responseRate * 0.2 + responseTimeScore * 0.15
  );
  let grade;
  if (score >= 90) grade = 'A+';
  else if (score >= 80) grade = 'A';
  else if (score >= 70) grade = 'B+';
  else if (score >= 60) grade = 'B';
  else grade = 'C';
  return { score, grade };
}

/**
 * Typical per-creator payout for a single deal with this brand
 * (a fraction of their average campaign budget).
 */
export function getAverageDealSize(brand = {}, intel) {
  const seed = brandSeed(brand);
  const rand = seededRandom(`${seed}-avg-deal-size`);
  const i = intel ?? getBrandIntel(brand);
  const dealSize = Math.round((i.avgBudget * (0.12 + rand() * 0.3)) / 500) * 500;
  return Math.max(2000, dealSize);
}

const HIRING_FREQUENCY_LABELS = [
  { min: 3, label: 'Hires weekly' },
  { min: 1.5, label: 'Hires bi-weekly' },
  { min: 0.8, label: 'Hires monthly' },
  { min: 0.3, label: 'Hires quarterly' },
  { min: 0, label: 'Hires occasionally' },
];

/**
 * How often this brand brings on new creators, derived from their
 * recent campaign cadence.
 */
export function getHiringFrequency(brand = {}) {
  const seed = brandSeed(brand);
  const rand = seededRandom(`${seed}-hiring-frequency`);
  const campaignsPerMonth = Math.round((0.3 + rand() * 4) * 10) / 10;
  const { label } = HIRING_FREQUENCY_LABELS.find((tier) => campaignsPerMonth >= tier.min);
  return { campaignsPerMonth, label };
}

const APPLY_DAYS = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday'];
const APPLY_WINDOWS = ['9:00 AM – 11:00 AM', '11:00 AM – 1:00 PM', '2:00 PM – 4:00 PM', '4:00 PM – 6:00 PM'];

/**
 * Best day/time window to apply to this brand, based on when they're
 * historically most responsive.
 */
export function getBestTimeToApply(brand = {}) {
  const seed = brandSeed(brand);
  const rand = seededRandom(`${seed}-best-time-to-apply`);
  const day = APPLY_DAYS[Math.floor(rand() * APPLY_DAYS.length)];
  const window = APPLY_WINDOWS[Math.floor(rand() * APPLY_WINDOWS.length)];
  const responseLift = Math.round(15 + rand() * 35);
  return {
    day,
    window,
    responseLift,
    summary: `${day}s, ${window}`,
    reason: `This brand reviews applications fastest on ${day}s during ${window} — applying then can improve your response chance by ~${responseLift}%.`,
  };
}

/**
 * Monthly ROI (%) trend for campaigns run with this brand, for the
 * Campaign ROI History chart.
 */
export function getCampaignROIHistory(brand = {}, months = 6) {
  const seed = brandSeed(brand);
  const rand = seededRandom(`${seed}-roi-history`);
  const now = new Date();
  let roi = Math.round(90 + rand() * 70);

  return Array.from({ length: months }, (_, idx) => {
    const i = months - 1 - idx;
    const d = new Date(now.getFullYear(), now.getMonth() - i, 1);
    roi = Math.max(60, Math.round(roi * (0.9 + rand() * 0.25)));
    return { month: MONTHS[d.getMonth()], roi };
  });
}

/**
 * Where this brand ranks against others in its industry, based on its
 * trust/match/success composite score.
 */
export function getIndustryRanking(brand = {}, intel) {
  const seed = brandSeed(brand);
  const rand = seededRandom(`${seed}-industry-ranking`);
  const i = intel ?? getBrandIntel(brand);
  const totalInIndustry = Math.round(24 + rand() * 76);
  const composite = (i.trustScore + i.campaignSuccessRate + i.matchScore) / 3;
  const percentile = Math.min(99, Math.max(1, Math.round(composite)));
  const rank = Math.max(1, Math.round(totalInIndustry * (1 - percentile / 100)));
  return { rank, totalInIndustry, percentile, industry: brand.industry || 'General' };
}

/**
 * Other brands in the same industry, ranked by match score, for the
 * "Competitor Brands" comparison list.
 */
export function getCompetitorBrands(brand = {}, allBrands = [], count = 3) {
  return allBrands
    .filter((b) => b.id !== brand.id && b.industry && b.industry === brand.industry)
    .sort((a, b) => (b.intel?.matchScore ?? 0) - (a.intel?.matchScore ?? 0))
    .slice(0, count);
}

const HEATMAP_AGE_GROUPS = ['13-17', '18-24', '25-34', '35-44', '45+'];
const HEATMAP_PLATFORMS = ['Instagram', 'TikTok', 'YouTube', 'Facebook'];

/**
 * Audience overlap intensity by age group and platform, for the
 * Audience Match Heatmap.
 */
export function getAudienceMatchHeatmap(brand = {}) {
  const seed = brandSeed(brand);
  const rand = seededRandom(`${seed}-audience-heatmap`);
  return {
    platforms: HEATMAP_PLATFORMS,
    rows: HEATMAP_AGE_GROUPS.map((age) => ({
      age,
      cells: HEATMAP_PLATFORMS.map((platform) => ({ platform, value: Math.round(30 + rand() * 65) })),
    })),
  };
}

const SUCCESS_STORY_NAMES = ['Ayesha Khan', 'Bilal Ahmed', 'Sara Malik', 'Hamza Raza', 'Fatima Noor', 'Omar Siddiqui', 'Zara Iqbal', 'Hassan Tariq'];
const SUCCESS_STORY_TEMPLATES = [
  (b) => `turned a single campaign with ${b} into an ongoing monthly retainer.`,
  (b, pct) => `grew their following by ${pct}% after ${b} featured their content.`,
  (b, pct, n) => `landed ${n} repeat collaborations with ${b} after their first campaign exceeded targets.`,
  (b, pct) => `used their campaign with ${b} as a portfolio centerpiece, leading to ${pct}% more brand inquiries.`,
];

/**
 * Narrative creator success stories for this brand — extends "Top
 * Creators Worked With" with an outcome story per creator.
 */
export function getCreatorSuccessStories(brand = {}, count = 3) {
  const seed = brandSeed(brand);
  const rand = seededRandom(`${seed}-success-stories`);
  const niche = brand.industry ?? NICHES[Math.floor(rand() * NICHES.length)];
  const brandName = brand.companyName ?? 'this brand';

  return Array.from({ length: count }, (_, i) => {
    const pct = Math.round(15 + rand() * 65);
    const n = Math.round(2 + rand() * 5);
    const template = SUCCESS_STORY_TEMPLATES[Math.floor(rand() * SUCCESS_STORY_TEMPLATES.length)];
    return {
      id: `${seed}-story-${i}`,
      name: SUCCESS_STORY_NAMES[(i * 3 + Math.floor(rand() * 2)) % SUCCESS_STORY_NAMES.length],
      niche,
      story: `${template(brandName, pct, n)}`,
      result: `+${pct}% growth`,
    };
  });
}

/**
 * Combined feed of open campaigns and recent brand activity, for the
 * Open Opportunities Feed section.
 */
export function getOpenOpportunitiesFeed(brand = {}, campaigns) {
  const seed = brandSeed(brand);
  const rand = seededRandom(`${seed}-opportunities-feed`);
  const list = campaigns ?? getOpenCampaigns(brand);

  const campaignItems = list.map((c, i) => ({
    id: `${seed}-feed-campaign-${i}`,
    type: 'campaign',
    title: `New campaign: ${c.title}`,
    detail: `${formatPKR(c.budgetMin)} – ${formatPKR(c.budgetMax)} · ${c.timeline}`,
    postedHoursAgo: Math.round(2 + rand() * 240),
    campaign: c,
  }));

  const activityTemplates = [
    'increased budgets across active campaigns',
    'started responding to applications faster this week',
    `expanded hiring into ${NICHES[Math.floor(rand() * NICHES.length)]} creators`,
  ];
  const activityItems = activityTemplates.slice(0, 2).map((text, i) => ({
    id: `${seed}-feed-activity-${i}`,
    type: 'activity',
    title: `${brand.companyName ?? 'This brand'} ${text}`,
    detail: '',
    postedHoursAgo: Math.round(24 + rand() * 400),
  }));

  return [...campaignItems, ...activityItems].sort((a, b) => a.postedHoursAgo - b.postedHoursAgo);
}

/**
 * Computes summary counts for the Opportunity Overview dashboard from a
 * list of brands (each already enriched with `.intel`).
 */
export function getOpportunityOverview(brands = [], creatorNiches = []) {
  const recommendedBrands = brands.filter((b) => (b.intel?.matchScore ?? 0) >= 80).length;
  const activeCampaigns = brands.reduce((sum, b) => sum + (b.intel?.activeCampaigns ?? 0), 0);
  const nicheLower = (creatorNiches ?? []).map((n) => n.toLowerCase());
  const matchingNiche = brands.filter((b) => b.industry && nicheLower.includes(b.industry.toLowerCase())).length;
  const highBudget = brands.filter((b) => (b.intel?.avgBudget ?? 0) >= 75000).length;
  const trending = brands.filter((b) => b.intel?.badges?.some((bd) => bd.key === 'trending')).length;

  return {
    recommendedBrands,
    activeCampaigns,
    openInvitations: Math.min(brands.length, Math.max(1, Math.round(brands.length * 0.12))),
    matchingNiche,
    highBudget,
    trending,
  };
}

const TEAM_NAMES = ['Ahmed Raza', 'Mehak Fatima', 'Usman Tariq', 'Sana Javed', 'Bilal Hashmi', 'Noor ul Ain', 'Farhan Sheikh', 'Iqra Yousaf'];
const TEAM_ROLES = {
  marketing: ['Marketing Director', 'Brand Marketing Manager', 'Content Strategist'],
  partnerships: ['Head of Partnerships', 'Partnership Manager', 'Influencer Relations Lead'],
  campaigns: ['Campaign Manager', 'Senior Campaign Manager', 'Campaign Coordinator'],
  community: ['Community Manager', 'Social Media Manager', 'Community Engagement Lead'],
};

/**
 * Marketing, partnership, campaign, and community contacts for the
 * Team & Contacts section.
 */
export function getBrandTeamContacts(brand = {}) {
  const seed = brandSeed(brand);
  const rand = seededRandom(`${seed}-team-contacts`);
  let nameIdx = 0;

  const buildMember = (dept) => {
    const roles = TEAM_ROLES[dept];
    const name = TEAM_NAMES[(nameIdx++ + Math.floor(rand() * 2)) % TEAM_NAMES.length];
    return {
      id: `${seed}-team-${dept}-${nameIdx}`,
      name,
      role: roles[Math.floor(rand() * roles.length)],
      initials: name.split(' ').map((p) => p[0]).join('').slice(0, 2).toUpperCase(),
      department: dept,
    };
  };

  return {
    marketing: [buildMember('marketing'), buildMember('marketing')],
    partnerships: [buildMember('partnerships'), buildMember('partnerships')],
    campaigns: [buildMember('campaigns')],
    community: [buildMember('community')],
  };
}

const AWARD_TEMPLATES = [
  'Best Brand Partner — CreConnect Creator Awards',
  'Top Advertiser of the Year',
  'Excellence in Influencer Marketing',
  'Most Creator-Friendly Brand',
  'Outstanding Campaign Innovation Award',
];
const CERTIFICATION_TEMPLATES = [
  'Verified Business Account',
  'Escrow-Certified Payer',
  'ISO 9001 Certified Operations',
  'Meta Business Partner',
];
const RECOGNITION_TEMPLATES = [
  'Featured in CreConnect "Brands to Watch"',
  'Ranked in the Top 10 {industry} brands on the platform',
  'Highlighted for fastest creator response times',
  'Recognized for highest campaign completion rate',
];

/**
 * Awards, certifications, industry recognitions, and featured campaigns
 * for the Brand Achievements section.
 */
export function getBrandAchievements(brand = {}) {
  const seed = brandSeed(brand);
  const rand = seededRandom(`${seed}-achievements`);
  const industry = brand.industry || 'General';
  const now = new Date();

  const awards = pickSubset(rand, AWARD_TEMPLATES, 1).map((title, i) => ({
    id: `${seed}-award-${i}`,
    title,
    year: now.getFullYear() - Math.floor(rand() * 3),
  }));

  const certifications = pickSubset(rand, CERTIFICATION_TEMPLATES, 1).map((title, i) => ({
    id: `${seed}-cert-${i}`,
    title,
  }));

  const recognitions = pickSubset(rand, RECOGNITION_TEMPLATES, 1).map((title, i) => ({
    id: `${seed}-recognition-${i}`,
    title: title.replace('{industry}', industry),
  }));

  return { awards, certifications, recognitions, featuredCampaigns: getCampaignGallery(brand, 2) };
}

const TIMELINE_TEMPLATES = [
  { icon: '🚀', type: 'launch', title: (b) => `${b} launched its creator partnership program` },
  { icon: '📣', type: 'campaign', title: (b, n) => `Major campaign with ${n} creators completed` },
  { icon: '🤝', type: 'partnership', title: (b, n, niche) => `${b} partnered with top-tier ${niche.toLowerCase()} creators` },
  { icon: '🏆', type: 'milestone', title: (b, n) => `Reached ${n}+ successful collaborations` },
  { icon: '💰', type: 'milestone', title: (b) => `${b} expanded campaign budgets across all niches` },
  { icon: '🌍', type: 'launch', title: (b) => `${b} expanded into new regional markets` },
];

/**
 * Chronological partnership history — major campaigns, product launches,
 * milestones, and creator partnerships — for the Partnership History timeline.
 */
export function getPartnershipTimeline(brand = {}, count = 6) {
  const seed = brandSeed(brand);
  const rand = seededRandom(`${seed}-partnership-timeline`);
  const brandName = brand.companyName ?? 'This brand';
  const niche = brand.industry ?? NICHES[Math.floor(rand() * NICHES.length)];
  const now = new Date();

  return Array.from({ length: count }, (_, i) => {
    const template = TIMELINE_TEMPLATES[(i + Math.floor(rand() * 2)) % TIMELINE_TEMPLATES.length];
    const monthsAgo = (count - i) * Math.round(2 + rand() * 3);
    const d = new Date(now.getFullYear(), now.getMonth() - monthsAgo, 1);
    const n = Math.round(5 + rand() * 50);
    return {
      id: `${seed}-timeline-${i}`,
      date: `${MONTHS[d.getMonth()]} ${d.getFullYear()}`,
      icon: template.icon,
      type: template.type,
      title: template.title(brandName, n, niche),
    };
  });
}

const GALLERY_CATEGORIES = ['Product Images', 'Campaign Creatives', 'Brand Videos', 'Advertisements', 'Marketing Assets'];
const GALLERY_GRADIENTS = [
  'linear-gradient(135deg, #857fff 0%, #4c2dd1 100%)',
  'linear-gradient(135deg, #f59e0b 0%, #f0445f 100%)',
  'linear-gradient(135deg, #16b364 0%, #0ea5e9 100%)',
  'linear-gradient(135deg, #f0445f 0%, #857fff 100%)',
  'linear-gradient(135deg, #6d5cff 0%, #16b364 100%)',
  'linear-gradient(135deg, #0ea5e9 0%, #857fff 100%)',
];

/**
 * Categorized media gallery (product images, creatives, videos, ads,
 * marketing assets) for the Brand Gallery section, rendered as gradient tiles.
 */
export function getBrandGalleryMedia(brand = {}, perCategory = 4) {
  const seed = brandSeed(brand);
  const rand = seededRandom(`${seed}-gallery-media`);
  const brandName = brand.companyName ?? 'Brand';

  return GALLERY_CATEGORIES.map((category) => ({
    category,
    items: Array.from({ length: perCategory }, (_, i) => ({
      id: `${seed}-media-${category}-${i}`,
      title: `${brandName} — ${category.replace(/s$/, '')} ${i + 1}`,
      gradient: GALLERY_GRADIENTS[Math.floor(rand() * GALLERY_GRADIENTS.length)],
    })),
  }));
}

const PRODUCT_SUFFIXES = ['Pro', 'Plus', 'Lite', 'Max', 'Edge', 'Studio', 'Hub'];
const PARTNER_BRAND_NAMES = ['Nova Retail', 'Urban Threads', 'PixelWorks', 'GreenLeaf Co.', 'Skyline Foods', 'Metro Tech'];

/**
 * Products, sub-brands, partner brands, and campaign categories for the
 * Brand Ecosystem section.
 */
export function getBrandEcosystem(brand = {}) {
  const seed = brandSeed(brand);
  const rand = seededRandom(`${seed}-ecosystem`);
  const brandName = brand.companyName ?? 'Brand';

  const products = pickSubset(rand, PRODUCT_SUFFIXES, 2).map((suffix, i) => ({
    id: `${seed}-product-${i}`,
    name: `${brandName} ${suffix}`,
  }));

  const subBrands = rand() > 0.5 ? [{ id: `${seed}-subbrand-0`, name: `${brandName} Kids` }] : [];

  const partnerBrands = pickSubset(rand, PARTNER_BRAND_NAMES, 2)
    .map((name, i) => ({ id: `${seed}-partner-${i}`, name }));

  return {
    products,
    subBrands,
    partnerBrands,
    campaignCategories: pickSubset(rand, CAMPAIGN_TYPES, 2),
  };
}

/**
 * Composite Brand Health Score — growth, reputation, creator satisfaction,
 * and payment trust scores combined into one overall score.
 */
export function getBrandHealthScore(brand = {}, intel) {
  const i = intel ?? getBrandIntel(brand);
  const payment = getPaymentReliability(brand);
  const growthScore = Math.max(0, Math.min(100, Math.round(50 + i.growthRate * 1.5)));
  const reputationScore = i.trustScore;
  const creatorSatisfactionScore = i.satisfactionScore;
  const paymentTrustScore = Math.round((payment.completionRate + payment.escrowProtected) / 2);
  const overall = Math.round((growthScore + reputationScore + creatorSatisfactionScore + paymentTrustScore) / 4);
  return { overall, growthScore, reputationScore, creatorSatisfactionScore, paymentTrustScore };
}

const NETWORK_NAMES = ['Ayesha Khan', 'Bilal Ahmed', 'Sara Malik', 'Hamza Raza', 'Fatima Noor', 'Omar Siddiqui', 'Zara Iqbal', 'Hassan Tariq', 'Mariam Sheikh', 'Ali Raza', 'Hira Aslam', 'Usman Ghani'];

/**
 * The brand's broader creator network for the Creator Network section —
 * sortable by most successful, most recent, or highest reach.
 */
export function getCreatorNetwork(brand = {}, count = 9) {
  const seed = brandSeed(brand);
  const rand = seededRandom(`${seed}-creator-network`);

  return Array.from({ length: count }, (_, i) => {
    const niche = NICHES[Math.floor(rand() * NICHES.length)];
    const followers = Math.round((5000 + rand() * 495000) / 100) * 100;
    const campaignCount = Math.round(1 + rand() * 12);
    const rating = Math.round((3.5 + rand() * 1.5) * 10) / 10;
    const reach = Math.round(followers * (1.2 + rand() * 2));
    const daysAgo = Math.round(rand() * 180);
    return {
      id: `${seed}-network-${i}`,
      name: NETWORK_NAMES[(i + Math.floor(rand() * 2)) % NETWORK_NAMES.length],
      niche,
      followers,
      campaignCount,
      rating,
      reach,
      daysAgo,
    };
  });
}

const TAGLINE_TEMPLATES = [
  (n) => `Empowering creators to grow with ${n}.`,
  (n) => `${n} — building authentic brand stories with creators.`,
  (n) => `Partner with ${n} to reach audiences that matter.`,
  (n) => `${n}: where creativity meets opportunity.`,
];
const OPERATING_COUNTRIES_POOL = ['Pakistan', 'UAE', 'Saudi Arabia', 'United Kingdom', 'United States', 'India', 'Bangladesh', 'Canada'];
const TEAM_SIZE_BY_COMPANY_SIZE = {
  'Startup (1-10)': '1-10 employees',
  'Growing (11-50)': '11-50 employees',
  'Mid-size (51-200)': '51-200 employees',
  'Enterprise (200+)': '200+ employees',
};

/**
 * Tagline, operating footprint, languages, team size, and social presence
 * flags used across the Brand Hero and Company Information sections.
 */
export function getBrandProfileExtras(brand = {}) {
  const seed = brandSeed(brand);
  const rand = seededRandom(`${seed}-profile-extras`);
  const brandName = brand.companyName ?? 'This brand';
  const meta = getBrandMeta(brand);

  const operatingCountries = pickSubset(rand, OPERATING_COUNTRIES_POOL, 2);
  if (!operatingCountries.includes('Pakistan')) operatingCountries.unshift('Pakistan');

  return {
    tagline: TAGLINE_TEMPLATES[Math.floor(rand() * TAGLINE_TEMPLATES.length)](brandName),
    operatingCountries,
    languages: pickSubset(rand, LANGUAGES_POOL, 1),
    teamSize: TEAM_SIZE_BY_COMPANY_SIZE[meta.companySize] || '11-50 employees',
    socialLinks: {
      // Use string handles (or null) so components can call .replace() safely
      instagram: brand.instagram || (rand() > 0.2 ? `@${brandName.toLowerCase().replace(/\s+/g, '')}` : null),
      facebook:  brand.facebook  || (rand() > 0.3 ? brandName : null),
      linkedin:  brand.linkedin  || (rand() > 0.25 ? brandName.toLowerCase().replace(/\s+/g, '-') : null),
      tiktok:    brand.tiktok    || (rand() > 0.4 ? `@${brandName.toLowerCase().replace(/\s+/g, '')}` : null),
      youtube:   brand.youtube   || (rand() > 0.45 ? brandName : null),
      x:         brand.x         || (rand() > 0.5 ? `@${brandName.toLowerCase().replace(/\s+/g, '')}` : null),
    },
  };
}

const HEATMAP_FORMATS = ['Reels', 'Static Posts', 'Stories', 'Long-form Video', 'Livestreams'];
const HEATMAP_REGIONS = ['Lahore', 'Karachi', 'Islamabad', 'Dubai', 'International'];

/**
 * Performance heatmap of which creator niches, regions, and content
 * formats perform best for this brand's partnerships.
 */
export function getPartnershipHeatmap(brand = {}) {
  const seed = brandSeed(brand);
  const rand = seededRandom(`${seed}-partnership-heatmap`);

  return {
    niches: NICHES.slice(0, 6).map((niche) => ({ label: niche, value: Math.round(40 + rand() * 58) })),
    regions: HEATMAP_REGIONS.map((region) => ({ label: region, value: Math.round(35 + rand() * 60) })),
    formats: HEATMAP_FORMATS.map((format) => ({ label: format, value: Math.round(45 + rand() * 53) })),
  };
}
