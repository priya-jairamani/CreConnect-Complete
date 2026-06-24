'use strict';

/**
 * Standalone demo — runs the full hybrid engine against seed-data.json.
 * No database required.
 *
 * Usage:
 *   node demo.js
 *   node demo.js --brand b2000000-0000-0000-0000-000000000001
 *   node demo.js --creator c1000000-0000-0000-0000-000000000004
 */

const HybridEngine = require('./engine/index');
const seedData     = require('./data/seed-data.json');

const engine = new HybridEngine();
engine.loadData({
  creators:       seedData.creators,
  brands:         seedData.brands,
  collaborations: seedData.collaborations,
  feedback:       seedData.aiFeedback,
});

const args = process.argv.slice(2);
const brandFlag   = args.indexOf('--brand');
const creatorFlag = args.indexOf('--creator');

// ─────────────────────────────────────────────────────────────────────────────

function printMatches(label, matches) {
  console.log('\n' + '═'.repeat(70));
  console.log(` ${label}`);
  console.log('═'.repeat(70));
  console.log(
    ' Rank │ Score │ Name / ID                              │ Niche / Industry',
  );
  console.log('─'.repeat(70));

  matches.forEach((m, i) => {
    const rank  = String(i + 1).padStart(4);
    const score = String(m.score).padStart(5);
    const name  = (m.creatorName || m.brandName || '').substring(0, 38).padEnd(38);
    const cat   = m.niche || m.industry || '';
    console.log(` ${rank} │ ${score} │ ${name} │ ${cat}`);

    // Breakdown detail
    if (m.breakdown) {
      const b = m.breakdown;
      console.log(
        `       │       │  ↳ niche:${b.nicheMatch}  eng:${b.engagement}  aud:${b.audienceFit}  loc:${b.locationMatch}  rating:${b.rating}  hist:${b.history}  fb:${b.feedback}`,
      );
    }
  });
  console.log('─'.repeat(70));
}

// ─────────────────────────────────────────────────────────────────────────────

if (brandFlag !== -1 && args[brandFlag + 1]) {
  // Single brand mode
  const brandId = args[brandFlag + 1];
  const brand   = seedData.brands.find((b) => b.id === brandId);
  if (!brand) { console.error('Brand not found:', brandId); process.exit(1); }

  console.log(`\nFinding best creators for: ${brand.companyName} (${brand.industry})`);
  const matches = engine.getMatches(brandId, 10);
  printMatches(`Top 10 Creators for ${brand.companyName}`, matches);

} else if (creatorFlag !== -1 && args[creatorFlag + 1]) {
  // Single creator mode
  const creatorId = args[creatorFlag + 1];
  const creator   = seedData.creators.find((c) => c.id === creatorId);
  if (!creator) { console.error('Creator not found:', creatorId); process.exit(1); }

  console.log(`\nFinding best brands for: ${creator.displayName} (${creator.niche})`);
  const matches = engine.getMatchesForCreator(creatorId, 10);
  printMatches(`Top 10 Brands for ${creator.displayName}`, matches);

} else {
  // Full run — all brands
  console.log('\nRunning full hybrid engine for all brands...\n');
  const allMatches = engine.runForAll(5);

  for (const [brandId, matches] of Object.entries(allMatches)) {
    const brand = seedData.brands.find((b) => b.id === brandId);
    printMatches(`Top 5 for ${brand.companyName} (${brand.industry})`, matches);
  }

  console.log('\n\nSummary Statistics');
  console.log('─'.repeat(40));
  let totalScore = 0, count = 0;
  for (const matches of Object.values(allMatches)) {
    for (const m of matches) { totalScore += m.score; count++; }
  }
  console.log(`Total matches generated : ${count}`);
  console.log(`Average match score     : ${(totalScore / count).toFixed(1)}`);
  console.log(`Brands processed        : ${Object.keys(allMatches).length}`);
  console.log(`Creators in pool        : ${seedData.creators.length}`);
  console.log(`Collaborations used     : ${seedData.collaborations.length}`);
}
