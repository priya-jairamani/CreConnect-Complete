'use strict';

// Normalises free-text industry names from the DB to the canonical keys used
// in NICHE_INDUSTRY_MAP. Add new aliases here as more brands register.
const INDUSTRY_ALIASES = {
  // Fashion variants
  'fashion & apparel': 'Fashion',
  'apparel': 'Fashion',
  'clothing': 'Fashion',
  // Beauty variants
  'beauty & cosmetics': 'Beauty',
  'cosmetics': 'Beauty',
  'skincare': 'Beauty',
  // Gaming variants
  'esports': 'Gaming',
  'gaming & esports': 'Gaming',
  // Technology variants
  'tech': 'Technology',
  'it': 'Technology',
  'software': 'Technology',
  'saas': 'Technology',
  // Fitness variants
  'fitness': 'Health & Fitness',
  'health': 'Health & Fitness',
  'wellness': 'Health & Fitness',
  'health & wellness': 'Health & Fitness',
  // Food variants
  'food': 'Food & Beverage',
  'restaurant': 'Food & Beverage',
  'fmcg': 'Food & Beverage',
  'food & drinks': 'Food & Beverage',
  // Lifestyle variants
  'home & lifestyle': 'Lifestyle',
  'home decor': 'Lifestyle',
  // Travel variants
  'hospitality': 'Travel',
  'tourism': 'Travel',
  // Education variants
  'edtech': 'Education',
  'e-learning': 'Education',
  // Finance variants
  'fintech': 'Finance',
  'banking': 'Finance',
  'insurance': 'Finance',
  // Catch-alls
  'e-commerce': 'Lifestyle',
  'ecommerce': 'Lifestyle',
  'retail': 'Lifestyle',
  'media': 'Lifestyle',
};

function normaliseIndustry(raw) {
  if (!raw) return raw;
  return INDUSTRY_ALIASES[raw.toLowerCase()] || raw;
}

// Niche-to-industry compatibility table. Values 0.0–1.0.
const NICHE_INDUSTRY_MAP = {
  FASHION:   { Fashion: 1.0, Beauty: 0.5, Lifestyle: 0.7 },
  BEAUTY:    { Beauty: 1.0, Fashion: 0.5, Lifestyle: 0.6 },
  GAMING:    { Gaming: 1.0, Technology: 0.4 },
  TECH:      { Technology: 1.0, Education: 0.5, Finance: 0.4 },
  FITNESS:   { 'Health & Fitness': 1.0, 'Food & Beverage': 0.3, Lifestyle: 0.4 },
  FOOD:      { 'Food & Beverage': 1.0, Lifestyle: 0.5, Travel: 0.3 },
  LIFESTYLE: { Lifestyle: 1.0, Fashion: 0.6, Travel: 0.5, Beauty: 0.4 },
  TRAVEL:    { Travel: 1.0, Lifestyle: 0.5, 'Food & Beverage': 0.3 },
  EDUCATION: { Education: 1.0, Technology: 0.5, Finance: 0.4 },
  FINANCE:   { Finance: 1.0, Technology: 0.4, Education: 0.4 },
};

/**
 * Returns 0.0–1.0 compatibility between a creator niche and a brand industry.
 * Also checks the creator's preferredIndustries array for a bonus.
 */
function nicheIndustryScore(creator, brand) {
  const industry = normaliseIndustry(brand.industry);
  const primary = (NICHE_INDUSTRY_MAP[creator.niche] || {})[industry] || 0;

  // Check array niches for additional match
  let arrayBonus = 0;
  if (Array.isArray(creator.niches)) {
    for (const n of creator.niches) {
      const v = (NICHE_INDUSTRY_MAP[n] || {})[industry] || 0;
      if (v > arrayBonus) arrayBonus = v;
    }
  }
  // Preferred industries declared by the creator (normalise before comparing)
  let prefBonus = 0;
  if (Array.isArray(creator.preferredIndustries)) {
    const normPref = creator.preferredIndustries.map(normaliseIndustry);
    if (normPref.includes(industry)) prefBonus = 0.1;
  }

  return Math.min(1.0, Math.max(primary, arrayBonus) + prefBonus);
}

/**
 * Clamps and linearly normalizes a value into [0, 1].
 */
function normalize(value, min, max) {
  if (max <= min) return 0;
  return Math.min(1, Math.max(0, (value - min) / (max - min)));
}

/**
 * Scores creator engagement rate. Assumes 0–10% maps to 0–1.
 * Rates above 10% are still capped at 1.
 */
function engagementScore(engagementRate) {
  return normalize(engagementRate, 0, 10);
}

/**
 * Audience size fit.
 * If the brand has follower constraints on campaigns, we use them.
 * Otherwise we use a logarithmic scale: more followers = more audience reach.
 */
function audienceFitScore(creator, brand) {
  const followers = creator.followerCount || 0;
  // Brand's preferred follower range via budgetMin/Max proxy — use log scale
  // 1K = 0.1, 10K = 0.3, 50K = 0.6, 100K = 0.75, 500K = 0.9, 1M+ = 1.0
  const logScore = normalize(Math.log10(Math.max(followers, 1)), Math.log10(1000), Math.log10(1000000));

  // Budget overlap: creator budgetMin–Max vs brand defaultBudgetMin–Max
  // Guard: if either side has no budget data, stay neutral (0.5)
  let budgetOverlap = 0.5;
  const cMin = creator.budgetMin || 0;
  const cMax = creator.budgetMax  || 0;
  const bMin = brand.defaultBudgetMin || 0;
  const bMax = brand.defaultBudgetMax || 0;

  if (cMax > 0 && bMax > 0) {
    // Both sides have real budget data — compute overlap ratio
    const overlapStart = Math.max(cMin, bMin);
    const overlapEnd   = Math.min(cMax, bMax);
    if (overlapEnd >= overlapStart) {
      const overlapRange = overlapEnd - overlapStart;
      const brandRange   = Math.max(bMax - bMin, 1);
      budgetOverlap = Math.min(1, overlapRange / brandRange);
    } else {
      budgetOverlap = 0;
    }
  }

  return (logScore * 0.6) + (budgetOverlap * 0.4);
}

/**
 * Location similarity. 100% same city, 60% same country, 0% otherwise.
 * Simple string matching on location field.
 */
function locationScore(creator, brand) {
  if (!creator.location || !brand.location) return 0.3; // unknown → neutral
  if (creator.location.toLowerCase() === brand.location.toLowerCase()) return 1.0;
  // Both in Pakistan (default assumption if both have a location)
  return 0.5;
}

/**
 * Cosine similarity between two arrays of equal length (feature vectors).
 */
function cosineSimilarity(a, b) {
  if (a.length !== b.length) return 0;
  let dot = 0, normA = 0, normB = 0;
  for (let i = 0; i < a.length; i++) {
    dot   += a[i] * b[i];
    normA += a[i] * a[i];
    normB += b[i] * b[i];
  }
  if (normA === 0 || normB === 0) return 0;
  return dot / (Math.sqrt(normA) * Math.sqrt(normB));
}

/**
 * Given a creator's niche, returns a one-hot vector aligned to NICHES array.
 */
const NICHES = ['FASHION','BEAUTY','GAMING','TECH','FITNESS','FOOD','LIFESTYLE','TRAVEL','EDUCATION','FINANCE'];

function nicheVector(creator) {
  return NICHES.map((n) => {
    if (creator.niche === n) return 1.0;
    if (Array.isArray(creator.niches) && creator.niches.includes(n)) return 0.5;
    return 0;
  });
}

/**
 * Brand preference vector aligned to NICHES (from preferredCategories).
 */
function brandNicheVector(brand) {
  return NICHES.map((n) => (Array.isArray(brand.preferredCategories) && brand.preferredCategories.includes(n) ? 1.0 : 0));
}

module.exports = {
  nicheIndustryScore,
  normalize,
  engagementScore,
  audienceFitScore,
  locationScore,
  cosineSimilarity,
  nicheVector,
  brandNicheVector,
  NICHES,
};
