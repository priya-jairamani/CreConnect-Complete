/**
 * Deterministic mock data generators for the Brand Administration settings
 * page. The backend doesn't yet expose team management, billing, security,
 * integrations, or audit-log data — these helpers derive realistic,
 * stable-per-brand datasets so the workspace UI can be built and previewed
 * today, then swapped to live data later without changing shape.
 */

import { seededRandom } from './mockAnalytics';
import { formatPKR } from './formatters';

function brandSeed(brand) {
  return brand?.id ?? brand?.companyName ?? 'brand';
}

const ROLES = ['Owner', 'Admin', 'Campaign Manager', 'Recruiter', 'Analyst'];
const FIRST_NAMES = ['Ayesha', 'Bilal', 'Sara', 'Hamza', 'Zara', 'Omar', 'Maria', 'Faisal'];
const LAST_NAMES = ['Khan', 'Ahmed', 'Malik', 'Raza', 'Sheikh', 'Iqbal', 'Hussain', 'Farooq'];

export function getTeamMembers(brand = {}) {
  const seed = brandSeed(brand);
  const rand = seededRandom(`${seed}-team`);
  const count = 3 + Math.floor(rand() * 4);
  const members = [{
    id: 'me',
    name: 'You',
    email: brand?.user?.email ?? 'you@brand.com',
    role: 'Owner',
    status: 'active',
    lastActive: 'Active now',
    avatarColor: '#6d5cff',
  }];
  for (let i = 0; i < count; i++) {
    const first = FIRST_NAMES[Math.floor(rand() * FIRST_NAMES.length)];
    const last = LAST_NAMES[Math.floor(rand() * LAST_NAMES.length)];
    members.push({
      id: `member-${i}`,
      name: `${first} ${last}`,
      email: `${first.toLowerCase()}.${last.toLowerCase()}@${(brand.companyName || 'brand').toLowerCase().replace(/\s+/g, '')}.com`,
      role: ROLES[1 + Math.floor(rand() * (ROLES.length - 1))],
      status: rand() > 0.15 ? 'active' : 'pending',
      lastActive: rand() > 0.5 ? `${1 + Math.floor(rand() * 12)}h ago` : `${1 + Math.floor(rand() * 6)}d ago`,
      avatarColor: ['#6d5cff', '#16b364', '#f5a623', '#f0445f', '#3aa0ff'][Math.floor(rand() * 5)],
    });
  }
  return members;
}

const INTEGRATIONS_LIST = [
  { key: 'googleAnalytics', name: 'Google Analytics', icon: '📊', description: 'Track campaign traffic and conversions' },
  { key: 'metaBusiness', name: 'Meta Business', icon: '📘', description: 'Manage Instagram & Facebook campaigns' },
  { key: 'tiktokBusiness', name: 'TikTok Business', icon: '🎵', description: 'Sync TikTok ad and creator data' },
  { key: 'linkedinPages', name: 'LinkedIn Pages', icon: '💼', description: 'Publish to your company page' },
  { key: 'youtubeStudio', name: 'YouTube Studio', icon: '▶️', description: 'Track video performance metrics' },
  { key: 'hubspot', name: 'HubSpot', icon: '🧡', description: 'Sync leads and CRM contacts' },
  { key: 'salesforce', name: 'Salesforce', icon: '☁️', description: 'Sync deals and partnership pipelines' },
  { key: 'zapier', name: 'Zapier', icon: '⚡', description: 'Automate workflows across 5000+ apps' },
];

export function getIntegrations(brand = {}) {
  const seed = brandSeed(brand);
  const rand = seededRandom(`${seed}-integrations`);
  return INTEGRATIONS_LIST.map((i) => ({
    ...i,
    connected: rand() > 0.6,
    lastSynced: rand() > 0.5 ? `${1 + Math.floor(rand() * 23)}h ago` : `${1 + Math.floor(rand() * 6)}d ago`,
  }));
}

export function getApiKeys(brand = {}) {
  const seed = brandSeed(brand);
  const rand = seededRandom(`${seed}-api-keys`);
  const make = (n) => Array.from({ length: n }, () => Math.floor(rand() * 16).toString(16)).join('');
  return [
    { id: 'live', label: 'Live API Key', value: `cc_live_${make(24)}`, createdLabel: '3 months ago' },
    { id: 'test', label: 'Test API Key', value: `cc_test_${make(24)}`, createdLabel: '3 months ago' },
  ];
}

export function getWebhooks(brand = {}) {
  const seed = brandSeed(brand);
  const rand = seededRandom(`${seed}-webhooks`);
  if (rand() > 0.5) {
    return [{ id: 'wh-1', url: 'https://hooks.example.com/creconnect/campaigns', events: ['campaign.published', 'application.received'], status: 'active' }];
  }
  return [];
}

const AUDIT_ACTIONS = [
  { type: 'campaign', icon: '📣', text: 'published campaign "Summer Launch Collab"' },
  { type: 'campaign', icon: '📣', text: 'edited campaign budget for "UGC Refresh"' },
  { type: 'team', icon: '👥', text: 'invited a new team member' },
  { type: 'team', icon: '👥', text: 'changed permissions for a team member' },
  { type: 'billing', icon: '💳', text: 'upgraded subscription to Growth plan' },
  { type: 'billing', icon: '💳', text: 'updated payment method' },
  { type: 'security', icon: '🔒', text: 'enabled two-factor authentication' },
  { type: 'security', icon: '🔒', text: 'signed in from a new device' },
  { type: 'campaign', icon: '📣', text: 'approved a creator application' },
  { type: 'team', icon: '👥', text: 'removed a team member' },
];

export function getAuditLog(brand = {}, count = 14) {
  const seed = brandSeed(brand);
  const rand = seededRandom(`${seed}-audit-log`);
  const actors = ['You', 'Ayesha Khan', 'Bilal Ahmed', 'Sara Malik'];
  const entries = [];
  let hoursAgo = Math.floor(rand() * 4) + 1;
  for (let i = 0; i < count; i++) {
    const action = AUDIT_ACTIONS[Math.floor(rand() * AUDIT_ACTIONS.length)];
    entries.push({
      id: `audit-${i}`,
      actor: actors[Math.floor(rand() * actors.length)],
      ...action,
      hoursAgo,
    });
    hoursAgo += Math.floor(rand() * 18) + 2;
  }
  return entries;
}

const PLANS = [
  { id: 'starter', name: 'Starter', price: 0, campaignLimit: 2, creatorLimit: 25, storageGb: 1 },
  { id: 'growth', name: 'Growth', price: 14999, campaignLimit: 10, creatorLimit: 150, storageGb: 10 },
  { id: 'scale', name: 'Scale', price: 49999, campaignLimit: 40, creatorLimit: 600, storageGb: 50 },
  { id: 'enterprise', name: 'Enterprise', price: null, campaignLimit: Infinity, creatorLimit: Infinity, storageGb: 500 },
];

export function getSubscription(brand = {}, intel = {}) {
  const seed = brandSeed(brand);
  const rand = seededRandom(`${seed}-subscription`);
  const planIndex = Math.min(2, Math.floor(rand() * 3));
  const plan = PLANS[planIndex];
  const usedCampaigns = Math.min(plan.campaignLimit, intel.activeCampaigns ?? Math.floor(rand() * plan.campaignLimit));
  const usedCreators = Math.min(plan.creatorLimit, Math.floor(rand() * plan.creatorLimit * 0.8));
  const usedStorageGb = Math.round(rand() * plan.storageGb * 10) / 10;
  const renewsInDays = 5 + Math.floor(rand() * 25);
  return { plan, plans: PLANS, usedCampaigns, usedCreators, usedStorageGb, renewsInDays };
}

export function getInvoices(brand = {}, plan, count = 5) {
  const seed = brandSeed(brand);
  const rand = seededRandom(`${seed}-invoices`);
  const months = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'];
  const now = new Date();
  return Array.from({ length: count }, (_, i) => {
    const d = new Date(now.getFullYear(), now.getMonth() - i, 1);
    return {
      id: `inv-${i}`,
      label: `${months[d.getMonth()]} ${d.getFullYear()}`,
      amount: plan?.price ?? Math.round(rand() * 50000),
      status: i === 0 ? 'Due' : 'Paid',
    };
  });
}

export function getPaymentMethods(brand = {}) {
  const seed = brandSeed(brand);
  const rand = seededRandom(`${seed}-payment-methods`);
  const cards = [];
  if (rand() > 0.3) {
    cards.push({ id: 'card-1', brand: 'Visa', last4: String(1000 + Math.floor(rand() * 8999)).slice(0, 4), expiry: `${1 + Math.floor(rand() * 12)}/${27 + Math.floor(rand() * 4)}`, isDefault: true });
  }
  return cards;
}

export function getFinancialSummary(brand = {}, intel = {}) {
  const seed = brandSeed(brand);
  const rand = seededRandom(`${seed}-financial-summary`);
  const totalSpend = Math.round(((intel.avgBudget ?? 30000) * (intel.completedCollaborations ?? 10) * (0.3 + rand() * 0.4)) / 1000) * 1000;
  const pendingPayments = Math.round((intel.avgBudget ?? 30000) * (1 + rand() * 2) / 500) * 500;
  const escrowBalance = Math.round((intel.avgBudget ?? 30000) * (0.5 + rand() * 1.5) / 500) * 500;
  return {
    totalSpend: formatPKR(totalSpend),
    pendingPayments: formatPKR(pendingPayments),
    escrowBalance: formatPKR(escrowBalance),
  };
}

export function getSecurityCenter(brand = {}) {
  const seed = brandSeed(brand);
  const rand = seededRandom(`${seed}-security`);
  const score = Math.round(55 + rand() * 40);
  const devices = [
    { id: 'd1', name: 'Chrome on Windows', location: 'Lahore, Pakistan', lastActive: 'Active now', current: true },
    { id: 'd2', name: 'Safari on iPhone', location: 'Lahore, Pakistan', lastActive: `${1 + Math.floor(rand() * 5)}d ago`, current: false },
  ];
  if (rand() > 0.5) {
    devices.push({ id: 'd3', name: 'Chrome on macOS', location: 'Karachi, Pakistan', lastActive: `${1 + Math.floor(rand() * 4)}w ago`, current: false });
  }
  const loginActivity = Array.from({ length: 4 }, (_, i) => ({
    id: `login-${i}`,
    device: devices[Math.floor(rand() * devices.length)].name,
    ip: `103.${Math.floor(rand() * 255)}.${Math.floor(rand() * 255)}.${Math.floor(rand() * 255)}`,
    location: 'Lahore, Pakistan',
    time: `${(i + 1) * (3 + Math.floor(rand() * 9))}h ago`,
    status: 'Success',
  }));
  return { score, twoFactorEnabled: rand() > 0.6, devices, loginActivity };
}

export function getWorkspaceAnalytics(brand = {}, intel = {}) {
  const seed = brandSeed(brand);
  const rand = seededRandom(`${seed}-workspace-analytics`);
  return {
    teamActivityScore: Math.round(60 + rand() * 35),
    campaignsPerMonth: Math.round(1 + rand() * 5),
    avgCreatorResponseHours: intel.avgResponseTimeHours ?? Math.round(2 + rand() * 20),
    tasksCompletedThisWeek: Math.round(5 + rand() * 30),
    teamMembersOnline: Math.round(1 + rand() * 4),
  };
}

export function getReputationScores(intel = {}) {
  return {
    trustScore: intel.trustScore ?? 0,
    satisfactionScore: intel.satisfactionScore ?? 0,
    paymentReliability: intel.campaignSuccessRate ?? 0,
    campaignSuccessScore: intel.campaignSuccessRate ?? 0,
  };
}

export function getProfileCompletion(values = {}) {
  const fields = [
    'companyName', 'brandName', 'tagline', 'industry', 'description',
    'foundedYear', 'companySize', 'headquarters', 'website', 'logoUrl',
  ];
  const filled = fields.filter((f) => Boolean(values[f])).length;
  return Math.round((filled / fields.length) * 100);
}
