import PropTypes from 'prop-types';
import GenericSettingsSection from './GenericSettingsSection';
import PermissionMatrix from './PermissionMatrix';
import { PRIVACY_MATRIX } from '@/utils/mockSettings';

/** Enterprise-grade privacy management — data privacy center, compliance center & a granular user privacy matrix. */
export default function PrivacyControlCenter({ values, onChange, modifiedFields, highlightFieldId, privacyMatrix, onTogglePrivacy }) {
  return (
    <div className="space-y-5">
      <GenericSettingsSection
        sectionId="privacy"
        values={values}
        onChange={onChange}
        modifiedFields={modifiedFields}
        highlightFieldId={highlightFieldId}
      />
      <PermissionMatrix
        title={PRIVACY_MATRIX.title}
        description={PRIVACY_MATRIX.description}
        rows={PRIVACY_MATRIX.rows}
        columns={PRIVACY_MATRIX.columns}
        value={privacyMatrix}
        onToggle={onTogglePrivacy}
      />
    </div>
  );
}

PrivacyControlCenter.propTypes = {
  // eslint-disable-next-line react/forbid-prop-types
  values: PropTypes.object.isRequired,
  onChange: PropTypes.func.isRequired,
  modifiedFields: PropTypes.instanceOf(Set).isRequired,
  highlightFieldId: PropTypes.string,
  // eslint-disable-next-line react/forbid-prop-types
  privacyMatrix: PropTypes.object.isRequired,
  onTogglePrivacy: PropTypes.func.isRequired,
};
