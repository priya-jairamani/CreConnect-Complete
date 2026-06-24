import PropTypes from 'prop-types';
import Input from '@/components/common/Input';
import ChipMultiSelect from '@/components/common/ChipMultiSelect';
import {
  PREFERRED_INDUSTRIES, PREFERRED_CAMPAIGN_TYPES, COLLAB_STYLES,
  REMOTE_ONSITE_OPTIONS, TRAVEL_AVAILABILITY_OPTIONS,
} from '@/constants/creatorOptions';

export default function PreferencesPanel({ values, onChange, readOnly }) {
  const set = (field) => (e) => onChange(field, e.target.value);

  return (
    <div className="space-y-5">
      <ChipMultiSelect
        label="Preferred Industries"
        options={PREFERRED_INDUSTRIES}
        value={values.preferredIndustries}
        onChange={(v) => !readOnly && onChange('preferredIndustries', v)}
        readOnly={readOnly}
      />
      <ChipMultiSelect
        label="Preferred Campaign Types"
        options={PREFERRED_CAMPAIGN_TYPES}
        value={values.preferredCampaignTypes}
        onChange={(v) => !readOnly && onChange('preferredCampaignTypes', v)}
        readOnly={readOnly}
      />

      <div className="grid sm:grid-cols-2 gap-4">
        <Input
          label="Minimum Budget (PKR)"
          name="budgetMin"
          type="number"
          value={values.budgetMin}
          onChange={set('budgetMin')}
          placeholder="20000"
          disabled={readOnly}
        />

        <div className="space-y-1.5">
          <label className="text-sm font-medium text-fg">Preferred Collaboration Style</label>
          <select className="input-base" value={values.collaborationStyle} onChange={set('collaborationStyle')} disabled={readOnly}>
            <option value="">Select style</option>
            {COLLAB_STYLES.map((c) => <option key={c} value={c}>{c}</option>)}
          </select>
        </div>

        <div className="space-y-1.5">
          <label className="text-sm font-medium text-fg">Remote / Onsite Preference</label>
          <select className="input-base" value={values.remoteOnsite} onChange={set('remoteOnsite')} disabled={readOnly}>
            <option value="">Select preference</option>
            {REMOTE_ONSITE_OPTIONS.map((c) => <option key={c} value={c}>{c}</option>)}
          </select>
        </div>

        <div className="space-y-1.5">
          <label className="text-sm font-medium text-fg">Travel Availability</label>
          <select className="input-base" value={values.travelAvailability} onChange={set('travelAvailability')} disabled={readOnly}>
            <option value="">Select availability</option>
            {TRAVEL_AVAILABILITY_OPTIONS.map((c) => <option key={c} value={c}>{c}</option>)}
          </select>
        </div>
      </div>
    </div>
  );
}

PreferencesPanel.propTypes = {
  values:   PropTypes.object.isRequired,
  onChange: PropTypes.func.isRequired,
  readOnly: PropTypes.bool,
};
