import PropTypes from 'prop-types';
import Modal from '@/components/common/Modal';
import Avatar from '@/components/common/Avatar';
import Badge from '@/components/common/Badge';
import Button from '@/components/common/Button';
import { formatPKR } from '@/utils/formatters';

const ROWS = [
  { key: 'avgBudget',              label: 'Average Budget',         format: (v) => formatPKR(v) },
  { key: 'responseRate',           label: 'Response Rate',          format: (v) => `${v}%` },
  { key: 'trustScore',             label: 'Trust Score',            format: (v) => `${v}/100` },
  { key: 'activeCampaigns',        label: 'Active Campaigns',       format: (v) => v },
  { key: 'completedCollaborations',label: 'Completed Campaigns',    format: (v) => v },
  { key: 'creatorRating',          label: 'Creator Rating',         format: (v) => `★ ${v}` },
];

export default function CompareBrandsModal({ brands, isOpen, onClose, onRemove }) {
  if (!brands.length) return null;

  return (
    <Modal isOpen={isOpen} onClose={onClose} size="full" title="Compare Brands" description="Comparing budget, response rate, trust, campaigns, and ratings side by side.">
      <div className="overflow-x-auto">
        <table className="w-full text-sm border-separate" style={{ borderSpacing: '0 0.5rem' }}>
          <thead>
            <tr>
              <th className="text-left text-fg-muted text-xs font-medium px-3 py-2 w-40">Brand</th>
              {brands.map((b) => (
                <th key={b.id} className="px-3 py-2 min-w-[180px]">
                  <div className="flex flex-col items-center gap-2 rounded-xl p-3" style={{ background: 'var(--surface-2)', border: '1px solid var(--border)' }}>
                    <Avatar src={b.logoUrl} initials={b.companyName?.slice(0, 2)?.toUpperCase()} size="md" />
                    <p className="text-fg font-semibold text-center" style={{ fontFamily: 'Sora, sans-serif' }}>{b.companyName}</p>
                    {b.isVerified && <Badge variant="success" label="Verified" dot />}
                    <Button variant="ghost" size="xs" onClick={() => onRemove(b.id)}>Remove</Button>
                  </div>
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {ROWS.map((row) => (
              <tr key={row.key}>
                <td className="text-fg-muted text-xs font-medium px-3 py-2">{row.label}</td>
                {brands.map((b) => (
                  <td key={b.id} className="px-3 py-2 text-center text-fg font-semibold rounded-lg" style={{ background: 'var(--surface-2)' }}>
                    {row.format(b.intel?.[row.key] ?? '—')}
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </Modal>
  );
}

CompareBrandsModal.propTypes = {
  brands:  PropTypes.array.isRequired,
  isOpen:  PropTypes.bool.isRequired,
  onClose: PropTypes.func.isRequired,
  onRemove: PropTypes.func.isRequired,
};
