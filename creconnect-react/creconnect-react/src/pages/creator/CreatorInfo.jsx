import { useState, useEffect, useRef, useMemo, useCallback } from 'react';
import {
  ResponsiveContainer, BarChart, Bar, XAxis, YAxis, Tooltip, CartesianGrid,
} from 'recharts';
import Button from '@/components/common/Button';
import Skeleton from '@/components/common/Skeleton';
import StatCard from '@/components/common/StatCard';
import CollapsibleSection from '@/components/common/CollapsibleSection';
import ShareProfileModal from '@/components/common/ShareProfileModal';
import IdentityPanel from '@/components/intelligence/IdentityPanel';
import ContactBusinessPanel from '@/components/intelligence/ContactBusinessPanel';
import ScorecardPanel from '@/components/intelligence/ScorecardPanel';
import SpecializationPanel from '@/components/intelligence/SpecializationPanel';
import { CollaborationStats, BrandRelationships } from '@/components/intelligence/CollaborationPanel';
import EarningsPanel from '@/components/intelligence/EarningsPanel';
import WorkHistoryPanel from '@/components/intelligence/WorkHistoryPanel';
import PreferencesPanel from '@/components/intelligence/PreferencesPanel';
import AIInsightsPanel from '@/components/intelligence/AIInsightsPanel';
import BenchmarkPanel from '@/components/intelligence/BenchmarkPanel';
import AudienceCharts from '@/components/portfolio/AudienceCharts';
import PerformanceCharts from '@/components/portfolio/PerformanceCharts';
import PlatformGrid from '@/components/portfolio/PlatformGrid';
import ReviewsPanel from '@/components/portfolio/ReviewsPanel';
import MediaGallery from '@/components/portfolio/MediaGallery';
import VerificationCenter from '@/components/verification/VerificationCenter';
import { creatorsApi } from '@/api/creators.api';
import { uploadApi } from '@/api/upload.api';
import { ROUTES } from '@/constants/routes';
import {
  getScorecard, getAudienceQuality, getBenchmark, getAIInsights,
  getCreatorBadges, getRatingDistribution, getScores,
} from '@/utils/mockAnalytics';

const tooltipStyle = {
  background: 'var(--surface-2)', border: '1px solid var(--border)',
  borderRadius: 8, fontSize: 12, color: 'var(--fg)',
};
const axisTick = { fill: 'var(--fg-muted)', fontSize: 11 };

const EXTRA_DEFAULTS = {
  fullName: '', headline: '', timezone: '', nationality: '', gender: '', availabilityStatus: 'AVAILABLE',
  languages: [], phone: '', portfolioLink: '', mediaKitLink: '',
  linkedin: '', instagram: '', tiktok: '', youtube: '', facebook: '', x: '',
  niches: [], contentFormats: [], contentStyles: [],
  preferredIndustries: [], preferredCampaignTypes: [], budgetMin: '',
  collaborationStyle: '', remoteOnsite: '', travelAvailability: '',
};

const BACKEND_FIELDS = [
  'displayName', 'username', 'bio', 'location', 'websiteUrl',
  'fullName', 'headline', 'timezone', 'nationality', 'gender', 'availabilityStatus',
  'phone', 'portfolioLink', 'mediaKitLink',
  'linkedin', 'instagram', 'tiktok', 'youtube', 'facebook', 'x',
  'niches', 'contentFormats', 'contentStyles', 'preferredIndustries', 'preferredCampaignTypes',
  'budgetMin', 'collaborationStyle', 'remoteOnsite', 'travelAvailability',
];

/* Fields belonging to each editable section */
const SECTION_FIELDS = {
  identity:       ['fullName', 'displayName', 'username', 'headline', 'bio', 'location', 'timezone', 'nationality', 'gender', 'availabilityStatus', 'languages'],
  contact:        ['phone', 'websiteUrl', 'portfolioLink', 'mediaKitLink', 'linkedin', 'instagram', 'tiktok', 'youtube', 'facebook', 'x'],
  specialization: ['niches', 'contentFormats', 'contentStyles'],
  preferences:    ['preferredIndustries', 'preferredCampaignTypes', 'budgetMin', 'collaborationStyle', 'remoteOnsite', 'travelAvailability'],
};

/* ─── Public profile link component ─────────────────────────────────── */
function PublicProfileLink({ profileUrl, displayName, onShareModal }) {
  const [copied,     setCopied]     = useState(false);
  const [linkClicks, setLinkClicks] = useState(() => {
    try { return Number(localStorage.getItem('cc-profile-link-clicks') ?? 0); } catch { return 0; }
  });

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(profileUrl);
      setCopied(true);
      setTimeout(() => setCopied(false), 2500);
    } catch { /* noop */ }
  };

  const prettyUrl = profileUrl
    ? profileUrl.replace(/^https?:\/\/[^/]+/, 'creconnect.com')
    : `creconnect.com/creator/${displayName?.toLowerCase().replace(/\s+/g, '-') || 'your-profile'}`;

  return (
    <div className="rounded-2xl p-5 space-y-4" style={{ background: 'var(--surface-2)', border: '1px solid var(--border)' }}>
      <div className="flex items-center justify-between">
        <h3 className="font-semibold text-fg text-sm" style={{ fontFamily: 'Sora, sans-serif' }}>
          Public Profile Link
        </h3>
        <span className="text-xs text-fg-muted flex items-center gap-1.5">
          🔗 <span className="font-bold text-fg">{linkClicks}</span> shares
        </span>
      </div>

      <div className="flex items-center gap-2 p-3 rounded-xl" style={{ background: 'var(--surface)', border: '1px solid var(--border)' }}>
        <span className="flex-1 text-fg text-sm font-medium truncate" title={profileUrl}>{prettyUrl}</span>
        <button
          onClick={handleCopy}
          className="flex-shrink-0 text-xs px-3 py-1.5 rounded-lg font-medium transition-colors"
          style={copied
            ? { background: 'rgba(22,179,100,0.15)', color: '#16b364', border: '1px solid rgba(22,179,100,0.3)' }
            : { background: 'var(--surface-2)', color: 'var(--fg-muted)', border: '1px solid var(--border)' }
          }
        >
          {copied ? '✓ Copied!' : '⎘ Copy Link'}
        </button>
      </div>

      <div className="flex flex-wrap gap-2">
        <button
          onClick={() => window.open(profileUrl, '_blank', 'noopener,noreferrer')}
          className="px-4 py-2 rounded-xl text-xs font-medium transition-colors flex items-center gap-1.5"
          style={{ background: 'var(--surface)', color: 'var(--fg-muted)', border: '1px solid var(--border)' }}
        >
          ↗ Open Profile
        </button>
        <button
          onClick={onShareModal}
          className="px-4 py-2 rounded-xl text-xs font-medium transition-colors flex items-center gap-1.5 text-white"
          style={{ background: 'var(--brand-500)' }}
        >
          ◎ Share Profile
        </button>
        <button
          onClick={() => {
            const next = linkClicks + 1;
            setLinkClicks(next);
            try { localStorage.setItem('cc-profile-link-clicks', String(next)); } catch { /* noop */ }
          }}
          className="px-4 py-2 rounded-xl text-xs font-medium transition-colors flex items-center gap-1.5"
          style={{ background: 'var(--surface)', color: 'var(--fg-muted)', border: '1px solid var(--border)' }}
        >
          📊 Track Clicks
        </button>
      </div>
    </div>
  );
}

/* ─── Main page ──────────────────────────────────────────────────────── */

export default function CreatorInfo() {
  const [profile,        setProfile]        = useState(null);
  const [collaborations, setCollaborations] = useState([]);
  const [stats,          setStats]          = useState(null);
  const [isLoading,      setIsLoading]      = useState(true);
  const [connectedPlatforms, setConnectedPlatforms] = useState([]);

  const [values,      setValues]      = useState({ displayName: '', username: '', bio: '', location: '', websiteUrl: '', ...EXTRA_DEFAULTS });
  const [avatarUrl,   setAvatarUrl]   = useState(null);
  const [isUploading, setIsUploading] = useState(false);
  const [uploadError, setUploadError] = useState(null);
  const [isSaving,    setIsSaving]    = useState(false);
  const [saved,       setSaved]       = useState(false);
  const [error,       setError]       = useState(null);
  const fileInputRef = useRef(null);

  /* Share modal */
  const [shareOpen, setShareOpen] = useState(false);

  /* Per-section edit state */
  const [sectionStatus,   setSectionStatus]   = useState({}); // { identity: 'idle'|'editing'|'saving' }
  const [sectionSnapshot, setSectionSnapshot] = useState({});

  useEffect(() => {
    Promise.all([
      creatorsApi.getProfile(),
      creatorsApi.getCollaborations({ limit: 50 }),
      creatorsApi.getStats().catch(() => ({ data: null })),
    ]).then(([profileRes, collabRes, statsRes]) => {
      const p = profileRes.data || {};
      setProfile(p);
      setCollaborations(collabRes.data?.data ?? []);
      setStats(statsRes.data);
      setConnectedPlatforms(p.platforms ?? []);
      if (p.avatarUrl) setAvatarUrl(p.avatarUrl);
      setValues({
        displayName: p.displayName || '',
        username:    p.username    || '',
        bio:         p.bio         || '',
        location:    p.location    || '',
        websiteUrl:  p.websiteUrl  || '',
        fullName:           p.fullName           || '',
        headline:           p.headline           || '',
        timezone:           p.timezone           || '',
        nationality:        p.nationality        || '',
        gender:             p.gender             || '',
        availabilityStatus: p.availabilityStatus || 'AVAILABLE',
        phone:              p.phone              || '',
        portfolioLink:      p.portfolioLink      || '',
        mediaKitLink:       p.mediaKitLink       || '',
        linkedin:           p.linkedin           || '',
        instagram:          p.instagram          || '',
        tiktok:             p.tiktok             || '',
        youtube:            p.youtube            || '',
        facebook:           p.facebook           || '',
        x:                  p.x                  || '',
        niches:                 p.niches                 || [],
        contentFormats:         p.contentFormats         || [],
        contentStyles:          p.contentStyles          || [],
        preferredIndustries:    p.preferredIndustries    || [],
        preferredCampaignTypes: p.preferredCampaignTypes || [],
        budgetMin:          p.budgetMin != null ? String(p.budgetMin) : '',
        collaborationStyle: p.collaborationStyle || '',
        remoteOnsite:       p.remoteOnsite       || '',
        travelAvailability: p.travelAvailability || '',
        languages:          p.languages          || [],
      });
    }).catch((err) => setError(err?.response?.data?.message || err?.message || 'Could not load profile'))
      .finally(() => setIsLoading(false));
  }, []);

  const handleChange = useCallback((field, value) => setValues((v) => ({ ...v, [field]: value })), []);

  const handlePlatformConnect = useCallback(async (data) => {
    // postMessage sends { platform, handle, followerCount }; API expects { name, handle, ... }
    const payload = { name: data.name ?? data.platform, handle: data.handle, followerCount: data.followerCount ?? 0, isConnected: true };
    try {
      const res = await creatorsApi.addPlatform(payload);
      const saved = res.data?.data ?? res.data ?? payload;
      setConnectedPlatforms((prev) => {
        const without = prev.filter((p) => p.name !== payload.name);
        return [...without, { ...payload, ...saved }];
      });
      // Mirror the handle into the text field for the matching platform
      const fieldMap = { INSTAGRAM: 'instagram', TIKTOK: 'tiktok', YOUTUBE: 'youtube', LINKEDIN: 'linkedin', FACEBOOK: 'facebook', TWITTER: 'x' };
      const field = fieldMap[payload.name];
      if (field) setValues((v) => ({ ...v, [field]: payload.handle }));
    } catch (err) {
      setError(err?.response?.data?.message || err?.message || 'Could not connect platform');
    }
  }, []);

  const handlePlatformDisconnect = useCallback(async (platformId) => {
    try {
      await creatorsApi.removePlatform(platformId);
      setConnectedPlatforms((prev) => prev.filter((p) => p.id !== platformId));
    } catch (err) {
      setError(err?.response?.data?.message || err?.message || 'Could not disconnect platform');
    }
  }, []);

  const handlePhotoChange = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    if (file.size > 2 * 1024 * 1024) { setUploadError('File must be under 2MB'); return; }
    setIsUploading(true);
    setUploadError(null);
    try {
      const { data } = await uploadApi.avatar(file);
      setAvatarUrl(data.url ?? data.avatarUrl ?? data);
    } catch (err) {
      setUploadError(err?.message || 'Upload failed');
    } finally {
      setIsUploading(false);
    }
  };

  /* Global save */
  const handleSave = async () => {
    setIsSaving(true);
    setError(null);
    try {
      const payload = {};
      BACKEND_FIELDS.forEach((f) => { payload[f] = values[f]; });
      if (payload.budgetMin !== '') payload.budgetMin = Number(payload.budgetMin) || 0;
      const { data: updated } = await creatorsApi.updateProfile(payload);
      // Sync avatar URL from the server response to keep UI consistent
      if (updated?.avatarUrl) setAvatarUrl(updated.avatarUrl);
      setSaved(true);
      setTimeout(() => setSaved(false), 3000);
    } catch (err) {
      setError(err?.response?.data?.message || err?.message || 'Failed to save changes');
    }
    setIsSaving(false);
  };

  /* Per-section edit controls */
  const startEdit = useCallback((key) => {
    setSectionSnapshot((s) => ({ ...s, [key]: { ...values } }));
    setSectionStatus((s) => ({ ...s, [key]: 'editing' }));
  }, [values]);

  const cancelEdit = useCallback((key) => {
    const snap = sectionSnapshot[key];
    if (snap) {
      const fields = SECTION_FIELDS[key] ?? [];
      fields.forEach((f) => handleChange(f, snap[f]));
    }
    setSectionStatus((s) => ({ ...s, [key]: 'idle' }));
  }, [sectionSnapshot, handleChange]);

  const saveSection = useCallback(async (key) => {
    setSectionStatus((s) => ({ ...s, [key]: 'saving' }));
    try {
      const fields  = SECTION_FIELDS[key] ?? [];
      const payload = {};
      fields.forEach((f) => {
        if (f === 'budgetMin') {
          if (values[f] !== '') payload[f] = Number(values[f]) || 0;
        } else {
          payload[f] = values[f];
        }
      });
      const { data: updated } = await creatorsApi.updateProfile(payload);
      if (updated?.avatarUrl) setAvatarUrl(updated.avatarUrl);
      setSectionStatus((s) => ({ ...s, [key]: 'idle' }));
    } catch (err) {
      setError(err?.response?.data?.message || err?.message || 'Save failed');
      setSectionStatus((s) => ({ ...s, [key]: 'editing' }));
    }
  }, [values]);

  const getSectionStatus = useCallback((key) => sectionStatus[key] ?? 'idle', [sectionStatus]);

  const sectionActions = useCallback((key) => {
    const status = getSectionStatus(key);
    if (status === 'idle') {
      return (
        <button
          onClick={(e) => { e.stopPropagation(); startEdit(key); }}
          className="text-xs px-2.5 py-1 rounded-lg font-medium transition-colors hover:text-fg"
          style={{ background: 'var(--surface-2)', color: 'var(--fg-muted)', border: '1px solid var(--border)' }}
        >
          ✏ Edit
        </button>
      );
    }
    return (
      <div className="flex items-center gap-1.5">
        <button
          onClick={(e) => { e.stopPropagation(); cancelEdit(key); }}
          className="text-xs px-2.5 py-1 rounded-lg font-medium transition-colors hover:text-danger"
          style={{ background: 'var(--surface-2)', color: 'var(--fg-muted)', border: '1px solid var(--border)' }}
        >
          Cancel
        </button>
        <button
          onClick={(e) => { e.stopPropagation(); saveSection(key); }}
          disabled={status === 'saving'}
          className="text-xs px-3 py-1 rounded-lg font-semibold text-white disabled:opacity-60 transition-opacity"
          style={{ background: 'var(--brand-500)' }}
        >
          {status === 'saving' ? 'Saving…' : '✓ Save'}
        </button>
      </div>
    );
  }, [getSectionStatus, startEdit, cancelEdit, saveSection]);

  /* Derived analytics */
  const seed = profile?.username ?? profile?.id ?? 'creator';
  const metrics  = useMemo(() => profile?.metrics ?? {}, [profile]);
  const platforms = connectedPlatforms;

  const scorecard        = useMemo(() => getScorecard(seed),        [seed]);
  const audienceQuality  = useMemo(() => getAudienceQuality(seed),  [seed]);
  const benchmark        = useMemo(() => getBenchmark(seed),        [seed]);
  const ratingDistribution = useMemo(() => getRatingDistribution(seed), [seed]);
  const aiInsights       = useMemo(() => getAIInsights(profile, stats ?? {}, platforms), [profile, stats, platforms]);
  const badges           = useMemo(() => getCreatorBadges({ profile: profile ?? {}, stats: stats ?? {}, scorecard }), [profile, stats, scorecard]);

  const totalFollowers = useMemo(
    () => platforms.reduce((sum, p) => sum + (p.followerCount ?? 0), 0) || metrics.totalFollowers || 0,
    [platforms, metrics],
  );

  const businessMetrics = useMemo(() => {
    const baseScores   = getScores(seed);
    const totalCollabs = metrics.totalCollaborations ?? collaborations.length;
    const completed    = metrics.completedCollabs    ?? collaborations.filter((c) => c.status === 'COMPLETED').length;
    return {
      responseRate:    baseScores.responseRate,
      avgResponseTime: metrics.avgResponseTime ? `${metrics.avgResponseTime}h` : baseScores.avgResponseTime,
      acceptanceRate:  Math.round(70 + (baseScores.responseRate % 25)),
      completionRate:  totalCollabs > 0
        ? Math.round((completed / totalCollabs) * 100)
        : Math.round(70 + (baseScores.campaignSuccessRate % 25)),
    };
  }, [seed, metrics, collaborations]);

  const profileUrl = profile?.username
    ? `${window.location.origin}${ROUTES.CREATOR_PROFILE}?username=${profile.username}`
    : '';

  const dateJoined = profile?.createdAt
    ? new Date(profile.createdAt).toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' })
    : '—';

  if (isLoading) {
    return (
      <div className="p-6 space-y-4">
        <Skeleton className="h-10 w-64 rounded-xl" />
        {Array.from({ length: 4 }).map((_, i) => <Skeleton key={i} className="h-40 rounded-2xl" />)}
      </div>
    );
  }

  const identityReadOnly = getSectionStatus('identity') === 'idle';
  const contactReadOnly  = getSectionStatus('contact')  === 'idle';
  const specReadOnly     = getSectionStatus('specialization') === 'idle';
  const prefReadOnly     = getSectionStatus('preferences')    === 'idle';

  return (
    <div className="p-6 space-y-6 pb-28">
      <header className="flex items-center justify-between gap-4 flex-wrap">
        <div>
          <h1 className="text-2xl font-bold text-fg" style={{ fontFamily: 'Sora, sans-serif' }}>
            Creator Intelligence Center
          </h1>
          <p className="text-fg-muted text-sm mt-0.5">
            Your complete profile, performance, and brand-relationship intelligence — in one place.
          </p>
        </div>
      </header>

      {error && (
        <div className="px-4 py-3 rounded-xl text-sm text-danger" style={{ background: 'rgba(240,68,95,0.08)', border: '1px solid rgba(240,68,95,0.2)' }}>
          ⚠ {error}
        </div>
      )}

      {/* ── Identity & Personal Information ── */}
      <CollapsibleSection
        icon="🪪" title="Identity & Personal Information"
        subtitle="Who you are, how you're addressed, and how brands recognize you"
        actions={sectionActions('identity')}
      >
        <IdentityPanel
          values={values}
          onChange={handleChange}
          badges={badges}
          profileUrl={profileUrl}
          dateJoined={dateJoined}
          avatarUrl={avatarUrl}
          isUploading={isUploading}
          uploadError={uploadError}
          onPhotoChange={handlePhotoChange}
          fileInputRef={fileInputRef}
          readOnly={identityReadOnly}
        />
      </CollapsibleSection>

      {/* ── Contact & Business ── */}
      <CollapsibleSection
        icon="✉️" title="Contact & Business"
        subtitle="How brands reach you, and how reliably you respond"
        actions={sectionActions('contact')}
      >
        <ContactBusinessPanel
          values={values}
          onChange={handleChange}
          email={profile?.user?.email}
          businessMetrics={businessMetrics}
          readOnly={contactReadOnly}
          platforms={connectedPlatforms}
          onConnect={handlePlatformConnect}
          onDisconnect={handlePlatformDisconnect}
        />
      </CollapsibleSection>

      {/* ── Creator Scorecard (read-only) ── */}
      <CollapsibleSection icon="🛡️" title="Creator Scorecard" subtitle="A premium, multi-dimensional trust & performance scorecard">
        <ScorecardPanel scorecard={scorecard} />
      </CollapsibleSection>

      {/* ── Content Specialization ── */}
      <CollapsibleSection
        icon="🎯" title="Content Specialization"
        subtitle="Your niches, formats, and creative style"
        actions={sectionActions('specialization')}
      >
        <SpecializationPanel values={values} onChange={handleChange} readOnly={specReadOnly} />
      </CollapsibleSection>

      {/* ── Audience Intelligence ── */}
      <CollapsibleSection icon="👥" title="Audience Intelligence" subtitle="Who your audience is and how genuine it is">
        <div className="space-y-4">
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
            <StatCard value={totalFollowers.toLocaleString()} label="Audience Size"      icon="◎" />
            <StatCard value={`${audienceQuality.realFollowers}%`}    label="Real Followers"    icon="✓" />
            <StatCard value={`${audienceQuality.activeFollowers}%`}  label="Active Followers"  icon="⚡" />
            <StatCard value={`${audienceQuality.returningViewers}%`} label="Returning Viewers" icon="↻" />
          </div>
          <AudienceCharts seed={seed} />
        </div>
      </CollapsibleSection>

      {/* ── Performance Insights ── */}
      <CollapsibleSection icon="📈" title="Performance Insights" subtitle="Reach, engagement, growth, and content performance trends">
        <PerformanceCharts seed={seed} baseFollowers={totalFollowers || 10000} />
      </CollapsibleSection>

      {/* ── Platform Breakdown ── */}
      <CollapsibleSection icon="🔗" title="Platform Breakdown" subtitle="Per-platform stats, growth, and platform-level scores">
        {platforms.length ? (
          <PlatformGrid platforms={platforms} seed={seed} />
        ) : (
          <div className="text-center py-8">
            <p className="text-3xl mb-2 opacity-40">🔗</p>
            <p className="text-fg-muted text-sm">Connect your social platforms to see per-platform breakdowns here.</p>
          </div>
        )}
      </CollapsibleSection>

      {/* ── Collaboration Intelligence ── */}
      <CollapsibleSection icon="🤝" title="Collaboration Intelligence" subtitle="Your track record working with brands">
        <CollaborationStats collaborations={collaborations} metrics={metrics} seed={seed} />
      </CollapsibleSection>

      {/* ── Brand Relationships ── */}
      <CollapsibleSection icon="🏢" title="Brand Relationships" subtitle="Brands you've worked with, and how those relationships look">
        <BrandRelationships collaborations={collaborations} seed={seed} />
      </CollapsibleSection>

      {/* ── Earnings Center ── */}
      <CollapsibleSection icon="💰" title="Earnings Center" subtitle="Your revenue, payments, and growth over time">
        <EarningsPanel seed={seed} totalEarnings={metrics.totalEarnings ?? 0} collaborations={collaborations} />
      </CollapsibleSection>

      {/* ── Work History ── */}
      <CollapsibleSection icon="🗂" title="Work History" subtitle="A timeline of campaigns, collaborations, and achievements">
        <WorkHistoryPanel profile={profile} metrics={metrics} collaborations={collaborations} scorecard={scorecard} />
      </CollapsibleSection>

      {/* ── Social Proof ── */}
      <CollapsibleSection icon="★" title="Social Proof" subtitle="Testimonials, reviews, and rating analytics">
        <div className="space-y-4">
          <div className="rounded-xl p-4" style={{ background: 'var(--surface-2)', border: '1px solid var(--border)' }}>
            <h3 className="text-fg text-sm font-semibold mb-3" style={{ fontFamily: 'Sora, sans-serif' }}>Rating Distribution</h3>
            <ResponsiveContainer width="100%" height={140}>
              <BarChart data={ratingDistribution} layout="vertical" margin={{ left: 8 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" horizontal={false} />
                <XAxis type="number" tick={axisTick} axisLine={false} tickLine={false} unit="%" />
                <YAxis type="category" dataKey="label" tick={axisTick} axisLine={false} tickLine={false} width={32} />
                <Tooltip contentStyle={tooltipStyle} formatter={(v) => `${v}%`} />
                <Bar dataKey="value" fill="#f5a623" radius={[0, 6, 6, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
          <ReviewsPanel reviews={profile?.reviews ?? []} seed={seed} />
        </div>
      </CollapsibleSection>

      {/* ── Creator Preferences ── */}
      <CollapsibleSection
        icon="⚙️" title="Creator Preferences"
        subtitle="Tell brands what kind of work you're looking for"
        actions={sectionActions('preferences')}
      >
        <PreferencesPanel values={values} onChange={handleChange} readOnly={prefReadOnly} />
      </CollapsibleSection>

      {/* ── AI Insights ── */}
      <CollapsibleSection icon="🤖" title="AI Insights" subtitle="Personalized, data-driven recommendations">
        <AIInsightsPanel insights={aiInsights} />
      </CollapsibleSection>

      {/* ── Competitive Benchmarking ── */}
      <CollapsibleSection icon="📊" title="Competitive Benchmarking" subtitle="How you compare to creators in your niche">
        <BenchmarkPanel benchmark={benchmark} />
      </CollapsibleSection>

      {/* ── Portfolio Media Gallery ── */}
      <CollapsibleSection
        icon="🎬"
        title="Portfolio Media Gallery"
        subtitle="Upload and manage your best content — photos, videos, reels, and brand collaborations"
        defaultOpen={false}
      >
        <MediaGallery isManage />
      </CollapsibleSection>

      {/* ── Verification Center ── */}
      <CollapsibleSection
        icon="🛡️"
        title="Verification Center"
        subtitle="Verify your identity and platforms to earn the Verified badge and increase brand trust"
        defaultOpen={false}
      >
        <VerificationCenter userType="creator" />
      </CollapsibleSection>

      {/* ── Export & Sharing ── */}
      <CollapsibleSection icon="📤" title="Export & Sharing" subtitle="Share your profile or export materials for brand pitches">
        <div className="space-y-4">
          {/* Public profile link component */}
          <PublicProfileLink
            profileUrl={profileUrl}
            displayName={profile?.displayName || profile?.username}
            onShareModal={() => setShareOpen(true)}
          />

          {/* Export actions */}
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-3">
            <Button variant="secondary" size="md" onClick={() => window.print()} className="w-full">
              ⬇ Download Media Kit
            </Button>
            <Button variant="secondary" size="md" onClick={() => window.print()} className="w-full">
              ⬇ Download Profile PDF
            </Button>
            <Button
              variant="primary" size="md"
              onClick={() => window.print()}
              className="w-full"
            >
              ⚡ Generate Brand Pitch Deck
            </Button>
          </div>
        </div>
      </CollapsibleSection>

      {/* ── Sticky global save bar ── */}
      <div
        className="fixed bottom-0 left-0 right-0 lg:left-[220px] z-30 px-6 py-4 flex items-center justify-end gap-3"
        style={{ background: 'var(--surface)', borderTop: '1px solid var(--border)' }}
      >
        {saved && <span className="text-success text-sm">✓ Saved successfully</span>}
        <Button variant="primary" size="md" isLoading={isSaving} onClick={handleSave}>
          Save All Changes
        </Button>
      </div>

      {/* Share modal */}
      <ShareProfileModal
        isOpen={shareOpen}
        onClose={() => setShareOpen(false)}
        profileUrl={profileUrl}
        displayName={profile?.displayName || profile?.username}
      />
    </div>
  );
}
