import PropTypes from 'prop-types';
import GenericSettingsSection from './GenericSettingsSection';

/** Global platform controls — identity, behavior toggles & platform-wide limits. */
export default function PlatformConfigSection({ values, onChange, modifiedFields, highlightFieldId }) {
  return (
    <GenericSettingsSection
      sectionId="platform"
      values={values}
      onChange={onChange}
      modifiedFields={modifiedFields}
      highlightFieldId={highlightFieldId}
    />
  );
}

PlatformConfigSection.propTypes = {
  // eslint-disable-next-line react/forbid-prop-types
  values: PropTypes.object.isRequired,
  onChange: PropTypes.func.isRequired,
  modifiedFields: PropTypes.instanceOf(Set).isRequired,
  highlightFieldId: PropTypes.string,
};
