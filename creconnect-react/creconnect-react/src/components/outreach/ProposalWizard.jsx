import { useMemo, useState } from 'react';
import PropTypes from 'prop-types';
import Button from '@/components/common/Button';
import { PROPOSAL_STEPS } from '@/constants/outreachOptions';
import {
  OverviewStep, RequirementsStep, DeliverablesStep, BudgetStep,
  TimelineStep, ContractStep, BriefStep, OutreachStep,
} from '@/components/outreach/ProposalSteps';

const STEP_COMPONENTS = {
  overview: OverviewStep,
  requirements: RequirementsStep,
  deliverables: DeliverablesStep,
  budget: BudgetStep,
  timeline: TimelineStep,
  contract: ContractStep,
  brief: BriefStep,
  outreach: OutreachStep,
};

export default function ProposalWizard({ proposal, onChange, selectedCreators, lastSavedAt, onSendInvitations, isSending, onOpenTemplates, onOpenCopilot }) {
  const [stepIndex, setStepIndex] = useState(0);
  const step = PROPOSAL_STEPS[stepIndex];
  const StepComponent = STEP_COMPONENTS[step.key];

  const isLast = stepIndex === PROPOSAL_STEPS.length - 1;
  const isFirst = stepIndex === 0;

  const savedLabel = useMemo(() => {
    if (!lastSavedAt) return null;
    const seconds = Math.max(0, Math.round((Date.now() - lastSavedAt) / 1000));
    if (seconds < 5) return 'Saved just now';
    if (seconds < 60) return `Saved ${seconds}s ago`;
    return `Saved ${Math.round(seconds / 60)}m ago`;
  }, [lastSavedAt]);

  return (
    <div className="card rounded-2xl p-5 space-y-5">
      {/* Header */}
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h2 className="font-semibold text-fg" style={{ fontFamily: 'Sora, sans-serif' }}>
            Campaign Proposal Builder
          </h2>
          <p className="text-fg-muted text-xs mt-0.5">
            Step {stepIndex + 1} of {PROPOSAL_STEPS.length} · {step.label}
            {savedLabel && <span className="ml-2 text-success">· {savedLabel}</span>}
          </p>
        </div>
        <div className="flex gap-2">
          <Button variant="ghost" size="sm" onClick={onOpenTemplates}>📋 Templates</Button>
          <Button variant="ghost" size="sm" onClick={onOpenCopilot}>🤖 Copilot</Button>
        </div>
      </div>

      {/* Stepper */}
      <div className="flex items-center gap-1 overflow-x-auto pb-1">
        {PROPOSAL_STEPS.map((s, i) => {
          const active = i === stepIndex;
          const done = i < stepIndex;
          return (
            <button
              key={s.key}
              onClick={() => setStepIndex(i)}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-medium transition-all flex-shrink-0"
              style={
                active
                  ? { background: 'linear-gradient(135deg, #6d5cff, #4c2dd1)', color: '#fff' }
                  : done
                    ? { background: 'rgba(22,179,100,0.12)', color: '#16b364', border: '1px solid rgba(22,179,100,0.25)' }
                    : { background: 'var(--surface-2)', color: 'var(--fg-muted)', border: '1px solid var(--border)' }
              }
            >
              <span>{s.icon}</span>
              <span className="hidden sm:inline">{s.label}</span>
            </button>
          );
        })}
      </div>

      {/* Step content — scrollable so the stepper + nav buttons stay in view */}
      <div className="overflow-y-auto pr-1" style={{ maxHeight: '58vh' }}>
        {step.key === 'outreach' ? (
          <OutreachStep proposal={proposal} onChange={onChange} selectedCreators={selectedCreators} />
        ) : (
          <StepComponent proposal={proposal} onChange={onChange} />
        )}
      </div>

      {/* Footer nav */}
      <div className="flex items-center justify-between gap-3 pt-2 border-t" style={{ borderColor: 'var(--border)' }}>
        <Button variant="secondary" size="sm" disabled={isFirst} onClick={() => setStepIndex((i) => Math.max(0, i - 1))}>
          ← Back
        </Button>
        {isLast ? (
          <Button variant="primary" size="sm" onClick={onSendInvitations} isLoading={isSending} disabled={isSending}>
            🚀 Review &amp; Send Invitations
          </Button>
        ) : (
          <Button variant="primary" size="sm" onClick={() => setStepIndex((i) => Math.min(PROPOSAL_STEPS.length - 1, i + 1))}>
            Next →
          </Button>
        )}
      </div>
    </div>
  );
}

ProposalWizard.propTypes = {
  proposal: PropTypes.object.isRequired,
  onChange: PropTypes.func.isRequired,
  selectedCreators: PropTypes.arrayOf(PropTypes.object).isRequired,
  lastSavedAt: PropTypes.number,
  onSendInvitations: PropTypes.func.isRequired,
  isSending: PropTypes.bool,
  onOpenTemplates: PropTypes.func.isRequired,
  onOpenCopilot: PropTypes.func.isRequired,
};
