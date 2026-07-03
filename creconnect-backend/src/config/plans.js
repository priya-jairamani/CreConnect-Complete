const {
  STRIPE_PRICE_BRAND_GROWTH,
  STRIPE_PRICE_BRAND_SCALE,
  STRIPE_PRICE_CREATOR_PRO,
  STRIPE_PRICE_CREATOR_UNLIMITED,
} = require('./env');

// campaignLimit / collabLimit / collabLimitPerCampaign: null = unlimited.
// price: null = custom/not self-serve (Enterprise — admin-provisioned only).
const PLANS = {
  BRAND: {
    FREE:       { name: 'Free',       price: 0,     campaignLimit: 1,    collabLimitPerCampaign: 2,    aiEnabled: false, stripePriceId: null },
    GROWTH:     { name: 'Growth',     price: 14999, campaignLimit: 10,   collabLimitPerCampaign: null, aiEnabled: true,  stripePriceId: STRIPE_PRICE_BRAND_GROWTH },
    SCALE:      { name: 'Scale',      price: 49999, campaignLimit: 40,   collabLimitPerCampaign: null, aiEnabled: true,  stripePriceId: STRIPE_PRICE_BRAND_SCALE },
    ENTERPRISE: { name: 'Enterprise', price: null,  campaignLimit: null, collabLimitPerCampaign: null, aiEnabled: true,  stripePriceId: null },
  },
  CREATOR: {
    FREE:      { name: 'Free',      price: 0,    collabLimit: 2,    aiEnabled: false, stripePriceId: null },
    PRO:       { name: 'Pro',       price: 2999, collabLimit: 15,   aiEnabled: true,  stripePriceId: STRIPE_PRICE_CREATOR_PRO },
    UNLIMITED: { name: 'Unlimited', price: 6999, collabLimit: null, aiEnabled: true,  stripePriceId: STRIPE_PRICE_CREATOR_UNLIMITED },
  },
};

function getPlan(role, tier) {
  return PLANS[role]?.[tier] ?? null;
}

// Reverse lookup used by the Stripe webhook to map a subscribed Price back to a tier name.
function getTierByPriceId(role, stripePriceId) {
  const roleplans = PLANS[role] ?? {};
  return Object.keys(roleplans).find((tier) => roleplans[tier].stripePriceId === stripePriceId) ?? null;
}

module.exports = { PLANS, getPlan, getTierByPriceId };
