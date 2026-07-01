import { useState, useEffect, useMemo, useCallback } from 'react';
import { useCopy } from '@/hooks/useCopy';
import { useNavigate, useSearchParams, useLocation } from 'react-router-dom';
import Skeleton from '@/components/common/Skeleton';
import EmptyState from '@/components/common/EmptyState';
import CollapsibleSection from '@/components/common/CollapsibleSection';
import AIInsightsPanel from '@/components/intelligence/AIInsightsPanel';
import AudienceCharts from '@/components/portfolio/AudienceCharts';
import MediaGallery from '@/components/portfolio/MediaGallery';

import HeroSection from '@/components/brandPortfolio/HeroSection';
import CompanyInfoSection from '@/components/brandPortfolio/CompanyInfoSection';
import TrustReputationSection from '@/components/brandPortfolio/TrustReputationSection';
import BrandHealthScoreSection from '@/components/brandPortfolio/BrandHealthScoreSection';
import TeamContactsSection from '@/components/brandPortfolio/TeamContactsSection';
import AchievementsSection from '@/components/brandPortfolio/AchievementsSection';
import PartnershipTimelineSection from '@/components/brandPortfolio/PartnershipTimelineSection';
import BrandGalleryMediaSection from '@/components/brandPortfolio/BrandGalleryMediaSection';
import BrandEcosystemSection from '@/components/brandPortfolio/BrandEcosystemSection';
import CreatorNetworkSection from '@/components/brandPortfolio/CreatorNetworkSection';
import PartnershipHeatmapSection from '@/components/brandPortfolio/PartnershipHeatmapSection';

import BrandPerformanceSection from '@/components/discovery/portfolio/BrandPerformanceSection';
import CampaignROISection from '@/components/discovery/portfolio/CampaignROISection';
import IndustryPositionSection from '@/components/discovery/portfolio/IndustryPositionSection';
import CreatorFitSection from '@/components/discovery/portfolio/CreatorFitSection';
import AudienceHeatmapSection from '@/components/discovery/portfolio/AudienceHeatmapSection';
import CampaignGallerySection from '@/components/discovery/portfolio/CampaignGallerySection';
import TopCreatorsSection from '@/components/discovery/portfolio/TopCreatorsSection';
import SuccessStoriesSection from '@/components/discovery/portfolio/SuccessStoriesSection';
import ReviewsSection from '@/components/discovery/portfolio/ReviewsSection';
import PaymentReliabilitySection from '@/components/discovery/portfolio/PaymentReliabilitySection';

import { searchApi } from '@/api/search.api';
import { brandsApi } from '@/api/brands.api';
import { messagesApi } from '@/api/messages.api';
import { ROUTES } from '@/constants/routes';
import { useToast } from '@/hooks/useToast';
import {
  getBrandIntel, getBrandMeta, getBrandPerformanceSeries, getCreatorFitAnalysis,
  getCampaignGallery, getTopCreatorsWorkedWith, getBrandReviews, getPaymentReliability,
  getBrandAIInsights, getCampaignROIHistory, getIndustryRanking, getCompetitorBrands,
  getAudienceMatchHeatmap, getCreatorSuccessStories,
  getBrandTeamContacts, getBrandAchievements, getPartnershipTimeline, getBrandGalleryMedia,
  getBrandEcosystem, getBrandHealthScore, getCreatorNetwork, getBrandProfileExtras,
  getPartnershipHeatmap,
} from '@/utils/mockBrandIntel';

const WATCHLIST_KEY = 'cc-creator-watchlist';
const FOLLOWING_KEY = 'cc-creator-following';

function readIdSet(key) {
  try {
    return new Set(JSON.parse(localStorage.getItem(key)) ?? []);
  } catch {
    return new Set();
  }
}

const TABS = [
  { key: 'overview',    label: 'Overview',      icon: '🏠' },
  { key: 'performance', label: 'Performance',   icon: '📈' },
  { key: 'campaigns',   label: 'Campaigns',     icon: '🎬' },
  { key: 'creators',    label: 'Creators',      icon: '👥' },
  { key: 'reviews',     label: 'Reviews',       icon: '★'  },
  { key: 'payments',    label: 'Payments',      icon: '🛡️' },
  { key: 'audience',    label: 'Audience',      icon: '🗺️' },
  { key: 'team',        label: 'Team & History',icon: '🤝' },
];

export default function BrandPortfolio() {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const location = useLocation();
  const toast = useToast();
  const { copy: copyToClipboard, copied: linkCopied } = useCopy();
  const brandId = searchParams.get('brandId');
  const isOwnProfile = !brandId;
  const isInBrandModule = location.pathname.startsWith('/brand/');

  const [allBrands, setAllBrands] = useState([]);
  const [ownBrand, setOwnBrand] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('overview');

  const [savedIds, setSavedIds] = useState(() => readIdSet(WATCHLIST_KEY));
  const [followingIds, setFollowingIds] = useState(() => readIdSet(FOLLOWING_KEY));

  useEffect(() => {
    Promise.all([
      searchApi.brands({}).catch(() => ({ data: [] })),
      isOwnProfile ? brandsApi.getProfile().catch(() => ({ data: null })) : Promise.resolve({ data: null }),
    ]).then(([brandsRes, ownRes]) => {
      const list = Array.isArray(brandsRes.data) ? brandsRes.data : (brandsRes.data?.data ?? []);
      setAllBrands(list.map((b) => ({ ...b, intel: getBrandIntel(b) })));
      if (ownRes.data) {
        setOwnBrand({ ...ownRes.data, intel: getBrandIntel(ownRes.data) });
      }
    }).finally(() => setIsLoading(false));
  }, [isOwnProfile]);

  const brand = useMemo(
    () => (isOwnProfile ? ownBrand : allBrands.find((b) => String(b.id) === String(brandId))),
    [isOwnProfile, ownBrand, allBrands, brandId]
  );
  const intel = useMemo(() => brand?.intel ?? getBrandIntel(brand ?? {}), [brand]);

  const meta = useMemo(() => (brand ? getBrandMeta(brand) : null), [brand]);
  const extras = useMemo(() => (brand ? getBrandProfileExtras(brand) : null), [brand]);
  const series = useMemo(() => (brand ? getBrandPerformanceSeries(brand) : []), [brand]);
  const fit = useMemo(() => (brand ? getCreatorFitAnalysis(brand) : []), [brand]);
  const gallery = useMemo(() => (brand ? getCampaignGallery(brand, 6) : []), [brand]);
  const topCreators = useMemo(() => (brand ? getTopCreatorsWorkedWith(brand) : []), [brand]);
  const { reviews, satisfactionTrend } = useMemo(() => (brand ? getBrandReviews(brand) : { reviews: [], satisfactionTrend: [] }), [brand]);
  const payment = useMemo(() => (brand ? getPaymentReliability(brand) : null), [brand]);
  const aiInsights = useMemo(() => (brand ? getBrandAIInsights(brand, intel) : []), [brand, intel]);
  const roiHistory = useMemo(() => (brand ? getCampaignROIHistory(brand) : []), [brand]);
  const ranking = useMemo(() => (brand ? getIndustryRanking(brand, intel) : null), [brand, intel]);
  const competitors = useMemo(() => (brand ? getCompetitorBrands(brand, allBrands) : []), [brand, allBrands]);
  const heatmap = useMemo(() => (brand ? getAudienceMatchHeatmap(brand) : null), [brand]);
  const successStories = useMemo(() => (brand ? getCreatorSuccessStories(brand) : []), [brand]);
  const team = useMemo(() => (brand ? getBrandTeamContacts(brand) : null), [brand]);
  const achievements = useMemo(() => (brand ? getBrandAchievements(brand) : null), [brand]);
  const timeline = useMemo(() => (brand ? getPartnershipTimeline(brand) : []), [brand]);
  const galleryMedia = useMemo(() => (brand ? getBrandGalleryMedia(brand) : []), [brand]);
  const ecosystem = useMemo(() => (brand ? getBrandEcosystem(brand) : null), [brand]);
  const health = useMemo(() => (brand ? getBrandHealthScore(brand, intel) : null), [brand, intel]);
  const creatorNetwork = useMemo(() => (brand ? getCreatorNetwork(brand) : []), [brand]);
  const partnershipHeatmap = useMemo(() => (brand ? getPartnershipHeatmap(brand) : null), [brand]);
  const totalReach = useMemo(() => gallery.reduce((sum, g) => sum + g.reach, 0), [gallery]);


  const toggleSaved = useCallback(() => {
    if (!brand) return;
    setSavedIds((prev) => {
      const next = new Set(prev);
      if (next.has(brand.id)) { next.delete(brand.id); toast.info(`Removed ${brand.companyName} from watchlist`); }
      else { next.add(brand.id); toast.success(`Saved ${brand.companyName} to watchlist`); }
      localStorage.setItem(WATCHLIST_KEY, JSON.stringify([...next]));
      return next;
    });
  }, [brand, toast]);

  const toggleFollowing = useCallback(() => {
    if (!brand) return;
    setFollowingIds((prev) => {
      const next = new Set(prev);
      if (next.has(brand.id)) { next.delete(brand.id); toast.info(`Unfollowed ${brand.companyName}`); }
      else { next.add(brand.id); toast.success(`Following ${brand.companyName} — you'll get alerts on new campaigns`); }
      localStorage.setItem(FOLLOWING_KEY, JSON.stringify([...next]));
      return next;
    });
  }, [brand, toast]);

  const [startingChat, setStartingChat] = useState(false);

  const handleMessage = useCallback(async () => {
    if (!brand) return;
    if (isOwnProfile) { toast.info('This is a preview of your own brand profile.'); return; }

    const uid = brand.userId;
    if (!uid) { toast.error('Cannot start conversation — brand account not found.'); return; }

    setStartingChat(true);
    try {
      const { data } = await messagesApi.createConversation(uid);
      const conv = data?.data ?? data;
      if (conv?.id) {
        navigate(ROUTES.CREATOR_MESSAGES, { state: { openConversationId: conv.id, conversation: conv } });
      } else {
        navigate(`${ROUTES.CREATOR_MESSAGES}?userId=${uid}`);
      }
    } catch (err) {
      toast.error(err?.message || 'Could not start conversation.');
    } finally {
      setStartingChat(false);
    }
  }, [brand, isOwnProfile, navigate, toast]);

  const handleShare = useCallback(() => {
    if (!brand) return;
    const url = `${window.location.origin}${ROUTES.BRAND_PORTFOLIO}?brandId=${brand.id}`;
    copyToClipboard(url);
  }, [brand, copyToClipboard]);

  const handleExport = useCallback((label) => {
    toast.info(`${label} is coming soon.`);
  }, [toast]);

  if (isLoading) {
    return (
      <div className="p-6 space-y-6">
        <Skeleton className="h-48 rounded-2xl" />
        <Skeleton className="h-12 rounded-2xl" />
        <Skeleton className="h-96 rounded-2xl" />
      </div>
    );
  }

  if (!brand) {
    return (
      <div className="p-6">
        {isOwnProfile ? (
          <EmptyState
            icon="🏢"
            title="Set up your brand profile"
            message="Complete your brand profile in Settings to preview your portfolio the way creators see it."
            action={(
              <button
                type="button"
                onClick={() => navigate(ROUTES.BRAND_SETTINGS)}
                className="px-4 py-2 rounded-full text-sm font-medium bg-brand-500 text-white"
              >
                Go to Settings
              </button>
            )}
          />
        ) : (
          <EmptyState
            icon="🏢"
            title="Brand not found"
            message="We couldn't find a brand profile for this link. It may have been removed or the link is incorrect."
            action={(
              <button
                type="button"
                onClick={() => navigate(isInBrandModule ? ROUTES.BRAND_SEARCH : ROUTES.CREATOR_FIND_BRANDS)}
                className="px-4 py-2 rounded-full text-sm font-medium bg-brand-500 text-white"
              >
                Browse Brands
              </button>
            )}
          />
        )}
      </div>
    );
  }

  return (
    <div className="p-6 space-y-6 pb-24">
      <HeroSection
        brand={brand}
        intel={intel}
        meta={meta}
        extras={extras}
        totalReach={totalReach}
        isOwnProfile={isOwnProfile}
        isSaved={savedIds.has(brand.id)}
        onToggleSave={toggleSaved}
        isFollowing={followingIds.has(brand.id)}
        onToggleFollow={toggleFollowing}
        onMessage={handleMessage}
        onShare={handleShare}
        onEditProfile={() => navigate(ROUTES.BRAND_SETTINGS)}
      />

      {/* Sticky tab navigation */}
      <div className="sticky top-0 z-10 -mx-6 px-6 py-2" style={{ background: 'var(--surface)', borderBottom: '1px solid var(--border)' }}>
        <div className="flex items-center gap-2 overflow-x-auto">
          {TABS.map((tab) => (
            <button
              key={tab.key}
              type="button"
              onClick={() => setActiveTab(tab.key)}
              className={`px-3 py-1.5 rounded-full text-sm font-medium whitespace-nowrap transition-colors ${activeTab === tab.key ? 'bg-brand-500 text-white' : ''}`}
              style={activeTab === tab.key ? {} : { background: 'var(--surface-2)', color: 'var(--fg-muted)', border: '1px solid var(--border)' }}
            >
              {tab.icon} {tab.label}
            </button>
          ))}
        </div>
      </div>

      {/* Export & sharing toolbar */}
      <div className="flex flex-wrap gap-2 justify-end">
        <button type="button" onClick={handleShare} className="px-3 py-1.5 rounded-full text-xs font-medium transition-all"
          style={linkCopied
            ? { background: 'rgba(22,179,100,0.15)', color: '#16b364', border: '1px solid rgba(22,179,100,0.3)' }
            : { background: 'var(--surface-2)', color: 'var(--fg-muted)', border: '1px solid var(--border)' }
          }
        >{linkCopied ? '✓ Link Copied!' : '↗ Share Profile'}</button>
        <button type="button" onClick={() => handleExport('Export Portfolio PDF')} className="px-3 py-1.5 rounded-full text-xs font-medium" style={{ background: 'var(--surface-2)', color: 'var(--fg-muted)', border: '1px solid var(--border)' }}>📄 Export Portfolio PDF</button>
        <button type="button" onClick={() => handleExport('Media Kit download')} className="px-3 py-1.5 rounded-full text-xs font-medium" style={{ background: 'var(--surface-2)', color: 'var(--fg-muted)', border: '1px solid var(--border)' }}>🗂 Download Media Kit</button>
        <button type="button" onClick={() => handleExport('Partnership report generation')} className="px-3 py-1.5 rounded-full text-xs font-medium" style={{ background: 'var(--surface-2)', color: 'var(--fg-muted)', border: '1px solid var(--border)' }}>📊 Generate Partnership Report</button>
      </div>

      {activeTab === 'overview' && (
        <div className="space-y-4">
          <CollapsibleSection icon="🏢" title="Company Information" subtitle="Profile, footprint, and verification">
            <CompanyInfoSection brand={brand} meta={meta} extras={extras} />
          </CollapsibleSection>
          <CollapsibleSection icon="🛡️" title="Trust & Reputation Center" subtitle="Trust score, payment reliability, and response metrics">
            <TrustReputationSection brand={brand} intel={intel} payment={payment} />
          </CollapsibleSection>
          <CollapsibleSection icon="❤️" title="Brand Health Score" subtitle="Growth, reputation, satisfaction, and payment trust">
            <BrandHealthScoreSection health={health} />
          </CollapsibleSection>
          <CollapsibleSection icon="🎯" title="Creator Fit Analysis" subtitle="Why this brand matches you">
            <CreatorFitSection fit={fit} />
          </CollapsibleSection>
          <CollapsibleSection icon="🤖" title="AI Insights" subtitle="Personalized recommendations for working with this brand">
            <AIInsightsPanel insights={aiInsights} />
          </CollapsibleSection>
        </div>
      )}

      {activeTab === 'performance' && (
        <div className="space-y-4">
          <CollapsibleSection icon="📈" title="Campaign Performance" subtitle="Campaign volume, hiring, spending, and collaboration trends">
            <BrandPerformanceSection intel={intel} series={series} />
          </CollapsibleSection>
          <CollapsibleSection icon="💹" title="Campaign ROI History" subtitle="Estimated return on investment from past campaigns">
            <CampaignROISection history={roiHistory} />
          </CollapsibleSection>
          <CollapsibleSection icon="🏆" title="Competitive Position" subtitle="Industry ranking and competitor brands" defaultOpen={false}>
            <IndustryPositionSection
              ranking={ranking}
              competitors={competitors}
              onSelectBrand={(b) => navigate(`${isInBrandModule ? ROUTES.BRAND_MY_PORTFOLIO : ROUTES.BRAND_PORTFOLIO}?brandId=${b.id}`)}
            />
          </CollapsibleSection>
        </div>
      )}

      {activeTab === 'campaigns' && (
        <div className="space-y-4">
          <CollapsibleSection icon="🖼" title="Campaign Showcase" subtitle="Past campaign results and performance">
            <CampaignGallerySection gallery={gallery} />
          </CollapsibleSection>
          <CollapsibleSection icon="🏆" title="Brand Achievements" subtitle="Awards, certifications, and recognition" defaultOpen={false}>
            <AchievementsSection achievements={achievements} />
          </CollapsibleSection>
          <CollapsibleSection icon="🎨" title="Brand Gallery" subtitle="Product images, creatives, videos, and marketing assets" defaultOpen={false}>
            <div className="space-y-6">
              {/* Portfolio gallery with upload — only editable when viewing own profile */}
              <MediaGallery
                isManage={isOwnProfile}
                mediaApi={brandsApi}
              />
              {/* Existing curated showcase */}
              {galleryMedia.length > 0 && (
                <div>
                  <p className="text-fg-muted text-[10px] uppercase tracking-widest mb-3">Brand Showcase</p>
                  <BrandGalleryMediaSection gallery={galleryMedia} />
                </div>
              )}
            </div>
          </CollapsibleSection>
        </div>
      )}

      {activeTab === 'creators' && (
        <div className="space-y-4">
          <CollapsibleSection icon="👥" title="Top Creators Worked With" subtitle="Creators this brand collaborates with most">
            <TopCreatorsSection creators={topCreators} />
          </CollapsibleSection>
          <CollapsibleSection icon="🌐" title="Creator Network" subtitle="Browse this brand's wider creator network">
            <CreatorNetworkSection creators={creatorNetwork} />
          </CollapsibleSection>
          <CollapsibleSection icon="🌟" title="Creator Success Stories" subtitle="Outcomes creators have achieved working with this brand" defaultOpen={false}>
            <SuccessStoriesSection stories={successStories} />
          </CollapsibleSection>
        </div>
      )}

      {activeTab === 'reviews' && (
        <div className="space-y-4">
          <CollapsibleSection icon="★" title="Brand Reviews" subtitle="Testimonials and satisfaction trends">
            <ReviewsSection reviews={reviews} satisfactionTrend={satisfactionTrend} />
          </CollapsibleSection>
        </div>
      )}

      {activeTab === 'payments' && (
        <div className="space-y-4">
          <CollapsibleSection icon="🛡️" title="Payment Transparency" subtitle="Trust dashboard for payments and escrow">
            <PaymentReliabilitySection payment={payment} />
          </CollapsibleSection>
        </div>
      )}

      {activeTab === 'audience' && (
        <div className="space-y-4">
          <AudienceCharts seed={`${brand.id}-audience`} />
          <CollapsibleSection icon="🗺️" title="Audience Match Heatmap" subtitle="Audience overlap by age group and platform" defaultOpen={false}>
            <AudienceHeatmapSection heatmap={heatmap} />
          </CollapsibleSection>
          <CollapsibleSection icon="🔥" title="Brand Partnership Heatmap" subtitle="Best-performing niches, regions, and content formats" defaultOpen={false}>
            <PartnershipHeatmapSection heatmap={partnershipHeatmap} />
          </CollapsibleSection>
        </div>
      )}

      {activeTab === 'team' && (
        <div className="space-y-4">
          <CollapsibleSection icon="🤝" title="Team & Contacts" subtitle="Marketing, partnerships, campaigns, and community team">
            <TeamContactsSection team={team} onMessage={() => handleMessage(true)} />
          </CollapsibleSection>
          <CollapsibleSection icon="🕓" title="Partnership History" subtitle="Major campaigns, launches, and milestones" defaultOpen={false}>
            <PartnershipTimelineSection timeline={timeline} />
          </CollapsibleSection>
          <CollapsibleSection icon="🧩" title="Brand Ecosystem" subtitle="Products, sub-brands, and partner brands" defaultOpen={false}>
            <BrandEcosystemSection ecosystem={ecosystem} />
          </CollapsibleSection>
        </div>
      )}
    </div>
  );
}
