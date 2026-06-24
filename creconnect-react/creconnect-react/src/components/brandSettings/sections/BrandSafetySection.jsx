import { useState } from 'react';
import PropTypes from 'prop-types';
import ChipMultiSelect from '@/components/common/ChipMultiSelect';
import Switch from '@/components/common/Switch';
import Button from '@/components/common/Button';
import Badge from '@/components/common/Badge';

const BLOCKED_CATEGORIES = ['Adult Content', 'Gambling', 'Alcohol', 'Tobacco', 'Politics', 'Controversial Topics'];

export default function BrandSafetySection({ values, onChange, onSave, isSaving }) {
  const [keywordInput, setKeywordInput] = useState('');

  const addKeyword = () => {
    const word = keywordInput.trim();
    if (!word || values.restrictedKeywords.includes(word)) return;
    onChange('restrictedKeywords', [...values.restrictedKeywords, word]);
    setKeywordInput('');
  };

  const removeKeyword = (word) => {
    onChange('restrictedKeywords', values.restrictedKeywords.filter((w) => w !== word));
  };

  return (
    <div className="space-y-6">
      <div>
        <h3 className="text-sm font-semibold text-fg-muted uppercase tracking-wide mb-3">Blocked Content Categories</h3>
        <ChipMultiSelect options={BLOCKED_CATEGORIES} value={values.blockedCategories} onChange={(v) => onChange('blockedCategories', v)} />
      </div>

      <div className="pt-2 border-t" style={{ borderColor: 'var(--border)' }}>
        <h3 className="text-sm font-semibold text-fg-muted uppercase tracking-wide mb-3 mt-5">Restricted Keywords</h3>
        <p className="text-fg-muted text-xs mb-2">Creator content containing these keywords will be flagged for review.</p>
        <div className="flex gap-2 mb-2">
          <input
            type="text"
            className="input-base flex-1"
            value={keywordInput}
            onChange={(e) => setKeywordInput(e.target.value)}
            onKeyDown={(e) => { if (e.key === 'Enter') { e.preventDefault(); addKeyword(); } }}
            placeholder="Add a keyword and press Enter"
          />
          <Button variant="secondary" size="md" onClick={addKeyword}>Add</Button>
        </div>
        <div className="flex flex-wrap gap-2">
          {values.restrictedKeywords.map((w) => (
            <button key={w} type="button" onClick={() => removeKeyword(w)}>
              <Badge variant="neutral" label={`${w}  ✕`} className="cursor-pointer" />
            </button>
          ))}
          {values.restrictedKeywords.length === 0 && (
            <p className="text-fg-muted text-xs">No restricted keywords yet.</p>
          )}
        </div>
      </div>

      <div className="pt-2 border-t" style={{ borderColor: 'var(--border)' }}>
        <h3 className="text-sm font-semibold text-fg-muted uppercase tracking-wide mb-3 mt-5">Content Guidelines</h3>
        <textarea
          className="input-base w-full min-h-[100px] resize-y"
          value={values.contentGuidelines}
          onChange={(e) => onChange('contentGuidelines', e.target.value)}
          placeholder="Describe tone, style, and brand-safety expectations for creator content."
        />
        {onSave && (
          <div className="flex justify-end mt-3">
            <Button variant="primary" size="sm" isLoading={isSaving} onClick={onSave}>
              Save Guidelines
            </Button>
          </div>
        )}
      </div>

      <div className="pt-2 border-t" style={{ borderColor: 'var(--border)' }}>
        <h3 className="text-sm font-semibold text-fg-muted uppercase tracking-wide mb-3 mt-5">Creator Screening &amp; Fraud Detection</h3>
        <div className="space-y-1">
          <div className="py-2.5 border-b" style={{ borderColor: 'var(--border)' }}>
            <Switch
              checked={values.screenMinFollowers}
              onChange={(v) => onChange('screenMinFollowers', v)}
              label="Require minimum follower threshold"
              description="Auto-reject applications from creators below your minimum audience size"
            />
          </div>
          <div className="py-2.5 border-b" style={{ borderColor: 'var(--border)' }}>
            <Switch
              checked={values.screenEngagementRate}
              onChange={(v) => onChange('screenEngagementRate', v)}
              label="Require minimum engagement rate"
              description="Flag creators with abnormally low engagement for review"
            />
          </div>
          <div className="py-2.5">
            <Switch
              checked={values.fraudDetection}
              onChange={(v) => onChange('fraudDetection', v)}
              label="Enable AI fraud detection"
              description="Automatically flag suspicious follower growth, fake engagement, or bot activity"
            />
          </div>
        </div>
      </div>
    </div>
  );
}

BrandSafetySection.propTypes = {
  values:   PropTypes.object.isRequired,
  onChange: PropTypes.func.isRequired,
  onSave:   PropTypes.func,
  isSaving: PropTypes.bool,
};
