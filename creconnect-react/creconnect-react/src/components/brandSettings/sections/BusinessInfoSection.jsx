import PropTypes from 'prop-types';
import Input from '@/components/common/Input';
import Badge from '@/components/common/Badge';
import Button from '@/components/common/Button';

const STATUS_META = {
  pending: { variant: 'warning', label: '⏳ Pending Review' },
  verified: { variant: 'success', label: '✓ Verified' },
  rejected: { variant: 'danger', label: '✕ Rejected' },
};

function UploadCard({ icon, title, description, fileName }) {
  return (
    <div className="card rounded-2xl p-4 flex items-center gap-4" style={{ background: 'var(--surface-2)' }}>
      <span className="w-10 h-10 rounded-xl bg-brand-500/12 text-brand-400 flex items-center justify-center text-lg flex-shrink-0">{icon}</span>
      <div className="min-w-0 flex-1">
        <p className="text-fg font-medium text-sm">{title}</p>
        <p className="text-fg-muted text-xs mt-0.5">{fileName || description}</p>
      </div>
      <Button variant="secondary" size="xs">{fileName ? 'Replace' : 'Upload'}</Button>
    </div>
  );
}
UploadCard.propTypes = { icon: PropTypes.string.isRequired, title: PropTypes.string.isRequired, description: PropTypes.string.isRequired, fileName: PropTypes.string };

export default function BusinessInfoSection({ values, onChange, verificationStatus }) {
  const status = STATUS_META[verificationStatus] ?? STATUS_META.pending;

  return (
    <div className="space-y-6">
      <div>
        <h3 className="text-sm font-semibold text-fg-muted uppercase tracking-wide mb-3">Business Details</h3>
        <div className="grid sm:grid-cols-2 gap-4">
          <Input label="Legal Company Name" name="legalName" value={values.legalName} onChange={(e) => onChange('legalName', e.target.value)} placeholder="Acme Private Limited" />
          <Input label="Registration Number" name="registrationNumber" value={values.registrationNumber} onChange={(e) => onChange('registrationNumber', e.target.value)} placeholder="0012345-7" />
          <Input label="Tax ID" name="taxId" value={values.taxId} onChange={(e) => onChange('taxId', e.target.value)} placeholder="NTN-1234567-8" />
          <Input label="VAT Number" name="vatNumber" value={values.vatNumber} onChange={(e) => onChange('vatNumber', e.target.value)} placeholder="VAT-987654" />
          <Input label="Business Address" name="businessAddress" value={values.businessAddress} onChange={(e) => onChange('businessAddress', e.target.value)} placeholder="Street, City, Country" className="sm:col-span-2" />
        </div>
      </div>

      <div className="pt-2 border-t" style={{ borderColor: 'var(--border)' }}>
        <div className="flex items-center justify-between flex-wrap gap-2 mb-3 mt-5">
          <h3 className="text-sm font-semibold text-fg-muted uppercase tracking-wide">Verification Status</h3>
          <Badge variant={status.variant} label={status.label} />
        </div>
        {verificationStatus !== 'verified' && (
          <p className="text-fg-muted text-sm mb-4">
            Verified brands receive a trust badge on their public profile, appear higher in creator search results, and unlock higher campaign budget limits.
          </p>
        )}
        <div className="grid sm:grid-cols-2 gap-3">
          <UploadCard icon="📄" title="Registration Documents" description="Certificate of incorporation, business license" />
          <UploadCard icon="🪪" title="Verification Documents" description="Government-issued ID, proof of address" />
        </div>
        {verificationStatus === 'pending' && (
          <Button variant="primary" size="sm" className="mt-4">Submit for Verification</Button>
        )}
      </div>
    </div>
  );
}

BusinessInfoSection.propTypes = {
  values: PropTypes.object.isRequired,
  onChange: PropTypes.func.isRequired,
  verificationStatus: PropTypes.oneOf(['pending', 'verified', 'rejected']).isRequired,
};
