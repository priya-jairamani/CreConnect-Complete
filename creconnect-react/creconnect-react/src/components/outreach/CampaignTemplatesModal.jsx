import PropTypes from 'prop-types';
import Modal from '@/components/common/Modal';
import { CAMPAIGN_TEMPLATES, DELIVERABLE_TYPE_ICONS } from '@/constants/outreachOptions';

export default function CampaignTemplatesModal({ isOpen, onClose, onApplyTemplate }) {
  return (
    <Modal isOpen={isOpen} onClose={onClose} size="2xl" title="Campaign Templates" description="Start from a proven campaign structure — you can customize everything afterward.">
      <div className="grid sm:grid-cols-2 gap-3">
        {CAMPAIGN_TEMPLATES.map((template) => (
          <button
            key={template.key}
            onClick={() => onApplyTemplate(template)}
            className="text-left rounded-2xl p-4 transition-colors hover:border-brand-500/50"
            style={{ background: 'var(--surface-2)', border: '1px solid var(--border)' }}
          >
            <div className="flex items-center gap-2 mb-2">
              <span className="text-xl">{template.icon}</span>
              <h3 className="font-semibold text-fg text-sm" style={{ fontFamily: 'Sora, sans-serif' }}>{template.label}</h3>
            </div>
            <p className="text-fg-muted text-xs leading-relaxed mb-3">{template.description}</p>
            <div className="flex flex-wrap gap-1.5">
              {template.defaults.deliverables.map((d, i) => (
                <span key={i} className="text-[11px] px-2 py-0.5 rounded-full" style={{ background: 'var(--surface)', border: '1px solid var(--border)', color: 'var(--fg-muted)' }}>
                  {DELIVERABLE_TYPE_ICONS[d.type] ?? '📄'} {d.quantity}x {d.type}
                </span>
              ))}
            </div>
          </button>
        ))}
      </div>
    </Modal>
  );
}

CampaignTemplatesModal.propTypes = {
  isOpen: PropTypes.bool.isRequired,
  onClose: PropTypes.func.isRequired,
  onApplyTemplate: PropTypes.func.isRequired,
};
