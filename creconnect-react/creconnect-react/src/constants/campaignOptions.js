export const OBJECTIVES = [
  { value: 'AWARENESS',   label: 'Brand Awareness',  icon: '📣' },
  { value: 'ENGAGEMENT',  label: 'Engagement Boost',  icon: '💬' },
  { value: 'CONVERSIONS', label: 'Sales / Conversions', icon: '🛒' },
  { value: 'LAUNCH',      label: 'Product Launch',    icon: '🚀' },
];

export const NICHES = [
  'Fashion', 'Beauty', 'Gaming', 'Tech', 'Fitness', 'Food', 'Lifestyle', 'Travel', 'Education', 'Finance',
];

export const PLATFORM_OPTIONS = [
  { value: 'INSTAGRAM', label: 'Instagram' },
  { value: 'TIKTOK',    label: 'TikTok' },
  { value: 'YOUTUBE',   label: 'YouTube' },
  { value: 'TWITTER',   label: 'X (Twitter)' },
  { value: 'FACEBOOK',  label: 'Facebook' },
  { value: 'LINKEDIN',  label: 'LinkedIn' },
  { value: 'SNAPCHAT',  label: 'Snapchat' },
];

export const LANGUAGES = ['English', 'Urdu', 'Punjabi', 'Pashto', 'Sindhi'];

export const LOCATIONS = ['Lahore', 'Karachi', 'Islamabad', 'Rawalpindi', 'Peshawar', 'Multan', 'Faisalabad', 'Quetta'];

export const BUDGET_TYPES = [
  { value: 'FIXED',       label: 'Fixed Price',  description: 'A single fixed budget for the whole campaign' },
  { value: 'MILESTONE',   label: 'Milestone-based', description: 'Split the budget across delivery milestones' },
  { value: 'PERFORMANCE', label: 'Performance-based', description: 'Pay based on results (CPM / CPE / CPA)' },
];

export const DELIVERABLE_TYPES = [
  { key: 'reels',       label: 'Reels',       icon: '🎬', contentType: 'REEL' },
  { key: 'posts',       label: 'Posts',       icon: '🖼️', contentType: 'SPONSORED_POST' },
  { key: 'stories',     label: 'Stories',     icon: '⚡', contentType: 'STORY' },
  { key: 'videos',      label: 'Videos',      icon: '🎥', contentType: 'VIDEO_REVIEW' },
  { key: 'livestreams', label: 'Livestreams', icon: '🔴', contentType: 'CAMPAIGN_POST' },
];
