import { useState, useEffect, useCallback, useMemo } from 'react';
import { useCampaignContext } from '@/context/CampaignContext';
import { useNavigate, useSearchParams } from 'react-router-dom';
import OpportunityOverview from '@/components/discovery/OpportunityOverview';
import AISearchBar from '@/components/discovery/AISearchBar';
import AdvancedFilters from '@/components/discovery/AdvancedFilters';
import BrandCard2 from '@/components/discovery/BrandCard2';
import BrandPortfolioModal from '@/components/discovery/BrandPortfolioModal';
import AIApplicationModal from '@/components/discovery/AIApplicationModal';
import CompareBrandsModal from '@/components/discovery/CompareBrandsModal';
import CompareTray from '@/components/discovery/CompareTray';
import DiscoveryEmptyState from '@/components/discovery/DiscoveryEmptyState';
import Skeleton from '@/components/common/Skeleton';
import { searchApi } from '@/api/search.api';
import { campaignsApi } from '@/api/campaigns.api';
import { creatorsApi } from '@/api/creators.api';
import { aiApi } from '@/api/ai.api';
import { ROUTES } from '@/constants/routes';
import { useToast } from '@/hooks/useToast';
import { parseAISearch } from '@/utils/aiSearchParser';
import {
  getBrandIntel, getBrandMeta, getBrandFilterTags, getOpportunityOverview,
} from '@/utils/mockBrandIntel';

const EMPTY_FILTERS = {
  industries: [], budgetTiers: [], brandSizes: [], locations: [], campaignTypes: [],
  creatorRequirements: [], audienceSizes: [], languages: [], responseTimes: [], verifiedOnly: false,
};

const WATCHLIST_KEY = 'cc-creator-watchlist';
const FOLLOWING_KEY = 'cc-creator-following';

function readIdSet(key) {
  try {
    return new Set(JSON.parse(localStorage.getItem(key)) ?? []);
  } catch {
    return new Set();
  }
}

function brandSizeFromCompanySize(companySize = '') {
  if (companySize.startsWith('Startup')) return 'Startup';
  if (companySize.startsWith('Enterprise')) return 'Enterprise';
  return 'Growing';
}

const RESPONSE_TIME_MAX_HOURS = {
  'Within 1 hour': 1,
  'Within 6 hours': 6,
  'Within 24 hours': 24,
  'Within 3 days': 72,
};

function enrichBrandForCard(brand, allBrands, aiScore, aiBreakdown) {
  const full = allBrands.find((b) => b.id === brand.id) || brand;
  const intel = full.intel ?? getBrandIntel(full);
  const meta = full.meta ?? getBrandMeta(full);
  const filterTags = full.filterTags ?? getBrandFilterTags(full);
  return {
    ...full,
    intel,
    meta,
    location: full.location || meta.headquarters,
    brandSize: full.brandSize || brandSizeFromCompanySize(meta.companySize),
    filterTags,
    aiScore,
    aiBreakdown,
  };
}

export default function FindBrands() {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const toast = useToast();
  const { offers, fetchOffers } = useCampaignContext();

  const [query, setQuery] = useState(() => searchParams.get('q') || '');
  const [filters, setFilters] = useState(EMPTY_FILTERS);
  const [allBrands, setAllBrands] = useState([]);
  const [creatorNiches, setCreatorNiches] = useState([]);
  const [creatorProfile, setCreatorProfile] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [viewTab, setViewTab] = useState('all');

  const [selectedBrand, setSelectedBrand] = useState(null);
  const [pitchBrand, setPitchBrand] = useState(null);
  const [compareIds, setCompareIds] = useState([]);
  const [isCompareOpen, setIsCompareOpen] = useState(false);

  const [savedIds, setSavedIds] = useState(() => readIdSet(WATCHLIST_KEY));
  const [followingIds, setFollowingIds] = useState(() => readIdSet(FOLLOWING_KEY));

  const [applying, setApplying] = useState(null);
  const [applyState, setApplyState] = useState({});

  // AI Match state
  const [aiMode,     setAiMode]     = useState(false);
  const [aiMatches,  setAiMatches]  = useState([]);
  const [aiLoading,  setAiLoading]  = useState(false);

  /* ── Load brands + creator profile (for niche matching) ── */
  useEffect(() => { fetchOffers(); }, [fetchOffers]);

  useEffect(() => {
    Promise.all([
      searchApi.brands({}).catch(() => ({ data: [] })),
      creatorsApi.getProfile().catch(() => ({ data: null })),
    ]).then(([brandsRes, profileRes]) => {
      const list = Array.isArray(brandsRes.data) ? brandsRes.data : (brandsRes.data?.data ?? []);
      const enriched = list.map((brand) => {
        const intel = getBrandIntel(brand);
        const meta = getBrandMeta(brand);
        const filterTags = getBrandFilterTags(brand);
        return {
          ...brand,
          intel,
          meta,
          location: brand.location || meta.headquarters,
          brandSize: brandSizeFromCompanySize(meta.companySize),
          filterTags,
        };
      });
      setAllBrands(enriched);

      const profile = profileRes.data;
      if (profile) {
        setCreatorProfile(profile);
        // Prefer the DB niches[] array; fall back to the single niche field
        const niches = profile.niches?.length ? profile.niches : (profile.niche ? [profile.niche] : []);
        setCreatorNiches(niches);
      }
    }).finally(() => setIsLoading(false));
  }, []);

  /* ── Apply to a brand's first published campaign ── */
  const handleApply = useCallback(async (brand) => {
    setApplying(brand.id);
    try {
      const { data } = await campaignsApi.list({ brandId: brand.id, status: 'PUBLISHED' });
      const list = Array.isArray(data) ? data : (data?.data ?? []);
      if (list.length === 0) {
        setApplyState((s) => ({ ...s, [brand.id]: 'none' }));
        return;
      }
      await campaignsApi.apply(list[0].id, {});
      setApplyState((s) => ({ ...s, [brand.id]: 'done' }));
      toast.success(`Application sent to ${brand.companyName}!`);
    } catch (err) {
      const msg = err?.response?.data?.message || err?.message || 'Error';
      setApplyState((s) => ({ ...s, [brand.id]: msg }));
    } finally {
      setApplying(null);
    }
  }, [toast]);

  /* ── Watchlist / follow / compare ── */
  const toggleSaved = useCallback((brand) => {
    setSavedIds((prev) => {
      const next = new Set(prev);
      if (next.has(brand.id)) { next.delete(brand.id); toast.info(`Removed ${brand.companyName} from watchlist`); }
      else { next.add(brand.id); toast.success(`Saved ${brand.companyName} to watchlist`); }
      localStorage.setItem(WATCHLIST_KEY, JSON.stringify([...next]));
      return next;
    });
  }, [toast]);

  const toggleFollowing = useCallback((brand) => {
    setFollowingIds((prev) => {
      const next = new Set(prev);
      if (next.has(brand.id)) { next.delete(brand.id); toast.info(`Unfollowed ${brand.companyName}`); }
      else { next.add(brand.id); toast.success(`Following ${brand.companyName} — you'll get alerts on new campaigns`); }
      localStorage.setItem(FOLLOWING_KEY, JSON.stringify([...next]));
      return next;
    });
  }, [toast]);

  const toggleCompare = useCallback((brand) => {
    setCompareIds((prev) => {
      if (prev.includes(brand.id)) return prev.filter((id) => id !== brand.id);
      if (prev.length >= 4) {
        toast.warning('You can compare up to 4 brands at a time');
        return prev;
      }
      return [...prev, brand.id];
    });
  }, [toast]);

  const handleMessage = useCallback((brand) => {
    navigate(`${ROUTES.CREATOR_MESSAGES}?brandId=${brand.id}`);
  }, [navigate]);

  const handleShare = useCallback((brand) => {
    const url = `${window.location.origin}${ROUTES.CREATOR_FIND_BRANDS}?q=${encodeURIComponent(brand.companyName)}`;
    navigator.clipboard?.writeText(url).catch(() => {});
    toast.success('✓ Link copied!');
  }, [toast]);

  /* ── AI Match ── */
  const fetchAiMatches = useCallback(async (profileId) => {
    if (!profileId) { toast.warning('Could not load your creator profile — try refreshing.'); return; }
    setAiLoading(true);
    try {
      const { data } = await aiApi.getCreatorMatches(profileId, 20);
      const list = Array.isArray(data) ? data : (data?.data ?? []);
      const enriched = list
        .map((m) => {
          const brand = m.brand || allBrands.find((b) => b.id === m.brandId);
          if (!brand) return null;
          return enrichBrandForCard(brand, allBrands, m.matchScore, m.breakdown);
        })
        .filter(Boolean);
      setAiMatches(enriched);
      if (enriched.length === 0) {
        toast.info('No brand matches found for your profile yet. Try completing your niche and location in Profile.');
      }
    } catch (err) {
      const msg = err?.message || err?.data?.message;
      toast.error(msg || 'Could not load AI matches. Check your plan includes AI matching.');
      setAiMatches([]);
    }
    setAiLoading(false);
  }, [toast, allBrands]);

  const toggleAiMode = useCallback(() => {
    setAiMode((prev) => {
      const next = !prev;
      if (next) fetchAiMatches(creatorProfile?.id);
      return next;
    });
  }, [creatorProfile, fetchAiMatches]);

  /* ── Search + filtering (client-side, over the enriched brand list) ── */
  const parsed = useMemo(() => parseAISearch(query), [query]);

  const activeFilterCount = useMemo(() => {
    return Object.entries(filters).reduce((sum, [key, val]) => {
      if (key === 'verifiedOnly') return sum + (val ? 1 : 0);
      return sum + (val?.length ?? 0);
    }, 0);
  }, [filters]);

  const filteredBrands = useMemo(() => {
    return allBrands.filter((b) => {
      if (parsed.raw.trim()) {
        if (parsed.industry && b.industry?.toLowerCase() !== parsed.industry.toLowerCase()) return false;
        if (parsed.location && !b.location?.toLowerCase().includes(parsed.location.toLowerCase())) return false;
        if (parsed.minBudget && (b.intel.avgBudget ?? 0) < parsed.minBudget) return false;

        if (!parsed.industry && !parsed.location && !parsed.minBudget) {
          const haystack = `${b.companyName} ${b.industry ?? ''} ${b.description ?? ''} ${b.location ?? ''}`.toLowerCase();
          const terms = parsed.raw.toLowerCase().split(/\s+/).filter(Boolean);
          if (!terms.some((t) => haystack.includes(t))) return false;
        }
      }

      if (filters.industries.length && !filters.industries.includes(b.industry)) return false;
      if (filters.budgetTiers.length && !filters.budgetTiers.includes(b.intel.budgetTier)) return false;
      if (filters.brandSizes.length && !filters.brandSizes.includes(b.brandSize)) return false;
      if (filters.locations.length && !filters.locations.some((loc) => b.location?.includes(loc))) return false;
      if (filters.campaignTypes.length && !filters.campaignTypes.some((t) => b.filterTags.campaignTypes.includes(t))) return false;
      if (filters.creatorRequirements.length && !filters.creatorRequirements.some((r) => b.filterTags.creatorRequirements.includes(r))) return false;
      if (filters.audienceSizes.length && !filters.audienceSizes.some((a) => b.filterTags.audienceSizes.includes(a))) return false;
      if (filters.languages.length && !filters.languages.some((l) => b.filterTags.languages.includes(l))) return false;
      if (filters.responseTimes.length) {
        const hours = b.intel.avgResponseTimeHours;
        if (!filters.responseTimes.some((rt) => hours <= (RESPONSE_TIME_MAX_HOURS[rt] ?? Infinity))) return false;
      }
      if (filters.verifiedOnly && !b.isVerified) return false;

      return true;
    });
  }, [allBrands, parsed, filters]);

  const overview = useMemo(() => ({
    ...getOpportunityOverview(allBrands, creatorNiches),
    openInvitations: offers.length,          // real count from backend
  }), [allBrands, creatorNiches, offers]);

  const recommendedForEmpty = useMemo(
    () => [...allBrands].sort((a, b) => (b.intel.matchScore ?? 0) - (a.intel.matchScore ?? 0)).slice(0, 4),
    [allBrands]
  );
  const trendingForEmpty = useMemo(
    () => allBrands.filter((b) => b.intel.badges?.some((bd) => bd.key === 'trending')).slice(0, 4),
    [allBrands]
  );

  const compareBrands = useMemo(
    () => compareIds.map((id) => allBrands.find((b) => b.id === id)).filter(Boolean),
    [compareIds, allBrands]
  );

  const displayBrands = useMemo(
    () => (viewTab === 'watchlist' ? filteredBrands.filter((b) => savedIds.has(b.id)) : filteredBrands),
    [viewTab, filteredBrands, savedIds]
  );

  const handleClear = () => { setQuery(''); setFilters(EMPTY_FILTERS); };

  return (
    <div className="p-6 space-y-6 pb-24">
      <header className="flex items-start justify-between gap-4 flex-wrap">
        <div>
          <h1 className="text-2xl font-bold text-fg" style={{ fontFamily: 'Sora, sans-serif' }}>
            Brand Discovery
          </h1>
          <p className="text-fg-muted text-sm mt-0.5">
            {aiMode
              ? 'AI-ranked brands matched to your niche, engagement, and collaboration history.'
              : 'Find the brands, campaigns, and opportunities that fit you best.'}
          </p>
        </div>
        <button
          onClick={toggleAiMode}
          disabled={aiLoading || isLoading}
          className="flex items-center gap-1.5 px-4 py-2 rounded-xl text-sm font-medium transition-all flex-shrink-0"
          style={aiMode
            ? { background: 'linear-gradient(135deg,#6d5cff,#4c2dd1)', color: '#fff', border: 'none', boxShadow: '0 0 12px rgba(109,92,255,0.4)' }
            : { background: 'var(--surface-2)', color: 'var(--fg-muted)', border: '1px solid var(--border)' }
          }
        >
          {aiLoading ? '⏳ Loading…' : aiMode ? '✦ AI Match ON' : '✦ AI Match'}
        </button>
      </header>

      {/* AI mode banner */}
      {aiMode && (
        <div
          className="rounded-2xl p-4 flex items-start gap-3"
          style={{ background: 'rgba(109,92,255,0.08)', border: '1px solid rgba(109,92,255,0.2)' }}
        >
          <span className="text-brand-400 text-xl mt-0.5">✦</span>
          <div>
            <p className="text-sm font-semibold text-fg">AI Matching Engine Active</p>
            <p className="text-xs text-fg-muted mt-0.5">
              Brands are ranked by a hybrid score (0–100) based on your niche, engagement quality,
              audience fit, location, ratings, and your collaboration history.
            </p>
          </div>
          <button
            onClick={() => setAiMode(false)}
            className="ml-auto text-fg-muted hover:text-fg text-sm transition-colors flex-shrink-0"
          >
            ✕
          </button>
        </div>
      )}

      {isLoading ? (
        <div className="grid grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-4">
          {Array.from({ length: 6 }).map((_, i) => <Skeleton key={i} className="h-28 rounded-2xl" />)}
        </div>
      ) : (
        <OpportunityOverview overview={overview} />
      )}

      <AISearchBar value={query} onChange={setQuery} onSubmit={setQuery} />

      <AdvancedFilters
        filters={filters}
        onChange={(key, value) => setFilters((f) => ({ ...f, [key]: value }))}
        onClear={() => setFilters(EMPTY_FILTERS)}
        activeCount={activeFilterCount}
      />

      {!isLoading && (
        <div className="flex items-center justify-between flex-wrap gap-2">
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={() => setViewTab('all')}
              className={`px-3 py-1.5 rounded-full text-sm font-medium transition-colors ${viewTab === 'all' ? 'bg-brand-500 text-white' : ''}`}
              style={viewTab === 'all' ? {} : { background: 'var(--surface-2)', color: 'var(--fg-muted)', border: '1px solid var(--border)' }}
            >
              All Opportunities
            </button>
            <button
              type="button"
              onClick={() => setViewTab('watchlist')}
              className={`px-3 py-1.5 rounded-full text-sm font-medium transition-colors ${viewTab === 'watchlist' ? 'bg-brand-500 text-white' : ''}`}
              style={viewTab === 'watchlist' ? {} : { background: 'var(--surface-2)', color: 'var(--fg-muted)', border: '1px solid var(--border)' }}
            >
              ★ Watchlist ({savedIds.size})
            </button>
          </div>
          <p className="text-fg-muted text-sm">{displayBrands.length} opportunit{displayBrands.length !== 1 ? 'ies' : 'y'} found</p>
        </div>
      )}

      {/* AI results */}
      {aiMode && (
        aiLoading ? (
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {Array.from({ length: 6 }).map((_, i) => <Skeleton key={i} className="h-[28rem] rounded-2xl" />)}
          </div>
        ) : aiMatches.length === 0 ? (
          <div className="flex flex-col items-center text-center gap-3 py-12">
            <div className="w-16 h-16 rounded-2xl flex items-center justify-center text-3xl" style={{ background: 'rgba(109,92,255,0.1)', border: '1px solid rgba(109,92,255,0.2)' }}>✦</div>
            <h3 className="text-lg font-semibold text-fg" style={{ fontFamily: 'Sora, sans-serif' }}>No AI matches yet</h3>
            <p className="text-fg-muted text-sm max-w-sm">We couldn&apos;t find brands that match your profile yet. Add your niche and location in Profile, then try again.</p>
            <button type="button" onClick={() => setAiMode(false)} className="px-3 py-1.5 rounded-full text-sm font-medium" style={{ background: 'var(--surface-2)', color: 'var(--fg)', border: '1px solid var(--border)' }}>
              Browse all brands
            </button>
          </div>
        ) : (
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {aiMatches.map((brand, idx) => (
              <div key={brand.id} className="relative">
                {/* Score badge */}
                <div
                  className="absolute top-3 right-3 z-10 flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-bold"
                  style={{ background: 'linear-gradient(135deg,#6d5cff,#4c2dd1)', color: '#fff', boxShadow: '0 2px 8px rgba(109,92,255,0.4)' }}
                >
                  ✦ {brand.aiScore ?? '—'}<span className="font-normal opacity-80">/100</span>
                </div>
                {/* Rank badge */}
                <div
                  className="absolute top-3 left-3 z-10 w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold"
                  style={{ background: 'var(--surface-3)', color: 'var(--fg-muted)', border: '1px solid var(--border)' }}
                >
                  {idx + 1}
                </div>
                <BrandCard2
                  brand={brand}
                  onView={setSelectedBrand}
                  onApply={handleApply}
                  onAIPitch={setPitchBrand}
                  onSave={toggleSaved}
                  isSaved={savedIds.has(brand.id)}
                  onCompareToggle={toggleCompare}
                  isComparing={compareIds.includes(brand.id)}
                  applyState={applyState[brand.id]}
                  isApplying={applying === brand.id}
                />
              </div>
            ))}
          </div>
        )
      )}

      {!aiMode && (isLoading ? (
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {Array.from({ length: 6 }).map((_, i) => <Skeleton key={i} className="h-[28rem] rounded-2xl" />)}
        </div>
      ) : displayBrands.length === 0 ? (
        viewTab === 'watchlist' ? (
          <div className="flex flex-col items-center text-center gap-2 py-10">
            <div className="w-16 h-16 rounded-2xl bg-brand-500/10 flex items-center justify-center text-3xl border border-brand-500/20">★</div>
            <h3 className="text-lg font-semibold text-fg" style={{ fontFamily: 'Sora, sans-serif' }}>Your watchlist is empty</h3>
            <p className="text-fg-muted text-sm max-w-sm">Save brands you&apos;re interested in to track them here and get notified about new opportunities.</p>
            <button
              type="button"
              onClick={() => setViewTab('all')}
              className="px-3 py-1.5 rounded-full text-sm font-medium"
              style={{ background: 'var(--surface-2)', color: 'var(--fg)', border: '1px solid var(--border)' }}
            >
              Browse all opportunities
            </button>
          </div>
        ) : (
          <DiscoveryEmptyState
            recommended={recommendedForEmpty}
            trending={trendingForEmpty}
            onSelectBrand={setSelectedBrand}
            onSuggestedSearch={setQuery}
            onClear={handleClear}
          />
        )
      ) : (
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {displayBrands.map((brand) => (
            <BrandCard2
              key={brand.id}
              brand={brand}
              onView={setSelectedBrand}
              onApply={handleApply}
              onAIPitch={setPitchBrand}
              onSave={toggleSaved}
              isSaved={savedIds.has(brand.id)}
              onCompareToggle={toggleCompare}
              isComparing={compareIds.includes(brand.id)}
              applyState={applyState[brand.id]}
              isApplying={applying === brand.id}
            />
          ))}
        </div>
      ))}

      <BrandPortfolioModal
        brand={selectedBrand}
        isOpen={!!selectedBrand}
        onClose={() => setSelectedBrand(null)}
        isSaved={selectedBrand ? savedIds.has(selectedBrand.id) : false}
        onToggleSave={toggleSaved}
        isFollowing={selectedBrand ? followingIds.has(selectedBrand.id) : false}
        onToggleFollow={toggleFollowing}
        isComparing={selectedBrand ? compareIds.includes(selectedBrand.id) : false}
        onToggleCompare={toggleCompare}
        onApply={handleApply}
        isApplying={selectedBrand ? applying === selectedBrand.id : false}
        applyState={selectedBrand ? applyState[selectedBrand.id] : undefined}
        onMessage={handleMessage}
        onShare={handleShare}
        onAIPitch={setPitchBrand}
        allBrands={allBrands}
        onSelectBrand={setSelectedBrand}
      />

      <AIApplicationModal
        brand={pitchBrand}
        profile={creatorProfile}
        creatorNiches={creatorNiches}
        isOpen={!!pitchBrand}
        onClose={() => setPitchBrand(null)}
        onApply={handleApply}
        isApplying={pitchBrand ? applying === pitchBrand.id : false}
        applyState={pitchBrand ? applyState[pitchBrand.id] : undefined}
      />

      <CompareBrandsModal
        brands={compareBrands}
        isOpen={isCompareOpen}
        onClose={() => setIsCompareOpen(false)}
        onRemove={(id) => setCompareIds((prev) => prev.filter((c) => c !== id))}
      />

      <CompareTray
        brands={compareBrands}
        onRemove={(id) => setCompareIds((prev) => prev.filter((c) => c !== id))}
        onClear={() => setCompareIds([])}
        onCompare={() => setIsCompareOpen(true)}
      />
    </div>
  );
}
