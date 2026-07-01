import { useState, useEffect } from 'react';
import PropTypes from 'prop-types';
import Modal from '@/components/common/Modal';
import Button from '@/components/common/Button';
import { generateApplicationPitch } from '@/utils/aiApplicationGenerator';
import { useCopy } from '@/hooks/useCopy';

export default function AIApplicationModal({
  brand, profile, creatorNiches, isOpen, onClose, onApply, isApplying, applyState,
}) {
  const { copy, copied } = useCopy();
  const [variant, setVariant] = useState(0);
  const [text, setText] = useState('');

  useEffect(() => {
    if (isOpen && brand) {
      setText(generateApplicationPitch(brand, profile, creatorNiches, variant));
    }
  }, [isOpen, brand, profile, creatorNiches, variant]);

  if (!brand) return null;

  const handleRegenerate = () => setVariant((v) => v + 1);

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={`✨ AI Application — ${brand.companyName}`}
      description="A personalized pitch generated from your profile and this brand's open campaigns. Edit it however you like before applying."
      size="lg"
      footer={
        <div className="flex flex-wrap items-center gap-2">
          <Button variant="primary" size="sm" isLoading={isApplying} disabled={applyState === 'done'} onClick={() => onApply(brand)}>
            {applyState === 'done' ? '✓ Applied' : 'Apply Now'}
          </Button>
          <Button variant="outline" size="sm" onClick={() => copy(text)}
            style={copied ? { background: 'rgba(22,179,100,0.12)', color: '#16b364', borderColor: 'rgba(22,179,100,0.35)' } : {}}
          >{copied ? '✓ Copied!' : '📋 Copy Pitch'}</Button>
          <Button variant="ghost" size="sm" onClick={handleRegenerate}>🔄 Regenerate</Button>
        </div>
      }
    >
      <textarea
        value={text}
        onChange={(e) => setText(e.target.value)}
        rows={12}
        className="w-full rounded-xl p-3 text-sm text-fg leading-relaxed resize-y focus:outline-none focus:ring-1"
        style={{ background: 'var(--surface-2)', border: '1px solid var(--border)' }}
      />
    </Modal>
  );
}

AIApplicationModal.propTypes = {
  brand:         PropTypes.object,
  profile:       PropTypes.object,
  creatorNiches: PropTypes.array,
  isOpen:        PropTypes.bool.isRequired,
  onClose:       PropTypes.func.isRequired,
  onApply:       PropTypes.func.isRequired,
  isApplying:    PropTypes.bool,
  applyState:    PropTypes.string,
};
