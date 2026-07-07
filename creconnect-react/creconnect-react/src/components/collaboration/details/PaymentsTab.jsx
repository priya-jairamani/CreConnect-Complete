import PropTypes from 'prop-types';
import Badge from '@/components/common/Badge';
import Skeleton from '@/components/common/Skeleton';
import EmptyState from '@/components/common/EmptyState';
import { formatPKR } from '@/utils/formatters';

const STATUS_META = {
  PENDING:  { label: 'Pending',   variant: 'warning' },
  ESCROW:   { label: 'In Escrow', variant: 'brand'   },
  RELEASED: { label: 'Released',  variant: 'success' },
  PAID:     { label: 'Paid',      variant: 'success' },
  DISPUTED: { label: 'Disputed',  variant: 'danger'  },
};

export default function PaymentsTab({ payments, isLoading, intel }) {
  if (isLoading) {
    return <div className="space-y-3">{[1, 2].map((i) => <Skeleton key={i} className="h-20 rounded-2xl" />)}</div>;
  }

  const list = Array.isArray(payments) ? payments : [];

  if (list.length === 0) {
    return (
      <EmptyState
        icon="💳"
        title="No payments yet"
        message={`Collaboration payment status: ${intel?.paymentStatus ?? 'Pending'}. The brand funds escrow before release.`}
      />
    );
  }

  const total = list.reduce((s, p) => s + (Number(p.amountPKR) || 0), 0);

  return (
    <div className="space-y-4">
      <div className="rounded-xl p-4 flex items-center justify-between" style={{ background: 'var(--surface-2)', border: '1px solid var(--border)' }}>
        <div>
          <p className="text-fg-muted text-xs">Total recorded</p>
          <p className="text-xl font-bold text-brand-400" style={{ fontFamily: 'Sora, sans-serif' }}>{formatPKR(total)}</p>
        </div>
        <Badge variant="neutral" label={`${list.length} payment${list.length !== 1 ? 's' : ''}`} />
      </div>

      <div className="space-y-3">
        {list.map((p) => {
          const meta = STATUS_META[p.status] ?? STATUS_META.PENDING;
          return (
            <div key={p.id} className="rounded-2xl p-4" style={{ background: 'var(--surface-2)', border: '1px solid var(--border)' }}>
              <div className="flex items-start justify-between gap-3">
                <div>
                  <p className="text-fg font-semibold">{formatPKR(p.amountPKR)}</p>
                  <p className="text-fg-muted text-xs mt-0.5">
                    Created {new Date(p.createdAt).toLocaleDateString('en-PK', { month: 'short', day: 'numeric', year: 'numeric' })}
                  </p>
                  {p.releasedAt && (
                    <p className="text-fg-muted text-xs">Released {new Date(p.releasedAt).toLocaleDateString('en-PK', { month: 'short', day: 'numeric', year: 'numeric' })}</p>
                  )}
                </div>
                <Badge variant={meta.variant} label={meta.label} />
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

PaymentsTab.propTypes = {
  payments:  PropTypes.array,
  isLoading: PropTypes.bool,
  intel:     PropTypes.object,
};
