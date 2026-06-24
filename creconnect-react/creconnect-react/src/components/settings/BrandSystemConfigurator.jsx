import PropTypes from 'prop-types';
import Badge from '@/components/common/Badge';
import GenericSettingsSection from './GenericSettingsSection';
import { SETTINGS_SCHEMA } from '@/utils/mockSettings';

/** Configures brand profile rules, verification engine, safety controls & the brand trust system weights. */
export default function BrandSystemConfigurator({ values, onChange, modifiedFields, highlightFieldId }) {
  const trustFields = SETTINGS_SCHEMA.brand.find((g) => g.id === 'trust_system')?.fields ?? [];
  const totalWeight = trustFields.reduce((sum, f) => sum + (Number(values[f.id]) || 0), 0);

  return (
    <div className="space-y-5">
      <GenericSettingsSection
        sectionId="brand"
        values={values}
        onChange={onChange}
        modifiedFields={modifiedFields}
        highlightFieldId={highlightFieldId}
        groupIds={['profile_rules', 'verification_engine', 'safety_controls']}
      />

      <div>
        <div className="flex items-center justify-between mb-3 px-1">
          <p className="text-xs text-fg-muted">Brand Trust System weights should total 100%.</p>
          <Badge variant={totalWeight === 100 ? 'success' : 'warning'} label={`Total: ${totalWeight}%`} />
        </div>
        <GenericSettingsSection
          sectionId="brand"
          values={values}
          onChange={onChange}
          modifiedFields={modifiedFields}
          highlightFieldId={highlightFieldId}
          groupIds={['trust_system']}
        />
      </div>
    </div>
  );
}

BrandSystemConfigurator.propTypes = {
  // eslint-disable-next-line react/forbid-prop-types
  values: PropTypes.object.isRequired,
  onChange: PropTypes.func.isRequired,
  modifiedFields: PropTypes.instanceOf(Set).isRequired,
  highlightFieldId: PropTypes.string,
};
