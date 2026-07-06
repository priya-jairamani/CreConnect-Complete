import PropTypes from 'prop-types';

export const FILTER_OPTIONS = {
  dateRange: ['Today', 'This Week', 'This Month', 'This Quarter', 'This Year'],
  region: ['All Regions', 'Lahore', 'Karachi', 'Islamabad', 'Rawalpindi', 'International'],
  industry: ['All Industries', 'Beauty', 'Fashion', 'Technology', 'Food & Beverage', 'Travel'],
  campaignType: ['All Types', 'Sponsored Post', 'Reel/Video', 'Unboxing', 'Long-term Partnership'],
  creatorCategory: ['All Categories', 'Nano (1K-10K)', 'Micro (10K-100K)', 'Mid (100K-500K)', 'Macro (500K+)'],
};

const FIELDS = [
  { key: 'dateRange', label: 'Date Range' },
  { key: 'region', label: 'Region' },
  { key: 'industry', label: 'Industry' },
  { key: 'campaignType', label: 'Campaign Type' },
  { key: 'creatorCategory', label: 'Creator Category' },
];

/** Global dashboard filter bar — Date Range, Region, Industry, Campaign Type, Creator Category. */
export default function DashboardFilters({ filters, onChange }) {
  return (
    <div className="card rounded-2xl p-4 flex flex-wrap gap-3 items-center">
      <span className="text-xs font-semibold text-fg-muted uppercase tracking-wide mr-1">Filters</span>
      {FIELDS.map((field) => (
        <select
          key={field.key}
          value={filters[field.key]}
          onChange={(e) => onChange(field.key, e.target.value)}
          className="input-base text-sm py-1.5 px-3 rounded-lg w-auto"
          aria-label={field.label}
        >
          {FILTER_OPTIONS[field.key].map((opt) => (
            <option key={opt} value={opt}>{opt}</option>
          ))}
        </select>
      ))}
    </div>
  );
}

DashboardFilters.propTypes = {
  filters: PropTypes.object.isRequired,
  onChange: PropTypes.func.isRequired,
};
