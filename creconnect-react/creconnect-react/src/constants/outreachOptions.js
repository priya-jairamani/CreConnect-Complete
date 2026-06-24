export const CAMPAIGN_OBJECTIVES = [
  'Brand Awareness', 'Product Launch', 'Sales & Conversions', 'App Installs', 'Community Growth', 'Event Promotion',
];

export const CAMPAIGN_CATEGORIES = [
  'Fashion', 'Beauty', 'Tech', 'Fitness', 'Food', 'Travel', 'Gaming', 'Lifestyle', 'Finance', 'Education',
];

export const TARGET_KPIS = [
  'Reach', 'Impressions', 'Engagement Rate', 'Click-Through Rate', 'Conversions', 'New Followers', 'Sales',
];

export const PLATFORMS = ['Instagram', 'TikTok', 'YouTube', 'Facebook', 'X', 'LinkedIn', 'Threads'];

export const DELIVERABLE_TYPES = ['Reel', 'Story', 'Post', 'Short', 'YouTube Video', 'Livestream', 'UGC Content'];

export const DELIVERABLE_TYPE_ICONS = {
  Reel: '🎬', Story: '📱', Post: '🖼️', Short: '🎞️', 'YouTube Video': '▶️', Livestream: '🔴', 'UGC Content': '📦',
};

export const AUDIENCE_COUNTRIES = ['Pakistan', 'UAE', 'Saudi Arabia', 'UK', 'USA', 'India', 'Canada', 'Other'];

export const LANGUAGES = ['English', 'Urdu', 'Arabic', 'Hindi', 'Punjabi'];

export const BUDGET_TYPES = ['Fixed', 'Milestone-Based', 'Performance-Based', 'Hybrid'];

export const EXCLUSIVITY_PERIODS = ['None', '30 days', '60 days', '90 days', '6 months', '12 months'];

export const CONTENT_OWNERSHIP_OPTIONS = ['Creator retains ownership', 'Brand owns content', 'Shared ownership'];

export const USAGE_RIGHTS_OPTIONS = ['Organic only', 'Paid social (whitelisting)', 'Website & email', 'All channels — perpetual'];

export const LICENSING_TERMS = ['3 months', '6 months', '12 months', 'Perpetual'];

export const INVITATION_STAGES = ['Draft', 'Sent', 'Viewed', 'Responded', 'Negotiating', 'Accepted', 'Rejected'];

export const INVITATION_STAGE_VARIANT = {
  Draft: 'neutral',
  Sent: 'accent',
  Viewed: 'brand',
  Responded: 'warning',
  Negotiating: 'warning',
  Accepted: 'success',
  Rejected: 'danger',
};

export const FUNNEL_STAGES = ['Sourced', 'Contacted', 'Interested', 'Negotiating', 'Accepted', 'Active'];

export const RISK_LABELS = ['Low', 'Medium', 'High'];

export const RISK_VARIANT = {
  Low: 'success',
  Medium: 'warning',
  High: 'danger',
};

export const PROPOSAL_STEPS = [
  { key: 'overview', label: 'Overview', icon: '🧭' },
  { key: 'requirements', label: 'Requirements', icon: '🎯' },
  { key: 'deliverables', label: 'Deliverables', icon: '🎬' },
  { key: 'budget', label: 'Budget', icon: '💰' },
  { key: 'timeline', label: 'Timeline', icon: '⏳' },
  { key: 'contract', label: 'Contract', icon: '📜' },
  { key: 'brief', label: 'Brand Brief', icon: '📝' },
  { key: 'outreach', label: 'AI Outreach', icon: '🤖' },
];

export const CAMPAIGN_TEMPLATES = [
  {
    key: 'product-launch',
    icon: '🚀',
    label: 'Product Launch',
    description: 'Introduce a new product with high-impact creator content.',
    defaults: {
      objective: 'Product Launch',
      category: 'Tech',
      deliverables: [{ type: 'Reel', quantity: 1 }, { type: 'Post', quantity: 2 }, { type: 'Story', quantity: 3 }],
      budgetType: 'Fixed',
    },
  },
  {
    key: 'brand-awareness',
    icon: '📣',
    label: 'Brand Awareness',
    description: 'Maximize reach and visibility across creator audiences.',
    defaults: {
      objective: 'Brand Awareness',
      category: 'Lifestyle',
      deliverables: [{ type: 'Post', quantity: 2 }, { type: 'Story', quantity: 4 }],
      budgetType: 'Fixed',
    },
  },
  {
    key: 'ugc-campaign',
    icon: '📦',
    label: 'UGC Campaign',
    description: 'Collect authentic user-generated content for ads and socials.',
    defaults: {
      objective: 'Sales & Conversions',
      category: 'Beauty',
      deliverables: [{ type: 'UGC Content', quantity: 3 }],
      budgetType: 'Performance-Based',
    },
  },
  {
    key: 'influencer-takeover',
    icon: '🎤',
    label: 'Influencer Takeover',
    description: 'Hand your brand channel to a creator for a day.',
    defaults: {
      objective: 'Community Growth',
      category: 'Lifestyle',
      deliverables: [{ type: 'Story', quantity: 6 }, { type: 'Livestream', quantity: 1 }],
      budgetType: 'Fixed',
    },
  },
  {
    key: 'affiliate-campaign',
    icon: '🔗',
    label: 'Affiliate Campaign',
    description: 'Pay creators based on conversions and sales they drive.',
    defaults: {
      objective: 'Sales & Conversions',
      category: 'Fashion',
      deliverables: [{ type: 'Post', quantity: 1 }, { type: 'Reel', quantity: 1 }],
      budgetType: 'Performance-Based',
    },
  },
  {
    key: 'event-promotion',
    icon: '🎉',
    label: 'Event Promotion',
    description: 'Drive awareness and attendance for an upcoming event.',
    defaults: {
      objective: 'Event Promotion',
      category: 'Lifestyle',
      deliverables: [{ type: 'Story', quantity: 4 }, { type: 'Reel', quantity: 1 }],
      budgetType: 'Hybrid',
    },
  },
];
