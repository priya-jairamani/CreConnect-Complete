import PropTypes from 'prop-types';
import SettingsGroup from './SettingsGroup';
import { SETTINGS_SCHEMA } from '@/utils/mockSettings';

/** Renders every settings group for a section straight from SETTINGS_SCHEMA. */
export default function GenericSettingsSection({ sectionId, values, onChange, modifiedFields, highlightFieldId, groupIds }) {
  const groups = (SETTINGS_SCHEMA[sectionId] ?? []).filter((g) => !groupIds || groupIds.includes(g.id));

  return (
    <div className="space-y-5">
      {groups.map((group) => (
        <SettingsGroup
          key={group.id}
          group={group}
          values={values}
          onChange={onChange}
          modifiedFields={modifiedFields}
          highlightFieldId={highlightFieldId}
        />
      ))}
    </div>
  );
}

GenericSettingsSection.propTypes = {
  sectionId: PropTypes.string.isRequired,
  // eslint-disable-next-line react/forbid-prop-types
  values: PropTypes.object.isRequired,
  onChange: PropTypes.func.isRequired,
  modifiedFields: PropTypes.instanceOf(Set).isRequired,
  highlightFieldId: PropTypes.string,
  groupIds: PropTypes.arrayOf(PropTypes.string),
};
