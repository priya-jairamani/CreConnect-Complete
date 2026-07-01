'use strict';

/**
 * Script: Rename Bhavish Kumar → Mohib Usman
 *         Update existing collaborations with proper details
 *         Add new ACCEPTED, PENDING, COMPLETED collaborations
 *
 * Run: node scripts/update-mohib-collabs.js
 */

require('dotenv').config();
const { sequelize } = require('../src/models');
const db = require('../src/models');

const CREATOR_ID  = '599ee860-19ce-405a-af2e-7c68928c6bff';
const CREATOR_USER_ID = '45ddd6d1-8fad-47d7-8f7a-4619ae9e5ecc';

// Brand IDs
const BCOMPANY_BRAND_ID = '4cad122a-ef2e-40dd-bd01-d0f11bbb069f';
const KHAADI_BRAND_ID   = 'cc53e073-d69f-4d6f-afa5-8dd22b8d7072';
const DARAZ_BRAND_ID    = 'bca9b9a0-c1cd-4f87-b389-e933ec14937d';
const MENU_BRAND_ID     = '6c806804-aabc-425a-8a17-25d854db83df';

// Campaign IDs (from existing DB)
const KHAADI_EID_CAMP_ID    = '72ed9a20-21a9-44ad-abbe-db6a6a052eec'; // Khaadi Eid Collection 2025 Launch
const DARAZ_SALE_CAMP_ID    = '8c85befe-2f2c-4549-a8f4-d740fac2c823'; // Daraz 11.11 Sale Countdown
const MENU_IFTAR_CAMP_ID    = '05a7debf-a2b5-4669-85f8-f2bd73d249bd'; // Menu Iftar Special Review

// Existing collab IDs to update
const EXISTING_COLLAB_1 = 'f0f04b72-d7b0-40fd-8125-7bedf6f4203e';
const EXISTING_COLLAB_2 = '7f688779-068c-4fb3-a0a7-c959a6012317';

// ─── Step 1: Rename creator ────────────────────────────────────────────────────
async function renameCreator() {
  const creator = await db.CreatorProfile.findOne({ where: { id: CREATOR_ID } });
  if (!creator) { console.log('  ⚠️  Creator not found'); return; }

  await creator.update({
    displayName: 'Mohib Usman',
    fullName:    'Mohib Usman',
    username:    'mohib_lifestyle',
    bio:         'Lifestyle & fashion content creator from Karachi 🇵🇰. I share everyday style, restaurant discoveries, and local travel. My audience is 70% female, aged 18–28, from urban Pakistan.',
    headline:    'Lifestyle & Fashion Creator | Karachi',
  });

  console.log('  ✅ Creator renamed: Bhavish Kumar → Mohib Usman');
  console.log('     Username updated: bhavish_lifestyle → mohib_lifestyle');
}

// ─── Step 2: Update existing collaborations ────────────────────────────────────
async function updateExistingCollabs() {
  // Get campaign IDs from B Company that already exist for this creator
  const bCompanyCamps = await db.Campaign.findAll({
    where: { brandId: BCOMPANY_BRAND_ID },
    attributes: ['id', 'title'],
    limit: 5,
  });

  const camp1 = bCompanyCamps[0];
  const camp2 = bCompanyCamps[1] || bCompanyCamps[0];

  // Update collab 1 — make it COMPLETED
  await db.Collaboration.update({
    campaignId:     camp1?.id,
    status:         'COMPLETED',
    stage:          'COMPLETED',
    priority:       'HIGH',
    offerAmountPKR: 55000,
    offerType:      'FIXED',
    paymentStatus:  'PAID',
    startDate:      new Date('2026-03-12'),
    endDate:        new Date('2026-04-03'),
  }, { where: { id: EXISTING_COLLAB_1 } });

  console.log('\n  ✅ Collab 1 updated (B Company Fashion):');
  console.log('     Status: COMPLETED | Stage: COMPLETED');
  console.log('     Offer: PKR 55,000 FIXED | Payment: PAID');
  console.log(`     Period: 12 Mar 2026 → 3 Apr 2026`);

  // Update collab 2 — make it ACCEPTED / IN_PROGRESS
  await db.Collaboration.update({
    campaignId:     camp2?.id,
    status:         'ACCEPTED',
    stage:          'IN_PROGRESS',
    priority:       'MEDIUM',
    offerAmountPKR: 38000,
    offerType:      'MILESTONE',
    paymentStatus:  'ESCROW',
    startDate:      new Date('2026-06-05'),
    endDate:        new Date('2026-07-10'),
  }, { where: { id: EXISTING_COLLAB_2 } });

  console.log('\n  ✅ Collab 2 updated (B Company Fashion):');
  console.log('     Status: ACCEPTED | Stage: IN_PROGRESS');
  console.log('     Offer: PKR 38,000 MILESTONE | Payment: ESCROW');
  console.log(`     Period: 5 Jun 2026 → 10 Jul 2026`);
}

// ─── Step 3: Add new collaborations ───────────────────────────────────────────
async function addNewCollabs() {
  const toCreate = [
    // ── ACCEPTED ── Khaadi Eid Collection
    {
      campaignId:     KHAADI_EID_CAMP_ID,
      brandId:        KHAADI_BRAND_ID,
      creatorId:      CREATOR_ID,
      status:         'ACCEPTED',
      stage:          'CONTRACTED',
      priority:       'HIGH',
      offerAmountPKR: 72000,
      offerType:      'FIXED',
      paymentStatus:  'ESCROW',
      startDate:      new Date('2026-06-20'),
      endDate:        new Date('2026-07-25'),
      _label: 'Khaadi — Eid Collection 2025 Launch',
      _desc:  'ACCEPTED | CONTRACTED | PKR 72,000 ESCROW',
    },
    // ── PENDING ── Daraz 11.11 Sale
    {
      campaignId:     DARAZ_SALE_CAMP_ID,
      brandId:        DARAZ_BRAND_ID,
      creatorId:      CREATOR_ID,
      status:         'PENDING',
      stage:          'INQUIRY',
      priority:       'MEDIUM',
      offerAmountPKR: 45000,
      offerType:      'FIXED',
      paymentStatus:  'PENDING',
      startDate:      null,
      endDate:        null,
      _label: 'Daraz — 11.11 Sale Countdown',
      _desc:  'PENDING | INQUIRY | PKR 45,000 (awaiting brand response)',
    },
    // ── COMPLETED ── Menu Restaurant Iftar
    {
      campaignId:     MENU_IFTAR_CAMP_ID,
      brandId:        MENU_BRAND_ID,
      creatorId:      CREATOR_ID,
      status:         'COMPLETED',
      stage:          'COMPLETED',
      priority:       'MEDIUM',
      offerAmountPKR: 30000,
      offerType:      'FIXED',
      paymentStatus:  'PAID',
      startDate:      new Date('2026-04-01'),
      endDate:        new Date('2026-04-20'),
      _label: 'Menu Restaurant — Iftar Special Review',
      _desc:  'COMPLETED | PKR 30,000 PAID',
    },
  ];

  for (const collab of toCreate) {
    const { _label, _desc, ...data } = collab;

    // Skip if already exists for this brand+creator+campaign
    const exists = await db.Collaboration.findOne({
      where: { brandId: data.brandId, creatorId: data.creatorId, campaignId: data.campaignId },
    });

    if (exists) {
      // Update the existing one instead
      await exists.update(data);
      console.log(`\n  🔄 Updated existing collab — ${_label}`);
      console.log(`     ${_desc}`);
    } else {
      await db.Collaboration.create(data);
      console.log(`\n  ✅ New collab created — ${_label}`);
      console.log(`     ${_desc}`);
    }
  }
}

// ─── Step 4: Add payment for completed collabs ─────────────────────────────────
async function addPayments() {
  // Find all PAID collabs for this creator without a payment record
  const paidCollabs = await db.Collaboration.findAll({
    where: { creatorId: CREATOR_ID, paymentStatus: 'PAID' },
  });

  let added = 0;
  for (const collab of paidCollabs) {
    const exists = await db.Payment.findOne({ where: { collaborationId: collab.id } });
    if (!exists) {
      await db.Payment.create({
        collaborationId: collab.id,
        amountPKR:       collab.offerAmountPKR,
        status:          'PAID',
        releasedAt:      collab.endDate || new Date(),
      });
      added++;
    }
  }
  if (added > 0) console.log(`\n  ✅ ${added} payment record(s) added for completed collabs`);
  else console.log(`\n  ℹ️  All completed collab payments already recorded`);
}

// ─── Main ──────────────────────────────────────────────────────────────────────
async function main() {
  try {
    await sequelize.authenticate();
    console.log('Database connected\n');

    console.log('── Step 1: Rename Creator ───────────────────────────────');
    await renameCreator();

    console.log('\n── Step 2: Update Existing Collaborations ───────────────');
    await updateExistingCollabs();

    console.log('\n── Step 3: Add New Collaborations ───────────────────────');
    await addNewCollabs();

    console.log('\n── Step 4: Add Payment Records ──────────────────────────');
    await addPayments();

    console.log('\n══════════════════════════════════════════════════════════');
    console.log('  Done! Mohib Usman now has 5 collaborations:');
    console.log('  • 2 × COMPLETED  (B Company Fashion + Menu Restaurant)');
    console.log('  • 2 × ACCEPTED   (B Company Fashion + Khaadi)');
    console.log('  • 1 × PENDING    (Daraz)');
    console.log('══════════════════════════════════════════════════════════');
  } catch (err) {
    console.error('Error:', err.message);
    console.error(err.stack);
  } finally {
    await sequelize.close();
  }
}

main();
