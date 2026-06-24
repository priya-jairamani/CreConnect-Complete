import PropTypes from 'prop-types';
import Badge from '@/components/common/Badge';
import Button from '@/components/common/Button';

const STATUS_VARIANT = {
  Signed: 'success',
  'Pending Signature': 'warning',
  Voided: 'danger',
};

export default function ContractTab({ contract }) {
  const { status, type, signedDate, expiryDate, paymentTerms } = contract;

  return (
    <div className="space-y-4 max-w-xl">
      <div className="rounded-2xl p-5" style={{ background: 'var(--surface-2)', border: '1px solid var(--border)' }}>
        <div className="flex items-center justify-between mb-4">
          <h4 className="text-fg font-semibold text-base" style={{ fontFamily: 'Sora, sans-serif' }}>{type}</h4>
          <Badge variant={STATUS_VARIANT[status] ?? 'neutral'} label={status} />
        </div>

        <div className="space-y-3 text-sm">
          <div className="flex justify-between"><span className="text-fg-muted">Contract Type</span><span className="text-fg font-medium">{type}</span></div>
          <div className="flex justify-between"><span className="text-fg-muted">Status</span><span className="text-fg font-medium">{status}</span></div>
          <div className="flex justify-between"><span className="text-fg-muted">Signed Date</span><span className="text-fg font-medium">{signedDate ? new Date(signedDate).toLocaleDateString('en-PK', { month: 'short', day: 'numeric', year: 'numeric' }) : '—'}</span></div>
          <div className="flex justify-between"><span className="text-fg-muted">Expiry Date</span><span className="text-fg font-medium">{expiryDate ? new Date(expiryDate).toLocaleDateString('en-PK', { month: 'short', day: 'numeric', year: 'numeric' }) : '—'}</span></div>
          <div className="flex justify-between gap-4"><span className="text-fg-muted flex-shrink-0">Payment Terms</span><span className="text-fg font-medium text-right">{paymentTerms}</span></div>
        </div>
      </div>

      <div className="flex flex-wrap gap-2">
        <Button variant="secondary" size="sm">📄 View Contract</Button>
        <Button variant="secondary" size="sm">⬇️ Download Contract</Button>
        {status === 'Pending Signature' && (
          <Button variant="primary" size="sm">✓ Accept Terms</Button>
        )}
      </div>
    </div>
  );
}

ContractTab.propTypes = {
  contract: PropTypes.object.isRequired,
};
