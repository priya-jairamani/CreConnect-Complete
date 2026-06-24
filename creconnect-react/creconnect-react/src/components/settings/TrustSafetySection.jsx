import PropTypes from 'prop-types';
import GenericSettingsSection from './GenericSettingsSection';

/** Moderation & risk controls — reporting rules, fraud detection & content moderation thresholds. */
export default function TrustSafetySection({ values, onChange, modifiedFields, highlightFieldId }) {
  return (
    <GenericSettingsSection
      sectionId="trust_safety"
      values={values}
      onChange={onChange}
      modifiedFields={modifiedFields}
      highlightFieldId={highlightFieldId}
    />
  );
}

TrustSafetySection.propTypes = {
  // eslint-disable-next-line react/forbid-prop-types
  values: PropTypes.object.isRequired,
  onChange: PropTypes.func.isRequired,
  modifiedFields: PropTypes.instanceOf(Set).isRequired,
  highlightFieldId: PropTypes.string,
};
