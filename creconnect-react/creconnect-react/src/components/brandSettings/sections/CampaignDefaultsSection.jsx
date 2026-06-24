import PropTypes from 'prop-types';
import Input from '@/components/common/Input';
import Badge from '@/components/common/Badge';

const APPROVAL_FLOWS = ['Manual review', 'Auto-approve trusted creators', 'Two-step (manager + admin)'];
const REVIEW_PROCESSES = ['Single reviewer', 'Two reviewers', 'Team consensus'];
const DELIVERABLES = ['1 Instagram Reel', '2 Feed Posts', '3 Stories', '1 TikTok Video', '1 YouTube Video', '1 Unboxing Video'];

const TEMPLATES = [
  { key: 'productLaunch', icon: '🚀', title: 'Product Launch', description: 'Drive awareness for a new product release' },
  { key: 'awareness', icon: '📣', title: 'Awareness Campaign', description: 'Build brand recognition and reach' },
  { key: 'ugc', icon: '🎬', title: 'UGC Campaign', description: 'Collect authentic user-generated content' },
  { key: 'affiliate', icon: '🔗', title: 'Affiliate Campaign', description: 'Performance-based, commission-driven collabs' },
];

function Field({ label, children }) {
  return (
    <div className="flex flex-col gap-1.5">
      <label className="text-sm font-medium text-fg">{label}</label>
      {children}
    </div>
  );
}
Field.propTypes = { label: PropTypes.string.isRequired, children: PropTypes.node.isRequired };

export default function CampaignDefaultsSection({ values, onChange }) {
  return (
    <div className="space-y-6">
      <div>
        <h3 className="text-sm font-semibold text-fg-muted uppercase tracking-wide mb-3">Default Campaign Settings</h3>
        <div className="grid sm:grid-cols-2 gap-4">
          <Input label="Default Budget — Min (PKR)" name="defaultBudgetMin" type="number" value={values.defaultBudgetMin} onChange={(e) => onChange('defaultBudgetMin', e.target.value)} placeholder="25000" />
          <Input label="Default Budget — Max (PKR)" name="defaultBudgetMax" type="number" value={values.defaultBudgetMax} onChange={(e) => onChange('defaultBudgetMax', e.target.value)} placeholder="75000" />
          <Field label="Campaign Approval Flow">
            <select className="input-base w-full" value={values.campaignApprovalFlow} onChange={(e) => onChange('campaignApprovalFlow', e.target.value)}>
              {APPROVAL_FLOWS.map((f) => <option key={f} value={f}>{f}</option>)}
            </select>
          </Field>
          <Field label="Creator Approval Flow">
            <select className="input-base w-full" value={values.creatorApprovalFlow} onChange={(e) => onChange('creatorApprovalFlow', e.target.value)}>
              {APPROVAL_FLOWS.map((f) => <option key={f} value={f}>{f}</option>)}
            </select>
          </Field>
          <Field label="Review Process">
            <select className="input-base w-full" value={values.reviewProcess} onChange={(e) => onChange('reviewProcess', e.target.value)}>
              {REVIEW_PROCESSES.map((f) => <option key={f} value={f}>{f}</option>)}
            </select>
          </Field>
          <Field label="Default Deliverables">
            <select className="input-base w-full" value={values.defaultDeliverable} onChange={(e) => onChange('defaultDeliverable', e.target.value)}>
              {DELIVERABLES.map((f) => <option key={f} value={f}>{f}</option>)}
            </select>
          </Field>
        </div>
      </div>

      <div className="pt-2 border-t" style={{ borderColor: 'var(--border)' }}>
        <h3 className="text-sm font-semibold text-fg-muted uppercase tracking-wide mb-3 mt-5">Campaign Templates</h3>
        <div className="grid sm:grid-cols-2 gap-3">
          {TEMPLATES.map((t) => {
            const active = values.defaultTemplate === t.key;
            return (
              <button
                key={t.key}
                type="button"
                onClick={() => onChange('defaultTemplate', t.key)}
                className="card rounded-2xl p-4 flex items-start gap-3 text-left transition-all"
                style={active ? { border: '1px solid var(--brand-500)', background: 'rgba(109,92,255,0.08)' } : { background: 'var(--surface-2)' }}
              >
                <span className="w-9 h-9 rounded-xl bg-brand-500/12 text-brand-400 flex items-center justify-center text-base flex-shrink-0">{t.icon}</span>
                <div className="min-w-0 flex-1">
                  <div className="flex items-center gap-2">
                    <p className="text-fg font-medium text-sm">{t.title}</p>
                    {active && <Badge variant="brand" label="Default" />}
                  </div>
                  <p className="text-fg-muted text-xs mt-0.5">{t.description}</p>
                </div>
              </button>
            );
          })}
        </div>
      </div>
    </div>
  );
}

CampaignDefaultsSection.propTypes = {
  values: PropTypes.object.isRequired,
  onChange: PropTypes.func.isRequired,
};
