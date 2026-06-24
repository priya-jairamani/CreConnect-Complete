import PropTypes from 'prop-types';
import GenericSettingsSection from './GenericSettingsSection';

/** The marketplace operating system — campaign rules, collaboration rules & marketplace economics. */
export default function MarketplaceRulesPanel({ values, onChange, modifiedFields, highlightFieldId }) {
  return (
    <GenericSettingsSection
      sectionId="marketplace"
      values={values}
      onChange={onChange}
      modifiedFields={modifiedFields}
      highlightFieldId={highlightFieldId}
    />
  );
}

MarketplaceRulesPanel.propTypes = {
  // eslint-disable-next-line react/forbid-prop-types
  values: PropTypes.object.isRequired,
  onChange: PropTypes.func.isRequired,
  modifiedFields: PropTypes.instanceOf(Set).isRequired,
  highlightFieldId: PropTypes.string,
};
