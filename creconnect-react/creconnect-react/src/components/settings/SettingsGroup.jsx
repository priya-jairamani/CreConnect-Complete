import PropTypes from 'prop-types';
import CollapsibleSection from '@/components/common/CollapsibleSection';
import Badge from '@/components/common/Badge';
import SettingField from './SettingField';

/** Renders one settings group (collapsible card) with all of its fields as a responsive grid. */
export default function SettingsGroup({ group, values, onChange, modifiedFields, defaultOpen = true, highlightFieldId }) {
  const modifiedCount = group.fields.filter((f) => modifiedFields.has(f.id)).length;

  return (
    <CollapsibleSection
      icon={group.icon}
      title={group.title}
      subtitle={group.subtitle}
      badge={modifiedCount > 0 ? <Badge variant="brand" label={`${modifiedCount} changed`} /> : null}
      defaultOpen={defaultOpen}
    >
      <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
        {group.fields.map((field) => (
          <div
            key={field.id}
            id={`field-${field.id}`}
            className={field.type === 'multiselect' || field.type === 'slider' ? 'md:col-span-2' : ''}
            style={highlightFieldId === field.id ? { outline: '2px solid var(--brand-500)', borderRadius: '0.75rem', padding: '0.5rem', margin: '-0.5rem' } : undefined}
          >
            <SettingField
              field={field}
              value={values[field.id]}
              onChange={onChange}
              isModified={modifiedFields.has(field.id)}
            />
          </div>
        ))}
      </div>
    </CollapsibleSection>
  );
}

SettingsGroup.propTypes = {
  group: PropTypes.shape({
    id: PropTypes.string.isRequired,
    title: PropTypes.string.isRequired,
    icon: PropTypes.node,
    subtitle: PropTypes.string,
    fields: PropTypes.array.isRequired,
  }).isRequired,
  // eslint-disable-next-line react/forbid-prop-types
  values: PropTypes.object.isRequired,
  onChange: PropTypes.func.isRequired,
  modifiedFields: PropTypes.instanceOf(Set).isRequired,
  defaultOpen: PropTypes.bool,
  highlightFieldId: PropTypes.string,
};
