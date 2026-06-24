import PropTypes from 'prop-types';
import ChipMultiSelect from '@/components/common/ChipMultiSelect';
import { PRIMARY_NICHES, CONTENT_FORMATS, CONTENT_STYLES_OPTIONS } from '@/constants/creatorOptions';

export default function SpecializationPanel({ values, onChange, readOnly }) {
  return (
    <div className="space-y-5">
      <ChipMultiSelect
        label="Primary Niches"
        options={PRIMARY_NICHES}
        value={values.niches}
        onChange={(v) => !readOnly && onChange('niches', v)}
        max={3}
        readOnly={readOnly}
      />
      <ChipMultiSelect
        label="Content Formats"
        options={CONTENT_FORMATS}
        value={values.contentFormats}
        onChange={(v) => !readOnly && onChange('contentFormats', v)}
        readOnly={readOnly}
      />
      <ChipMultiSelect
        label="Content Style"
        options={CONTENT_STYLES_OPTIONS}
        value={values.contentStyles}
        onChange={(v) => !readOnly && onChange('contentStyles', v)}
        readOnly={readOnly}
      />
    </div>
  );
}

SpecializationPanel.propTypes = {
  values: PropTypes.shape({
    niches:         PropTypes.arrayOf(PropTypes.string),
    contentFormats: PropTypes.arrayOf(PropTypes.string),
    contentStyles:  PropTypes.arrayOf(PropTypes.string),
  }).isRequired,
  onChange: PropTypes.func.isRequired,
  readOnly: PropTypes.bool,
};
