/**
 * Deterministic "estimated" outreach-intelligence generators for the
 * Campaign Invitation Center (Brand → Creator outreach workspace).
 *
 * The backend doesn't yet expose match scoring, pricing estimates,
 * recruitment funnels, or invitation pipelines. These helpers derive
 * realistic, stable-per-creator datasets from a seed string (creator id /
 * username) so the workspace can render rich cards, comparisons, and
 * forecasts today and swap to live data later without changing shape.
 */

import { seededRandom, getScores, getAudienceQuality, getAudienceCountries } from './mockAnalytics';
import { formatPKR } from './formatters';
import { FUNNEL_STAGES, INVITATION_STAGES } from '@/constants/outreachOptions';

function creatorSeed(creator = {}) {
  return creator.id ?? creator.userId ?? creator.username ?? creator.displayName ?? 'creator';
}

/**
 * Core outreach intelligence for a single creator: scores, reach,
 * pricing estimate, reliability, and risk factors.
 */
export function getCreatorOutreachIntel(creator = {}) {
  const seed = creatorSeed(creator);
  const rand = seededRandom(`${seed}-outreach-intel`);
  const scores = getScores(seed);
  const audienceQuality = getAudienceQuality(seed);

  const followers = creator.metrics?.totalFollowers ?? creator.followerCount ?? Math.round(5000 + rand() * 200000);
  const engagementRate = creator.metrics?.avgEngagementRate ?? creator.engagementRate ?? Math.round((1 + rand() * 7) * 10) / 10 / 100;
  const avgReach = Math.round(followers * (0.25 + rand() * 0.45));
  const avgCampaignROI = Math.round(80 + rand() * 160);
  const reliability = Math.round(70 + rand() * 28);
  const missedDeadlines = Math.round(rand() * 3);
  const fraudRiskScore = Math.max(0, 100 - audienceQuality.realFollowers + Math.round(rand() * 6));
  const fraudRisk = fraudRiskScore >= 18 ? 'High' : fraudRiskScore >= 8 ? 'Medium' : 'Low';
  const pastCollaborations = creator.metrics?.completedCollabs ?? Math.round(rand() * 40);

  const pricingMin = Math.round((followers * 0.4 + 4000) / 500) * 500;
  const pricingMax = Math.round((pricingMin * (1.5 + rand() * 0.9)) / 500) * 500;

  return {
    creatorScore: scores.creatorScore,
    authenticityScore: scores.authenticityScore,
    audienceQuality: audienceQuality.realFollowers,
    avgReach,
    avgCampaignROI,
    reliability,
    missedDeadlines,
    fraudRisk,
    responseRate: scores.responseRate,
    avgResponseTime: scores.avgResponseTime,
    pricingMin,
    pricingMax,
    followers,
    engagementRate,
    pastCollaborations,
  };
}

/**
 * AI Match breakdown for a creator against a campaign brief: audience,
 * niche, location, engagement, and budget fit, plus a "why recommended" string.
 */
export function getMatchBreakdown(creator = {}, campaign = {}) {
  const seed = creatorSeed(creator);
  const rand = seededRandom(`${seed}-match-${campaign.category ?? ''}`);
  const intel = getCreatorOutreachIntel(creator);

  const audienceMatch = Math.round(60 + rand() * 38);

  const niche = (creator.niche ?? '').toLowerCase();
  const category = (campaign.category ?? '').toLowerCase();
  const nicheFit = category
    ? (niche === category ? Math.round(85 + rand() * 14) : Math.round(50 + rand() * 35))
    : Math.round(60 + rand() * 35);

  const audienceCountries = getAudienceCountries(seed).map((c) => c.label);
  const targetCountries = campaign.audienceCountries ?? [];
  const locationFit = targetCountries.length
    ? (targetCountries.some((c) => audienceCountries.includes(c)) ? Math.round(80 + rand() * 18) : Math.round(40 + rand() * 30))
    : Math.round(60 + rand() * 35);

  const engagementFit = Math.min(100, Math.round(intel.engagementRate * 100 * 14 + rand() * 10));

  const avgBudget = (intel.pricingMin + intel.pricingMax) / 2;
  const campaignBudget = ((campaign.budgetMin ?? 0) + (campaign.budgetMax ?? 0)) / 2 || avgBudget;
  const budgetRatio = avgBudget > 0 ? campaignBudget / avgBudget : 1;
  const budgetFit = Math.round(Math.max(35, Math.min(99, 100 - Math.abs(1 - budgetRatio) * 60)));

  const overall = Math.round(
    audienceMatch * 0.25 + nicheFit * 0.25 + locationFit * 0.15 + engagementFit * 0.2 + budgetFit * 0.15
  );

  const reasons = [];
  if (nicheFit >= 80) reasons.push(`strong fit for ${campaign.category ?? creator.niche ?? 'this'} content`);
  if (engagementFit >= 70) reasons.push('above-average engagement rate');
  if (intel.authenticityScore >= 85) reasons.push('a high authenticity score');
  if (locationFit >= 80) reasons.push('an audience that overlaps with your target markets');
  if (intel.reliability >= 90) reasons.push('a strong track record of on-time delivery');
  if (!reasons.length) reasons.push('a solid overall profile match for this campaign');

  const why = `${creator.displayName ?? 'This creator'} is recommended for ${reasons.slice(0, 3).join(', ')}.`;

  return { overall, audienceMatch, nicheFit, locationFit, engagementFit, budgetFit, why };
}

/**
 * Creator Recruitment Funnel — counts of creators at each outreach stage.
 */
export function getRecruitmentFunnel(creators = []) {
  const counts = Object.fromEntries(FUNNEL_STAGES.map((s) => [s, 0]));
  creators.forEach((creator) => {
    const seed = creatorSeed(creator);
    const rand = seededRandom(`${seed}-funnel`);
    const r = rand();
    let stage;
    if (r < 0.12) stage = 'Active';
    else if (r < 0.28) stage = 'Accepted';
    else if (r < 0.46) stage = 'Negotiating';
    else if (r < 0.66) stage = 'Interested';
    else if (r < 0.85) stage = 'Contacted';
    else stage = 'Sourced';
    counts[stage] += 1;
  });
  return FUNNEL_STAGES.map((stage) => ({ stage, count: counts[stage] }));
}

/**
 * Deterministic invitation-pipeline stage for a creator (used to seed the
 * Invitation Tracker before the brand has sent any real invites).
 */
export function getInvitationStage(creator = {}) {
  const seed = creatorSeed(creator);
  const rand = seededRandom(`${seed}-invitation-stage`);
  const r = rand();
  if (r < 0.18) return 'Draft';
  if (r < 0.38) return 'Sent';
  if (r < 0.54) return 'Viewed';
  if (r < 0.68) return 'Responded';
  if (r < 0.8) return 'Negotiating';
  if (r < 0.94) return 'Accepted';
  return 'Rejected';
}

export { INVITATION_STAGES };

/**
 * Campaign forecast — expected reach/engagement/conversions/ROI and a
 * confidence score, derived from the proposal brief and any selected creators.
 */
export function getCampaignForecast(proposal = {}, selectedCreators = []) {
  const seed = `forecast-${proposal.title ?? ''}-${selectedCreators.map(creatorSeed).join(',')}`;
  const rand = seededRandom(seed || 'forecast-default');

  if (!selectedCreators.length) {
    const avgBudget = ((proposal.budgetTotal ?? 0)) || 50000;
    const reach = Math.round(avgBudget * (4 + rand() * 4));
    const engagement = Math.round(reach * (0.02 + rand() * 0.04));
    const conversions = Math.round(engagement * (0.03 + rand() * 0.05));
    const roi = Math.round(80 + rand() * 100);
    return {
      expectedReach: reach,
      expectedImpressions: Math.round(reach * (1.4 + rand() * 0.6)),
      expectedEngagement: engagement,
      estimatedConversions: conversions,
      estimatedROI: roi,
      confidenceScore: Math.round(40 + rand() * 25),
    };
  }

  let reach = 0;
  let engagementSum = 0;
  let matchSum = 0;
  selectedCreators.forEach((creator) => {
    const intel = getCreatorOutreachIntel(creator);
    const match = getMatchBreakdown(creator, proposal);
    reach += intel.avgReach;
    engagementSum += intel.engagementRate;
    matchSum += match.overall;
  });
  const avgEngagementRate = engagementSum / selectedCreators.length;
  const avgMatch = matchSum / selectedCreators.length;
  const expectedEngagement = Math.round(reach * avgEngagementRate);
  const estimatedConversions = Math.round(expectedEngagement * (0.03 + rand() * 0.05));
  const estimatedROI = Math.round(70 + avgMatch * 0.9 + rand() * 30);
  const confidenceScore = Math.round(Math.min(98, Math.max(35, avgMatch * 0.9 + rand() * 12)));

  return {
    expectedReach: reach,
    expectedImpressions: Math.round(reach * (1.4 + rand() * 0.6)),
    expectedEngagement,
    estimatedConversions,
    estimatedROI,
    confidenceScore,
  };
}

/**
 * Budget → Reach → Engagement → Conversion chain estimate for the
 * Expected Campaign Calculator.
 */
export function getCampaignCalculatorEstimate({ budget = 0, avgFollowers = 50000, avgEngagementRate = 0.03 } = {}) {
  const seed = `calc-${budget}-${avgFollowers}-${avgEngagementRate}`;
  const rand = seededRandom(seed);
  const costPerCreator = Math.max(2000, avgFollowers * (0.4 + rand() * 0.4));
  const creatorCount = Math.max(1, Math.floor(budget / costPerCreator));
  const reach = Math.round(creatorCount * avgFollowers * (1.2 + rand() * 0.8));
  const engagement = Math.round(reach * avgEngagementRate);
  const conversions = Math.round(engagement * (0.02 + rand() * 0.04));
  return { creatorCount, reach, engagement, conversions };
}

/**
 * AI-generated personalized outreach message for a creator/campaign pair.
 */
export function generateOutreachMessage(creator = {}, campaign = {}) {
  const name = creator.displayName ?? 'there';
  const niche = (creator.niche ?? 'content').toLowerCase();
  const brand = campaign.brandName ?? 'our brand';
  const title = campaign.title ?? 'an upcoming campaign';
  const objective = campaign.objective ? `our goal is ${campaign.objective.toLowerCase()}` : "we think this could be a great partnership";

  return `Hi ${name}, we love your ${niche} content and think you'd be a perfect fit for "${title}" with ${brand}. We'd like to invite you to collaborate — ${objective}. We'll cover deliverables, timeline, and budget in the full proposal. Let us know if you're interested!`;
}

/**
 * AI-generated campaign summary for the proposal review step.
 */
export function generateProposalSummary(proposal = {}) {
  const deliverableSummary = (proposal.deliverables ?? [])
    .map((d) => `${d.quantity}x ${d.type}`)
    .join(', ') || 'content deliverables';

  return `"${proposal.title || 'Untitled Campaign'}" is a ${proposal.objective ?? 'campaign'} in the ${proposal.category ?? 'general'} category. Creators will deliver ${deliverableSummary}, with a total budget of ${formatPKR(proposal.budgetTotal ?? 0)} and a ${(proposal.budgetType ?? 'fixed').toLowerCase()} payout structure.`;
}

/**
 * AI campaign-success prediction for the Brand Copilot.
 */
export function getCampaignSuccessPrediction(proposal = {}, selectedCreators = []) {
  const forecast = getCampaignForecast(proposal, selectedCreators);
  const factors = [];
  if (selectedCreators.length === 0) factors.push('No creators shortlisted yet — add creators to improve accuracy.');
  if (proposal.deliverables?.length) factors.push(`${proposal.deliverables.length} deliverable type(s) defined.`);
  if (proposal.budgetTotal) factors.push(`Budget of ${formatPKR(proposal.budgetTotal)} allocated.`);
  if (selectedCreators.length >= 3) factors.push('Strong creator roster increases reach diversity.');

  return { ...forecast, factors };
}
