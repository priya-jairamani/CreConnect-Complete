import PropTypes from 'prop-types';
import Avatar from '@/components/common/Avatar';
import Badge from '@/components/common/Badge';
import Button from '@/components/common/Button';

export default function UserTable({ title, columns, rows, onApprove, onReject }) {
  return (
    <div className="bg-navy-800 border border-navy-600 rounded-2xl overflow-hidden">
      <div className="px-5 py-4 border-b border-navy-700">
        <h2 className="text-cream-200 font-bold text-base">{title}</h2>
      </div>

      {/* Table header */}
      <div className="grid px-5 py-2 bg-navy-900/50 text-navy-400 text-xs uppercase tracking-wider font-semibold"
           style={{ gridTemplateColumns: columns.map(() => '1fr').join(' ') + ' 120px' }}>
        {columns.map((c) => <span key={c}>{c}</span>)}
        <span>Actions</span>
      </div>

      {/* Rows */}
      {rows.map((row) => (
        <div
          key={row.id}
          className="grid px-5 py-3.5 border-t border-navy-700 items-center text-sm"
          style={{ gridTemplateColumns: columns.map(() => '1fr').join(' ') + ' 120px' }}
        >
          {/* Name column always first */}
          <div className="flex items-center gap-3">
            <Avatar initials={row.initial} size="sm" className={row.color} />
            <span className="text-white font-medium">{row.name}</span>
          </div>

          {/* Remaining columns */}
          {row.cells?.map((cell, i) => (
            <span key={i} className="text-navy-300">{cell}</span>
          ))}

          {/* Status */}
          <Badge status={row.status} />

          {/* Actions */}
          <div className="flex gap-2">
            {row.status !== 'approved' && (
              <Button variant="primary" size="sm" onClick={() => onApprove?.(row.id)}>
                Approve
              </Button>
            )}
            <Button variant="danger" size="sm" onClick={() => onReject?.(row.id)}>
              Reject
            </Button>
          </div>
        </div>
      ))}
    </div>
  );
}

UserTable.propTypes = {
  title:     PropTypes.string.isRequired,
  columns:   PropTypes.arrayOf(PropTypes.string).isRequired,
  rows:      PropTypes.array.isRequired,
  onApprove: PropTypes.func,
  onReject:  PropTypes.func,
};
