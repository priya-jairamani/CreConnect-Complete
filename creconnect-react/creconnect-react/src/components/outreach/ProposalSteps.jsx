import PropTypes from 'prop-types';
import Input from '@/components/common/Input';
import Button from '@/components/common/Button';
import ChipMultiSelect from '@/components/common/ChipMultiSelect';
import Avatar from '@/components/common/Avatar';
import {
  CAMPAIGN_OBJECTIVES, CAMPAIGN_CATEGORIES, TARGET_KPIS, PLATFORMS, AUDIENCE_COUNTRIES, LANGUAGES,
  DELIVERABLE_TYPES, DELIVERABLE_TYPE_ICONS, BUDGET_TYPES, EXCLUSIVITY_PERIODS,
  CONTENT_OWNERSHIP_OPTIONS, USAGE_RIGHTS_OPTIONS, LICENSING_TERMS,
} from '@/constants/outreachOptions';
import { generateOutreachMessage, generateProposalSummary } from '@/utils/mockOutreachIntel';

/* ----------------------------------------------------------------------- */
/* Shared field helpers                                                     */
/* ----------------------------------------------------------------------- */

function Field({ label, hint, children }) {
  return (
    <div className="flex flex-col gap-1.5">
      <label className="text-sm font-medium text-fg">{label}</label>
      {children}
      {hint && <p className="text-fg-muted text-xs">{hint}</p>}
    </div>
  );
}

Field.propTypes = {
  label: PropTypes.string.isRequired,
  hint: PropTypes.string,
  children: PropTypes.node.isRequired,
};

function Select({ value, onChange, options, placeholder }) {
  return (
    <select value={value ?? ''} onChange={onChange} className="input-base w-full">
      {placeholder && <option value="">{placeholder}</option>}
      {options.map((o) => <option key={o} value={o}>{o}</option>)}
    </select>
  );
}

Select.propTypes = {
  value: PropTypes.string,
  onChange: PropTypes.func.isRequired,
  options: PropTypes.arrayOf(PropTypes.string).isRequired,
  placeholder: PropTypes.string,
};

function Textarea({ value, onChange, placeholder, rows = 4 }) {
  return (
    <textarea
      value={value ?? ''}
      onChange={onChange}
      placeholder={placeholder}
      rows={rows}
      className="input-base w-full resize-none"
    />
  );
}

Textarea.propTypes = {
  value: PropTypes.string,
  onChange: PropTypes.func.isRequired,
  placeholder: PropTypes.string,
  rows: PropTypes.number,
};

/* ----------------------------------------------------------------------- */
/* 1. Campaign Overview                                                     */
/* ----------------------------------------------------------------------- */

export function OverviewStep({ proposal, onChange }) {
  return (
    <div className="space-y-4">
      <Input
        label="Campaign Title"
        name="title"
        value={proposal.title ?? ''}
        onChange={(e) => onChange({ title: e.target.value })}
        placeholder="e.g. Summer Glow Skincare Launch"
        required
      />
      <div className="grid sm:grid-cols-2 gap-4">
        <Field label="Objective">
          <Select value={proposal.objective} onChange={(e) => onChange({ objective: e.target.value })} options={CAMPAIGN_OBJECTIVES} placeholder="Select objective" />
        </Field>
        <Field label="Category">
          <Select value={proposal.category} onChange={(e) => onChange({ category: e.target.value })} options={CAMPAIGN_CATEGORIES} placeholder="Select category" />
        </Field>
      </div>
      <Field label="Description">
        <Textarea value={proposal.description} onChange={(e) => onChange({ description: e.target.value })} placeholder="Describe the campaign concept and what you want creators to do…" />
      </Field>
      <Field label="Campaign Goals">
        <Textarea value={proposal.goals} onChange={(e) => onChange({ goals: e.target.value })} placeholder="What does success look like for this campaign?" rows={3} />
      </Field>
      <ChipMultiSelect label="Target KPIs" options={TARGET_KPIS} value={proposal.targetKpis ?? []} onChange={(v) => onChange({ targetKpis: v })} />
    </div>
  );
}

OverviewStep.propTypes = { proposal: PropTypes.object.isRequired, onChange: PropTypes.func.isRequired };

/* ----------------------------------------------------------------------- */
/* 2. Creator Requirements                                                  */
/* ----------------------------------------------------------------------- */

export function RequirementsStep({ proposal, onChange }) {
  return (
    <div className="space-y-4">
      <ChipMultiSelect label="Target Niches" options={CAMPAIGN_CATEGORIES} value={proposal.niches ?? []} onChange={(v) => onChange({ niches: v })} max={5} />
      <ChipMultiSelect label="Required Platforms" options={PLATFORMS} value={proposal.requiredPlatforms ?? []} onChange={(v) => onChange({ requiredPlatforms: v })} />
      <div className="grid sm:grid-cols-2 gap-4">
        <Input
          label="Minimum Followers"
          name="minFollowers"
          type="number"
          value={proposal.minFollowers ?? ''}
          onChange={(e) => onChange({ minFollowers: e.target.value })}
          placeholder="e.g. 10000"
        />
        <Input
          label="Minimum Engagement Rate (%)"
          name="minEngagement"
          type="number"
          value={proposal.minEngagement ?? ''}
          onChange={(e) => onChange({ minEngagement: e.target.value })}
          placeholder="e.g. 2.5"
        />
      </div>
      <ChipMultiSelect label="Audience Countries" options={AUDIENCE_COUNTRIES} value={proposal.audienceCountries ?? []} onChange={(v) => onChange({ audienceCountries: v })} />
      <ChipMultiSelect label="Languages" options={LANGUAGES} value={proposal.languages ?? []} onChange={(v) => onChange({ languages: v })} />
    </div>
  );
}

RequirementsStep.propTypes = { proposal: PropTypes.object.isRequired, onChange: PropTypes.func.isRequired };

/* ----------------------------------------------------------------------- */
/* 3. Deliverables                                                          */
/* ----------------------------------------------------------------------- */

export function DeliverablesStep({ proposal, onChange }) {
  const deliverables = proposal.deliverables ?? [];

  const update = (index, patch) => {
    const next = deliverables.map((d, i) => (i === index ? { ...d, ...patch } : d));
    onChange({ deliverables: next });
  };

  const add = () => {
    onChange({ deliverables: [...deliverables, { type: DELIVERABLE_TYPES[0], quantity: 1, dueDate: '', approvalRequired: true, revisionLimit: 1 }] });
  };

  const remove = (index) => {
    onChange({ deliverables: deliverables.filter((_, i) => i !== index) });
  };

  return (
    <div className="space-y-4">
      {deliverables.length === 0 && (
        <p className="text-fg-muted text-sm">No deliverables added yet. Add the content types you expect creators to produce.</p>
      )}
      <div className="space-y-3">
        {deliverables.map((d, index) => (
          <div key={index} className="rounded-xl p-3 space-y-3" style={{ background: 'var(--surface-2)', border: '1px solid var(--border)' }}>
            <div className="flex items-center justify-between gap-2">
              <div className="flex items-center gap-2 min-w-0">
                <span className="text-lg flex-shrink-0">{DELIVERABLE_TYPE_ICONS[d.type] ?? '📄'}</span>
                <Select value={d.type} onChange={(e) => update(index, { type: e.target.value })} options={DELIVERABLE_TYPES} />
              </div>
              <button onClick={() => remove(index)} className="text-fg-muted hover:text-danger text-xs flex-shrink-0">✕ Remove</button>
            </div>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
              <Input label="Quantity" name={`qty-${index}`} type="number" value={String(d.quantity ?? 1)} onChange={(e) => update(index, { quantity: Number(e.target.value) || 0 })} />
              <Input label="Due Date" name={`due-${index}`} type="date" value={d.dueDate ?? ''} onChange={(e) => update(index, { dueDate: e.target.value })} />
              <Input label="Revision Limit" name={`rev-${index}`} type="number" value={String(d.revisionLimit ?? 1)} onChange={(e) => update(index, { revisionLimit: Number(e.target.value) || 0 })} />
              <Field label="Approval Required">
                <label className="flex items-center gap-2 h-[38px]">
                  <input type="checkbox" checked={!!d.approvalRequired} onChange={(e) => update(index, { approvalRequired: e.target.checked })} className="w-4 h-4 rounded accent-brand-500" />
                  <span className="text-fg-muted text-xs">{d.approvalRequired ? 'Yes' : 'No'}</span>
                </label>
              </Field>
            </div>
          </div>
        ))}
      </div>
      <Button variant="outline" size="sm" onClick={add}>+ Add Deliverable</Button>
    </div>
  );
}

DeliverablesStep.propTypes = { proposal: PropTypes.object.isRequired, onChange: PropTypes.func.isRequired };

/* ----------------------------------------------------------------------- */
/* 4. Budget Configuration                                                  */
/* ----------------------------------------------------------------------- */

export function BudgetStep({ proposal, onChange }) {
  return (
    <div className="space-y-4">
      <Field label="Budget Type">
        <Select value={proposal.budgetType} onChange={(e) => onChange({ budgetType: e.target.value })} options={BUDGET_TYPES} placeholder="Select budget type" />
      </Field>
      <div className="grid sm:grid-cols-2 gap-4">
        <Input
          label="Total Budget (PKR)"
          name="budgetTotal"
          type="number"
          value={proposal.budgetTotal ?? ''}
          onChange={(e) => onChange({ budgetTotal: e.target.value })}
          placeholder="e.g. 150000"
          prefix="₨"
        />
        <Input
          label="Creator Payout (PKR)"
          name="creatorPayout"
          type="number"
          value={proposal.creatorPayout ?? ''}
          onChange={(e) => onChange({ creatorPayout: e.target.value })}
          placeholder="e.g. 100000"
          prefix="₨"
        />
        <Input
          label="Bonus Incentives (PKR)"
          name="bonusIncentives"
          type="number"
          value={proposal.bonusIncentives ?? ''}
          onChange={(e) => onChange({ bonusIncentives: e.target.value })}
          placeholder="Optional"
          prefix="₨"
        />
        <Input
          label="Affiliate Commission (%)"
          name="affiliateCommission"
          type="number"
          value={proposal.affiliateCommission ?? ''}
          onChange={(e) => onChange({ affiliateCommission: e.target.value })}
          placeholder="Optional"
          suffix="%"
        />
      </div>
      <Input
        label="Performance Rewards (PKR)"
        name="performanceRewards"
        type="number"
        value={proposal.performanceRewards ?? ''}
        onChange={(e) => onChange({ performanceRewards: e.target.value })}
        placeholder="Optional bonus per conversion / KPI hit"
        prefix="₨"
      />
    </div>
  );
}

BudgetStep.propTypes = { proposal: PropTypes.object.isRequired, onChange: PropTypes.func.isRequired };

/* ----------------------------------------------------------------------- */
/* 5. Timeline                                                              */
/* ----------------------------------------------------------------------- */

const TIMELINE_FIELDS = [
  { key: 'start', label: 'Campaign Start', icon: '🚦' },
  { key: 'confirmation', label: 'Creator Confirmation', icon: '🤝' },
  { key: 'submission', label: 'Content Submission', icon: '📤' },
  { key: 'review', label: 'Review Stage', icon: '🔍' },
  { key: 'publishing', label: 'Publishing Date', icon: '📅' },
  { key: 'completion', label: 'Completion Date', icon: '🏁' },
];

export function TimelineStep({ proposal, onChange }) {
  const timeline = proposal.timeline ?? {};

  const update = (key, value) => {
    onChange({ timeline: { ...timeline, [key]: value } });
  };

  return (
    <div className="space-y-3">
      {TIMELINE_FIELDS.map((field, index) => (
        <div key={field.key} className="flex items-center gap-3">
          <div className="flex flex-col items-center flex-shrink-0">
            <span
              className="w-9 h-9 rounded-full flex items-center justify-center text-base"
              style={{ background: 'var(--surface-2)', border: '1px solid var(--border)' }}
            >
              {field.icon}
            </span>
            {index < TIMELINE_FIELDS.length - 1 && (
              <span className="w-px flex-1 my-1" style={{ background: 'var(--border)', minHeight: '14px' }} />
            )}
          </div>
          <div className="flex-1 pb-3">
            <Input
              label={field.label}
              name={`timeline-${field.key}`}
              type="date"
              value={timeline[field.key] ?? ''}
              onChange={(e) => update(field.key, e.target.value)}
            />
          </div>
        </div>
      ))}
    </div>
  );
}

TimelineStep.propTypes = { proposal: PropTypes.object.isRequired, onChange: PropTypes.func.isRequired };

/* ----------------------------------------------------------------------- */
/* 6. Contract Settings                                                     */
/* ----------------------------------------------------------------------- */

export function ContractStep({ proposal, onChange }) {
  const contract = proposal.contract ?? {};

  const update = (patch) => onChange({ contract: { ...contract, ...patch } });

  return (
    <div className="space-y-4">
      <div className="grid sm:grid-cols-2 gap-4">
        <Field label="NDA Required">
          <label className="flex items-center gap-2 h-[38px]">
            <input type="checkbox" checked={!!contract.ndaRequired} onChange={(e) => update({ ndaRequired: e.target.checked })} className="w-4 h-4 rounded accent-brand-500" />
            <span className="text-fg-muted text-sm">{contract.ndaRequired ? 'Yes — creators must sign an NDA' : 'No NDA required'}</span>
          </label>
        </Field>
        <Field label="Whitelisting Rights">
          <label className="flex items-center gap-2 h-[38px]">
            <input type="checkbox" checked={!!contract.whitelistingRights} onChange={(e) => update({ whitelistingRights: e.target.checked })} className="w-4 h-4 rounded accent-brand-500" />
            <span className="text-fg-muted text-sm">{contract.whitelistingRights ? 'Granted' : 'Not granted'}</span>
          </label>
        </Field>
      </div>
      <div className="grid sm:grid-cols-2 gap-4">
        <Field label="Exclusivity Period">
          <Select value={contract.exclusivityPeriod} onChange={(e) => update({ exclusivityPeriod: e.target.value })} options={EXCLUSIVITY_PERIODS} placeholder="Select period" />
        </Field>
        <Field label="Content Ownership">
          <Select value={contract.contentOwnership} onChange={(e) => update({ contentOwnership: e.target.value })} options={CONTENT_OWNERSHIP_OPTIONS} placeholder="Select ownership" />
        </Field>
        <Field label="Usage Rights">
          <Select value={contract.usageRights} onChange={(e) => update({ usageRights: e.target.value })} options={USAGE_RIGHTS_OPTIONS} placeholder="Select usage rights" />
        </Field>
        <Field label="Licensing Terms">
          <Select value={contract.licensingTerms} onChange={(e) => update({ licensingTerms: e.target.value })} options={LICENSING_TERMS} placeholder="Select term" />
        </Field>
      </div>
    </div>
  );
}

ContractStep.propTypes = { proposal: PropTypes.object.isRequired, onChange: PropTypes.func.isRequired };

/* ----------------------------------------------------------------------- */
/* 7. Brand Brief                                                           */
/* ----------------------------------------------------------------------- */

export function BriefStep({ proposal, onChange }) {
  const brief = proposal.brief ?? {};
  const assets = brief.assets ?? [];

  const update = (patch) => onChange({ brief: { ...brief, ...patch } });

  const addAsset = () => update({ assets: [...assets, ''] });
  const updateAsset = (index, value) => update({ assets: assets.map((a, i) => (i === index ? value : a)) });
  const removeAsset = (index) => update({ assets: assets.filter((_, i) => i !== index) });

  return (
    <div className="space-y-4">
      <Field label="Campaign Instructions" hint="Detailed brief of what creators should communicate and how.">
        <Textarea value={brief.instructions} onChange={(e) => update({ instructions: e.target.value })} placeholder="Describe the key messages, hashtags, mentions, and content flow…" rows={5} />
      </Field>
      <Input
        label="Tone of Voice"
        name="toneOfVoice"
        value={brief.toneOfVoice ?? ''}
        onChange={(e) => update({ toneOfVoice: e.target.value })}
        placeholder="e.g. Friendly, energetic, aspirational"
      />
      <Field label="Content Examples">
        <Textarea value={brief.contentExamples} onChange={(e) => update({ contentExamples: e.target.value })} placeholder="Link or describe reference content / past campaigns" rows={3} />
      </Field>
      <Field label="Do's and Don'ts">
        <Textarea value={brief.dosDonts} onChange={(e) => update({ dosDonts: e.target.value })} placeholder="e.g. Do mention our app name. Don't show competitor products." rows={3} />
      </Field>
      <Field label="Brand Assets, Guidelines & References" hint="Add links to logos, brand guidelines, or reference assets.">
        <div className="space-y-2">
          {assets.map((asset, index) => (
            <div key={index} className="flex items-center gap-2">
              <input
                type="text"
                value={asset}
                onChange={(e) => updateAsset(index, e.target.value)}
                placeholder="https://…"
                className="input-base w-full"
              />
              <button onClick={() => removeAsset(index)} className="text-fg-muted hover:text-danger text-xs flex-shrink-0">✕</button>
            </div>
          ))}
          <Button variant="outline" size="sm" onClick={addAsset}>+ Add Asset Link</Button>
        </div>
      </Field>
    </div>
  );
}

BriefStep.propTypes = { proposal: PropTypes.object.isRequired, onChange: PropTypes.func.isRequired };

/* ----------------------------------------------------------------------- */
/* 8. AI Assisted Outreach                                                  */
/* ----------------------------------------------------------------------- */

export function OutreachStep({ proposal, onChange, selectedCreators }) {
  const outreachMessages = proposal.outreachMessages ?? {};

  const generateForCreator = (creator) => {
    const id = creator.id ?? creator.userId;
    const message = generateOutreachMessage(creator, proposal);
    onChange({ outreachMessages: { ...outreachMessages, [id]: message } });
  };

  const generateSummary = () => {
    onChange({ summary: generateProposalSummary(proposal) });
  };

  return (
    <div className="space-y-4">
      <div className="rounded-xl p-3" style={{ background: 'rgba(109,92,255,0.06)', border: '1px solid rgba(109,92,255,0.15)' }}>
        <p className="text-fg-muted text-xs leading-relaxed">
          <span className="text-brand-400 font-medium">✦ AI Outreach </span>
          generates a personalized invite per creator and a campaign summary you can review and edit before sending.
        </p>
      </div>

      <Field label="Campaign Summary">
        <Textarea value={proposal.summary} onChange={(e) => onChange({ summary: e.target.value })} placeholder="Click 'Generate campaign summary' to draft an AI summary…" rows={3} />
      </Field>
      <Button variant="secondary" size="sm" onClick={generateSummary}>✦ Generate campaign summary</Button>

      <div className="pt-2 space-y-3">
        <p className="text-sm font-medium text-fg">Personalized Invitations</p>
        {selectedCreators.length === 0 ? (
          <p className="text-fg-muted text-xs">Shortlist or select creators to generate personalized outreach messages.</p>
        ) : (
          selectedCreators.map((creator) => {
            const id = creator.id ?? creator.userId;
            return (
              <div key={id} className="rounded-xl p-3 space-y-2" style={{ background: 'var(--surface-2)', border: '1px solid var(--border)' }}>
                <div className="flex items-center justify-between gap-2">
                  <div className="flex items-center gap-2 min-w-0">
                    <Avatar src={creator.avatarUrl} initials={creator.displayName?.slice(0, 2)?.toUpperCase()} size="sm" />
                    <p className="text-fg text-sm font-medium truncate">{creator.displayName}</p>
                  </div>
                  <Button variant="ghost" size="xs" onClick={() => generateForCreator(creator)}>✦ Generate</Button>
                </div>
                <Textarea
                  value={outreachMessages[id] ?? ''}
                  onChange={(e) => onChange({ outreachMessages: { ...outreachMessages, [id]: e.target.value } })}
                  placeholder={`Click 'Generate' to draft an invite for ${creator.displayName}…`}
                  rows={3}
                />
              </div>
            );
          })
        )}
      </div>
    </div>
  );
}

OutreachStep.propTypes = {
  proposal: PropTypes.object.isRequired,
  onChange: PropTypes.func.isRequired,
  selectedCreators: PropTypes.arrayOf(PropTypes.object).isRequired,
};
