import PropTypes from 'prop-types';
import CollapsibleSection from '@/components/common/CollapsibleSection';
import Badge from '@/components/common/Badge';
import GenericSettingsSection from './GenericSettingsSection';
import PermissionMatrix from './PermissionMatrix';
import { SUBSCRIPTION_PLANS, FEATURE_ACCESS_MATRIX } from '@/utils/mockSettings';

/** Platform financial configuration — revenue settings, subscription plans & feature access matrix. */
export default function BillingRevenueSection({ values, onChange, modifiedFields, highlightFieldId, featureMatrix, onToggleFeature }) {
  return (
    <div className="space-y-5">
      <GenericSettingsSection
        sectionId="billing"
        values={values}
        onChange={onChange}
        modifiedFields={modifiedFields}
        highlightFieldId={highlightFieldId}
      />

      <CollapsibleSection icon="📦" title="Subscription Management" subtitle="Plans available to creators & brands.">
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          {SUBSCRIPTION_PLANS.map((plan) => (
            <div key={plan.id} className="rounded-xl p-4" style={{ background: 'var(--surface-2)' }}>
              <div className="flex items-center justify-between mb-1">
                <p className="text-sm font-semibold text-fg" style={{ fontFamily: 'Sora, sans-serif' }}>{plan.name}</p>
                <Badge variant="brand" label={plan.audience} />
              </div>
              <p className="text-lg font-bold text-fg mb-1" style={{ fontFamily: 'Sora, sans-serif' }}>{plan.price}</p>
              <p className="text-xs text-fg-muted">{plan.description}</p>
              <p className="text-xs text-fg-muted mt-2">{plan.activeUsers.toLocaleString()} active accounts</p>
            </div>
          ))}
        </div>
      </CollapsibleSection>

      <PermissionMatrix
        title={FEATURE_ACCESS_MATRIX.title}
        description={FEATURE_ACCESS_MATRIX.description}
        rows={FEATURE_ACCESS_MATRIX.rows}
        columns={FEATURE_ACCESS_MATRIX.columns}
        value={featureMatrix}
        onToggle={onToggleFeature}
      />
    </div>
  );
}

BillingRevenueSection.propTypes = {
  // eslint-disable-next-line react/forbid-prop-types
  values: PropTypes.object.isRequired,
  onChange: PropTypes.func.isRequired,
  modifiedFields: PropTypes.instanceOf(Set).isRequired,
  highlightFieldId: PropTypes.string,
  // eslint-disable-next-line react/forbid-prop-types
  featureMatrix: PropTypes.object.isRequired,
  onToggleFeature: PropTypes.func.isRequired,
};
