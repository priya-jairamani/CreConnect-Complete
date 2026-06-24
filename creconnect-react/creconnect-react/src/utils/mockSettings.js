/**
 * Mock data layer for the Admin "Settings" Platform Governance & Configuration Center.
 * Illustrative data only — wire up to dedicated settings/config endpoints once available.
 */

function daysAgo(n) {
  const d = new Date();
  d.setDate(d.getDate() - n);
  return d.toISOString();
}
function hoursAgo(n) {
  const d = new Date();
  d.setHours(d.getHours() - n);
  return d.toISOString();
}

/* ───────────────────────── Settings Navigation ───────────────────────── */

export const SETTINGS_SECTIONS = [
  { id: 'platform', label: 'Platform Configuration', icon: '⚙️', description: 'Global platform identity, behavior & limits.' },
  { id: 'creator', label: 'Creator System', icon: '🎨', description: 'Profile, verification, eligibility, safety & reputation.' },
  { id: 'brand', label: 'Brand System', icon: '🏢', description: 'Profile, verification, trust & safety controls.' },
  { id: 'marketplace', label: 'Marketplace Rules', icon: '🛒', description: 'Campaigns, collaborations & marketplace economics.' },
  { id: 'trust_safety', label: 'Trust & Safety', icon: '🛡️', description: 'Reporting, fraud detection & content moderation.' },
  { id: 'privacy', label: 'Privacy & Compliance', icon: '🔐', description: 'Data privacy, GDPR/CCPA & user privacy controls.' },
  { id: 'ai_automation', label: 'AI & Automation', icon: '🤖', description: 'AI features, confidence settings & automation engine.' },
  { id: 'security', label: 'Security Center', icon: '🔒', description: 'Authentication, access control & security monitoring.' },
  { id: 'integrations', label: 'Integrations', icon: '🔌', description: 'Connected services & API management.' },
  { id: 'billing', label: 'Billing & Revenue Rules', icon: '💳', description: 'Commission, subscriptions & financial configuration.' },
];

/* ───────────────────────── Settings Schema ───────────────────────── */
/* Field types: text | email | number | percent | select | toggle | multiselect | slider */

export const SETTINGS_SCHEMA = {
  platform: [
    {
      id: 'general', title: 'General Settings', icon: '🌐',
      fields: [
        { id: 'platform_name', label: 'Platform Name', description: 'Displayed across the dashboard, emails & invoices.', type: 'text', value: 'CreConnect' },
        { id: 'support_email', label: 'Support Email', description: 'Primary contact address for user support requests.', type: 'email', value: 'support@creconnect.com' },
        { id: 'default_timezone', label: 'Default Timezone', description: 'Used for scheduling, reports & timestamps.', type: 'select', value: 'Asia/Karachi', options: ['UTC', 'Asia/Karachi', 'Asia/Dubai', 'Europe/London', 'America/New_York'] },
        { id: 'default_currency', label: 'Default Currency', description: 'Default currency for pricing, payouts & invoices.', type: 'select', value: 'PKR', options: ['PKR', 'USD', 'EUR', 'GBP', 'AED'] },
        { id: 'date_format', label: 'Date Format', description: 'Applied across admin, creator & brand interfaces.', type: 'select', value: 'DD/MM/YYYY', options: ['DD/MM/YYYY', 'MM/DD/YYYY', 'YYYY-MM-DD'] },
        { id: 'language', label: 'Language Settings', description: 'Default platform language for new accounts.', type: 'select', value: 'English', options: ['English', 'Urdu', 'Arabic', 'French'] },
        { id: 'regional_settings', label: 'Regional Settings', description: 'Affects address formats, phone formats & holidays.', type: 'select', value: 'Pakistan (PK)', options: ['Pakistan (PK)', 'United States (US)', 'United Kingdom (UK)', 'United Arab Emirates (AE)'] },
      ],
    },
    {
      id: 'behavior', title: 'Platform Behavior', icon: '🚦',
      fields: [
        { id: 'creator_registration', label: 'Creator Registration', description: 'Allow new creators to sign up for the platform.', type: 'toggle', value: true },
        { id: 'brand_registration', label: 'Brand Registration', description: 'Allow new brands to sign up for the platform.', type: 'toggle', value: true },
        { id: 'email_verification_required', label: 'Email Verification Required', description: 'Require email confirmation before account activation.', type: 'toggle', value: true },
        { id: 'phone_verification_required', label: 'Phone Verification Required', description: 'Require phone OTP verification before account activation.', type: 'toggle', value: false },
        { id: 'invitation_system', label: 'Invitation System', description: 'Restrict new signups to invite codes only.', type: 'toggle', value: false },
        { id: 'maintenance_mode', label: 'Maintenance Mode', description: 'Take the platform offline for all non-admin users.', type: 'toggle', value: false, impact: 'high' },
        { id: 'beta_features', label: 'Beta Features', description: 'Enable experimental features for internal testing.', type: 'toggle', value: true },
      ],
    },
    {
      id: 'limits', title: 'Platform Limits', icon: '📐',
      fields: [
        { id: 'max_campaigns', label: 'Maximum Campaigns', description: 'Maximum active campaigns per brand account.', type: 'number', value: 50, unit: 'per brand', min: 1, max: 500 },
        { id: 'max_team_members', label: 'Maximum Team Members', description: 'Maximum team seats per organization.', type: 'number', value: 25, unit: 'per organization', min: 1, max: 200 },
        { id: 'max_upload_size', label: 'Maximum Upload Size', description: 'Maximum file size for media uploads.', type: 'number', value: 100, unit: 'MB', min: 5, max: 1000 },
        { id: 'max_file_count', label: 'Maximum File Count', description: 'Maximum number of files per upload batch.', type: 'number', value: 20, unit: 'files', min: 1, max: 100 },
        { id: 'max_api_requests', label: 'Maximum API Requests', description: 'Rate limit applied to external API consumers.', type: 'number', value: 1000, unit: 'requests/hour', min: 10, max: 100000, impact: 'high' },
      ],
    },
  ],

  creator: [
    {
      id: 'profile', title: 'Creator Profile Settings', icon: '🧑‍🎨',
      fields: [
        { id: 'required_profile_completion', label: 'Required Profile Completion %', description: 'Minimum profile completion before applying to campaigns.', type: 'slider', value: 80, min: 0, max: 100, unit: '%' },
        { id: 'required_social_accounts', label: 'Required Social Accounts', description: 'Minimum linked social accounts required.', type: 'number', value: 1, unit: 'accounts', min: 0, max: 5 },
        { id: 'portfolio_requirements', label: 'Portfolio Requirements', description: 'Whether a portfolio is required to apply to campaigns.', type: 'select', value: 'Recommended', options: ['Optional', 'Recommended', 'Required'] },
        { id: 'media_kit_requirements', label: 'Media Kit Requirements', description: 'Whether a media kit is required for verification.', type: 'select', value: 'Optional', options: ['Optional', 'Recommended', 'Required'] },
        { id: 'minimum_bio_length', label: 'Minimum Bio Length', description: 'Minimum characters required in creator bio.', type: 'number', value: 50, unit: 'characters', min: 0, max: 500 },
        { id: 'required_verification_fields', label: 'Required Verification Fields', description: 'Fields required to complete identity verification.', type: 'multiselect', value: ['Full Name', 'Phone Number', 'Social Profile'], options: ['Full Name', 'Date of Birth', 'Government ID', 'Phone Number', 'Social Profile', 'Bank Details'] },
      ],
    },
    {
      id: 'verification', title: 'Creator Verification Rules', icon: '🪪',
      fields: [
        { id: 'identity_verification', label: 'Identity Verification', description: 'Verify government-issued ID for new creators.', type: 'toggle', value: true },
        { id: 'social_verification', label: 'Social Verification', description: 'Verify ownership of linked social media accounts.', type: 'toggle', value: true },
        { id: 'phone_verification', label: 'Phone Verification', description: 'Verify phone number via OTP.', type: 'toggle', value: true },
        { id: 'document_verification', label: 'Document Verification', description: 'Require supporting documents for high-value campaigns.', type: 'toggle', value: false },
        { id: 'video_verification', label: 'Video Verification', description: 'Require a short verification video for flagged accounts.', type: 'toggle', value: false },
        { id: 'risk_based_verification', label: 'Risk-Based Verification', description: 'Apply stricter checks to accounts flagged as high risk.', type: 'toggle', value: true },
      ],
    },
    {
      id: 'eligibility', title: 'Creator Eligibility Rules', icon: '🎯',
      fields: [
        { id: 'minimum_followers', label: 'Minimum Followers', description: 'Minimum total followers to apply to campaigns.', type: 'number', value: 500, unit: 'followers', min: 0, max: 1000000 },
        { id: 'minimum_engagement_rate', label: 'Minimum Engagement Rate', description: 'Minimum average engagement rate across platforms.', type: 'percent', value: 1.5, min: 0, max: 20, step: 0.1 },
        { id: 'minimum_profile_completion', label: 'Minimum Profile Completion', description: 'Minimum profile completion to appear in brand search.', type: 'percent', value: 70, min: 0, max: 100 },
        { id: 'minimum_creator_score', label: 'Minimum Creator Score', description: 'Minimum reputation score to appear in recommendations.', type: 'number', value: 60, unit: '/ 100', min: 0, max: 100 },
        { id: 'campaign_eligibility_rules', label: 'Campaign Eligibility Rules', description: 'How creators qualify to apply for campaigns.', type: 'select', value: 'Score-Based', options: ['Open to All', 'Score-Based', 'Manual Approval'] },
      ],
    },
    {
      id: 'safety', title: 'Creator Safety Settings', icon: '🛟',
      fields: [
        { id: 'content_restrictions', label: 'Content Restrictions', description: 'Content categories creators may not publish.', type: 'multiselect', value: ['Adult Content', 'Hate Speech', 'Misinformation'], options: ['Adult Content', 'Violence', 'Hate Speech', 'Misinformation', 'Gambling', 'Alcohol & Tobacco'] },
        { id: 'communication_limits', label: 'Communication Limits', description: 'Maximum outbound messages per day to brands.', type: 'number', value: 20, unit: 'messages/day', min: 1, max: 200 },
        { id: 'reporting_thresholds', label: 'Reporting Thresholds', description: 'Reports required before an account is reviewed.', type: 'number', value: 3, unit: 'reports', min: 1, max: 20 },
        { id: 'account_review_rules', label: 'Account Review Rules', description: 'How flagged creator accounts are reviewed.', type: 'select', value: 'Hybrid', options: ['Automatic', 'Manual', 'Hybrid'] },
        { id: 'appeal_process_rules', label: 'Appeal Process Rules', description: 'Timeline & process for creators appealing actions.', type: 'select', value: 'Standard (7 days)', options: ['Standard (7 days)', 'Expedited (48 hours)', 'Case-by-Case'] },
      ],
    },
    {
      id: 'reputation', title: 'Creator Reputation Engine', icon: '⭐', subtitle: 'Weights should total 100%.',
      fields: [
        { id: 'trust_score_weight', label: 'Trust Score Weight', description: 'Contribution of identity & verification trust.', type: 'slider', value: 30, min: 0, max: 100, unit: '%' },
        { id: 'collaboration_score_weight', label: 'Collaboration Score Weight', description: 'Contribution of successful collaboration history.', type: 'slider', value: 20, min: 0, max: 100, unit: '%' },
        { id: 'review_weight', label: 'Review Weight', description: 'Contribution of brand reviews & ratings.', type: 'slider', value: 20, min: 0, max: 100, unit: '%' },
        { id: 'completion_rate_weight', label: 'Completion Rate Weight', description: 'Contribution of on-time deliverable completion.', type: 'slider', value: 20, min: 0, max: 100, unit: '%' },
        { id: 'violation_weight', label: 'Violation Weight', description: 'Penalty contribution from policy violations.', type: 'slider', value: 10, min: 0, max: 100, unit: '%' },
      ],
    },
  ],

  brand: [
    {
      id: 'profile_rules', title: 'Brand Profile Rules', icon: '🏢',
      fields: [
        { id: 'required_business_information', label: 'Required Business Information', description: 'Require legal business name, address & registration number.', type: 'toggle', value: true },
        { id: 'required_company_verification', label: 'Required Company Verification', description: 'Require verification before campaigns can be published.', type: 'toggle', value: true },
        { id: 'required_tax_information', label: 'Required Tax Information', description: 'Require tax ID / registration for invoicing.', type: 'toggle', value: false },
        { id: 'required_team_information', label: 'Required Team Information', description: 'Require at least one verified team contact.', type: 'toggle', value: false },
        { id: 'required_website_validation', label: 'Required Website Validation', description: 'Validate company website ownership during onboarding.', type: 'toggle', value: true },
      ],
    },
    {
      id: 'verification_engine', title: 'Brand Verification Engine', icon: '🔎',
      fields: [
        { id: 'business_registration_validation', label: 'Business Registration Validation', description: 'Cross-check business registration with government records.', type: 'toggle', value: true },
        { id: 'domain_verification', label: 'Domain Verification', description: 'Verify ownership of the brand’s domain via DNS/email.', type: 'toggle', value: true },
        { id: 'tax_verification', label: 'Tax Verification', description: 'Verify submitted tax identification numbers.', type: 'toggle', value: false },
        { id: 'identity_verification', label: 'Identity Verification', description: 'Verify identity of the primary account holder.', type: 'toggle', value: true },
        { id: 'risk_assessment_rules', label: 'Risk Assessment Rules', description: 'Risk model applied during brand onboarding.', type: 'select', value: 'Standard', options: ['Standard', 'Strict', 'Custom'] },
      ],
    },
    {
      id: 'trust_system', title: 'Brand Trust System', icon: '🤝', subtitle: 'Weights should total 100%.',
      fields: [
        { id: 'brand_trust_score_weight', label: 'Brand Trust Score', description: 'Overall trust weighting in brand ranking.', type: 'slider', value: 30, min: 0, max: 100, unit: '%' },
        { id: 'payment_reliability_score_weight', label: 'Payment Reliability Score', description: 'Weight of on-time payment & escrow history.', type: 'slider', value: 30, min: 0, max: 100, unit: '%' },
        { id: 'creator_satisfaction_score_weight', label: 'Creator Satisfaction Score', description: 'Weight of creator feedback & satisfaction ratings.', type: 'slider', value: 20, min: 0, max: 100, unit: '%' },
        { id: 'dispute_weight', label: 'Dispute Weight', description: 'Penalty weighting for open or lost disputes.', type: 'slider', value: 10, min: 0, max: 100, unit: '%' },
        { id: 'review_weight', label: 'Review Weight', description: 'Weight of public reviews from creators.', type: 'slider', value: 10, min: 0, max: 100, unit: '%' },
      ],
    },
    {
      id: 'safety_controls', title: 'Brand Safety Controls', icon: '🛡️',
      fields: [
        { id: 'campaign_approval_rules', label: 'Campaign Approval Rules', description: 'How new campaigns from this brand are approved.', type: 'select', value: 'Risk-Based', options: ['Automatic', 'Manual Review', 'Risk-Based'] },
        { id: 'communication_policies', label: 'Communication Policies', description: 'How brands may communicate with creators.', type: 'select', value: 'Moderated', options: ['Open', 'Moderated', 'Restricted'] },
        { id: 'creator_contact_policies', label: 'Creator Contact Policies', description: 'Whether brands can contact creators outside the platform.', type: 'select', value: 'Platform Messaging Only', options: ['Direct Contact Allowed', 'Platform Messaging Only'] },
        { id: 'platform_compliance_rules', label: 'Platform Compliance Rules', description: 'Compliance frameworks enforced on brand campaigns.', type: 'multiselect', value: ['Advertising Standards', 'FTC Disclosure', 'Data Protection'], options: ['Advertising Standards', 'FTC Disclosure', 'Local Tax Law', 'Data Protection'] },
      ],
    },
  ],

  marketplace: [
    {
      id: 'campaign_rules', title: 'Campaign Rules', icon: '📣',
      fields: [
        { id: 'default_campaign_duration', label: 'Default Campaign Duration', description: 'Default length applied to new campaigns.', type: 'number', value: 30, unit: 'days', min: 1, max: 365 },
        { id: 'campaign_approval_workflow', label: 'Campaign Approval Workflow', description: 'How new campaigns are approved before going live.', type: 'select', value: 'Hybrid', options: ['Manual', 'Automatic', 'Hybrid'] },
        { id: 'minimum_campaign_budget', label: 'Minimum Campaign Budget', description: 'Smallest budget allowed for a campaign.', type: 'number', value: 10000, unit: 'PKR', min: 0, max: 10000000 },
        { id: 'maximum_campaign_budget', label: 'Maximum Campaign Budget', description: 'Largest budget allowed without finance review.', type: 'number', value: 5000000, unit: 'PKR', min: 0, max: 100000000, impact: 'high' },
        { id: 'deliverable_rules', label: 'Deliverable Rules', description: 'How campaign deliverables are structured.', type: 'select', value: 'Flexible', options: ['Flexible', 'Strict Templates', 'Brand-Defined'] },
        { id: 'revision_limits', label: 'Revision Limits', description: 'Maximum revision rounds per deliverable.', type: 'number', value: 2, unit: 'revisions', min: 0, max: 10 },
        { id: 'application_limits', label: 'Application Limits', description: 'Maximum creator applications per campaign.', type: 'number', value: 50, unit: 'applications', min: 1, max: 1000 },
      ],
    },
    {
      id: 'collaboration_rules', title: 'Collaboration Rules', icon: '🤝',
      fields: [
        { id: 'creator_acceptance_limits', label: 'Creator Acceptance Limits', description: 'Maximum active collaborations per creator.', type: 'number', value: 10, unit: 'active collabs', min: 1, max: 100 },
        { id: 'brand_invitation_limits', label: 'Brand Invitation Limits', description: 'Maximum invitations a brand can send per day.', type: 'number', value: 25, unit: 'invites/day', min: 1, max: 500 },
        { id: 'collaboration_cancellation_rules', label: 'Collaboration Cancellation Rules', description: 'Notice window before a collaboration can be cancelled.', type: 'number', value: 24, unit: 'hours', min: 0, max: 168 },
        { id: 'collaboration_expiry_rules', label: 'Collaboration Expiry Rules', description: 'Time before an unaccepted collaboration request expires.', type: 'number', value: 14, unit: 'days', min: 1, max: 90 },
      ],
    },
    {
      id: 'economics', title: 'Marketplace Economics', icon: '💰',
      fields: [
        { id: 'platform_commission', label: 'Platform Commission', description: 'Commission taken on every completed campaign.', type: 'percent', value: 15, min: 0, max: 50, impact: 'high' },
        { id: 'transaction_fees', label: 'Transaction Fees', description: 'Fee applied to each processed payment.', type: 'percent', value: 2.5, min: 0, max: 10, step: 0.1 },
        { id: 'escrow_fees', label: 'Escrow Fees', description: 'Fee applied to funds held in escrow.', type: 'percent', value: 1, min: 0, max: 10, step: 0.1 },
        { id: 'withdrawal_fees', label: 'Withdrawal Fees', description: 'Fee applied to creator withdrawals.', type: 'percent', value: 1.5, min: 0, max: 10, step: 0.1 },
        { id: 'refund_rules', label: 'Refund Rules', description: 'Window during which a refund can be requested.', type: 'number', value: 7, unit: 'days', min: 0, max: 60 },
        { id: 'dispute_resolution_fees', label: 'Dispute Resolution Fees', description: 'Fee charged to the losing party in a resolved dispute.', type: 'percent', value: 2, min: 0, max: 10, step: 0.1 },
      ],
    },
  ],

  trust_safety: [
    {
      id: 'reporting_rules', title: 'Reporting Rules', icon: '🚩',
      fields: [
        { id: 'auto_escalation_rules', label: 'Auto Escalation Rules', description: 'Reports on a single account before auto-escalation.', type: 'number', value: 5, unit: 'reports', min: 1, max: 50 },
        { id: 'violation_thresholds', label: 'Violation Thresholds', description: 'Confirmed violations before account action is taken.', type: 'number', value: 3, unit: 'violations', min: 1, max: 20 },
        { id: 'repeat_offender_policies', label: 'Repeat Offender Policies', description: 'Action applied to repeat policy violators.', type: 'select', value: 'Warning then Suspend', options: ['Warning then Suspend', 'Immediate Suspend', 'Permanent Ban'] },
        { id: 'moderator_review_rules', label: 'Moderator Review Rules', description: 'Require human moderator review before action is applied.', type: 'toggle', value: true },
      ],
    },
    {
      id: 'fraud_detection', title: 'Fraud Detection Rules', icon: '🕵️',
      fields: [
        { id: 'follower_fraud_detection', label: 'Follower Fraud Detection', description: 'Detect purchased or fake follower patterns.', type: 'toggle', value: true },
        { id: 'engagement_fraud_detection', label: 'Engagement Fraud Detection', description: 'Detect artificially inflated engagement.', type: 'toggle', value: true },
        { id: 'spam_detection', label: 'Spam Detection', description: 'Detect spam messages & repetitive content.', type: 'toggle', value: true },
        { id: 'bot_detection', label: 'Bot Detection', description: 'Detect automated / bot-driven account activity.', type: 'toggle', value: true },
        { id: 'multi_account_detection', label: 'Multi-Account Detection', description: 'Detect duplicate accounts from the same individual.', type: 'toggle', value: true },
        { id: 'fraud_detection_sensitivity', label: 'Fraud Detection Sensitivity', description: 'Overall sensitivity of fraud detection models.', type: 'slider', value: 70, min: 0, max: 100, unit: '%' },
      ],
    },
    {
      id: 'content_moderation', title: 'Content Moderation', icon: '🧹',
      fields: [
        { id: 'ai_moderation_threshold', label: 'AI Moderation Threshold', description: 'Confidence above which AI auto-removes content.', type: 'percent', value: 85, min: 0, max: 100 },
        { id: 'manual_review_threshold', label: 'Manual Review Threshold', description: 'Confidence range routed to manual moderators.', type: 'percent', value: 60, min: 0, max: 100 },
        { id: 'blocked_categories', label: 'Blocked Categories', description: 'Content categories blocked platform-wide.', type: 'multiselect', value: ['Adult Content', 'Violence', 'Hate Speech', 'Drugs', 'Weapons'], options: ['Adult Content', 'Violence', 'Hate Speech', 'Drugs', 'Weapons', 'Counterfeit Goods'] },
        { id: 'restricted_content_rules', label: 'Restricted Content Rules', description: 'Content categories requiring extra disclosure or review.', type: 'multiselect', value: ['Unverified Health Claims', 'Crypto Promotions'], options: ['Political Content', 'Gambling Promotions', 'Unverified Health Claims', 'Crypto Promotions'] },
      ],
    },
  ],

  privacy: [
    {
      id: 'data_privacy', title: 'Data Privacy Center', icon: '🗄️',
      fields: [
        { id: 'user_data_retention', label: 'User Data Retention', description: 'How long inactive account data is retained.', type: 'number', value: 365, unit: 'days', min: 30, max: 3650 },
        { id: 'data_export_rules', label: 'Data Export Rules', description: 'Allow users to export their personal data.', type: 'toggle', value: true },
        { id: 'account_deletion_policies', label: 'Account Deletion Policies', description: 'Grace period before a deletion request is processed.', type: 'number', value: 30, unit: 'days', min: 0, max: 90 },
        { id: 'consent_management', label: 'Consent Management', description: 'How user consent is collected & recorded.', type: 'select', value: 'Granular Consent', options: ['Explicit Opt-In', 'Implied Consent', 'Granular Consent'] },
        { id: 'cookie_preferences', label: 'Cookie Preferences', description: 'Default cookie categories enabled for new visitors.', type: 'select', value: 'Essential + Analytics', options: ['Essential Only', 'Essential + Analytics', 'All Cookies'] },
      ],
    },
    {
      id: 'compliance', title: 'Compliance Center', icon: '⚖️',
      fields: [
        { id: 'gdpr', label: 'GDPR', description: 'Enforce GDPR data subject rights for EU users.', type: 'toggle', value: true },
        { id: 'ccpa', label: 'CCPA', description: 'Enforce CCPA disclosure & opt-out rights for CA users.', type: 'toggle', value: true },
        { id: 'data_processing_rules', label: 'Data Processing Rules', description: 'Legal basis applied to cross-border data transfers.', type: 'select', value: 'Standard Contractual Clauses', options: ['Standard Contractual Clauses', 'Adequacy Decision', 'Binding Corporate Rules'] },
        { id: 'privacy_requests', label: 'Privacy Requests', description: 'SLA for responding to data subject requests.', type: 'number', value: 30, unit: 'days', min: 1, max: 90 },
        { id: 'legal_hold_policies', label: 'Legal Hold Policies', description: 'Retention override applied during active legal cases.', type: 'select', value: 'Enabled for Active Cases', options: ['Disabled', 'Enabled for Active Cases', 'Always Enabled'] },
      ],
    },
  ],

  ai_automation: [
    {
      id: 'ai_features', title: 'AI Features Control', icon: '🧠',
      fields: [
        { id: 'ai_creator_matching', label: 'AI Creator Matching', description: 'Recommend creators to brands using AI matching.', type: 'toggle', value: true },
        { id: 'ai_campaign_suggestions', label: 'AI Campaign Suggestions', description: 'Suggest campaign structure & targeting to brands.', type: 'toggle', value: true },
        { id: 'ai_fraud_detection', label: 'AI Fraud Detection', description: 'Use AI models to flag fraudulent activity.', type: 'toggle', value: true },
        { id: 'ai_analytics', label: 'AI Analytics', description: 'Generate AI-powered analytics summaries.', type: 'toggle', value: true },
        { id: 'ai_content_review', label: 'AI Content Review', description: 'Use AI to pre-screen campaign content submissions.', type: 'toggle', value: false },
        { id: 'ai_insights', label: 'AI Insights', description: 'Surface AI-generated operational insights to admins.', type: 'toggle', value: true },
      ],
    },
    {
      id: 'ai_confidence', title: 'AI Confidence Settings', icon: '🎯',
      fields: [
        { id: 'auto_approval_threshold', label: 'Auto Approval Threshold', description: 'AI confidence above which items are auto-approved.', type: 'slider', value: 90, min: 0, max: 100, unit: '%' },
        { id: 'auto_rejection_threshold', label: 'Auto Rejection Threshold', description: 'AI confidence above which items are auto-rejected.', type: 'slider', value: 20, min: 0, max: 100, unit: '%', impact: 'high' },
        { id: 'fraud_risk_threshold', label: 'Fraud Risk Threshold', description: 'Risk score above which accounts are auto-flagged.', type: 'slider', value: 75, min: 0, max: 100, unit: '%', impact: 'high' },
        { id: 'ai_recommendation_sensitivity', label: 'AI Recommendation Sensitivity', description: 'How aggressively AI surfaces recommendations.', type: 'slider', value: 60, min: 0, max: 100, unit: '%' },
      ],
    },
  ],

  security: [
    {
      id: 'authentication', title: 'Authentication', icon: '🔑',
      fields: [
        { id: 'password_policies', label: 'Password Policies', description: 'Minimum password strength for all accounts.', type: 'select', value: 'Strong (recommended)', options: ['Basic', 'Standard', 'Strong (recommended)', 'Maximum'] },
        { id: 'password_min_length', label: 'Minimum Password Length', description: 'Minimum characters required for new passwords.', type: 'number', value: 10, unit: 'characters', min: 6, max: 32 },
        { id: 'session_duration', label: 'Session Duration', description: 'How long a session stays active without activity.', type: 'number', value: 30, unit: 'minutes', min: 5, max: 1440 },
        { id: 'mfa_requirements', label: 'MFA Requirements', description: 'Require multi-factor authentication for all users.', type: 'toggle', value: false },
        { id: 'admin_mfa_enforcement', label: 'Admin MFA Enforcement', description: 'Require MFA for all admin & moderator accounts.', type: 'toggle', value: true, impact: 'high' },
        { id: 'device_verification', label: 'Device Verification', description: 'Require verification for sign-ins from new devices.', type: 'toggle', value: true },
      ],
    },
  ],

  integrations: [
    {
      id: 'api_management', title: 'API Management', icon: '🔧',
      fields: [
        { id: 'rate_limits', label: 'Rate Limits', description: 'Default API rate limit applied per integration.', type: 'number', value: 1000, unit: 'requests/hour', min: 10, max: 100000 },
        { id: 'environment_management', label: 'Environment Management', description: 'Active environment for API credentials.', type: 'select', value: 'Production', options: ['Production', 'Staging', 'Development'] },
      ],
    },
  ],

  billing: [
    {
      id: 'revenue_settings', title: 'Revenue Settings', icon: '💵',
      fields: [
        { id: 'commission_structure', label: 'Commission Structure', description: 'How platform commission is calculated.', type: 'select', value: 'Tiered', options: ['Flat Rate', 'Tiered', 'Custom per Brand'] },
        { id: 'escrow_policies', label: 'Escrow Policies', description: 'When escrowed funds are released to creators.', type: 'select', value: 'Release on Completion + 7 days', options: ['Release on Approval', 'Release on Completion + 7 days', 'Manual Release'] },
        { id: 'payout_schedules', label: 'Payout Schedules', description: 'How often creator payouts are processed.', type: 'select', value: 'Bi-Weekly', options: ['Weekly', 'Bi-Weekly', 'Monthly'] },
        { id: 'tax_handling', label: 'Tax Handling', description: 'Who is responsible for tax withholding.', type: 'select', value: 'Platform Withholds Tax', options: ['Platform Withholds Tax', 'Creator Responsible', 'Brand Responsible'] },
      ],
    },
  ],
};

/* ───────────────────────── Permission Matrices ───────────────────────── */

export const PRIVACY_MATRIX = {
  title: 'User Privacy Controls',
  description: 'Control what each audience can see on public profiles & reports.',
  rows: ['Show Email Address', 'Show Phone Number', 'Show Revenue Data', 'Show Earnings History', 'Show Campaign Performance', 'Show Audience Insights'],
  columns: ['Creators', 'Brands', 'Public'],
  value: {
    'Show Email Address':        { Creators: true,  Brands: false, Public: false },
    'Show Phone Number':         { Creators: true,  Brands: false, Public: false },
    'Show Revenue Data':         { Creators: true,  Brands: true,  Public: false },
    'Show Earnings History':     { Creators: true,  Brands: false, Public: false },
    'Show Campaign Performance': { Creators: true,  Brands: true,  Public: false },
    'Show Audience Insights':    { Creators: true,  Brands: true,  Public: true  },
  },
};

export const ACCESS_CONTROL_MATRIX = {
  title: 'Role Management & Admin Permissions',
  description: 'Define what each platform role is permitted to do.',
  rows: ['View Users', 'Edit Users', 'Manage Campaigns', 'Access Financial Data', 'Moderate Content', 'Manage Settings', 'Manage Admins'],
  columns: ['Admin', 'Moderator', 'Support Agent', 'Custom Role'],
  value: {
    'View Users':            { Admin: true, Moderator: true,  'Support Agent': true,  'Custom Role': false },
    'Edit Users':            { Admin: true, Moderator: true,  'Support Agent': false, 'Custom Role': false },
    'Manage Campaigns':      { Admin: true, Moderator: false, 'Support Agent': false, 'Custom Role': false },
    'Access Financial Data': { Admin: true, Moderator: false, 'Support Agent': false, 'Custom Role': false },
    'Moderate Content':      { Admin: true, Moderator: true,  'Support Agent': false, 'Custom Role': true  },
    'Manage Settings':       { Admin: true, Moderator: false, 'Support Agent': false, 'Custom Role': false },
    'Manage Admins':         { Admin: true, Moderator: false, 'Support Agent': false, 'Custom Role': false },
  },
};

export const FEATURE_ACCESS_MATRIX = {
  title: 'Feature Access Matrix',
  description: 'Features included in each subscription plan.',
  rows: ['Campaign Analytics', 'AI Creator Matching', 'Priority Support', 'Custom Branding', 'API Access', 'Advanced Reporting', 'Dedicated Account Manager'],
  columns: ['Creator Plan', 'Brand Plan', 'Enterprise Plan'],
  value: {
    'Campaign Analytics':         { 'Creator Plan': true,  'Brand Plan': true,  'Enterprise Plan': true  },
    'AI Creator Matching':        { 'Creator Plan': false, 'Brand Plan': true,  'Enterprise Plan': true  },
    'Priority Support':           { 'Creator Plan': false, 'Brand Plan': true,  'Enterprise Plan': true  },
    'Custom Branding':            { 'Creator Plan': false, 'Brand Plan': false, 'Enterprise Plan': true  },
    'API Access':                 { 'Creator Plan': false, 'Brand Plan': false, 'Enterprise Plan': true  },
    'Advanced Reporting':         { 'Creator Plan': false, 'Brand Plan': true,  'Enterprise Plan': true  },
    'Dedicated Account Manager':  { 'Creator Plan': false, 'Brand Plan': false, 'Enterprise Plan': true  },
  },
};

/* ───────────────────────── Subscription Plans ───────────────────────── */

export const SUBSCRIPTION_PLANS = [
  { id: 'creator', name: 'Creator Plan', price: 'Free', audience: 'Creators', description: 'Core marketplace access for individual creators.', activeUsers: 8420 },
  { id: 'brand', name: 'Brand Plan', price: 'PKR 24,999/mo', audience: 'Brands', description: 'Full campaign tools, analytics & AI matching for growing brands.', activeUsers: 612 },
  { id: 'enterprise', name: 'Enterprise Plan', price: 'Custom', audience: 'Enterprise Brands', description: 'Custom branding, API access & dedicated account management.', activeUsers: 38 },
];

/* ───────────────────────── Automation Engine ───────────────────────── */

export const AUTOMATION_RULES = [
  { id: 'auto_verify_creators', name: 'Auto Verify Creators', description: 'Automatically approve identity verification for low-risk creators.', category: 'Verification', status: 'active', runsToday: 27 },
  { id: 'auto_verify_brands', name: 'Auto Verify Brands', description: 'Automatically approve brands that pass domain & registration checks.', category: 'Verification', status: 'active', runsToday: 4 },
  { id: 'auto_assign_reports', name: 'Auto Assign Reports', description: 'Assign incoming reports to available moderators by workload.', category: 'Moderation', status: 'active', runsToday: 19 },
  { id: 'auto_escalate_disputes', name: 'Auto Escalate Disputes', description: 'Escalate disputes that exceed SLA to senior admins.', category: 'Disputes', status: 'active', runsToday: 3 },
  { id: 'auto_notify_users', name: 'Auto Notify Users', description: 'Send automated notifications for account & policy changes.', category: 'Notifications', status: 'active', runsToday: 156 },
  { id: 'auto_suspend_high_risk', name: 'Auto Suspend High Risk Accounts', description: 'Temporarily suspend accounts exceeding the fraud risk threshold.', category: 'Risk', status: 'paused', runsToday: 0 },
];

/* ───────────────────────── Automation Builder ───────────────────────── */

export const CONDITION_FIELDS = ['Creator Score', 'Follower Count', 'Engagement Rate', 'Risk Score', 'Account Age (days)', 'Dispute Count', 'Verification Status'];
export const CONDITION_OPERATORS = ['is greater than', 'is less than', 'is equal to', 'is not equal to', 'contains'];
export const AUTOMATION_ACTIONS = ['Auto-Verify Account', 'Flag for Review', 'Send Notification', 'Suspend Account', 'Escalate to Senior Admin', 'Apply Trust Badge', 'Reduce Visibility'];

export const CUSTOM_AUTOMATIONS = [
  { id: 'rule-1', name: 'Fast-track trusted creators', condition: { field: 'Creator Score', operator: 'is greater than', value: '85' }, action: 'Auto-Verify Account', enabled: true },
  { id: 'rule-2', name: 'Flag high-risk new accounts', condition: { field: 'Risk Score', operator: 'is greater than', value: '75' }, action: 'Flag for Review', enabled: true },
  { id: 'rule-3', name: 'Escalate repeat disputes', condition: { field: 'Dispute Count', operator: 'is greater than', value: '2' }, action: 'Escalate to Senior Admin', enabled: false },
];

/* ───────────────────────── AI Settings Advisor ───────────────────────── */

export const AI_ADVISOR_RECOMMENDATIONS = [
  { id: 'adv-1', category: 'Security', impact: 'high', confidence: 94, title: 'Enforce MFA for all admin accounts', recommendation: '3 admin accounts do not have MFA enabled. Enforcing Admin MFA Enforcement closes a high-severity access risk.', action: 'Enable Admin MFA Enforcement' },
  { id: 'adv-2', category: 'Verification', impact: 'medium', confidence: 88, title: 'Tighten creator eligibility thresholds', recommendation: 'Raising the Minimum Creator Score from 60 to 65 would reduce low-quality applications by an estimated 12%.', action: 'Raise Minimum Creator Score' },
  { id: 'adv-3', category: 'Fraud Prevention', impact: 'high', confidence: 91, title: 'Lower fraud risk threshold', recommendation: 'Recent anomaly trends suggest lowering the Fraud Risk Threshold from 75% to 65% would catch more suspicious accounts earlier.', action: 'Lower Fraud Risk Threshold' },
  { id: 'adv-4', category: 'Revenue', impact: 'medium', confidence: 82, title: 'Adjust escrow release window', recommendation: 'Shortening escrow release from 7 to 5 days after completion may improve creator satisfaction without increasing dispute rates.', action: 'Update Escrow Policy' },
  { id: 'adv-5', category: 'Creator Experience', impact: 'low', confidence: 76, title: 'Relax portfolio requirements', recommendation: 'Making portfolio submission "Optional" instead of "Recommended" may reduce onboarding drop-off for new creators.', action: 'Update Portfolio Requirements' },
  { id: 'adv-6', category: 'Brand Experience', impact: 'medium', confidence: 85, title: 'Automate low-risk campaign approvals', recommendation: 'Switching Campaign Approval Workflow to Hybrid for brands with trust scores above 80 could cut approval time by 40%.', action: 'Update Campaign Approval Workflow' },
];

/* ───────────────────────── Security Center ───────────────────────── */

export const SECURITY_HEALTH_SCORE = 88;

export const SECURITY_HEALTH_FACTORS = [
  { id: 'mfa_coverage', label: 'MFA Coverage', value: 82, detail: '82% of admin accounts have MFA enabled' },
  { id: 'password_strength', label: 'Password Strength', value: 91, detail: 'Strong password policy enforced' },
  { id: 'session_hygiene', label: 'Session Hygiene', value: 88, detail: '30-minute session timeout active' },
  { id: 'access_review', label: 'Access Review Recency', value: 79, detail: 'Roles last reviewed 18 days ago' },
  { id: 'incident_response', label: 'Incident Response Readiness', value: 95, detail: 'All playbooks up to date' },
];

export const SECURITY_MONITORING_STATS = {
  failedLogins: 23,
  suspiciousLogins: 4,
  accessAttempts: 1840,
  privilegeEscalationEvents: 1,
};

export const SECURITY_EVENTS = [
  { id: 'sec-1', type: 'suspicious_login', severity: 'high', description: 'Login from new device flagged for admin account.', actor: 'omar.farooq@creconnect.com', location: 'Lahore, PK', timestamp: hoursAgo(2) },
  { id: 'sec-2', type: 'failed_login', severity: 'medium', description: '5 consecutive failed login attempts.', actor: 'unknown@brand-mail.com', location: 'Unknown', timestamp: hoursAgo(5) },
  { id: 'sec-3', type: 'privilege_escalation', severity: 'high', description: 'Moderator role elevated to Admin.', actor: 'ayesha.khan@creconnect.com', location: 'Karachi, PK', timestamp: hoursAgo(20) },
  { id: 'sec-4', type: 'access_attempt', severity: 'low', description: 'API key used from new IP range.', actor: 'integration:zapier', location: 'Singapore', timestamp: daysAgo(1) },
  { id: 'sec-5', type: 'suspicious_login', severity: 'medium', description: 'Multiple sessions from different countries within 1 hour.', actor: 'creator: hamza.sheikh', location: 'Multiple', timestamp: daysAgo(2) },
];

/* ───────────────────────── Integrations ───────────────────────── */

export const CONNECTED_SERVICES = [
  { id: 'google_analytics', name: 'Google Analytics', icon: '📈', category: 'Analytics', status: 'connected', lastSync: hoursAgo(1) },
  { id: 'meta_business', name: 'Meta Business', icon: '📘', category: 'Advertising', status: 'connected', lastSync: hoursAgo(3) },
  { id: 'tiktok_business', name: 'TikTok Business', icon: '🎵', category: 'Advertising', status: 'connected', lastSync: hoursAgo(6) },
  { id: 'stripe', name: 'Stripe', icon: '💳', category: 'Payments', status: 'connected', lastSync: hoursAgo(1) },
  { id: 'paypal', name: 'PayPal', icon: '💰', category: 'Payments', status: 'not_connected', lastSync: null },
  { id: 'hubspot', name: 'HubSpot', icon: '🧩', category: 'CRM', status: 'connected', lastSync: daysAgo(1) },
  { id: 'salesforce', name: 'Salesforce', icon: '☁️', category: 'CRM', status: 'not_connected', lastSync: null },
  { id: 'zapier', name: 'Zapier', icon: '⚡', category: 'Automation', status: 'connected', lastSync: hoursAgo(4) },
  { id: 'openai', name: 'OpenAI', icon: '🤖', category: 'AI', status: 'connected', lastSync: hoursAgo(1) },
  { id: 'webhook_center', name: 'Webhook Center', icon: '🔗', category: 'Developer', status: 'connected', lastSync: hoursAgo(2) },
];

export const API_KEYS = [
  { id: 'key-1', name: 'Production Server Key', maskedKey: 'cc_live_••••••••••••8f2a', scopes: ['read', 'write'], created: daysAgo(120), lastUsed: hoursAgo(1) },
  { id: 'key-2', name: 'Analytics Read-Only Key', maskedKey: 'cc_live_••••••••••••b91c', scopes: ['read'], created: daysAgo(64), lastUsed: hoursAgo(5) },
  { id: 'key-3', name: 'Zapier Integration Key', maskedKey: 'cc_live_••••••••••••44de', scopes: ['read', 'write', 'webhooks'], created: daysAgo(30), lastUsed: hoursAgo(4) },
  { id: 'key-4', name: 'Staging Key', maskedKey: 'cc_test_••••••••••••a210', scopes: ['read', 'write'], created: daysAgo(200), lastUsed: daysAgo(40) },
];

export const WEBHOOK_SECRETS = [
  { id: 'wh-1', endpoint: 'https://hooks.creconnect.com/payments', maskedSecret: 'whsec_••••••••9f3a', status: 'active' },
  { id: 'wh-2', endpoint: 'https://hooks.creconnect.com/verification', maskedSecret: 'whsec_••••••••2c7d', status: 'active' },
  { id: 'wh-3', endpoint: 'https://hooks.creconnect.com/disputes', maskedSecret: 'whsec_••••••••e814', status: 'disabled' },
];

/* ───────────────────────── Change Management / Audit Trail ───────────────────────── */

export const AUDIT_LOG = [
  { id: 'aud-1', settingLabel: 'Platform Commission', sectionLabel: 'Marketplace Rules', changedBy: 'Ayesha Khan', timestamp: hoursAgo(4), oldValue: '12%', newValue: '15%', reason: 'Aligned with updated finance model for Q3.' },
  { id: 'aud-2', settingLabel: 'Admin MFA Enforcement', sectionLabel: 'Security Center', changedBy: 'Omar Farooq', timestamp: hoursAgo(20), oldValue: 'Disabled', newValue: 'Enabled', reason: 'Security audit recommendation.' },
  { id: 'aud-3', settingLabel: 'Minimum Followers', sectionLabel: 'Creator System', changedBy: 'Ayesha Khan', timestamp: daysAgo(1), oldValue: '250', newValue: '500', reason: 'Reduce low-quality applications.' },
  { id: 'aud-4', settingLabel: 'Maintenance Mode', sectionLabel: 'Platform Configuration', changedBy: 'System', timestamp: daysAgo(2), oldValue: 'Enabled', newValue: 'Disabled', reason: 'Scheduled maintenance window completed.' },
  { id: 'aud-5', settingLabel: 'AI Fraud Detection', sectionLabel: 'AI & Automation', changedBy: 'Bilal Ahmed', timestamp: daysAgo(3), oldValue: 'Disabled', newValue: 'Enabled', reason: 'Enabled following fraud detection model rollout.' },
  { id: 'aud-6', settingLabel: 'Escrow Policies', sectionLabel: 'Billing & Revenue Rules', changedBy: 'Omar Farooq', timestamp: daysAgo(5), oldValue: 'Release on Approval', newValue: 'Release on Completion + 7 days', reason: 'Reduce premature fund releases ahead of disputes.' },
  { id: 'aud-7', settingLabel: 'Blocked Categories', sectionLabel: 'Trust & Safety', changedBy: 'Sana Tariq', timestamp: daysAgo(8), oldValue: 'Adult Content, Violence', newValue: 'Adult Content, Violence, Hate Speech, Drugs, Weapons', reason: 'Expanded after policy review.' },
  { id: 'aud-8', settingLabel: 'Session Duration', sectionLabel: 'Security Center', changedBy: 'Ayesha Khan', timestamp: daysAgo(12), oldValue: '60 minutes', newValue: '30 minutes', reason: 'Reduce session hijacking risk window.' },
];

/* ───────────────────────── Global Settings Search ───────────────────────── */

export const SETTINGS_SEARCH_INDEX = Object.entries(SETTINGS_SCHEMA).flatMap(([sectionId, groups]) => {
  const section = SETTINGS_SECTIONS.find((s) => s.id === sectionId);
  return groups.flatMap((group) =>
    group.fields.map((field) => ({
      sectionId,
      sectionLabel: section?.label ?? sectionId,
      sectionIcon: section?.icon ?? '⚙️',
      groupId: group.id,
      groupTitle: group.title,
      fieldId: field.id,
      label: field.label,
      description: field.description ?? '',
    }))
  );
});
