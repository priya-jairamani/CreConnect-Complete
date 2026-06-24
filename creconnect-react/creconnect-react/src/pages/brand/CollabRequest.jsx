import { useState, useEffect, useMemo, useCallback } from 'react';
import { useSearchParams } from 'react-router-dom';
import { searchApi } from '@/api/search.api';
import { campaignsApi } from '@/api/campaigns.api';
import { useToast } from '@/hooks/useToast';
import CollapsibleSection from '@/components/common/CollapsibleSection';

import OutreachKPIBar from '@/components/outreach/OutreachKPIBar';
import {
  CreatorBrowserPanel, CreatorShortlistSidebar, CreatorCompareDrawer,
} from '@/components/outreach/CreatorDiscovery';
import ProposalWizard from '@/components/outreach/ProposalWizard';
import {
  CampaignForecastCard, CampaignCalculator, CollaborationRiskPanel,
  PaymentSettingsPanel, AnalyticsPreview,
} from '@/components/outreach/CampaignForecastCard';
import { InvitationTracker, RecruitmentFunnel } from '@/components/outreach/InvitationTracker';
import CampaignTemplatesModal from '@/components/outreach/CampaignTemplatesModal';
import BrandCopilotModal from '@/components/outreach/BrandCopilotModal';
import { getInvitationStage } from '@/utils/mockOutreachIntel';

const PROPOSAL_DRAFT_KEY = 'cc-outreach-proposal-draft';
const SHORTLIST_KEY = 'cc-outreach-shortlist';
const STAGE_OVERRIDES_KEY = 'cc-outreach-stage-overrides';

const DEFAULT_PROPOSAL = {
  title: '', objective: '', category: '', description: '', goals: '', targetKpis: [],
  niches: [], requiredPlatforms: [], minFollowers: '', minEngagement: '', audienceCountries: [], languages: [],
  deliverables: [],
  budgetType: '', budgetTotal: '', creatorPayout: '', bonusIncentives: '', affiliateCommission: '', performanceRewards: '',
  timeline: {}, contract: {}, brief: { assets: [] }, payment: {},
  outreachMessages: {}, summary: '',
};

function loadJSON(key, fallback) {
  try {
    const raw = localStorage.getItem(key);
    return raw ? JSON.parse(raw) : fallback;
  } catch {
    return fallback;
  }
}

function creatorId(creator) {
  return creator.id ?? creator.userId;
}

const OBJECTIVE_MAP = {
  'Brand Awareness': 'AWARENESS', 'Product Launch': 'LAUNCH',
  'Sales & Conversions': 'CONVERSIONS', 'App Installs': 'CONVERSIONS',
  'Community Growth': 'ENGAGEMENT', 'Event Promotion': 'AWARENESS',
};
const BUDGET_TYPE_MAP = {
  'Fixed': 'FIXED', 'Milestone-Based': 'MILESTONE',
  'Performance-Based': 'PERFORMANCE', 'Hybrid': 'FIXED',
};
const NICHE_MAP = {
  Fashion: 'FASHION', Beauty: 'BEAUTY', Tech: 'TECH', Fitness: 'FITNESS',
  Food: 'FOOD', Travel: 'TRAVEL', Gaming: 'GAMING', Lifestyle: 'LIFESTYLE',
  Finance: 'FINANCE', Education: 'EDUCATION',
};

export default function CollabRequest() {
  const [searchParams] = useSearchParams();
  const toast = useToast();

  // Proposal state with autosave/draft
  const [proposal, setProposal] = useState(() => loadJSON(PROPOSAL_DRAFT_KEY, DEFAULT_PROPOSAL));
  const [lastSavedAt, setLastSavedAt] = useState(null);
  const [wizardKey, setWizardKey] = useState(0);

  useEffect(() => {
    const timer = setTimeout(() => {
      localStorage.setItem(PROPOSAL_DRAFT_KEY, JSON.stringify(proposal));
      setLastSavedAt(Date.now());
    }, 600);
    return () => clearTimeout(timer);
  }, [proposal]);

  const updateProposal = useCallback((patch) => {
    setProposal((prev) => ({ ...prev, ...patch }));
  }, []);

  // Creator discovery
  const [creators, setCreators] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [query, setQuery] = useState('');
  const [niches, setNiches] = useState([]);

  useEffect(() => {
    let cancelled = false;
    const timer = setTimeout(async () => {
      setIsLoading(true);
      try {
        const params = {};
        if (query.trim()) params.q = query.trim();
        if (niches.length === 1) params.niche = niches[0];
        const { data } = await searchApi.creators(params);
        const list = Array.isArray(data) ? data : (data?.data ?? []);
        if (!cancelled) setCreators(list);
      } catch {
        if (!cancelled) setCreators([]);
      }
      if (!cancelled) setIsLoading(false);
    }, 350);
    return () => { cancelled = true; clearTimeout(timer); };
  }, [query, niches]);

  const filteredCreators = useMemo(() => {
    if (niches.length <= 1) return creators;
    return creators.filter((c) => niches.includes(c.niche));
  }, [creators, niches]);

  // Shortlist, compare, selection
  const [shortlist, setShortlist] = useState(() => loadJSON(SHORTLIST_KEY, []));
  const [compareList, setCompareList] = useState([]);
  const [compareOpen, setCompareOpen] = useState(false);
  const [selectedIds, setSelectedIds] = useState([]);

  useEffect(() => {
    localStorage.setItem(SHORTLIST_KEY, JSON.stringify(shortlist));
  }, [shortlist]);

  const shortlistedIds = useMemo(() => shortlist.map(creatorId), [shortlist]);
  const comparingIds = useMemo(() => compareList.map(creatorId), [compareList]);

  const handleShortlist = useCallback((creator) => {
    setShortlist((prev) => {
      const id = creatorId(creator);
      if (prev.some((c) => creatorId(c) === id)) return prev.filter((c) => creatorId(c) !== id);
      return [...prev, creator];
    });
  }, []);

  const handleCompare = useCallback((creator) => {
    setCompareList((prev) => {
      const id = creatorId(creator);
      if (prev.some((c) => creatorId(c) === id)) return prev.filter((c) => creatorId(c) !== id);
      if (prev.length >= 4) return prev;
      return [...prev, creator];
    });
    setCompareOpen(true);
  }, []);

  const handleSave = useCallback(() => {
    // Lightweight bookmark hook — reserved for a future "Saved Creators" view.
  }, []);

  const handleSelect = useCallback((creator) => {
    setSelectedIds((prev) => {
      const id = creatorId(creator);
      return prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id];
    });
  }, []);

  // Invitation pipeline
  const [stageOverrides, setStageOverrides] = useState(() => loadJSON(STAGE_OVERRIDES_KEY, {}));
  const [isSending, setIsSending] = useState(false);

  useEffect(() => {
    localStorage.setItem(STAGE_OVERRIDES_KEY, JSON.stringify(stageOverrides));
  }, [stageOverrides]);

  const invitations = useMemo(() => shortlist.map((creator) => {
    const id = creatorId(creator);
    const stage = stageOverrides[id] ?? getInvitationStage(creator);
    return { creator, stage };
  }), [shortlist, stageOverrides]);

  const pipelineCounts = useMemo(() => {
    const counts = {};
    invitations.forEach(({ stage }) => { counts[stage] = (counts[stage] ?? 0) + 1; });
    return counts;
  }, [invitations]);

  const sendInvitations = useCallback(async (targets) => {
    if (!targets.length) {
      toast.warning('Add at least one creator to your shortlist before sending invitations.');
      return;
    }

    setIsSending(true);
    try {
      const deliverables = proposal.deliverables || [];
      const countType = (types) =>
        deliverables.filter((d) => types.includes(d.type)).reduce((s, d) => s + (Number(d.quantity) || 1), 0);

      await campaignsApi.create({
        title:         proposal.title       || 'Untitled Campaign',
        description:   proposal.description || proposal.goals || 'Campaign created from outreach proposal',
        objective:     OBJECTIVE_MAP[proposal.objective]   || 'AWARENESS',
        niche:         NICHE_MAP[proposal.category]        || undefined,
        budgetType:    BUDGET_TYPE_MAP[proposal.budgetType] || 'FIXED',
        platforms:     proposal.requiredPlatforms  || [],
        followerMin:   Number(proposal.minFollowers)  || 0,
        engagementMin: Number(proposal.minEngagement) || 0,
        languages:     proposal.languages || [],
        budgetPKR:     Number(proposal.budgetTotal)   || 0,
        reels:         countType(['Reel']),
        posts:         countType(['Post']),
        stories:       countType(['Story']),
        videos:        countType(['YouTube Video', 'Short']),
        livestreams:   countType(['Livestream']),
        startDate:     proposal.timeline?.kickoff     || undefined,
        deadline:      proposal.timeline?.completion  || undefined,
        status:        'PUBLISHED',
      });

      // Advance each shortlisted creator from Draft → Sent in the local pipeline
      const overrides = {};
      for (const creator of targets) {
        const id = creatorId(creator);
        const current = stageOverrides[id] ?? getInvitationStage(creator);
        if (current === 'Draft') overrides[id] = 'Sent';
      }
      if (Object.keys(overrides).length) {
        setStageOverrides((prev) => ({ ...prev, ...overrides }));
      }

      toast.success(`Campaign published and invitations sent to ${targets.length} creator${targets.length !== 1 ? 's' : ''}!`);

      // Reset all state and clear persisted drafts
      setProposal(DEFAULT_PROPOSAL);
      setShortlist([]);
      setSelectedIds([]);
      setStageOverrides({});
      setLastSavedAt(null);
      localStorage.removeItem(PROPOSAL_DRAFT_KEY);
      localStorage.removeItem(SHORTLIST_KEY);
      localStorage.removeItem(STAGE_OVERRIDES_KEY);
      setWizardKey((k) => k + 1); // remounts ProposalWizard → resets stepIndex to 0
    } catch (err) {
      toast.error(err?.response?.data?.message || err?.message || 'Failed to send invitations. Please try again.');
    } finally {
      setIsSending(false);
    }
  }, [proposal, stageOverrides, toast]);

  const handleInvite = useCallback((creator) => {
    setShortlist((prev) => (prev.some((c) => creatorId(c) === creatorId(creator)) ? prev : [...prev, creator]));
    sendInvitations([creator]);
  }, [sendInvitations]);

  const handleInviteAll = useCallback(() => {
    sendInvitations(shortlist);
  }, [sendInvitations, shortlist]);

  // Templates & Copilot
  const [templatesOpen, setTemplatesOpen] = useState(false);
  const [copilotOpen, setCopilotOpen] = useState(false);

  const handleApplyTemplate = useCallback((template) => {
    updateProposal({ ...template.defaults });
    setTemplatesOpen(false);
  }, [updateProposal]);

  // Pre-fill from ?creatorId= when navigating from Discover Creators
  useEffect(() => {
    const targetId = searchParams.get('creatorId');
    if (!targetId || !creators.length) return;
    const match = creators.find((c) => creatorId(c) === targetId);
    if (match && !shortlist.some((c) => creatorId(c) === targetId)) {
      setShortlist((prev) => [...prev, match]);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [searchParams, creators]);

  const selectedCreators = useMemo(() => {
    if (shortlist.length) return shortlist;
    return creators.filter((c) => selectedIds.includes(creatorId(c)));
  }, [shortlist, creators, selectedIds]);

  // Derived KPI metrics
  const campaignProgress = useMemo(() => {
    const checks = [
      !!proposal.title,
      !!proposal.objective,
      !!proposal.category,
      !!proposal.deliverables?.length,
      !!proposal.budgetTotal,
      Object.values(proposal.timeline ?? {}).some(Boolean),
      !!proposal.contract?.exclusivityPeriod || !!proposal.contract?.contentOwnership,
      !!proposal.brief?.instructions,
    ];
    const completed = checks.filter(Boolean).length;
    return Math.round((completed / checks.length) * 100);
  }, [proposal]);

  const budgetUtilization = useMemo(() => {
    const budget = Number(proposal.budgetTotal) || 0;
    if (!budget || !shortlist.length) return 0;
    const perCreator = Number(proposal.creatorPayout) || (budget / shortlist.length);
    const totalCost = shortlist.length * perCreator;
    return Math.min(100, Math.round((totalCost / budget) * 100));
  }, [proposal, shortlist]);

  return (
    <div className="p-6 space-y-6">
      <OutreachKPIBar
        proposal={proposal}
        pipelineCounts={pipelineCounts}
        targetCreatorCount={shortlist.length}
        budgetUtilization={budgetUtilization}
        campaignProgress={campaignProgress}
      />

      <div className="grid xl:grid-cols-[1fr_320px] gap-6">
        <div className="space-y-6 min-w-0">
          <CollapsibleSection icon="🔍" title="Creator Discovery" subtitle="Browse, filter, and evaluate creators with AI match scoring">
            <CreatorBrowserPanel
              creators={filteredCreators}
              isLoading={isLoading}
              query={query}
              onQueryChange={setQuery}
              niches={niches}
              onNichesChange={setNiches}
              proposal={proposal}
              shortlistedIds={shortlistedIds}
              comparingIds={comparingIds}
              selectedIds={selectedIds}
              onShortlist={handleShortlist}
              onCompare={handleCompare}
              onInvite={handleInvite}
              onSave={handleSave}
              onSelect={handleSelect}
            />
          </CollapsibleSection>

          <ProposalWizard
            key={wizardKey}
            proposal={proposal}
            onChange={updateProposal}
            selectedCreators={selectedCreators}
            lastSavedAt={lastSavedAt}
            onSendInvitations={handleInviteAll}
            isSending={isSending}
            onOpenTemplates={() => setTemplatesOpen(true)}
            onOpenCopilot={() => setCopilotOpen(true)}
          />

          <div className="grid sm:grid-cols-2 gap-4">
            <CampaignForecastCard proposal={proposal} selectedCreators={selectedCreators} />
            <CampaignCalculator proposal={proposal} selectedCreators={selectedCreators} />
          </div>

          <div className="grid sm:grid-cols-2 gap-4">
            <CollaborationRiskPanel selectedCreators={selectedCreators} />
            <PaymentSettingsPanel proposal={proposal} onChange={updateProposal} />
          </div>

          <AnalyticsPreview proposal={proposal} selectedCreators={selectedCreators} />

          <div className="grid sm:grid-cols-2 gap-4">
            <RecruitmentFunnel creators={shortlist} />
            <InvitationTracker invitations={invitations} />
          </div>
        </div>

        <div className="xl:sticky xl:top-4 xl:self-start">
          <CreatorShortlistSidebar
            shortlist={shortlist}
            onRemove={handleShortlist}
            onInviteAll={handleInviteAll}
            onCompareAll={() => { setCompareList(shortlist.slice(0, 4)); setCompareOpen(true); }}
            onClearAll={() => setShortlist([])}
          />
        </div>
      </div>

      <CreatorCompareDrawer
        isOpen={compareOpen}
        onClose={() => setCompareOpen(false)}
        creators={compareList}
        onRemove={handleCompare}
      />

      <CampaignTemplatesModal
        isOpen={templatesOpen}
        onClose={() => setTemplatesOpen(false)}
        onApplyTemplate={handleApplyTemplate}
      />

      <BrandCopilotModal
        isOpen={copilotOpen}
        onClose={() => setCopilotOpen(false)}
        proposal={proposal}
        candidates={creators}
        selectedCreators={selectedCreators}
        onChange={updateProposal}
        onShortlistCreator={handleShortlist}
      />
    </div>
  );
}
