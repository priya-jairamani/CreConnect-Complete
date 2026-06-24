import PropTypes from 'prop-types';
import ChipMultiSelect from '@/components/common/ChipMultiSelect';
import Switch from '@/components/common/Switch';
import Badge from '@/components/common/Badge';

const CHARTS = ['Campaign Performance', 'Spend Over Time', 'Creator Growth', 'Engagement Trends', 'ROI by Campaign', 'Audience Demographics'];
const EXPORT_FORMATS = ['CSV', 'PDF', 'Excel'];
const KPIS = ['Reach', 'Engagement Rate', 'Conversion Rate', 'Cost per Engagement', 'ROI', 'Creator Satisfaction'];

export default function AnalyticsSection({ values, onChange, savedReports }) {
  return (
    <div className="space-y-6">
      <div>
        <h3 className="text-sm font-semibold text-fg-muted uppercase tracking-wide mb-3">Default Dashboard Charts</h3>
        <ChipMultiSelect options={CHARTS} value={values.defaultCharts} onChange={(v) => onChange('defaultCharts', v)} />
      </div>

      <div className="pt-2 border-t" style={{ borderColor: 'var(--border)' }}>
        <h3 className="text-sm font-semibold text-fg-muted uppercase tracking-wide mb-3 mt-5">KPI Tracking</h3>
        <ChipMultiSelect options={KPIS} value={values.trackedKpis} onChange={(v) => onChange('trackedKpis', v)} />
      </div>

      <div className="pt-2 border-t" style={{ borderColor: 'var(--border)' }}>
        <h3 className="text-sm font-semibold text-fg-muted uppercase tracking-wide mb-3 mt-5">Export Preferences</h3>
        <ChipMultiSelect options={EXPORT_FORMATS} value={values.exportFormats} onChange={(v) => onChange('exportFormats', v)} />
      </div>

      <div className="pt-2 border-t" style={{ borderColor: 'var(--border)' }}>
        <h3 className="text-sm font-semibold text-fg-muted uppercase tracking-wide mb-3 mt-5">Saved Reports</h3>
        <div className="space-y-2">
          {savedReports.map((r) => (
            <div key={r.id} className="card rounded-2xl p-3 flex items-center justify-between gap-3" style={{ background: 'var(--surface-2)' }}>
              <div className="flex items-center gap-3 min-w-0">
                <span className="w-9 h-9 rounded-xl bg-brand-500/12 text-brand-400 flex items-center justify-center text-base flex-shrink-0">📊</span>
                <p className="text-fg font-medium text-sm truncate">{r.name}</p>
              </div>
              <Badge variant="neutral" label={r.frequency} />
            </div>
          ))}
        </div>
      </div>

      <div className="pt-2 border-t" style={{ borderColor: 'var(--border)' }}>
        <h3 className="text-sm font-semibold text-fg-muted uppercase tracking-wide mb-3 mt-5">Custom Metrics</h3>
        <Switch
          checked={values.customMetricsEnabled}
          onChange={(v) => onChange('customMetricsEnabled', v)}
          label="Enable custom metric formulas"
          description="Build custom KPIs by combining campaign and creator data points"
        />
      </div>
    </div>
  );
}

AnalyticsSection.propTypes = {
  values: PropTypes.object.isRequired,
  onChange: PropTypes.func.isRequired,
  savedReports: PropTypes.array.isRequired,
};
