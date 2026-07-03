import { useState, useEffect, useMemo, useRef, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { brandsApi } from '@/api/brands.api';
import { subscriptionsApi } from '@/api/subscriptions.api';
import { useToast } from '@/hooks/useToast';
import { ROUTES } from '@/constants/routes';

import { getBrandIntel, getBrandHealthScore } from '@/utils/mockBrandIntel';
import {
  getTeamMembers, getIntegrations, getApiKeys, getWebhooks,
  getPaymentMethods, getFinancialSummary,
  getSecurityCenter, getWorkspaceAnalytics, getReputationScores, getProfileCompletion,
} from '@/utils/mockBrandSettings';

import SettingsOverview from '@/components/brandSettings/SettingsOverview';
import SettingsSidebar from '@/components/brandSettings/SettingsSidebar';
import SettingsSectionCard from '@/components/brandSettings/SettingsSectionCard';

import CompanyProfileSection from '@/components/brandSettings/sections/CompanyProfileSection';
import PublicProfileSection from '@/components/brandSettings/sections/PublicProfileSection';
import BusinessInfoSection from '@/components/brandSettings/sections/BusinessInfoSection';
import TeamManagementSection from '@/components/brandSettings/sections/TeamManagementSection';
import BrandPreferencesSection from '@/components/brandSettings/sections/BrandPreferencesSection';
import CampaignDefaultsSection from '@/components/brandSettings/sections/CampaignDefaultsSection';
import PaymentSection from '@/components/brandSettings/sections/PaymentSection';
import NotificationsSection from '@/components/brandSettings/sections/NotificationsSection';
import IntegrationsSection from '@/components/brandSettings/sections/IntegrationsSection';
import AISettingsSection from '@/components/brandSettings/sections/AISettingsSection';
import BrandSafetySection from '@/components/brandSettings/sections/BrandSafetySection';
import SecuritySection from '@/components/brandSettings/sections/SecuritySection';
import AnalyticsSection from '@/components/brandSettings/sections/AnalyticsSection';
import BrandingSection from '@/components/brandSettings/sections/BrandingSection';
import BillingSection from '@/components/brandSettings/sections/BillingSection';
import AutomationSection from '@/components/brandSettings/sections/AutomationSection';
import DangerZoneSection from '@/components/brandSettings/sections/DangerZoneSection';
import VerificationCenter from '@/components/verification/VerificationCenter';

const SECTIONS = [
  { id: 'company-profile', icon: '🏢', label: 'Company Profile' },
  { id: 'public-profile', icon: '🌐', label: 'Public Brand Profile' },
  { id: 'business-info', icon: '📋', label: 'Business Information' },
  { id: 'team', icon: '👥', label: 'Team Management' },
  { id: 'preferences', icon: '🎯', label: 'Brand Preferences' },
  { id: 'campaign-defaults', icon: '📣', label: 'Campaign Defaults' },
  { id: 'payment', icon: '💳', label: 'Payment Settings' },
  { id: 'notifications', icon: '🔔', label: 'Notification Center' },
  { id: 'integrations', icon: '🔌', label: 'Integrations Hub' },
  { id: 'ai-settings', icon: '🤖', label: 'AI Settings' },
  { id: 'brand-safety', icon: '🛡️', label: 'Brand Safety' },
  { id: 'security', icon: '🔒', label: 'Privacy & Security' },
  { id: 'analytics', icon: '📊', label: 'Analytics Preferences' },
  { id: 'branding', icon: '🎨', label: 'Branding' },
  { id: 'billing', icon: '💎', label: 'Subscription & Billing' },
  { id: 'verification', icon: '🛡️', label: 'Verification Center' },
  { id: 'automation', icon: '⚡', label: 'Automation Rules' },
  { id: 'danger-zone', icon: '⬇', label: 'Export Data' },
];

function buildFormState(p = {}) {
  return {
    companyProfile: {
      companyName: p.companyName || '',
      brandName: p.brandName || p.companyName || '',
      tagline: p.tagline || '',
      industry: p.industry || '',
      description: p.description || '',
      foundedYear: p.foundedYear || '',
      companySize: p.companySize || '',
      headquarters: p.location || '',
      website: p.website || '',
      logoUrl:   p.logoUrl   || '',
      bannerUrl: p.bannerUrl || '',
      brandColor: p.brandColor || '#6d5cff',
      // Social links
      instagram: p.instagram || '',
      tiktok:    p.tiktok    || '',
      youtube:   p.youtube   || '',
      linkedin:  p.linkedin  || '',
      facebook:  p.facebook  || '',
      twitter:   p.twitter   || '',
    },
    publicProfile: {
      publicProfileVisible: p.publicProfileVisible ?? true,
      displayTeamMembers: p.displayTeamMembers ?? true,
      displayCampaignResults: p.displayCampaignResults ?? true,
      displayReviews: p.displayReviews ?? true,
      displayBudgetRanges: p.displayBudgetRanges ?? false,
      displayContactInfo: p.displayContactInfo ?? false,
    },
    businessInfo: {
      legalName: p.legalName || '',
      registrationNumber: p.registrationNumber || '',
      taxId: p.taxId || '',
      vatNumber: p.vatNumber || '',
      businessAddress: p.businessAddress || '',
    },
    preferences: {
      preferredCategories: p.preferredCategories || [],
      preferredPlatforms: p.preferredPlatforms || [],
      audienceAgeMin: p.audienceAgeMin || '18',
      audienceAgeMax: p.audienceAgeMax || '34',
      audienceGenders: p.audienceGenders || [],
      audienceCountries: p.audienceCountries || [],
      audienceInterests: p.audienceInterests || [],
    },
    campaignDefaults: {
      defaultBudgetMin: p.defaultBudgetMin || '25000',
      defaultBudgetMax: p.defaultBudgetMax || '75000',
      campaignApprovalFlow: p.campaignApprovalFlow || 'Manual review',
      creatorApprovalFlow: p.creatorApprovalFlow || 'Manual review',
      reviewProcess: p.reviewProcess || 'Single reviewer',
      defaultDeliverable: p.defaultDeliverable || '1 Instagram Reel',
      defaultTemplate: p.defaultTemplate || 'productLaunch',
    },
    payment: {
      stripeConnected: p.stripeConnected ?? false,
      escrowEnabled: p.escrowEnabled ?? true,
      autoReleasePayments: p.autoReleasePayments ?? false,
    },
    notifications: {
      categories: { campaign: true, messages: true, applications: true, payments: true, system: true, ...p.notificationCategories },
      channels: { email: true, push: true, sms: false, ...p.notificationChannels },
    },
    ai: {
      creatorRecommendations: p.creatorRecommendations ?? true,
      campaignForecasting: p.campaignForecasting ?? true,
      budgetSuggestions: p.budgetSuggestions ?? true,
      aiOutreach: p.aiOutreach ?? false,
      aiAnalyticsInsights: p.aiAnalyticsInsights ?? true,
    },
    brandSafety: {
      blockedCategories: p.blockedCategories || ['Adult Content', 'Gambling'],
      restrictedKeywords: p.restrictedKeywords || [],
      contentGuidelines: p.contentGuidelines || '',
      screenMinFollowers: p.screenMinFollowers ?? true,
      screenEngagementRate: p.screenEngagementRate ?? false,
      fraudDetection: p.fraudDetection ?? true,
    },
    security: {
      twoFactorEnabled: p.twoFactorEnabled ?? false,
      currentPassword: '',
      newPassword: '',
    },
    analytics: {
      defaultCharts: p.defaultCharts || ['Campaign Performance', 'Spend Over Time', 'Engagement Trends'],
      trackedKpis: p.trackedKpis || ['Reach', 'Engagement Rate', 'ROI'],
      exportFormats: p.exportFormats || ['CSV', 'PDF'],
      customMetricsEnabled: p.customMetricsEnabled ?? false,
    },
    branding: {
      accentColor: p.accentColor || '#6d5cff',
      density: p.density || 'comfortable',
    },
    automation: {
      autoApproveCreators: p.autoApproveCreators ?? false,
      autoSendInvites: p.autoSendInvites ?? false,
      autoReleasePaymentsRule: p.autoReleasePaymentsRule ?? false,
      smartRecommendations: p.smartRecommendations ?? true,
    },
  };
}

export default function BrandSettings() {
  const navigate = useNavigate();
  const toast = useToast();

  const [brand, setBrand] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [formState, setFormState] = useState(null);
  const [members, setMembers] = useState([]);
  const [search, setSearch] = useState('');
  const [activeId, setActiveId] = useState(SECTIONS[0].id);
  const [saveStatus,    setSaveStatus]    = useState('saved'); // 'saved' | 'saving' | 'unsaved'
  const [savingGuidelines, setSavingGuidelines] = useState(false);

  const sectionRefs = useRef({});
  const saveTimerRef = useRef(null);
  const isFirstRun = useRef(true);

  useEffect(() => {
    brandsApi.getProfile().then(({ data }) => {
      const p = data || {};
      setBrand(p);
      setFormState(buildFormState(p));
      setMembers(getTeamMembers(p));
      setIsLoading(false);
    }).catch(() => {
      setBrand({});
      setFormState(buildFormState({}));
      setMembers(getTeamMembers({}));
      setIsLoading(false);
    });
  }, []);

  // Derived intel / mock data
  const intel = useMemo(() => getBrandIntel(brand ?? {}), [brand]);
  const healthScore = useMemo(() => getBrandHealthScore(brand ?? {}, intel), [brand, intel]);
  const profileCompletion = useMemo(() => (formState ? getProfileCompletion(formState.companyProfile) : 0), [formState]);
  const verificationStatus = brand?.isVerified ? 'verified' : 'pending';
  const integrations = useMemo(() => getIntegrations(brand ?? {}), [brand]);
  const apiKeys = useMemo(() => getApiKeys(brand ?? {}), [brand]);
  const webhooks = useMemo(() => getWebhooks(brand ?? {}), [brand]);
const [subscription, setSubscription] = useState(null);
  const [plans, setPlans] = useState([]);
  const [billingBusyTier, setBillingBusyTier] = useState(null);

  const loadBilling = useCallback(() => {
    Promise.all([subscriptionsApi.getMine(), subscriptionsApi.listPlans()])
      .then(([subRes, plansRes]) => {
        setSubscription(subRes.data);
        setPlans(Array.isArray(plansRes.data) ? plansRes.data : []);
      })
      .catch(() => toast.error('Failed to load billing info'));
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  useEffect(() => { loadBilling(); }, [loadBilling]);

  // Returning from a subscription Checkout session
  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const result = params.get('subscription');
    if (!result) return;
    if (result === 'success') toast.success('Subscription updated!');
    if (result === 'cancelled') toast.error('Checkout was cancelled');
    window.history.replaceState({}, '', window.location.pathname);
    loadBilling();
  }, [loadBilling, toast]);

  const handleManageBilling = useCallback(async () => {
    try {
      const { data } = await subscriptionsApi.billingPortal();
      window.location.href = data.url;
    } catch (err) {
      toast.error(err?.message || 'No billing account yet — subscribe to a plan first.');
    }
  }, [toast]);

  const handleChangePlan = useCallback(async (tier) => {
    setBillingBusyTier(tier);
    try {
      const { data } = await subscriptionsApi.checkout(tier);
      if (data.url) { window.location.href = data.url; return; }
      // Already had an active plan — the switch happened immediately, no redirect needed
      toast.success('Plan updated!');
      await loadBilling();
      setBillingBusyTier(null);
    } catch (err) {
      toast.error(err?.message || 'Failed to start checkout');
      setBillingBusyTier(null);
    }
  }, [toast, loadBilling]);

  const paymentMethods = useMemo(() => getPaymentMethods(brand ?? {}), [brand]);
  const financials = useMemo(() => getFinancialSummary(brand ?? {}, intel), [brand, intel]);
  const security = useMemo(() => getSecurityCenter(brand ?? {}), [brand]);
  const workspaceAnalytics = useMemo(() => getWorkspaceAnalytics(brand ?? {}, intel), [brand, intel]);
  const reputationScores = useMemo(() => getReputationScores(intel), [intel]);
  const savedReports = useMemo(() => ([
    { id: 'r1', name: 'Monthly Campaign Summary', frequency: 'Monthly' },
    { id: 'r2', name: 'Creator Performance Report', frequency: 'Weekly' },
  ]), []);

  // Generic field updater + autosave
  const update = useCallback((section, field, value) => {
    setFormState((prev) => ({
      ...prev,
      [section]: { ...prev[section], [field]: value },
    }));
    setSaveStatus('unsaved');
  }, []);

  useEffect(() => {
    if (isFirstRun.current) {
      isFirstRun.current = false;
      return;
    }
    if (saveStatus !== 'unsaved') return;

    if (saveTimerRef.current) clearTimeout(saveTimerRef.current);
    saveTimerRef.current = setTimeout(async () => {
      setSaveStatus('saving');
      try {
        const { companyProfile: cp, publicProfile: pp, businessInfo: bi, preferences: pref, campaignDefaults: cd, brandSafety: bs, notifications: notif, automation: auto } = formState;
        await brandsApi.updateProfile({
          // Company profile
          companyName:   cp.companyName,
          contactName:   cp.companyName,
          industry:      cp.industry,
          website:       cp.website,
          location:      cp.headquarters,
          logoUrl:       cp.logoUrl   || undefined,
          bannerUrl:     cp.bannerUrl || undefined,
          tagline:       cp.tagline,
          description:   cp.description,
          foundedYear:   cp.foundedYear ? Number(cp.foundedYear) : null,
          brandColor:    cp.brandColor,
          instagram:     cp.instagram || null,
          tiktok:        cp.tiktok    || null,
          youtube:       cp.youtube   || null,
          linkedin:      cp.linkedin  || null,
          facebook:      cp.facebook  || null,
          twitter:       cp.twitter   || null,
          // Business info
          legalName:          bi.legalName,
          registrationNumber: bi.registrationNumber,
          taxId:              bi.taxId,
          vatNumber:          bi.vatNumber,
          businessAddress:    bi.businessAddress,
          // Public profile visibility
          publicProfileVisible:   pp.publicProfileVisible,
          displayTeamMembers:     pp.displayTeamMembers,
          displayCampaignResults: pp.displayCampaignResults,
          displayReviews:         pp.displayReviews,
          displayBudgetRanges:    pp.displayBudgetRanges,
          displayContactInfo:     pp.displayContactInfo,
          // Preferences
          preferredCategories: pref.preferredCategories,
          preferredPlatforms:  pref.preferredPlatforms,
          audienceAgeMin:      Number(pref.audienceAgeMin) || 18,
          audienceAgeMax:      Number(pref.audienceAgeMax) || 34,
          audienceGenders:     pref.audienceGenders,
          audienceCountries:   pref.audienceCountries,
          // Campaign defaults
          defaultBudgetMin: Number(cd.defaultBudgetMin) || 0,
          defaultBudgetMax: Number(cd.defaultBudgetMax) || 0,
          // Brand safety
          blockedCategories: bs.blockedCategories,
          contentGuidelines: bs.contentGuidelines,
          fraudDetection:    bs.fraudDetection,
          // Notifications
          notificationCategories: notif.categories,
          notificationChannels:   notif.channels,
          // Automation
          autoApproveCreators: auto.autoApproveCreators,
          autoSendInvites:     auto.autoSendInvites,
        }).catch(() => {});
      } finally {
        setSaveStatus('saved');
      }
    }, 1200);

    return () => clearTimeout(saveTimerRef.current);
  }, [formState, saveStatus]);

  // Scroll-spy
  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        const visible = entries.filter((e) => e.isIntersecting);
        if (visible.length > 0) {
          setActiveId(visible[0].target.id);
        }
      },
      { rootMargin: '-100px 0px -70% 0px', threshold: 0 }
    );
    Object.values(sectionRefs.current).forEach((el) => el && observer.observe(el));
    return () => observer.disconnect();
  }, [formState]);

  const handleNavigate = (id) => {
    const el = document.getElementById(id);
    if (el) el.scrollIntoView({ behavior: 'smooth', block: 'start' });
    setActiveId(id);
  };

  // Team management handlers
  const handleInvite = (email) => {
    setMembers((prev) => [...prev, {
      id: `pending-${Date.now()}`, name: email.split('@')[0], email, role: 'Analyst',
      status: 'pending', lastActive: 'Invited just now', avatarColor: '#3aa0ff',
    }]);
    toast.success(`Invitation sent to ${email}`);
  };
  const handleRoleChange = (id, role) => {
    setMembers((prev) => prev.map((m) => (m.id === id ? { ...m, role } : m)));
  };
  const handleRemoveMember = (id) => {
    setMembers((prev) => prev.filter((m) => m.id !== id));
    toast.info('Team member removed');
  };

  const handleSaveGuidelines = async () => {
    setSavingGuidelines(true);
    try {
      await brandsApi.updateProfile({
        contentGuidelines:  formState.brandSafety.contentGuidelines,
        blockedCategories:  formState.brandSafety.blockedCategories,
        restrictedKeywords: formState.brandSafety.restrictedKeywords ?? [],
        fraudDetection:     formState.brandSafety.fraudDetection,
      });
      toast.success('Content guidelines saved.');
    } catch {
      toast.error('Failed to save guidelines.');
    } finally {
      setSavingGuidelines(false);
    }
  };

  const handleDangerAction = (key) => {
    const messages = {
      export: 'Preparing your data export — we’ll email you a download link.',
      transfer: 'Ownership transfer requires confirmation from the recipient.',
      archive: 'Archiving a workspace is a sensitive action — please contact support to proceed.',
      delete: 'Workspace deletion requires additional confirmation. Please contact support.',
    };
    toast.info(messages[key] ?? 'Action received.');
  };

  if (isLoading || !formState) {
    return (
      <div className="p-6 flex items-center justify-center h-64">
        <div className="w-8 h-8 border-2 border-brand-500 border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  const saveLabel = {
    saved: '✓ All changes saved',
    saving: 'Saving…',
    unsaved: 'Unsaved changes',
  }[saveStatus];

  return (
    <div className="p-6 pb-10 space-y-6 max-w-[1400px] mx-auto">
      <div className="flex items-center justify-between gap-3 flex-wrap">
        <div />
        <span
          className="text-xs font-medium px-3 py-1.5 rounded-full flex items-center gap-1.5"
          style={{
            background: saveStatus === 'unsaved' ? 'rgba(245,166,35,0.12)' : 'rgba(22,179,100,0.12)',
            color: saveStatus === 'unsaved' ? 'var(--warning)' : 'var(--success)',
          }}
        >
          {saveStatus === 'saving' && <span className="w-3 h-3 border-2 border-current border-t-transparent rounded-full animate-spin" />}
          {saveLabel}
        </span>
      </div>

      <SettingsOverview
        brandHealthScore={healthScore.overall}
        profileCompletion={profileCompletion}
        isVerified={brand?.isVerified}
        planName={subscription?.name ?? '—'}
        activeCampaigns={intel.activeCampaigns}
        satisfactionScore={intel.satisfactionScore}
        trustScore={intel.trustScore}
        responseRate={intel.responseRate}
        onViewPortfolio={() => navigate(ROUTES.BRAND_MY_PORTFOLIO)}
        onVerifyBrand={() => handleNavigate('business-info')}
        onUpgradePlan={() => handleNavigate('billing')}
        onInviteTeam={() => handleNavigate('team')}
      />

      <div className="flex gap-6 items-start">
        <SettingsSidebar
          sections={SECTIONS}
          activeId={activeId}
          search={search}
          onSearchChange={setSearch}
          onNavigate={handleNavigate}
        />

        <div className="flex-1 min-w-0 space-y-4">
          <div ref={(el) => { sectionRefs.current['company-profile'] = el; }}>
            <SettingsSectionCard id="company-profile" icon="🏢" title="Company Profile" subtitle="Basic information and brand identity">
              <CompanyProfileSection values={formState.companyProfile} onChange={(f, v) => update('companyProfile', f, v)} />
            </SettingsSectionCard>
          </div>

          <div ref={(el) => { sectionRefs.current['public-profile'] = el; }}>
            <SettingsSectionCard id="public-profile" icon="🌐" title="Public Brand Profile" subtitle="Control what creators can see">
              <PublicProfileSection values={formState.publicProfile} onChange={(f, v) => update('publicProfile', f, v)} brand={{ ...brand, ...formState.companyProfile }} />
            </SettingsSectionCard>
          </div>

          <div ref={(el) => { sectionRefs.current['business-info'] = el; }}>
            <SettingsSectionCard id="business-info" icon="📋" title="Business Information" subtitle="Legal details and verification" defaultOpen={false}>
              <BusinessInfoSection values={formState.businessInfo} onChange={(f, v) => update('businessInfo', f, v)} verificationStatus={verificationStatus} />
            </SettingsSectionCard>
          </div>

          <div ref={(el) => { sectionRefs.current['team'] = el; }}>
            <SettingsSectionCard id="team" icon="👥" title="Team Management" subtitle="Invite teammates and manage roles">
              <TeamManagementSection
                members={members}
                onInvite={handleInvite}
                onRoleChange={handleRoleChange}
                onRemove={handleRemoveMember}
              />
            </SettingsSectionCard>
          </div>

          <div ref={(el) => { sectionRefs.current['preferences'] = el; }}>
            <SettingsSectionCard id="preferences" icon="🎯" title="Brand Preferences" subtitle="Creator categories, platforms, and audience" defaultOpen={false}>
              <BrandPreferencesSection values={formState.preferences} onChange={(f, v) => update('preferences', f, v)} />
            </SettingsSectionCard>
          </div>

          <div ref={(el) => { sectionRefs.current['campaign-defaults'] = el; }}>
            <SettingsSectionCard id="campaign-defaults" icon="📣" title="Campaign Defaults" subtitle="Default settings and templates for new campaigns" defaultOpen={false}>
              <CampaignDefaultsSection values={formState.campaignDefaults} onChange={(f, v) => update('campaignDefaults', f, v)} />
            </SettingsSectionCard>
          </div>

          <div ref={(el) => { sectionRefs.current['payment'] = el; }}>
            <SettingsSectionCard id="payment" icon="💳" title="Payment Settings" subtitle="Financial center, payouts, and escrow">
              <PaymentSection values={formState.payment} onChange={(f, v) => update('payment', f, v)} financials={financials} />
            </SettingsSectionCard>
          </div>

          <div ref={(el) => { sectionRefs.current['notifications'] = el; }}>
            <SettingsSectionCard id="notifications" icon="🔔" title="Notification Center" subtitle="Granular notification preferences" defaultOpen={false}>
              <NotificationsSection values={formState.notifications} onChange={(f, v) => update('notifications', f, v)} />
            </SettingsSectionCard>
          </div>

          <div ref={(el) => { sectionRefs.current['integrations'] = el; }}>
            <SettingsSectionCard id="integrations" icon="🔌" title="Integrations Hub" subtitle="Connected platforms, API keys, and webhooks" defaultOpen={false}>
              <IntegrationsSection
                integrations={integrations}
                onToggle={() => toast.info('Integration management is coming soon.')}
                apiKeys={apiKeys}
                webhooks={webhooks}
                onAddWebhook={() => toast.info('Webhook management is coming soon.')}
              />
            </SettingsSectionCard>
          </div>

          <div ref={(el) => { sectionRefs.current['ai-settings'] = el; }}>
            <SettingsSectionCard id="ai-settings" icon="🤖" title="AI Settings" subtitle="AI Copilot preferences" defaultOpen={false}>
              <AISettingsSection values={formState.ai} onChange={(f, v) => update('ai', f, v)} />
            </SettingsSectionCard>
          </div>

          <div ref={(el) => { sectionRefs.current['brand-safety'] = el; }}>
            <SettingsSectionCard id="brand-safety" icon="🛡️" title="Brand Safety" subtitle="Content guidelines and creator screening" defaultOpen={false}>
              <BrandSafetySection values={formState.brandSafety} onChange={(f, v) => update('brandSafety', f, v)} onSave={handleSaveGuidelines} isSaving={savingGuidelines} />
            </SettingsSectionCard>
          </div>

          <div ref={(el) => { sectionRefs.current['security'] = el; }}>
            <SettingsSectionCard id="security" icon="🔒" title="Privacy & Security" subtitle="Password, 2FA, sessions, and login activity" defaultOpen={false}>
              <SecuritySection values={formState.security} onChange={(f, v) => update('security', f, v)} security={security} />
            </SettingsSectionCard>
          </div>

          <div ref={(el) => { sectionRefs.current['analytics'] = el; }}>
            <SettingsSectionCard id="analytics" icon="📊" title="Analytics Preferences" subtitle="Dashboard configuration and reporting" defaultOpen={false}>
              <AnalyticsSection values={formState.analytics} onChange={(f, v) => update('analytics', f, v)} savedReports={savedReports} />
            </SettingsSectionCard>
          </div>

          <div ref={(el) => { sectionRefs.current['branding'] = el; }}>
            <SettingsSectionCard id="branding" icon="🎨" title="Branding" subtitle="Theme, accent colors, and dashboard appearance" defaultOpen={false}>
              <BrandingSection values={formState.branding} onChange={(f, v) => update('branding', f, v)} />
            </SettingsSectionCard>
          </div>

          <div ref={(el) => { sectionRefs.current['billing'] = el; }}>
            <SettingsSectionCard id="billing" icon="💎" title="Subscription & Billing" subtitle="Plan, usage, and invoices">
              {subscription ? (
                <BillingSection
                  subscription={subscription}
                  plans={plans}
                  onManageBilling={handleManageBilling}
                  onChangePlan={handleChangePlan}
                  busyTier={billingBusyTier}
                />
              ) : (
                <p className="text-fg-muted text-sm">Loading billing info…</p>
              )}
            </SettingsSectionCard>
          </div>

          {/* ── Verification Center — new section, DO NOT remove existing ones ── */}
          <div ref={(el) => { sectionRefs.current['verification'] = el; }}>
            <SettingsSectionCard id="verification" icon="🛡️" title="Verification Center" subtitle="Verify your business, domain, and identity to unlock the Verified brand badge" defaultOpen={false}>
              <VerificationCenter userType="brand" />
            </SettingsSectionCard>
          </div>

          <div ref={(el) => { sectionRefs.current['automation'] = el; }}>
            <SettingsSectionCard id="automation" icon="⚡" title="Automation Rules" subtitle="Automate recurring workspace workflows" defaultOpen={false}>
              <AutomationSection values={formState.automation} onChange={(f, v) => update('automation', f, v)} />
            </SettingsSectionCard>
          </div>

          <div ref={(el) => { sectionRefs.current['danger-zone'] = el; }}>
            <SettingsSectionCard id="danger-zone" icon="⬇" title="Export Data" subtitle="Download your workspace data" defaultOpen={false}>
              <DangerZoneSection onAction={handleDangerAction} />
            </SettingsSectionCard>
          </div>
        </div>
      </div>
    </div>
  );
}
