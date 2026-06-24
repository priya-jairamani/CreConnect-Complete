import PropTypes from 'prop-types';
import CollapsibleSection from '@/components/common/CollapsibleSection';
import ChipMultiSelect from '@/components/common/ChipMultiSelect';
import Badge from '@/components/common/Badge';
import Button from '@/components/common/Button';
import {
  INDUSTRIES, BUDGET_TIERS, BRAND_SIZES, LOCATIONS, CAMPAIGN_TYPES,
  CREATOR_REQUIREMENTS, AUDIENCE_SIZES, LANGUAGES, RESPONSE_TIMES,
} from '@/constants/discoveryOptions';

export default function AdvancedFilters({ filters, onChange, onClear, activeCount }) {
  const set = (key) => (value) => onChange(key, value);

  return (
    <CollapsibleSection
      icon="🧭"
      title="Advanced Filters"
      subtitle="Narrow down brands and campaigns by exactly what matters to you"
      defaultOpen={false}
      badge={activeCount > 0 ? <Badge variant="brand" label={`${activeCount} active`} /> : null}
    >
      <div className="space-y-5">
        <ChipMultiSelect label="Industry" options={INDUSTRIES} value={filters.industries} onChange={set('industries')} />
        <ChipMultiSelect label="Campaign Budget" options={BUDGET_TIERS} value={filters.budgetTiers} onChange={set('budgetTiers')} />
        <ChipMultiSelect label="Brand Size" options={BRAND_SIZES} value={filters.brandSizes} onChange={set('brandSizes')} />
        <ChipMultiSelect label="Location" options={LOCATIONS} value={filters.locations} onChange={set('locations')} />
        <ChipMultiSelect label="Campaign Type" options={CAMPAIGN_TYPES} value={filters.campaignTypes} onChange={set('campaignTypes')} />
        <ChipMultiSelect label="Creator Requirements" options={CREATOR_REQUIREMENTS} value={filters.creatorRequirements} onChange={set('creatorRequirements')} />
        <ChipMultiSelect label="Audience Size" options={AUDIENCE_SIZES} value={filters.audienceSizes} onChange={set('audienceSizes')} />
        <ChipMultiSelect label="Languages" options={LANGUAGES} value={filters.languages} onChange={set('languages')} />
        <ChipMultiSelect label="Response Time" options={RESPONSE_TIMES} value={filters.responseTimes} onChange={set('responseTimes')} />

        <div className="space-y-1.5">
          <label className="text-sm font-medium text-fg">Verification Status</label>
          <div className="flex flex-wrap gap-2">
            <button
              type="button"
              onClick={() => onChange('verifiedOnly', !filters.verifiedOnly)}
              className="px-3 py-1.5 rounded-full text-xs font-medium transition-all"
              style={
                filters.verifiedOnly
                  ? { background: 'linear-gradient(135deg, #6d5cff, #4c2dd1)', color: '#fff' }
                  : { background: 'var(--surface-2)', color: 'var(--fg-muted)', border: '1px solid var(--border)' }
              }
            >
              ✓ Verified Brands Only
            </button>
          </div>
        </div>

        {activeCount > 0 && (
          <div className="pt-1">
            <Button variant="secondary" size="sm" onClick={onClear}>Clear all filters</Button>
          </div>
        )}
      </div>
    </CollapsibleSection>
  );
}

AdvancedFilters.propTypes = {
  filters: PropTypes.shape({
    industries:          PropTypes.arrayOf(PropTypes.string),
    budgetTiers:         PropTypes.arrayOf(PropTypes.string),
    brandSizes:          PropTypes.arrayOf(PropTypes.string),
    locations:           PropTypes.arrayOf(PropTypes.string),
    campaignTypes:       PropTypes.arrayOf(PropTypes.string),
    creatorRequirements: PropTypes.arrayOf(PropTypes.string),
    audienceSizes:       PropTypes.arrayOf(PropTypes.string),
    languages:           PropTypes.arrayOf(PropTypes.string),
    responseTimes:       PropTypes.arrayOf(PropTypes.string),
    verifiedOnly:        PropTypes.bool,
  }).isRequired,
  onChange:    PropTypes.func.isRequired,
  onClear:     PropTypes.func.isRequired,
  activeCount: PropTypes.number.isRequired,
};
