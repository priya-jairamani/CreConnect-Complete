'use strict';

/**
 * Seed script: inserts realistic dummy data for bhavish1@gmail.com (CREATOR)
 * and bcompany@gmail.com (BRAND), including campaigns, collaborations,
 * applications, payments, and AI matches.
 *
 * Run: node scripts/seed-bhavish-bcompany.js
 */

require('dotenv').config();
const { sequelize } = require('../src/models');
const db = require('../src/models');

const BHAVISH_USER_ID  = '45ddd6d1-8fad-47d7-8f7a-4619ae9e5ecc';
const BCOMPANY_USER_ID = 'cb5bb5ec-b933-4fef-99fa-ba4206fd9244';

// ─── Helper ───────────────────────────────────────────────────────────────────
async function upsertCreatorProfile() {
  const existing = await db.CreatorProfile.findOne({ where: { userId: BHAVISH_USER_ID } });
  if (!existing) {
    console.log('  No creator profile found for bhavish1 — creating...');
    return;
  }

  await existing.update({
    displayName:   'Bhavish Kumar',
    username:      'bhavish_lifestyle',
    bio:           'Lifestyle & fashion content creator from Karachi 🇵🇰. I share everyday style, restaurant discoveries, and local travel. My audience is 70% female, aged 18–28, from urban Pakistan.',
    headline:      'Lifestyle & Fashion Creator | Karachi',
    niche:         'LIFESTYLE',
    niches:        ['LIFESTYLE', 'FASHION'],
    location:      'Karachi',
    followerCount: 45800,
    engagementRate: 4.8,
    rating:        4.2,
    isVerified:    true,
    totalViews:    892000,
    totalReach:    345000,
    budgetMin:     15000,
    budgetMax:     80000,
    availabilityStatus: 'AVAILABLE',

    // Social
    instagram:  '@bhavish_lifestyle',
    tiktok:     '@bhavish.pk',
    youtube:    'BhavishLifestyle',

    // Preferences
    preferredIndustries:    ['Lifestyle', 'Fashion', 'Food & Beverage', 'Beauty'],
    preferredCampaignTypes: ['PRODUCT_REVIEW', 'BRAND_AWARENESS', 'LAUNCH'],
    contentFormats:         ['Reels', 'Stories', 'Carousel Posts', 'YouTube Shorts'],
    contentStyles:          ['Aesthetic', 'Authentic', 'Lifestyle', 'Educational'],

    // Identity
    fullName:      'Bhavish Kumar',
    timezone:      'Asia/Karachi',
    nationality:   'Pakistani',
    gender:        'Male',
    collaborationStyle: 'Long-term',
    remoteOnsite:  'Both',
    travelAvailability: 'Domestic Only',
    portfolioLink: 'https://bhavish.pk/portfolio',
  });

  console.log(`  ✅ Creator profile updated — Bhavish Kumar (LIFESTYLE, 45.8K followers)`);
  return existing;
}

async function upsertBrandProfile() {
  const existing = await db.BrandProfile.findOne({ where: { userId: BCOMPANY_USER_ID } });
  if (!existing) {
    console.log('  No brand profile found for bcompany — skipping...');
    return null;
  }

  await existing.update({
    companyName:  'B Company Fashion',
    contactName:  'Rehan Malik',
    industry:     'Fashion',
    location:     'Karachi',
    website:      'https://bcompanyfashion.pk',
    brandSize:    'STARTUP',
    isVerified:   true,

    tagline:      'Modern fashion for the modern Pakistani woman',
    description:  'B Company Fashion is a contemporary Pakistani brand offering versatile, modern clothing for the urban Pakistani woman. We blend traditional aesthetics with modern silhouettes — think chic everyday wear that transitions from morning meetings to evening events.',
    foundedYear:  2022,
    brandColor:   '#2C2C54',

    // Targeting
    preferredCategories: ['FASHION', 'LIFESTYLE', 'BEAUTY'],
    preferredPlatforms:  ['instagram', 'tiktok'],
    audienceAgeMin:      18,
    audienceAgeMax:      32,
    audienceGenders:     ['Female'],
    audienceCountries:   ['Pakistan'],

    // Budget
    defaultBudgetMin: 30000,
    defaultBudgetMax: 150000,

    // Safety
    blockedCategories:  [],
    fraudDetection:     true,

    // Automation
    autoApproveCreators: false,
    autoSendInvites:     false,

    // Visibility
    publicProfileVisible:   true,
    displayTeamMembers:     false,
    displayCampaignResults: true,
    displayReviews:         true,
    displayBudgetRanges:    false,

    // Social
    instagram: '@bcompanyfashion',
    tiktok:    '@bcompany.pk',
  });

  console.log(`  ✅ Brand profile updated — B Company Fashion (Fashion, Karachi)`);
  return existing;
}

async function seedCampaigns(brandProfile) {
  if (!brandProfile) return [];
  const brandId = brandProfile.id;

  const existing = await db.Campaign.count({ where: { brandId } });
  if (existing >= 2) {
    console.log(`  ℹ️  Campaigns already exist for B Company (${existing} found) — skipping`);
    const camps = await db.Campaign.findAll({ where: { brandId } });
    return camps;
  }

  const campaigns = await db.Campaign.bulkCreate([
    {
      brandId,
      title:       'Eid Ready Collection — Spring 2026',
      description: 'B Company Fashion is launching its Eid festive collection for Spring 2026. We need lifestyle and fashion creators who can authentically showcase our new Pret line through styling reels and lookbooks. Ideal for female creators with an engaged, fashion-forward audience.',
      objective:   'LAUNCH',
      niche:       'FASHION',
      platforms:   ['instagram', 'tiktok'],
      followerMin:  20000,
      followerMax:  200000,
      engagementMin: 3.5,
      targetLocation: 'Karachi, Lahore',
      languages:   ['Urdu', 'English'],
      budgetType:  'FIXED',
      budgetMin:   40000,
      budgetMax:   90000,
      reels:       2,
      posts:       2,
      stories:     5,
      videos:      0,
      livestreams: 0,
      status:      'COMPLETED',
      contentType: 'Styling / Lookbook',
      requirements: 'Creator must wear outfits in both reels. Mention code BEID20 for 20% off. No competing fashion brand mention within 2 weeks of posting.',
      startDate:   new Date('2026-03-10'),
      deadline:    new Date('2026-04-05'),
    },
    {
      brandId,
      title:       'Summer Pret Drop — Everyday Chic',
      description: 'Promote B Company\'s summer pret collection targeting the everyday working woman. We want content that shows how our outfits work from morning to evening. Creators should have an aesthetic feed and a strong female following in urban Pakistan.',
      objective:   'AWARENESS',
      niche:       'FASHION',
      platforms:   ['instagram'],
      followerMin:  15000,
      followerMax:  150000,
      engagementMin: 4.0,
      targetLocation: 'Pakistan',
      languages:   ['Urdu', 'English'],
      budgetType:  'MILESTONE',
      budgetMin:   25000,
      budgetMax:   70000,
      reels:       1,
      posts:       2,
      stories:     4,
      videos:      0,
      livestreams: 0,
      status:      'PUBLISHED',
      contentType: 'Lifestyle / OOTD',
      requirements: 'Show morning-to-evening outfit transition. Include link in bio. Caption must include #BCompanyFashion.',
      startDate:   new Date('2026-06-01'),
      deadline:    new Date('2026-07-15'),
    },
  ]);

  console.log(`  ✅ Created 2 campaigns — "Eid Ready Collection" (COMPLETED) and "Summer Pret Drop" (PUBLISHED)`);
  return campaigns;
}

async function seedApplications(campaigns, creatorProfile) {
  if (!creatorProfile || !campaigns.length) return;
  const creatorId = creatorProfile.id;

  for (const camp of campaigns) {
    const exists = await db.Application.findOne({ where: { campaignId: camp.id, creatorId } });
    if (exists) continue;

    const isEid = camp.title.includes('Eid');
    await db.Application.create({
      campaignId: camp.id,
      creatorId,
      status: isEid ? 'COMPLETED' : 'ACCEPTED',
      note: isEid
        ? 'I love B Company\'s aesthetic! I have experience styling Eid collections for 2 previous brands. My Karachi-based audience is exactly your target demographic — 68% female, 18–28. Attaching my Eid 2025 portfolio link.'
        : 'The Summer Pret collection is right up my alley. I consistently post OOTD and lifestyle content and my feed aesthetic matches B Company\'s brand vision. Happy to share my media kit.',
    });
  }
  console.log(`  ✅ Applications created — Bhavish applied to both B Company campaigns`);
}

async function seedCollaborations(campaigns, brandProfile, creatorProfile) {
  if (!brandProfile || !creatorProfile || !campaigns.length) return [];
  const brandId   = brandProfile.id;
  const creatorId = creatorProfile.id;

  const existing = await db.Collaboration.count({ where: { brandId, creatorId } });
  if (existing >= 2) {
    console.log(`  ℹ️  Collaborations already exist (${existing} found) — skipping`);
    const collabs = await db.Collaboration.findAll({ where: { brandId, creatorId } });
    return collabs;
  }

  const eidCamp    = campaigns.find((c) => c.title.includes('Eid'));
  const summerCamp = campaigns.find((c) => c.title.includes('Summer'));

  const collabs = await db.Collaboration.bulkCreate([
    {
      campaignId:     eidCamp?.id || campaigns[0].id,
      brandId,
      creatorId,
      status:         'COMPLETED',
      stage:          'COMPLETED',
      priority:       'HIGH',
      offerAmountPKR: 55000,
      offerType:      'FIXED',
      paymentStatus:  'PAID',
      startDate:      new Date('2026-03-12'),
      endDate:        new Date('2026-04-03'),
    },
    {
      campaignId:     summerCamp?.id || campaigns[0].id,
      brandId,
      creatorId,
      status:         'ACCEPTED',
      stage:          'IN_PROGRESS',
      priority:       'MEDIUM',
      offerAmountPKR: 38000,
      offerType:      'MILESTONE',
      paymentStatus:  'ESCROW',
      startDate:      new Date('2026-06-05'),
      endDate:        new Date('2026-07-10'),
    },
  ]);

  console.log(`  ✅ Created 2 collaborations — Eid (COMPLETED, PKR 55,000 PAID) + Summer (IN_PROGRESS, PKR 38,000 ESCROW)`);
  return collabs;
}

async function seedPayment(collaborations) {
  if (!collaborations.length) return;

  const completedCollab = collaborations.find((c) => c.status === 'COMPLETED');
  if (!completedCollab) return;

  const exists = await db.Payment.findOne({ where: { collaborationId: completedCollab.id } });
  if (exists) {
    console.log(`  ℹ️  Payment already exists — skipping`);
    return;
  }

  await db.Payment.create({
    collaborationId: completedCollab.id,
    amountPKR:       55000,
    status:          'PAID',
    releasedAt:      new Date('2026-04-08'),
  });

  console.log(`  ✅ Payment created — PKR 55,000 PAID (released 2026-04-08)`);
}

async function seedAiMatch(brandProfile, creatorProfile) {
  if (!brandProfile || !creatorProfile || !db.AiMatch) return;

  const exists = await db.AiMatch.findOne({
    where: { brandId: brandProfile.id, creatorId: creatorProfile.id },
  });
  if (exists) {
    await exists.update({
      matchScore:  72,
      breakdown:   { nicheMatch: 21, engagement: 14, audienceFit: 11, locationMatch: 10, rating: 8, history: 8, feedback: 0 },
      method:      'hybrid',
      weights:     { contentBased: 70, collaborative: 30 },
      generatedAt: new Date(),
    });
    console.log(`  ✅ AI match updated — Score 72/100 (Bhavish ↔ B Company Fashion)`);
    return;
  }

  await db.AiMatch.create({
    brandId:     brandProfile.id,
    creatorId:   creatorProfile.id,
    matchScore:  72,
    breakdown:   { nicheMatch: 21, engagement: 14, audienceFit: 11, locationMatch: 10, rating: 8, history: 8, feedback: 0 },
    method:      'hybrid',
    weights:     { contentBased: 70, collaborative: 30 },
    generatedAt: new Date(),
  });

  console.log(`  ✅ AI match created — Score 72/100 (Bhavish ↔ B Company Fashion)`);
}

// ─── Main ─────────────────────────────────────────────────────────────────────
async function main() {
  try {
    await sequelize.authenticate();
    console.log('Database connected\n');

    console.log('── Bhavish1 Creator Profile ─────────────────────────────');
    const creatorProfile = await upsertCreatorProfile();

    console.log('\n── B Company Brand Profile ──────────────────────────────');
    const brandProfile = await upsertBrandProfile();

    console.log('\n── Campaigns for B Company ──────────────────────────────');
    const campaigns = await seedCampaigns(brandProfile);

    console.log('\n── Applications ─────────────────────────────────────────');
    await seedApplications(campaigns, creatorProfile);

    console.log('\n── Collaborations ───────────────────────────────────────');
    const collabs = await seedCollaborations(campaigns, brandProfile, creatorProfile);

    console.log('\n── Payments ─────────────────────────────────────────────');
    await seedPayment(collabs);

    console.log('\n── AI Match ─────────────────────────────────────────────');
    await seedAiMatch(brandProfile, creatorProfile);

    console.log('\n══════════════════════════════════════════════════════════');
    console.log('  Seed complete — Bhavish1 + B Company data ready');
    console.log('══════════════════════════════════════════════════════════');
  } catch (err) {
    console.error('Seed failed:', err.message);
    console.error(err.stack);
  } finally {
    await sequelize.close();
  }
}

main();
