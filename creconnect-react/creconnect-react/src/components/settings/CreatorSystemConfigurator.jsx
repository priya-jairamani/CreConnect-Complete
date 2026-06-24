import PropTypes from 'prop-types';
import Badge from '@/components/common/Badge';
import GenericSettingsSection from './GenericSettingsSection';
import { SETTINGS_SCHEMA } from '@/utils/mockSettings';

/** Configures creator profile requirements, verification rules, eligibility, safety & the reputation engine weights. */
export default function CreatorSystemConfigurator({ values, onChange, modifiedFields, highlightFieldId }) {
  const reputationFields = SETTINGS_SCHEMA.creator.find((g) => g.id === 'reputation')?.fields ?? [];
  const totalWeight = reputationFields.reduce((sum, f) => sum + (Number(values[f.id]) || 0), 0);

  return (
    <div className="space-y-5">
      <GenericSettingsSection
        sectionId="creator"
        values={values}
        onChange={onChange}
        modifiedFields={modifiedFields}
        highlightFieldId={highlightFieldId}
        groupIds={['profile', 'verification', 'eligibility', 'safety']}
      />

      <div>
        <div className="flex items-center justify-between mb-3 px-1">
          <p className="text-xs text-fg-muted">Creator Reputation Engine weights should total 100%.</p>
          <Badge variant={totalWeight === 100 ? 'success' : 'warning'} label={`Total: ${totalWeight}%`} />
        </div>
        <GenericSettingsSection
          sectionId="creator"
          values={values}
          onChange={onChange}
          modifiedFields={modifiedFields}
          highlightFieldId={highlightFieldId}
          groupIds={['reputation']}
        />
      </div>
    </div>
  );
}

CreatorSystemConfigurator.propTypes = {
  // eslint-disable-next-line react/forbid-prop-types
  values: PropTypes.object.isRequired,
  onChange: PropTypes.func.isRequired,
  modifiedFields: PropTypes.instanceOf(Set).isRequired,
  highlightFieldId: PropTypes.string,
};
