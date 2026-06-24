import { useState, useMemo } from 'react';
import PropTypes from 'prop-types';
import Modal from '@/components/common/Modal';
import Button from '@/components/common/Button';
import Input from '@/components/common/Input';
import Badge from '@/components/common/Badge';
import { formatPKR, formatFollowers } from '@/utils/formatters';
import { getCampaignForecast } from '@/utils/mockAnalytics';
import PlatformIcon from '@/components/common/PlatformIcon';
import {
  OBJECTIVES, NICHES, PLATFORM_OPTIONS, LOCATIONS, BUDGET_TYPES, DELIVERABLE_TYPES,
} from '@/constants/campaignOptions';

/* ─── 4-step wizard (was 6 steps) ──────────────────────────────────
   Step 1: Campaign Basics        (Name, Goal, Industry, Type)
   Step 2: Budget & Deliverables  (Budget, Deliverables, Creators, Timeline)
   Step 3: Target Creator         (Platforms, Creator Size, Niches, Regions)
   Step 4: Review & Publish       (Summary, AI Estimates, Publish)
 */
const STEPS = [
  { key: 'basics',       label: 'Campaign Basics'      },
  { key: 'budget',       label: 'Budget & Deliverables' },
  { key: 'targeting',    label: 'Target Creator'        },
  { key: 'review',       label: 'Review & Publish'      },
];

const CREATOR_SIZE_OPTIONS = [
  { label: 'Nano',   range: '1K – 10K',  min: 1_000,   max: 10_000  },
  { label: 'Micro',  range: '10K – 50K', min: 10_000,  max: 50_000  },
  { label: 'Mid',    range: '50K – 250K',min: 50_000,  max: 250_000 },
  { label: 'Macro',  range: '250K+',     min: 250_000, max: 5_000_000 },
];

const todayPlus = (days) => {
  const d = new Date(Date.now() + days * 24 * 60 * 60 * 1000);
  return d.toISOString().slice(0, 10);
};

const initialForm = {
  title:          '',
  description:    '',
  objective:      'AWARENESS',
  niche:          'Fashion',
  budgetType:     'FIXED',
  budgetMin:      50_000,
  budgetMax:      150_000,
  deliverables:   { reels: 2, posts: 1, stories: 0, videos: 0, livestreams: 0 },
  creatorCount:   3,
  deadline:       todayPlus(30),
  platforms:      ['INSTAGRAM'],
  creatorSizeMin: 10_000,
  creatorSizeMax: 250_000,
  targetLocation: 'Lahore',
};

function toggleArr(arr, v) {
  return arr.includes(v) ? arr.filter((x) => x !== v) : [...arr, v];
}

/* ─── Progress dots ─────────────────────────────────────────────── */
function StepDots({ current }) {
  return (
    <div className="flex items-center gap-2 mb-6">
      {STEPS.map((s, i) => (
        <div key={s.key} className="flex items-center gap-2 flex-1">
          <div
            className="w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold flex-shrink-0 transition-colors"
            style={
              i === current
                ? { background: 'linear-gradient(135deg, #6d5cff, #4c2dd1)', color: '#fff' }
                : i < current
                  ? { background: 'rgba(22,179,100,0.18)', color: '#16b364' }
                  : { background: 'var(--surface-2)', color: 'var(--fg-muted)' }
            }
          >
            {i < current ? '✓' : i + 1}
          </div>
          {i < STEPS.length - 1 && (
            <div className="h-0.5 flex-1 rounded-full" style={{ background: i < current ? 'rgba(22,179,100,0.4)' : 'var(--border)' }} />
          )}
        </div>
      ))}
    </div>
  );
}
StepDots.propTypes = { current: PropTypes.number.isRequired };

/* ─── Shared pill toggle ─────────────────────────────────────────── */
function Pill({ active, onClick, children }) {
  return (
    <button
      type="button" onClick={onClick}
      className="px-3 py-1.5 rounded-lg text-sm font-medium transition-all border"
      style={active
        ? { background: 'rgba(109,92,255,0.15)', color: 'var(--brand-400)', borderColor: 'rgba(109,92,255,0.35)' }
        : { background: 'var(--surface-2)', color: 'var(--fg-muted)', borderColor: 'var(--border)' }
      }
    >
      {children}
    </button>
  );
}
Pill.propTypes = { active: PropTypes.bool.isRequired, onClick: PropTypes.func.isRequired, children: PropTypes.node.isRequired };

function Field({ label, children, hint }) {
  return (
    <div className="flex flex-col gap-1.5">
      <label className="text-sm font-medium text-fg">{label}</label>
      {children}
      {hint && <p className="text-xs text-fg-muted">{hint}</p>}
    </div>
  );
}
Field.propTypes = { label: PropTypes.string.isRequired, children: PropTypes.node.isRequired, hint: PropTypes.string };

/* ─── Main wizard ────────────────────────────────────────────────── */
export default function CampaignWizard({ isOpen, onClose, onSubmit, isSubmitting }) {
  const [step, setStep] = useState(0);
  const [form, setForm] = useState(initialForm);

  const update = (patch) => setForm((p) => ({ ...p, ...patch }));

  const forecast = useMemo(() => getCampaignForecast(form), [form]);

  const canProceed = useMemo(() => {
    switch (STEPS[step].key) {
      case 'basics':     return form.title.trim().length >= 3;
      case 'budget':     return form.budgetMin > 0 && form.budgetMax >= form.budgetMin && Object.values(form.deliverables).some((n) => n > 0);
      case 'targeting':  return form.platforms.length > 0;
      default:           return true;
    }
  }, [step, form]);

  const reset       = () => { setStep(0); setForm(initialForm); };
  const handleClose = () => { reset(); onClose(); };

  const handleSubmit = async () => {
    const primaryDeliverable = DELIVERABLE_TYPES.find((d) => form.deliverables[d.key] > 0);
    const contentType = primaryDeliverable?.contentType ?? 'SPONSORED_POST';
    await onSubmit({
      title:       form.title,
      description: form.description.trim() || `${form.objective} campaign for ${form.niche} creators.`,
      objective:   form.objective,
      niche:       form.niche.toUpperCase(),
      budgetType:  form.budgetType,
      budgetMin:   Number(form.budgetMin),
      budgetMax:   Number(form.budgetMax),
      budgetPKR:   Number(form.budgetMax),
      platforms:   form.platforms,
      followerMin: form.creatorSizeMin,
      followerMax: form.creatorSizeMax,
      targetLocation: form.targetLocation,
      reels:       form.deliverables.reels       || 0,
      posts:       form.deliverables.posts       || 0,
      stories:     form.deliverables.stories     || 0,
      videos:      form.deliverables.videos      || 0,
      livestreams: form.deliverables.livestreams || 0,
      contentType,
      deadline:    new Date(form.deadline).toISOString(),
      startDate:   new Date().toISOString(),
      status:      'PUBLISHED',
    });
    reset();
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={handleClose}
      title="New Campaign"
      description="Launch your campaign in 4 quick steps — takes less than 2 minutes."
      size="2xl"
    >
      <StepDots current={step} />

      {/* ── STEP 1: Campaign Basics ── */}
      {STEPS[step].key === 'basics' && (
        <div className="space-y-4">
          <Input
            label="Campaign Name"
            name="title"
            value={form.title}
            onChange={(e) => update({ title: e.target.value })}
            placeholder="e.g. Summer Collection Launch 2026"
            required
          />

          <Field label="Campaign Description" hint="Briefly describe what this campaign is about">
            <textarea
              className="input-base w-full resize-none"
              rows={3}
              value={form.description}
              onChange={(e) => update({ description: e.target.value })}
              placeholder="e.g. We're launching our summer collection and need creators to showcase the outfits…"
            />
          </Field>

          <Field label="Campaign Goal">
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
              {OBJECTIVES.map((o) => (
                <button
                  key={o.value}
                  type="button"
                  onClick={() => update({ objective: o.value })}
                  className="rounded-xl p-3 text-center transition-all border"
                  style={form.objective === o.value
                    ? { background: 'rgba(109,92,255,0.12)', borderColor: 'rgba(109,92,255,0.4)' }
                    : { background: 'var(--surface-2)', borderColor: 'var(--border)' }
                  }
                >
                  <div className="text-xl mb-1">{o.icon}</div>
                  <div className="text-xs font-medium text-fg">{o.label}</div>
                </button>
              ))}
            </div>
          </Field>

          <div className="grid grid-cols-2 gap-4">
            <Field label="Industry / Category">
              <select className="input-base w-full" value={form.niche} onChange={(e) => update({ niche: e.target.value })}>
                {NICHES.map((n) => <option key={n} value={n}>{n}</option>)}
              </select>
            </Field>

            <Field label="Budget Model">
              <select className="input-base w-full" value={form.budgetType} onChange={(e) => update({ budgetType: e.target.value })}>
                {BUDGET_TYPES.map((b) => <option key={b.value} value={b.value}>{b.label}</option>)}
              </select>
            </Field>
          </div>
        </div>
      )}

      {/* ── STEP 2: Budget & Deliverables ── */}
      {STEPS[step].key === 'budget' && (
        <div className="space-y-5">
          <div className="grid grid-cols-2 gap-4">
            <Input
              label="Minimum Budget (PKR)"
              name="budgetMin"
              type="number"
              value={form.budgetMin}
              onChange={(e) => update({ budgetMin: Number(e.target.value) })}
              required
            />
            <Input
              label="Maximum Budget (PKR)"
              name="budgetMax"
              type="number"
              value={form.budgetMax}
              onChange={(e) => update({ budgetMax: Number(e.target.value) })}
              required
            />
          </div>

          <div className="rounded-xl px-4 py-2.5 text-sm" style={{ background: 'var(--surface-2)', border: '1px solid var(--border)' }}>
            Total budget range: <span className="text-fg font-semibold">{formatPKR(form.budgetMin)} – {formatPKR(form.budgetMax)}</span>
          </div>

          <Field label="Deliverables Required" hint="How many of each content type should creators deliver?">
            <div className="space-y-2">
              {DELIVERABLE_TYPES.map((d) => (
                <div key={d.key} className="flex items-center justify-between rounded-xl p-3" style={{ background: 'var(--surface-2)', border: '1px solid var(--border)' }}>
                  <div className="flex items-center gap-3">
                    <span className="text-lg">{d.icon}</span>
                    <span className="text-sm font-medium text-fg">{d.label}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <button type="button"
                      onClick={() => update({ deliverables: { ...form.deliverables, [d.key]: Math.max(0, form.deliverables[d.key] - 1) } })}
                      className="w-7 h-7 rounded-lg text-fg-muted hover:text-fg" style={{ background: 'var(--surface)', border: '1px solid var(--border)' }}>−</button>
                    <span className="w-8 text-center text-fg font-semibold">{form.deliverables[d.key]}</span>
                    <button type="button"
                      onClick={() => update({ deliverables: { ...form.deliverables, [d.key]: form.deliverables[d.key] + 1 } })}
                      className="w-7 h-7 rounded-lg text-fg-muted hover:text-fg" style={{ background: 'var(--surface)', border: '1px solid var(--border)' }}>+</button>
                  </div>
                </div>
              ))}
            </div>
          </Field>

          <div className="grid grid-cols-2 gap-4">
            <Field label="Number of Creators">
              <div className="flex items-center gap-2">
                <button type="button"
                  onClick={() => update({ creatorCount: Math.max(1, form.creatorCount - 1) })}
                  className="w-9 h-9 rounded-xl text-fg-muted hover:text-fg" style={{ background: 'var(--surface-2)', border: '1px solid var(--border)' }}>−</button>
                <span className="flex-1 text-center text-fg font-semibold text-lg" style={{ fontFamily: 'Sora, sans-serif' }}>{form.creatorCount}</span>
                <button type="button"
                  onClick={() => update({ creatorCount: form.creatorCount + 1 })}
                  className="w-9 h-9 rounded-xl text-fg-muted hover:text-fg" style={{ background: 'var(--surface-2)', border: '1px solid var(--border)' }}>+</button>
              </div>
            </Field>

            <Input
              label="Campaign Deadline"
              name="deadline"
              type="date"
              value={form.deadline}
              onChange={(e) => update({ deadline: e.target.value })}
              required
            />
          </div>
        </div>
      )}

      {/* ── STEP 3: Target Creator ── */}
      {STEPS[step].key === 'targeting' && (
        <div className="space-y-5">
          <Field label="Target Platforms">
            <div className="flex flex-wrap gap-2">
              {PLATFORM_OPTIONS.map((p) => (
                <Pill key={p.value} active={form.platforms.includes(p.value)} onClick={() => update({ platforms: toggleArr(form.platforms, p.value) })}>
                  <span className="inline-flex items-center gap-1.5">
                    <PlatformIcon platform={p.value} size={13} />
                    {p.label}
                  </span>
                </Pill>
              ))}
            </div>
          </Field>

          <Field label="Creator Size" hint="Select the follower range that fits your campaign">
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
              {CREATOR_SIZE_OPTIONS.map((cs) => {
                const active = form.creatorSizeMin === cs.min && form.creatorSizeMax === cs.max;
                return (
                  <button
                    key={cs.label}
                    type="button"
                    onClick={() => update({ creatorSizeMin: cs.min, creatorSizeMax: cs.max })}
                    className="rounded-xl p-3 text-center transition-all border"
                    style={active
                      ? { background: 'rgba(109,92,255,0.12)', borderColor: 'rgba(109,92,255,0.4)' }
                      : { background: 'var(--surface-2)', borderColor: 'var(--border)' }
                    }
                  >
                    <div className="text-sm font-semibold text-fg">{cs.label}</div>
                    <div className="text-[11px] text-fg-muted mt-0.5">{cs.range}</div>
                  </button>
                );
              })}
            </div>
          </Field>

          <Field label="Preferred Niches">
            <div className="flex flex-wrap gap-2">
              {NICHES.map((n) => (
                <Pill key={n} active={form.niche === n} onClick={() => update({ niche: n })}>
                  {n}
                </Pill>
              ))}
            </div>
          </Field>

          <Field label="Target Region">
            <select className="input-base w-full" value={form.targetLocation} onChange={(e) => update({ targetLocation: e.target.value })}>
              {LOCATIONS.map((l) => <option key={l} value={l}>{l}</option>)}
            </select>
          </Field>
        </div>
      )}

      {/* ── STEP 4: Review & Publish ── */}
      {STEPS[step].key === 'review' && (
        <div className="space-y-4">
          {/* AI estimates */}
          <div className="rounded-xl p-4 space-y-3" style={{ background: 'rgba(109,92,255,0.08)', border: '1px solid rgba(109,92,255,0.25)' }}>
            <div className="flex items-center gap-2">
              <span className="text-lg">✨</span>
              <h3 className="font-semibold text-fg text-sm" style={{ fontFamily: 'Sora, sans-serif' }}>AI Estimates</h3>
            </div>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
              {[
                { label: 'Recommended creators', value: forecast.recommendedCreators },
                { label: 'Estimated reach',       value: formatFollowers(forecast.estimatedReach) },
                { label: 'Est. engagement',       value: `${forecast.estimatedEngagementRate}%` },
                { label: 'Est. conversions',      value: formatFollowers(forecast.estimatedConversions) },
              ].map((m) => (
                <div key={m.label} className="rounded-lg p-3 text-center" style={{ background: 'var(--surface)' }}>
                  <p className="text-fg font-bold text-base" style={{ fontFamily: 'Sora, sans-serif' }}>{m.value}</p>
                  <p className="text-fg-muted text-[10px] mt-0.5">{m.label}</p>
                </div>
              ))}
            </div>
            <p className="text-fg-muted text-xs">
              💡 Suggested budget: <span className="text-fg font-medium">{formatPKR(forecast.suggestedBudgetMin)} – {formatPKR(forecast.suggestedBudgetMax)}</span>
              {' '}· Your range: {formatPKR(form.budgetMin)} – {formatPKR(form.budgetMax)}
            </p>
          </div>

          {/* Summary */}
          <div className="rounded-xl p-4 space-y-2" style={{ background: 'var(--surface-2)', border: '1px solid var(--border)' }}>
            <h3 className="font-semibold text-fg text-sm" style={{ fontFamily: 'Sora, sans-serif' }}>Campaign Summary</h3>
            {[
              { label: 'Name',        value: form.title || '—' },
              { label: 'Description', value: form.description || '—' },
              { label: 'Industry',    value: form.niche },
              { label: 'Platforms', value: form.platforms.join(', ') },
              { label: 'Budget',    value: `${formatPKR(form.budgetMin)} – ${formatPKR(form.budgetMax)}` },
              { label: 'Deadline',  value: form.deadline },
              { label: 'Creators',  value: `${form.creatorCount} creator${form.creatorCount !== 1 ? 's' : ''}` },
            ].map(({ label, value }) => (
              <div key={label} className="flex items-start justify-between gap-3 text-sm">
                <span className="text-fg-muted flex-shrink-0">{label}</span>
                <span className="text-fg font-medium text-right break-words min-w-0">{value}</span>
              </div>
            ))}
            <div className="flex items-center gap-1.5 flex-wrap pt-1">
              {DELIVERABLE_TYPES.filter((d) => form.deliverables[d.key] > 0).map((d) => (
                <Badge key={d.key} variant="brand" label={`${form.deliverables[d.key]}× ${d.label}`} />
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Footer */}
      <div className="flex gap-3 pt-6">
        {step > 0 && (
          <Button variant="secondary" size="md" onClick={() => setStep((s) => s - 1)} className="flex-1">
            Back
          </Button>
        )}
        {step < STEPS.length - 1 ? (
          <Button variant="primary" size="md" disabled={!canProceed} onClick={() => setStep((s) => s + 1)} className="flex-1">
            Continue →
          </Button>
        ) : (
          <Button variant="primary" size="md" isLoading={isSubmitting} onClick={handleSubmit} className="flex-1">
            🚀 Launch Campaign
          </Button>
        )}
      </div>
    </Modal>
  );
}

CampaignWizard.propTypes = {
  isOpen:       PropTypes.bool.isRequired,
  onClose:      PropTypes.func.isRequired,
  onSubmit:     PropTypes.func.isRequired,
  isSubmitting: PropTypes.bool,
};
