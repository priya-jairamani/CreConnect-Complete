import PropTypes from 'prop-types';
import { clsx } from 'clsx';
import Avatar from '@/components/common/Avatar';
import Badge from '@/components/common/Badge';
import Button from '@/components/common/Button';
import ScoreRing from '@/components/common/ScoreRing';
import { formatPKR } from '@/utils/formatters';
import { getBrandCreditScore, getAverageDealSize, getHiringFrequency, getBestTimeToApply } from '@/utils/mockBrandIntel';

function MiniStat({ label, value }) {
  return (
    <div className="rounded-xl px-2.5 py-2" style={{ background: 'var(--surface-2)' }}>
      <p className="text-fg text-sm font-semibold leading-none truncate" style={{ fontFamily: 'Sora, sans-serif' }}>{value}</p>
      <p className="text-fg-muted text-[10px] mt-1 truncate">{label}</p>
    </div>
  );
}
MiniStat.propTypes = { label: PropTypes.string.isRequired, value: PropTypes.node.isRequired };

export default function BrandCard2({ brand, onView, onApply, onSave, isSaved, onCompareToggle, isComparing, applyState, isApplying, onAIPitch }) {
  const intel = brand.intel ?? {};
  const creditScore = getBrandCreditScore(brand, intel);
  const dealSize = getAverageDealSize(brand, intel);
  const hiringFrequency = getHiringFrequency(brand);
  const bestTime = getBestTimeToApply(brand);

  return (
    <div className="card card-hover rounded-2xl p-5 flex flex-col gap-4">
      {/* Header */}
      <div className="flex items-start gap-3">
        <Avatar
          src={brand.logoUrl}
          initials={brand.companyName?.slice(0, 2)?.toUpperCase()}
          size="lg"
        />
        <div className="min-w-0 flex-1">
          <div className="flex items-center gap-2 flex-wrap">
            <h3 className="font-semibold text-fg truncate" style={{ fontFamily: 'Sora, sans-serif' }}>
              {brand.companyName}
            </h3>
            {brand.isVerified && <Badge variant="success" label="Verified" dot />}
          </div>
          <p className="text-fg-muted text-xs mt-0.5 truncate">
            {brand.industry || 'General'}{brand.location ? ` · ${brand.location}` : ''}
          </p>
        </div>
        <div className="flex flex-col items-center flex-shrink-0">
          <ScoreRing value={intel.matchScore ?? 0} size={48} strokeWidth={4} />
          <p className="text-fg-muted text-[10px] mt-1 whitespace-nowrap">Match Score</p>
        </div>
      </div>

      {/* Opportunity badges */}
      {intel.badges?.length > 0 && (
        <div className="flex flex-wrap gap-1.5">
          {intel.badges.map((b) => (
            <Badge key={b.key} variant={b.variant} label={`${b.icon} ${b.label}`} />
          ))}
        </div>
      )}

      {brand.description && (
        <p className="text-fg-muted text-sm leading-relaxed line-clamp-2">{brand.description}</p>
      )}

      {/* Metrics grid */}
      <div className="grid grid-cols-3 gap-2">
        <MiniStat label="Trust Score" value={`${intel.trustScore ?? '—'}`} />
        <MiniStat label="Response Rate" value={`${intel.responseRate ?? '—'}%`} />
        <MiniStat label="Avg Response" value={`${intel.avgResponseTimeHours ?? '—'}h`} />
        <MiniStat label="Success Rate" value={`${intel.campaignSuccessRate ?? '—'}%`} />
        <MiniStat label="Avg Budget" value={formatPKR(intel.avgBudget)} />
        <MiniStat label="Active Campaigns" value={intel.activeCampaigns ?? '—'} />
        <MiniStat label="Completed Collabs" value={intel.completedCollaborations ?? '—'} />
        <MiniStat label="Creator Rating" value={`★ ${intel.creatorRating ?? '—'}`} />
        <MiniStat label="Satisfaction" value={`${intel.satisfactionScore ?? '—'}%`} />
        <MiniStat label="Credit Score" value={`${creditScore.grade} (${creditScore.score})`} />
        <MiniStat label="Avg Deal Size" value={formatPKR(dealSize)} />
        <MiniStat label="Hiring Frequency" value={hiringFrequency.label.replace('Hires ', '')} />
      </div>

      <p className="text-fg-muted text-xs -mt-1">⏰ Best time to apply: <span className="text-fg">{bestTime.summary}</span></p>

      {/* Actions */}
      <div className="flex items-center gap-2 pt-1 flex-wrap">
        <Button variant="secondary" size="sm" onClick={() => onView(brand)}>
          View Brand
        </Button>
        {onAIPitch && (
          <Button variant="outline" size="sm" onClick={() => onAIPitch(brand)}>
            ✨ AI Pitch
          </Button>
        )}
        {onApply && (
          <Button
            variant="primary"
            size="sm"
            isLoading={isApplying}
            disabled={applyState === 'done'}
            onClick={() => onApply(brand)}
          >
            {applyState === 'done' ? '✓ Applied' : 'Apply'}
          </Button>
        )}
        <button
          type="button"
          onClick={() => onSave(brand)}
          title={isSaved ? 'Remove from watchlist' : 'Save to watchlist'}
          className={clsx(
            'w-9 h-9 rounded-xl flex items-center justify-center text-base transition-colors flex-shrink-0',
            isSaved ? 'text-warning' : 'text-fg-muted hover:text-fg'
          )}
          style={{ background: 'var(--surface-2)', border: '1px solid var(--border)' }}
        >
          {isSaved ? '★' : '☆'}
        </button>
        <label
          className="ml-auto flex items-center gap-1.5 text-xs text-fg-muted cursor-pointer select-none flex-shrink-0"
        >
          <input
            type="checkbox"
            checked={isComparing}
            onChange={() => onCompareToggle(brand)}
            className="accent-brand-500"
          />
          Compare
        </label>
      </div>

      {applyState === 'none' && (
        <p className="text-fg-muted text-xs text-center -mt-1">No active campaigns to apply to right now</p>
      )}
      {applyState && applyState !== 'done' && applyState !== 'none' && (
        <p className="text-danger text-xs text-center -mt-1">{applyState}</p>
      )}
    </div>
  );
}

BrandCard2.propTypes = {
  brand: PropTypes.shape({
    id:          PropTypes.string.isRequired,
    companyName: PropTypes.string.isRequired,
    industry:    PropTypes.string,
    location:    PropTypes.string,
    isVerified:  PropTypes.bool,
    description: PropTypes.string,
    logoUrl:     PropTypes.string,
    intel:       PropTypes.object,
  }).isRequired,
  onView:          PropTypes.func.isRequired,
  onApply:         PropTypes.func,
  onAIPitch:       PropTypes.func,
  onSave:          PropTypes.func.isRequired,
  isSaved:         PropTypes.bool,
  onCompareToggle: PropTypes.func.isRequired,
  isComparing:     PropTypes.bool,
  applyState:      PropTypes.string,
  isApplying:      PropTypes.bool,
};
