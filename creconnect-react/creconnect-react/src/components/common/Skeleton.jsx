import PropTypes from 'prop-types';
import { clsx } from 'clsx';

export default function Skeleton({ className = '', width, height, rounded = 'md' }) {
  const radiusMap = { sm: '6px', md: '10px', lg: '16px', full: '999px' };
  return (
    <div
      className={clsx('skeleton', className)}
      style={{
        width:  width  || '100%',
        height: height || '1rem',
        borderRadius: radiusMap[rounded] ?? '10px',
      }}
    />
  );
}

Skeleton.propTypes = {
  className: PropTypes.string,
  width:     PropTypes.oneOfType([PropTypes.string, PropTypes.number]),
  height:    PropTypes.oneOfType([PropTypes.string, PropTypes.number]),
  rounded:   PropTypes.oneOf(['sm', 'md', 'lg', 'full']),
};

/* Pre-built skeleton patterns */
export function SkeletonCard() {
  return (
    <div className="card rounded-2xl p-5 space-y-4">
      <div className="flex items-center gap-3">
        <Skeleton width={48} height={48} rounded="full" />
        <div className="flex-1 space-y-2">
          <Skeleton height={16} width="60%" />
          <Skeleton height={12} width="40%" />
        </div>
      </div>
      <Skeleton height={12} />
      <Skeleton height={12} width="80%" />
      <div className="flex gap-2">
        <Skeleton height={32} width={80} rounded="lg" />
        <Skeleton height={32} width={80} rounded="lg" />
      </div>
    </div>
  );
}

export function SkeletonRow() {
  return (
    <div className="flex items-center gap-3 py-3">
      <Skeleton width={40} height={40} rounded="full" />
      <div className="flex-1 space-y-2">
        <Skeleton height={14} width="50%" />
        <Skeleton height={12} width="30%" />
      </div>
      <Skeleton height={24} width={70} rounded="full" />
    </div>
  );
}
