import { useMemo } from 'react';
import PropTypes from 'prop-types';
import Avatar from '@/components/common/Avatar';
import Button from '@/components/common/Button';
import Drawer from '@/components/common/Drawer';
import EmptyState from '@/components/common/EmptyState';
import ChipMultiSelect from '@/components/common/ChipMultiSelect';
import CreatorIntelCard from '@/components/outreach/CreatorIntelCard';
import { formatFollowers, formatEngagement, formatPKR } from '@/utils/formatters';
import { getCreatorOutreachIntel } from '@/utils/mockOutreachIntel';
import { CAMPAIGN_CATEGORIES } from '@/constants/outreachOptions';

/* ----------------------------------------------------------------------- */
/* Creator Browser — search, filter, and intelligence cards                */
/* ----------------------------------------------------------------------- */

export function CreatorBrowserPanel({
  creators, isLoading, query, onQueryChange, niches, onNichesChange, proposal,
  shortlistedIds, comparingIds, selectedIds,
  onShortlist, onCompare, onInvite, onSave, onSelect,
}) {
  return (
    <div className="space-y-4">
      <div className="card rounded-2xl p-4 space-y-3">
        <div className="flex items-center gap-3">
          <span className="text-brand-400 text-base flex-shrink-0">✦</span>
          <input
            type="text"
            value={query}
            onChange={(e) => onQueryChange(e.target.value)}
            placeholder="Search creators by name, niche, or location…"
            className="flex-1 bg-transparent text-fg text-sm outline-none placeholder:text-fg-muted"
          />
          {query && (
            <button onClick={() => onQueryChange('')} className="text-fg-muted hover:text-fg text-sm transition-colors">
              ✕
            </button>
          )}
        </div>
        <ChipMultiSelect label="Niche" options={CAMPAIGN_CATEGORIES} value={niches} onChange={onNichesChange} />
      </div>

      {isLoading ? (
        <div className="grid sm:grid-cols-2 gap-4">
          {Array.from({ length: 4 }).map((_, i) => (
            <div key={i} className="h-72 rounded-2xl animate-pulse" style={{ background: 'var(--surface-2)' }} />
          ))}
        </div>
      ) : creators.length === 0 ? (
        <EmptyState
          icon="🔍"
          title="No creators found"
          message="Try adjusting your search or niche filters to discover more creators."
        />
      ) : (
        <div className="grid sm:grid-cols-2 gap-4">
          {creators.map((creator) => {
            const id = creator.id ?? creator.userId;
            return (
              <CreatorIntelCard
                key={id}
                creator={creator}
                proposal={proposal}
                isShortlisted={shortlistedIds.includes(id)}
                isComparing={comparingIds.includes(id)}
                isSelected={selectedIds.includes(id)}
                onShortlist={onShortlist}
                onCompare={onCompare}
                onInvite={onInvite}
                onSave={onSave}
                onSelect={onSelect}
              />
            );
          })}
        </div>
      )}
    </div>
  );
}

CreatorBrowserPanel.propTypes = {
  creators: PropTypes.arrayOf(PropTypes.object).isRequired,
  isLoading: PropTypes.bool,
  query: PropTypes.string.isRequired,
  onQueryChange: PropTypes.func.isRequired,
  niches: PropTypes.arrayOf(PropTypes.string).isRequired,
  onNichesChange: PropTypes.func.isRequired,
  proposal: PropTypes.object,
  shortlistedIds: PropTypes.array.isRequired,
  comparingIds: PropTypes.array.isRequired,
  selectedIds: PropTypes.array.isRequired,
  onShortlist: PropTypes.func,
  onCompare: PropTypes.func,
  onInvite: PropTypes.func,
  onSave: PropTypes.func,
  onSelect: PropTypes.func,
};

/* ----------------------------------------------------------------------- */
/* Creator Shortlist Sidebar                                                */
/* ----------------------------------------------------------------------- */

export function CreatorShortlistSidebar({ shortlist, onRemove, onInviteAll, onCompareAll, onClearAll }) {
  const totals = useMemo(() => {
    let budget = 0;
    let reach = 0;
    let engagement = 0;
    shortlist.forEach((creator) => {
      const intel = getCreatorOutreachIntel(creator);
      budget += (intel.pricingMin + intel.pricingMax) / 2;
      reach += intel.avgReach;
      engagement += Math.round(intel.avgReach * intel.engagementRate);
    });
    return { budget, reach, engagement };
  }, [shortlist]);

  return (
    <div className="card rounded-2xl p-4 space-y-4 sticky top-4">
      <div className="flex items-center justify-between">
        <h3 className="font-semibold text-fg text-sm" style={{ fontFamily: 'Sora, sans-serif' }}>
          Creator Shortlist
        </h3>
        {shortlist.length > 0 && (
          <button onClick={onClearAll} className="text-fg-muted hover:text-fg text-xs transition-colors">
            Clear
          </button>
        )}
      </div>

      {shortlist.length === 0 ? (
        <p className="text-fg-muted text-xs">Shortlist creators from the browser to build your outreach list.</p>
      ) : (
        <>
          <div className="space-y-2 max-h-72 overflow-y-auto pr-1">
            {shortlist.map((creator) => {
              const id = creator.id ?? creator.userId;
              return (
                <div key={id} className="flex items-center gap-2 rounded-xl p-2" style={{ background: 'var(--surface-2)' }}>
                  <Avatar src={creator.avatarUrl} initials={creator.displayName?.slice(0, 2)?.toUpperCase()} size="sm" />
                  <div className="min-w-0 flex-1">
                    <p className="text-fg text-xs font-medium truncate">{creator.displayName}</p>
                    <p className="text-fg-muted text-[10px]">{creator.niche || 'General'}</p>
                  </div>
                  <button onClick={() => onRemove(creator)} className="text-fg-muted hover:text-danger text-xs flex-shrink-0">✕</button>
                </div>
              );
            })}
          </div>

          <div className="grid grid-cols-3 gap-2 text-center">
            <div className="rounded-xl p-2" style={{ background: 'var(--surface-2)' }}>
              <p className="text-fg font-semibold text-xs" style={{ fontFamily: 'Sora, sans-serif' }}>{formatPKR(totals.budget)}</p>
              <p className="text-fg-muted text-[10px] mt-0.5">Est. Budget</p>
            </div>
            <div className="rounded-xl p-2" style={{ background: 'var(--surface-2)' }}>
              <p className="text-fg font-semibold text-xs" style={{ fontFamily: 'Sora, sans-serif' }}>{formatFollowers(totals.reach)}</p>
              <p className="text-fg-muted text-[10px] mt-0.5">Exp. Reach</p>
            </div>
            <div className="rounded-xl p-2" style={{ background: 'var(--surface-2)' }}>
              <p className="text-fg font-semibold text-xs" style={{ fontFamily: 'Sora, sans-serif' }}>{formatFollowers(totals.engagement)}</p>
              <p className="text-fg-muted text-[10px] mt-0.5">Exp. Engagement</p>
            </div>
          </div>

          <div className="flex flex-col gap-2">
            <Button variant="primary" size="sm" onClick={onInviteAll}>Invite all ({shortlist.length})</Button>
            <Button variant="secondary" size="sm" onClick={onCompareAll}>Compare shortlisted</Button>
          </div>
        </>
      )}
    </div>
  );
}

CreatorShortlistSidebar.propTypes = {
  shortlist: PropTypes.arrayOf(PropTypes.object).isRequired,
  onRemove: PropTypes.func.isRequired,
  onInviteAll: PropTypes.func.isRequired,
  onCompareAll: PropTypes.func.isRequired,
  onClearAll: PropTypes.func.isRequired,
};

/* ----------------------------------------------------------------------- */
/* Creator Compare Drawer — up to 4 side-by-side                           */
/* ----------------------------------------------------------------------- */

const COMPARE_ROWS = [
  { key: 'followers', label: 'Followers', format: (i) => formatFollowers(i.followers) },
  { key: 'engagementRate', label: 'Engagement', format: (i) => formatEngagement(i.engagementRate) },
  { key: 'avgReach', label: 'Avg Reach', format: (i) => formatFollowers(i.avgReach) },
  { key: 'audienceQuality', label: 'Audience Quality', format: (i) => `${i.audienceQuality}%` },
  { key: 'pricing', label: 'Pricing Estimate', format: (i) => `${formatPKR(i.pricingMin)}–${formatPKR(i.pricingMax)}` },
  { key: 'avgCampaignROI', label: 'Campaign Success', format: (i) => `${i.avgCampaignROI}%` },
  { key: 'authenticityScore', label: 'Authenticity', format: (i) => `${i.authenticityScore}%` },
];

export function CreatorCompareDrawer({ isOpen, onClose, creators, onRemove }) {
  return (
    <Drawer isOpen={isOpen} onClose={onClose} size="2xl" icon="⚖️" title="Compare Creators" subtitle={`${creators.length} of 4 selected`}>
      {creators.length === 0 ? (
        <div className="p-8">
          <EmptyState icon="⚖️" title="No creators to compare" message="Select up to 4 creators from the browser to compare them side by side." />
        </div>
      ) : (
        <div className="p-5 overflow-x-auto">
          <table className="w-full text-sm border-separate" style={{ borderSpacing: '0 8px' }}>
            <thead>
              <tr>
                <th className="text-left text-fg-muted text-xs font-medium pb-2 w-40">Metric</th>
                {creators.map((creator) => {
                  const id = creator.id ?? creator.userId;
                  return (
                    <th key={id} className="text-left pb-2 px-2">
                      <div className="flex items-center gap-2">
                        <Avatar src={creator.avatarUrl} initials={creator.displayName?.slice(0, 2)?.toUpperCase()} size="sm" />
                        <div className="min-w-0">
                          <p className="text-fg text-xs font-semibold truncate">{creator.displayName}</p>
                          <p className="text-fg-muted text-[10px] truncate">{creator.niche}</p>
                        </div>
                        <button onClick={() => onRemove(creator)} className="text-fg-muted hover:text-danger text-xs ml-1">✕</button>
                      </div>
                    </th>
                  );
                })}
              </tr>
            </thead>
            <tbody>
              {COMPARE_ROWS.map((row) => (
                <tr key={row.key}>
                  <td className="text-fg-muted text-xs py-2">{row.label}</td>
                  {creators.map((creator) => {
                    const id = creator.id ?? creator.userId;
                    const intel = getCreatorOutreachIntel(creator);
                    return (
                      <td key={id} className="text-fg text-xs font-medium py-2 px-2 rounded-lg" style={{ background: 'var(--surface-2)' }}>
                        {row.format(intel)}
                      </td>
                    );
                  })}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </Drawer>
  );
}

CreatorCompareDrawer.propTypes = {
  isOpen: PropTypes.bool.isRequired,
  onClose: PropTypes.func.isRequired,
  creators: PropTypes.arrayOf(PropTypes.object).isRequired,
  onRemove: PropTypes.func.isRequired,
};
