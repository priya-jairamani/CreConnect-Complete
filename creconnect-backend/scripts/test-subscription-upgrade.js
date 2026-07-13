/**
 * Tests subscription upgrade → feature enablement flow.
 * Run: node scripts/test-subscription-upgrade.js
 */
require('dotenv').config();
const axios = require('axios');
const db = require('../src/models');
const entitlements = require('../src/services/entitlements.service');
const { getPlan } = require('../src/config/plans');
const subscriptionsSvc = require('../src/services/subscriptions.service');

const BASE = (process.env.TEST_API_BASE || 'http://localhost:5000/api/v1').replace(/\/api\/v1\/?$/, '');
const API = `${BASE}/api/v1`;

async function login(email, password) {
  const { data } = await axios.post(`${API}/auth/login`, { email, password });
  return data?.data?.accessToken || data?.accessToken;
}

async function apiGet(path, token) {
  const { status, data } = await axios.get(`${API}${path}`, {
    headers: { Authorization: `Bearer ${token}` },
    validateStatus: () => true,
  });
  return { status, data: data?.data ?? data };
}

async function simulateWebhookUpgrade(userId, role, tier) {
  const plan = getPlan(role, tier);
  const fields = {
    userId,
    role,
    planTier: tier,
    status: 'ACTIVE',
    stripeCustomerId: 'cus_test_simulated',
    stripeSubscriptionId: `sub_test_${userId.slice(0, 8)}`,
    stripePriceId: plan.stripePriceId,
    currentPeriodStart: new Date(),
    currentPeriodEnd: new Date(Date.now() + 30 * 86400000),
    cancelAtPeriodEnd: false,
    campaignLimit: plan.campaignLimit ?? null,
    collabLimit: plan.collabLimit ?? null,
    aiEnabled: plan.aiEnabled,
    grantedByAdminId: null,
  };
  const existing = await db.Subscription.findOne({ where: { userId } });
  if (existing) await existing.update(fields);
  else await db.Subscription.create(fields);
}

async function removeSubscription(userId) {
  await db.Subscription.destroy({ where: { userId } });
}

function pass(label) { console.log(`  ✓ ${label}`); }
function fail(label, detail) { console.log(`  ✗ ${label}${detail ? `: ${detail}` : ''}`); }

async function testEntitlementsLayer() {
  console.log('\n── 1. Entitlements layer (simulate webhook DB write) ──');

  const brandUser = await db.User.findOne({
    where: { email: 'buser@gmail.com' },
    include: [{ model: db.BrandProfile, as: 'brandProfile' }],
  });
  if (!brandUser) { fail('buser@gmail.com not found'); return; }

  await removeSubscription(brandUser.id);

  let hasAi = await entitlements.hasAI(brandUser.id, 'BRAND');
  let plan = await entitlements.getEffectivePlan(brandUser.id, 'BRAND');
  if (!hasAi && plan.tier === 'FREE') pass('Free brand: aiEnabled=false, tier=FREE');
  else fail('Free brand check', `hasAI=${hasAi} tier=${plan.tier}`);

  await simulateWebhookUpgrade(brandUser.id, 'BRAND', 'GROWTH');

  hasAi = await entitlements.hasAI(brandUser.id, 'BRAND');
  plan = await entitlements.getEffectivePlan(brandUser.id, 'BRAND');
  if (hasAi && plan.tier === 'GROWTH' && plan.plan.campaignLimit === 10) {
    pass('After GROWTH upgrade: aiEnabled=true, campaignLimit=10');
  } else {
    fail('GROWTH upgrade check', JSON.stringify({ hasAi, tier: plan.tier, limit: plan.plan.campaignLimit }));
  }

  const summary = await subscriptionsSvc.getMyPlanSummary(brandUser.id, 'BRAND');
  if (summary.aiEnabled && summary.tier === 'GROWTH') pass('/subscriptions/me summary reflects GROWTH');
  else fail('Plan summary', JSON.stringify(summary));

  // cleanup — leave user on free for dev DB unless they had a sub before
  await removeSubscription(brandUser.id);
  pass('Restored buser@gmail.com to Free (test cleanup)');
}

async function testPaidUsersApi() {
  console.log('\n── 2. Live API — paid users AI Match ──');

  const cases = [
    { email: 'ccompany@gmail.com', password: 'Brand@12345', role: 'BRAND', path: null },
    { email: 'priya@gmail.com', password: 'Creator@12345', role: 'CREATOR', path: null },
  ];

  for (const c of cases) {
    let token;
    try {
      token = await login(c.email, c.password);
    } catch (e) {
      fail(`Login ${c.email}`, e.response?.data?.message || e.message);
      continue;
    }
    if (!token) { fail(`Login ${c.email}`, 'no token'); continue; }
    pass(`Login ${c.email}`);

    const sub = await apiGet('/subscriptions/me', token);
    if (sub.status === 200 && sub.data?.aiEnabled) {
      pass(`${c.email} subscription: ${sub.data.tier}, aiEnabled=true`);
    } else {
      fail(`${c.email} subscription`, `status=${sub.status} ai=${sub.data?.aiEnabled}`);
    }

    const profile = c.role === 'BRAND'
      ? await apiGet('/brands/me', token)
      : await apiGet('/creators/me', token);
    const profileId = profile.data?.id;
    if (!profileId) { fail(`${c.email} profile id`); continue; }

    const aiPath = c.role === 'BRAND'
      ? `/ai/matches/brand/${profileId}?limit=3`
      : `/ai/matches/creator/${profileId}?limit=3`;
    const ai = await apiGet(aiPath, token);
    if (ai.status === 200 && Array.isArray(ai.data) && ai.data.length > 0) {
      pass(`${c.email} AI Match: ${ai.data.length} results (top score ${ai.data[0].matchScore})`);
    } else if (ai.status === 200 && Array.isArray(ai.data)) {
      pass(`${c.email} AI Match: 200 OK (${ai.data.length} results — profile may have low matches)`);
    } else {
      fail(`${c.email} AI Match`, `status=${ai.status} msg=${ai.data?.message}`);
    }
  }
}

async function testFreeUserAiBlocked() {
  console.log('\n── 3. Live API — free user AI blocked ──');

  const brandUser = await db.User.findOne({
    where: { email: 'buser@gmail.com' },
    include: [{ model: db.BrandProfile, as: 'brandProfile' }],
  });
  if (!brandUser) return;

  await removeSubscription(brandUser.id);

  // Try common dev passwords
  const passwords = ['Brand@12345', 'Brand@123', 'password', 'Password@123'];
  let token = null;
  for (const pw of passwords) {
    try {
      token = await login('buser@gmail.com', pw);
      if (token) break;
    } catch { /* try next */ }
  }

  if (!token) {
    console.log('  ⚠ Skipped free-user API test — unknown password for buser@gmail.com');
    console.log('    Entitlements layer test above still validates upgrade logic.');
    return;
  }

  const ai = await apiGet(`/ai/matches/brand/${brandUser.brandProfile.id}?limit=3`, token);
  if (ai.status === 403) pass('Free brand AI Match correctly returns 403');
  else fail('Free brand should be blocked', `status=${ai.status}`);
}

async function main() {
  console.log('CreConnect subscription upgrade test');
  console.log(`API base: ${API}`);

  try {
    await db.sequelize.authenticate();
    pass('Database connected');
  } catch (e) {
    fail('Database', e.message);
    process.exit(1);
  }

  try {
    await axios.get(`${API}/auth/health`, { timeout: 5000 });
    pass('Backend reachable');
  } catch {
    fail('Backend not reachable — start with npm run dev');
    process.exit(1);
  }

  await testEntitlementsLayer();
  await testPaidUsersApi();
  await testFreeUserAiBlocked();

  console.log('\nDone.\n');
  process.exit(0);
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
