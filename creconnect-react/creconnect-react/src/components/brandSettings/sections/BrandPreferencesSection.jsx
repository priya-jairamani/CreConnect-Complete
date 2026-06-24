import PropTypes from 'prop-types';
import ChipMultiSelect from '@/components/common/ChipMultiSelect';
import Input from '@/components/common/Input';

const CATEGORIES = ['Fashion', 'Beauty', 'Fitness', 'Technology', 'Travel', 'Food', 'Gaming'];
const PLATFORMS = ['Instagram', 'TikTok', 'YouTube', 'LinkedIn', 'X'];
const GENDERS = ['Male', 'Female', 'Non-binary', 'All'];
const COUNTRIES = ['Pakistan', 'UAE', 'Saudi Arabia', 'India', 'United States', 'United Kingdom'];
const INTERESTS = ['Lifestyle', 'Sports', 'Music', 'Education', 'Finance', 'Parenting', 'Wellness'];

export default function BrandPreferencesSection({ values, onChange }) {
  return (
    <div className="space-y-6">
      <div>
        <h3 className="text-sm font-semibold text-fg-muted uppercase tracking-wide mb-3">Preferred Creator Categories</h3>
        <ChipMultiSelect options={CATEGORIES} value={values.preferredCategories} onChange={(v) => onChange('preferredCategories', v)} />
      </div>

      <div className="pt-2 border-t" style={{ borderColor: 'var(--border)' }}>
        <h3 className="text-sm font-semibold text-fg-muted uppercase tracking-wide mb-3 mt-5">Preferred Platforms</h3>
        <ChipMultiSelect options={PLATFORMS} value={values.preferredPlatforms} onChange={(v) => onChange('preferredPlatforms', v)} />
      </div>

      <div className="pt-2 border-t" style={{ borderColor: 'var(--border)' }}>
        <h3 className="text-sm font-semibold text-fg-muted uppercase tracking-wide mb-3 mt-5">Preferred Audience</h3>
        <div className="space-y-4">
          <div className="grid sm:grid-cols-2 gap-4">
            <Input label="Audience Age — Min" name="audienceAgeMin" type="number" value={values.audienceAgeMin} onChange={(e) => onChange('audienceAgeMin', e.target.value)} placeholder="18" />
            <Input label="Audience Age — Max" name="audienceAgeMax" type="number" value={values.audienceAgeMax} onChange={(e) => onChange('audienceAgeMax', e.target.value)} placeholder="34" />
          </div>
          <ChipMultiSelect label="Gender" options={GENDERS} value={values.audienceGenders} onChange={(v) => onChange('audienceGenders', v)} />
          <ChipMultiSelect label="Countries" options={COUNTRIES} value={values.audienceCountries} onChange={(v) => onChange('audienceCountries', v)} />
          <ChipMultiSelect label="Interests" options={INTERESTS} value={values.audienceInterests} onChange={(v) => onChange('audienceInterests', v)} />
        </div>
      </div>
    </div>
  );
}

BrandPreferencesSection.propTypes = {
  values: PropTypes.object.isRequired,
  onChange: PropTypes.func.isRequired,
};
