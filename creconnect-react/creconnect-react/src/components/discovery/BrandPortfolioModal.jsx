import { useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import PropTypes from 'prop-types';
import Modal from '@/components/common/Modal';
import Avatar from '@/components/common/Avatar';
import Badge from '@/components/common/Badge';
import Button from '@/components/common/Button';
import ScoreRing from '@/components/common/ScoreRing';
import CollapsibleSection from '@/components/common/CollapsibleSection';
import AIInsightsPanel from '@/components/intelligence/AIInsightsPanel';
import BrandPerformanceSection from '@/components/discovery/portfolio/BrandPerformanceSection';
import ActiveOpportunitiesSection from '@/components/discovery/portfolio/ActiveOpportunitiesSection';
import CreatorFitSection from '@/components/discovery/portfolio/CreatorFitSection';
import CampaignGallerySection from '@/components/discovery/portfolio/CampaignGallerySection';
import TopCreatorsSection from '@/components/discovery/portfolio/TopCreatorsSection';
import ReviewsSection from '@/components/discovery/portfolio/ReviewsSection';
import PaymentReliabilitySection from '@/components/discovery/portfolio/PaymentReliabilitySection';
import CampaignROISection from '@/components/discovery/portfolio/CampaignROISection';
import IndustryPositionSection from '@/components/discovery/portfolio/IndustryPositionSection';
import AudienceHeatmapSection from '@/components/discovery/portfolio/AudienceHeatmapSection';
import SuccessStoriesSection from '@/components/discovery/portfolio/SuccessStoriesSection';
import OpportunitiesFeedSection from '@/components/discovery/portfolio/OpportunitiesFeedSection';
import {
  getBrandMeta, getBrandPerformanceSeries, getOpenCampaigns, getCreatorFitAnalysis,
  getCampaignGallery, getTopCreatorsWorkedWith, getBrandReviews,
  getPaymentReliability, getBrandAIInsights, getCampaignROIHistory,
  getIndustryRanking, getCompetitorBrands, getAudienceMatchHeatmap,
  getCreatorSuccessStories, getOpenOpportunitiesFeed,
} from '@/utils/mockBrandIntel';
import { ROUTES } from '@/constants/routes';

export default function BrandPortfolioModal({
  brand, isOpen, onClose,
  isSaved, onToggleSave, isFollowing, onToggleFollow,
  isComparing, onToggleCompare,
  onApply, isApplying, applyState,
  onMessage, onShare, onAIPitch,
  allBrands, onSelectBrand,
}) {
  const navigate = useNavigate();
  const intel = useMemo(() => brand?.intel ?? {}, [brand]);
  const meta = useMemo(() => (brand ? getBrandMeta(brand) : null), [brand]);
  const series = useMemo(() => (brand ? getBrandPerformanceSeries(brand) : []), [brand]);
  const openCampaigns = useMemo(() => (brand ? getOpenCampaigns(brand) : []), [brand]);
  const fit = useMemo(() => (brand ? getCreatorFitAnalysis(brand) : []), [brand]);
  const gallery = useMemo(() => (brand ? getCampaignGallery(brand) : []), [brand]);
  const topCreators = useMemo(() => (brand ? getTopCreatorsWorkedWith(brand) : []), [brand]);
  const { reviews, satisfactionTrend } = useMemo(() => (brand ? getBrandReviews(brand) : { reviews: [], satisfactionTrend: [] }), [brand]);
  const payment = useMemo(() => (brand ? getPaymentReliability(brand) : null), [brand]);
  const aiInsights = useMemo(() => (brand ? getBrandAIInsights(brand, brand.intel ?? {}) : []), [brand]);
  const roiHistory = useMemo(() => (brand ? getCampaignROIHistory(brand) : []), [brand]);
  const ranking = useMemo(() => (brand ? getIndustryRanking(brand, intel) : null), [brand, intel]);
  const competitors = useMemo(() => (brand ? getCompetitorBrands(brand, allBrands) : []), [brand, allBrands]);
  const heatmap = useMemo(() => (brand ? getAudienceMatchHeatmap(brand) : null), [brand]);
  const successStories = useMemo(() => (brand ? getCreatorSuccessStories(brand) : []), [brand]);
  const opportunitiesFeed = useMemo(() => (brand ? getOpenOpportunitiesFeed(brand, openCampaigns) : []), [brand, openCampaigns]);

  if (!brand || !meta) return null;

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      size="full"
      title="Brand Portfolio"
      footer={
        <div className="flex flex-wrap items-center gap-2">
          <Button variant="primary" size="sm" isLoading={isApplying} disabled={applyState === 'done'} onClick={() => onApply(brand)}>
            {applyState === 'done' ? '✓ Applied' : 'Apply Now'}
          </Button>
          <Button variant={isSaved ? 'secondary' : 'outline'} size="sm" onClick={() => onToggleSave(brand)}>
            {isSaved ? '★ Saved' : '☆ Save Brand'}
          </Button>
          <Button variant={isFollowing ? 'secondary' : 'outline'} size="sm" onClick={() => onToggleFollow(brand)}>
            {isFollowing ? '✓ Following' : '+ Follow Brand'}
          </Button>
          <Button variant={isComparing ? 'secondary' : 'outline'} size="sm" onClick={() => onToggleCompare(brand)}>
            {isComparing ? '✓ Comparing' : '⇄ Compare Brand'}
          </Button>
          {onAIPitch && (
            <Button variant="outline" size="sm" onClick={() => onAIPitch(brand)}>✨ AI Pitch</Button>
          )}
          <Button variant="ghost" size="sm" onClick={() => onMessage(brand)}>💬 Message Brand</Button>
          <Button variant="ghost" size="sm" onClick={() => onShare(brand)}>↗ Share Opportunity</Button>
          <Button variant="ghost" size="sm" onClick={() => { onClose(); navigate(`${ROUTES.BRAND_PORTFOLIO}?brandId=${brand.id}`); }}>
            📋 View Full Portfolio
          </Button>
        </div>
      }
    >
      <div className="space-y-4 pb-2">
        {/* Overview */}
        <div className="rounded-2xl overflow-hidden" style={{ border: '1px solid var(--border)' }}>
          <div className="h-24" style={{ background: 'linear-gradient(135deg, #857fff 0%, #4c2dd1 100%)' }} />
          <div className="p-5 -mt-10 flex flex-col sm:flex-row sm:items-end gap-4">
            <div className="rounded-full border-4" style={{ borderColor: 'var(--surface)' }}>
              <Avatar src={brand.logoUrl} initials={brand.companyName?.slice(0, 2)?.toUpperCase()} size="2xl" />
            </div>
            <div className="min-w-0 flex-1">
              <div className="flex items-center gap-2 flex-wrap">
                <h2 className="text-xl font-bold text-fg" style={{ fontFamily: 'Sora, sans-serif' }}>{brand.companyName}</h2>
                {brand.isVerified && <Badge variant="success" label="Verified" dot />}
              </div>
              <p className="text-fg-muted text-sm mt-0.5">{brand.industry || 'General'} · {meta.headquarters}</p>
            </div>
            <div className="flex flex-col items-center flex-shrink-0">
              <ScoreRing value={intel.matchScore ?? 0} size={56} strokeWidth={5} />
              <p className="text-fg-muted text-[10px] mt-1">Match Score</p>
            </div>
          </div>
          <div className="px-5 pb-5 space-y-3">
            {brand.description && <p className="text-fg-muted text-sm leading-relaxed">{brand.description}</p>}
            <div className="flex flex-wrap gap-x-6 gap-y-2 text-sm">
              {brand.website && (
                <a href={brand.website} target="_blank" rel="noreferrer" className="text-brand-400 hover:underline">🔗 {brand.website}</a>
              )}
              <span className="text-fg-muted">🏢 HQ: {meta.headquarters}</span>
              <span className="text-fg-muted">👥 {meta.companySize}</span>
              <span className="text-fg-muted">📅 Founded {meta.foundedYear}</span>
            </div>
            {meta.verificationBadges.length > 0 && (
              <div className="flex flex-wrap gap-1.5">
                {meta.verificationBadges.map((b) => (
                  <Badge key={b.key} variant="brand" label={`${b.icon} ${b.label}`} />
                ))}
              </div>
            )}
            {intel.badges?.length > 0 && (
              <div className="flex flex-wrap gap-1.5">
                {intel.badges.map((b) => (
                  <Badge key={b.key} variant={b.variant} label={`${b.icon} ${b.label}`} />
                ))}
              </div>
            )}
          </div>
        </div>

        <CollapsibleSection icon="📈" title="Brand Performance" subtitle="Campaign volume, hiring, spending, and collaboration trends">
          <BrandPerformanceSection intel={intel} series={series} />
        </CollapsibleSection>

        <CollapsibleSection icon="💹" title="Campaign ROI History" subtitle="Estimated return on investment from past campaigns" defaultOpen={false}>
          <CampaignROISection history={roiHistory} />
        </CollapsibleSection>

        <CollapsibleSection icon="🏆" title="Industry Ranking & Competitors" subtitle="How this brand compares to others in its industry" defaultOpen={false}>
          <IndustryPositionSection ranking={ranking} competitors={competitors} onSelectBrand={onSelectBrand ?? (() => {})} />
        </CollapsibleSection>

        <CollapsibleSection icon="📣" title="Open Opportunities Feed" subtitle="Latest campaigns and activity from this brand">
          <OpportunitiesFeedSection feed={opportunitiesFeed} />
        </CollapsibleSection>

        <CollapsibleSection icon="📣" title="Active Opportunities" subtitle="Open campaigns you can apply to right now">
          <ActiveOpportunitiesSection
            campaigns={openCampaigns}
            onApply={() => onApply(brand)}
            isApplying={isApplying}
            applyState={applyState}
          />
        </CollapsibleSection>

        <CollapsibleSection icon="🎯" title="Creator Fit Analysis" subtitle="Why this brand matches you">
          <CreatorFitSection fit={fit} />
        </CollapsibleSection>

        <CollapsibleSection icon="🗺️" title="Audience Match Heatmap" subtitle="Audience overlap by age group and platform" defaultOpen={false}>
          <AudienceHeatmapSection heatmap={heatmap} />
        </CollapsibleSection>

        <CollapsibleSection icon="🖼" title="Previous Campaigns" subtitle="Past campaign results from this brand" defaultOpen={false}>
          <CampaignGallerySection gallery={gallery} />
        </CollapsibleSection>

        <CollapsibleSection icon="👥" title="Top Creators Worked With" subtitle="Creators this brand collaborates with most" defaultOpen={false}>
          <TopCreatorsSection creators={topCreators} />
        </CollapsibleSection>

        <CollapsibleSection icon="🌟" title="Creator Success Stories" subtitle="Outcomes creators have achieved working with this brand" defaultOpen={false}>
          <SuccessStoriesSection stories={successStories} />
        </CollapsibleSection>

        <CollapsibleSection icon="★" title="Creator Reviews" subtitle="Testimonials and satisfaction trends" defaultOpen={false}>
          <ReviewsSection reviews={reviews} satisfactionTrend={satisfactionTrend} />
        </CollapsibleSection>

        <CollapsibleSection icon="🛡️" title="Payment Reliability" subtitle="Trust dashboard for payments and escrow" defaultOpen={false}>
          <PaymentReliabilitySection payment={payment} />
        </CollapsibleSection>

        <CollapsibleSection icon="🤖" title="AI Insights" subtitle="Personalized recommendations for working with this brand">
          <AIInsightsPanel insights={aiInsights} />
        </CollapsibleSection>
      </div>
    </Modal>
  );
}

BrandPortfolioModal.propTypes = {
  brand:           PropTypes.object,
  isOpen:          PropTypes.bool.isRequired,
  onClose:         PropTypes.func.isRequired,
  isSaved:         PropTypes.bool,
  onToggleSave:    PropTypes.func.isRequired,
  isFollowing:     PropTypes.bool,
  onToggleFollow:  PropTypes.func.isRequired,
  isComparing:     PropTypes.bool,
  onToggleCompare: PropTypes.func.isRequired,
  onApply:         PropTypes.func.isRequired,
  isApplying:      PropTypes.bool,
  applyState:      PropTypes.string,
  onMessage:       PropTypes.func.isRequired,
  onShare:         PropTypes.func.isRequired,
  onAIPitch:       PropTypes.func,
  allBrands:       PropTypes.array,
  onSelectBrand:   PropTypes.func,
};
