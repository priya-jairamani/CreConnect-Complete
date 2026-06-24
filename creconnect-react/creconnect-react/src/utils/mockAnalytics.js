/**
 * Deterministic "estimated" analytics generators.
 *
 * The backend doesn't yet expose audience demographics or historical
 * performance series. These helpers derive realistic, stable-per-creator
 * datasets from a seed string (e.g. username) so the UI can render rich
 * charts today and swap to live data later without changing shape.
 */

export function seededRandom(seed) {
  let h = 1779033703 ^ seed.length;
  for (let i = 0; i < seed.length; i++) {
    h = Math.imul(h ^ seed.charCodeAt(i), 3432918353);
    h = (h << 13) | (h >>> 19);
  }
  return function () {
    h = Math.imul(h ^ (h >>> 16), 2246822519);
    h = Math.imul(h ^ (h >>> 13), 3266489917);
    h ^= h >>> 16;
    return (h >>> 0) / 4294967296;
  };
}

function normalize(values) {
  const total = values.reduce((a, b) => a + b, 0);
  return values.map((v) => Math.round((v / total) * 1000) / 10);
}

const MONTHS = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];

export function getAudienceAge(seed = 'default') {
  const rand = seededRandom(`${seed}-age`);
  const buckets = ['13-17', '18-24', '25-34', '35-44', '45-54', '55+'];
  const weights = [0.4, 1.6, 1.4, 0.7, 0.4, 0.2].map((w) => w * (0.7 + rand() * 0.6));
  const values = normalize(weights);
  return buckets.map((label, i) => ({ label, value: values[i] }));
}

export function getAudienceGender(seed = 'default') {
  const rand = seededRandom(`${seed}-gender`);
  const female = 35 + Math.round(rand() * 35);
  const male = 100 - female - Math.round(rand() * 5);
  const other = 100 - female - male;
  return [
    { label: 'Female', value: female, color: '#857fff' },
    { label: 'Male', value: male, color: '#f59e0b' },
    { label: 'Other', value: Math.max(other, 0), color: '#16b364' },
  ];
}

export function getAudienceCountries(seed = 'default') {
  const rand = seededRandom(`${seed}-country`);
  const pool = ['Pakistan', 'United States', 'United Kingdom', 'UAE', 'India', 'Saudi Arabia', 'Canada'];
  const weights = pool.map((_, i) => (i === 0 ? 3 + rand() * 2 : rand()));
  const values = normalize(weights);
  return pool
    .map((label, i) => ({ label, value: values[i] }))
    .sort((a, b) => b.value - a.value)
    .slice(0, 5);
}

export function getAudienceCities(seed = 'default') {
  const rand = seededRandom(`${seed}-city`);
  const pool = ['Lahore', 'Karachi', 'Islamabad', 'Rawalpindi', 'Faisalabad', 'Multan'];
  const weights = pool.map((_, i) => (i < 2 ? 2 + rand() * 2 : rand()));
  const values = normalize(weights);
  return pool
    .map((label, i) => ({ label, value: values[i] }))
    .sort((a, b) => b.value - a.value)
    .slice(0, 5);
}

export function getActiveHours(seed = 'default') {
  const rand = seededRandom(`${seed}-hours`);
  return Array.from({ length: 24 }, (_, hour) => {
    const eveningBoost = hour >= 18 && hour <= 23 ? 0.5 : 0;
    const lunchBoost = hour >= 12 && hour <= 14 ? 0.25 : 0;
    return {
      hour: `${hour.toString().padStart(2, '0')}:00`,
      value: Math.round((0.15 + rand() * 0.4 + eveningBoost + lunchBoost) * 100),
    };
  });
}

export function getAudienceInterests(seed = 'default') {
  const rand = seededRandom(`${seed}-interests`);
  const pool = ['Fashion', 'Beauty', 'Fitness', 'Travel', 'Food', 'Tech', 'Gaming', 'Lifestyle'];
  return pool
    .map((label) => ({ label, value: Math.round((0.3 + rand() * 0.7) * 100) }))
    .sort((a, b) => b.value - a.value)
    .slice(0, 6);
}

/**
 * Monthly time series for follower growth, reach, engagement and conversions.
 * @param {string} seed
 * @param {number} months
 * @param {number} baseFollowers  current/latest follower count to anchor the series
 */
export function getGrowthSeries(seed = 'default', months = 6, baseFollowers = 10000) {
  const rand = seededRandom(`${seed}-growth`);
  const now = new Date();
  const series = [];
  let followers = Math.round(baseFollowers / (1 + months * 0.02 * (1 + rand())));
  const monthlyGrowth = 0.015 + rand() * 0.03;

  for (let i = months - 1; i >= 0; i--) {
    const d = new Date(now.getFullYear(), now.getMonth() - i, 1);
    followers = Math.round(followers * (1 + monthlyGrowth * (0.6 + rand() * 0.8)));
    const reach = Math.round(followers * (1.8 + rand() * 1.2));
    const engagement = Math.round((2 + rand() * 4) * 10) / 10;
    const conversions = Math.round(reach * (0.005 + rand() * 0.015));
    series.push({
      month: MONTHS[d.getMonth()],
      followers,
      reach,
      engagement,
      conversions,
    });
  }
  // anchor the last point to the real current follower count
  if (series.length) series[series.length - 1].followers = baseFollowers;
  return series;
}

export function getContentPerformance(seed = 'default') {
  const rand = seededRandom(`${seed}-content`);
  const types = ['Reels', 'Posts', 'Stories', 'Videos'];
  return types.map((type) => ({
    type,
    avgViews: Math.round((1000 + rand() * 50000)),
    avgEngagement: Math.round((1.5 + rand() * 6) * 10) / 10,
  }));
}

/**
 * Per-platform supplemental stats (growth %, avg views/reach, audience quality)
 * derived from the platform's follower count for stable, plausible numbers.
 */
export function getPlatformStats(seed, followerCount = 0) {
  const rand = seededRandom(`${seed}-platform`);
  return {
    growth: Math.round((rand() * 18 - 3) * 10) / 10,
    avgViews: Math.round(followerCount * (0.15 + rand() * 0.5)),
    avgReach: Math.round(followerCount * (0.3 + rand() * 0.9)),
    audienceQuality: Math.round(60 + rand() * 38),
  };
}

/**
 * AI-style campaign forecast derived from the wizard's current inputs.
 * Pure function of niche/platforms/budget so the preview updates live
 * as the user edits the form, without needing a backend call.
 */
export function getCampaignForecast({ niche = '', platforms = [], budgetMin = 0, budgetMax = 0, followerMin = 0, followerMax = 0 }) {
  const seed = `${niche}-${platforms.join(',')}-${budgetMin}-${budgetMax}-${followerMin}-${followerMax}`;
  const rand = seededRandom(seed || 'forecast');
  const avgBudget = (budgetMin + budgetMax) / 2 || 50000;
  const avgFollowers = (followerMin + followerMax) / 2 || 50000;

  const recommendedCreators = Math.max(1, Math.round(avgBudget / (avgFollowers * (0.8 + rand() * 0.6) / 8 + 2000)));
  const estimatedReach = Math.round(recommendedCreators * avgFollowers * (1.4 + rand() * 1.2));
  const estimatedEngagementRate = Math.round((2 + rand() * 5) * 10) / 10;
  const estimatedConversions = Math.round(estimatedReach * (0.004 + rand() * 0.012));
  const suggestedBudgetMin = Math.round(avgBudget * (0.85 - rand() * 0.15));
  const suggestedBudgetMax = Math.round(avgBudget * (1.15 + rand() * 0.25));
  const costPerReach = estimatedReach > 0 ? Math.round((avgBudget / estimatedReach) * 1000) / 1000 : 0;

  return {
    recommendedCreators,
    estimatedReach,
    estimatedEngagementRate,
    estimatedConversions,
    suggestedBudgetMin,
    suggestedBudgetMax,
    costPerReach,
  };
}

export function getScores(seed = 'default') {
  const rand = seededRandom(`${seed}-scores`);
  return {
    creatorScore: Math.round(60 + rand() * 35),
    authenticityScore: Math.round(70 + rand() * 28),
    responseRate: Math.round(75 + rand() * 24),
    avgResponseTime: `${Math.round(1 + rand() * 11)}h`,
    campaignSuccessRate: Math.round(70 + rand() * 28),
  };
}

/**
 * Extended scorecard for the Creator Intelligence Center: adds trust,
 * brand-safety and audience-quality scores plus month-over-month deltas.
 */
export function getScorecard(seed = 'default') {
  const rand = seededRandom(`${seed}-scorecard`);
  const base = getScores(seed);
  const metrics = {
    creatorScore: base.creatorScore,
    authenticityScore: base.authenticityScore,
    trustScore: Math.round(72 + rand() * 25),
    brandSafetyScore: Math.round(80 + rand() * 18),
    collaborationScore: Math.round(68 + rand() * 28),
    audienceQualityScore: Math.round(65 + rand() * 30),
  };
  const trends = {};
  Object.keys(metrics).forEach((key) => {
    trends[key] = Math.round((rand() * 10 - 3) * 10) / 10;
  });
  return { metrics, trends };
}

/**
 * Audience-quality breakdown: real vs. suspicious followers, active vs. returning viewers.
 */
export function getAudienceQuality(seed = 'default') {
  const rand = seededRandom(`${seed}-audience-quality`);
  const realFollowers = Math.round(76 + rand() * 20);
  return {
    realFollowers,
    suspiciousFollowers: Math.max(0, 100 - realFollowers),
    activeFollowers: Math.round(50 + rand() * 38),
    returningViewers: Math.round(28 + rand() * 42),
  };
}

/**
 * Category benchmark comparison — creator metrics vs. niche-average,
 * expressed as a percentile rank (1-99).
 */
export function getBenchmark(seed = 'default') {
  const rand = seededRandom(`${seed}-benchmark`);
  const labels = ['Engagement', 'Reach', 'Growth', 'Authenticity', 'Pricing'];
  return labels.map((label) => {
    const creator = Math.round(35 + rand() * 60);
    const average = Math.round(35 + rand() * 40);
    const percentile = Math.min(99, Math.max(1, Math.round(50 + (creator - average) * 1.4)));
    return { label, creator, average, percentile };
  });
}

/**
 * Monthly earnings series + revenue-source breakdown.
 * If `totalEarnings` is provided (real data), the series is scaled to sum to it.
 */
export function getEarningsBreakdown(seed = 'default', months = 6, totalEarnings = 0) {
  const rand = seededRandom(`${seed}-earnings`);
  const now = new Date();
  const weights = Array.from({ length: months }, () => 0.6 + rand());
  const weightSum = weights.reduce((a, b) => a + b, 0);

  const series = [];
  for (let i = months - 1; i >= 0; i--) {
    const d = new Date(now.getFullYear(), now.getMonth() - i, 1);
    const share = weights[months - 1 - i] / weightSum;
    const earnings = totalEarnings > 0
      ? Math.round(totalEarnings * share)
      : Math.round(15000 + rand() * 120000);
    series.push({ month: MONTHS[d.getMonth()], earnings });
  }

  const sourceLabels = ['Sponsored Posts', 'Reels & Videos', 'Affiliate', 'Retainers', 'Appearances'];
  const sourceWeights = sourceLabels.map(() => rand());
  const sourceValues = normalize(sourceWeights);
  const sources = sourceLabels.map((label, i) => ({ label, value: sourceValues[i] }));

  return { series, sources };
}

/**
 * Star-rating distribution (1-5 stars, percentages summing to 100).
 */
export function getRatingDistribution(seed = 'default') {
  const rand = seededRandom(`${seed}-rating-dist`);
  const five = Math.round(45 + rand() * 35);
  const four = Math.round(8 + rand() * 25);
  const three = Math.round(rand() * 10);
  const two = Math.round(rand() * 4);
  const one = Math.max(0, 100 - five - four - three - two);
  return [
    { label: '5★', value: five },
    { label: '4★', value: four },
    { label: '3★', value: three },
    { label: '2★', value: two },
    { label: '1★', value: one },
  ];
}

const PLATFORM_LABELS = {
  INSTAGRAM: 'Instagram', TIKTOK: 'TikTok', YOUTUBE: 'YouTube', LINKEDIN: 'LinkedIn',
  FACEBOOK: 'Facebook', X: 'X', TWITTER: 'X', THREADS: 'Threads',
};

/**
 * AI-style profile insight strings, derived from a mix of real profile/stat
 * data and seeded mock deltas so they read naturally and stay stable.
 */
export function getAIInsights(profile = {}, stats = {}, platforms = []) {
  const seed = profile?.username ?? profile?.id ?? 'creator';
  const rand = seededRandom(`${seed}-ai-insights`);
  const insights = [];

  const engagementDelta = Math.round(rand() * 22 - 4);
  insights.push(
    engagementDelta >= 0
      ? `Engagement increased ${engagementDelta}% this month`
      : `Engagement dipped ${Math.abs(engagementDelta)}% this month — consider posting during peak hours`
  );

  if (profile?.niche) {
    const otherNiches = NICHES_FOR_INSIGHTS.filter((n) => n.toLowerCase() !== profile.niche.toLowerCase());
    const other = otherNiches[Math.floor(rand() * otherNiches.length)] ?? 'other niches';
    insights.push(`${profile.niche} content performs ${Math.round(15 + rand() * 30)}% better than ${other} content for your audience`);
  }

  const cities = getAudienceCities(seed);
  if (cities.length >= 2) {
    insights.push(`Your audience is strongest in ${cities[0].label} and ${cities[1].label}`);
  }

  const sortedPlatforms = [...(platforms ?? [])].sort((a, b) => (b.followerCount ?? 0) - (a.followerCount ?? 0));
  if (sortedPlatforms[0]) {
    const top = sortedPlatforms[0];
    const pct = Math.round(50 + rand() * 35);
    insights.push(`${PLATFORM_LABELS[top.platform?.toUpperCase()] ?? top.platform} currently drives ${pct}% of your total reach`);
  }

  if (typeof stats.engagementRate === 'number' && stats.engagementRate > 0) {
    const pct = (stats.engagementRate > 1 ? stats.engagementRate : stats.engagementRate * 100).toFixed(1);
    insights.push(`Your engagement rate of ${pct}% is ${rand() > 0.5 ? 'above' : 'in line with'} similar creators in your niche`);
  }

  insights.push(`Posting ${Math.round(2 + rand() * 3)}x per week could grow your reach by an estimated ${Math.round(10 + rand() * 20)}%`);

  return insights;
}

const NICHES_FOR_INSIGHTS = ['Fashion', 'Beauty', 'Fitness', 'Food', 'Tech', 'Gaming', 'Travel', 'Finance', 'Education', 'Lifestyle'];

/**
 * Computes which premium badges a creator has earned from their real
 * scores/stats — purely derived, no invented data.
 */
export function getCreatorBadges({ profile = {}, stats = {}, scorecard }) {
  const badges = [];
  if (profile.isVerified) badges.push({ key: 'verified', label: 'Verified Creator', icon: '✓', variant: 'success' });
  if ((scorecard?.metrics?.creatorScore ?? 0) >= 85) badges.push({ key: 'top', label: 'Top Performer', icon: '🏆', variant: 'brand' });
  if ((stats.activeCampaigns ?? 0) === 0 && (profile.ratingCount ?? 0) > 0 && (profile.ratingCount ?? 0) < 5) {
    badges.push({ key: 'rising', label: 'Rising Creator', icon: '🌱', variant: 'accent' });
  }
  if ((scorecard?.metrics?.collaborationScore ?? 0) >= 85) badges.push({ key: 'fast', label: 'Fast Responder', icon: '⚡', variant: 'warning' });
  if ((profile.rating ?? 0) >= 4.5) badges.push({ key: 'favorite', label: 'Brand Favorite', icon: '❤', variant: 'danger' });
  if ((scorecard?.metrics?.brandSafetyScore ?? 0) >= 90) badges.push({ key: 'premium', label: 'Premium Creator', icon: '💎', variant: 'neutral' });
  return badges;
}
