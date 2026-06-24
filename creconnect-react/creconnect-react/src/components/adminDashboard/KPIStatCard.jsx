import { useState } from 'react';
import PropTypes from 'prop-types';
import { motion } from 'framer-motion';
import AnimatedCounter from '@/components/common/AnimatedCounter';
import Sparkline from './Sparkline';
import { formatCompactPKR } from '@/utils/formatters';

function formatValue(value, format) {
  if (format === 'pkr') return formatCompactPKR(Math.round(value));
  if (format === 'percent') return `${value.toFixed(1)}%`;
  return Math.round(value).toLocaleString();
}

/** Premium executive KPI card — sparkline, trend badge, hover comparison. */
export default function KPIStatCard({ kpi }) {
  const [hovered, setHovered] = useState(false);
  const { label, icon, value, prevValue, format, sparkline, accent } = kpi;

  const change = value - prevValue;
  const pct = prevValue ? (change / prevValue) * 100 : 0;
  const isPositive = pct >= 0;

  return (
    <div
      className="card card-hover rounded-2xl p-5 flex flex-col gap-3 relative overflow-hidden group"
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
    >
      <div className="flex items-center justify-between">
        <div
          className="w-10 h-10 rounded-xl flex items-center justify-center text-lg flex-shrink-0"
          style={{ background: `${accent}1f`, color: accent }}
        >
          {icon}
        </div>
        <span
          className={
            'text-xs font-semibold px-2 py-0.5 rounded-full ' +
            (isPositive ? 'bg-success/15 text-success' : 'bg-danger/15 text-danger')
          }
        >
          {isPositive ? '+' : ''}
          {pct.toFixed(1)}%
        </span>
      </div>

      <div>
        <p
          className="text-3xl text-fg font-700 leading-none"
          style={{ fontFamily: 'Sora, sans-serif', fontWeight: 700 }}
        >
          <AnimatedCounter value={value} format={(v) => formatValue(v, format)} />
        </p>
        <p className="text-fg-muted text-sm mt-1.5">{label}</p>
      </div>

      <div className="mt-1">
        <Sparkline data={sparkline} color={accent} />
      </div>

      <motion.div
        initial={false}
        animate={{ opacity: hovered ? 1 : 0, height: hovered ? 'auto' : 0 }}
        transition={{ duration: 0.2, ease: 'easeOut' }}
        className="overflow-hidden"
      >
        <div className="pt-2 border-t border-border-subtle text-xs text-fg-muted flex items-center justify-between">
          <span>Previous period</span>
          <span className="text-fg font-medium">{formatValue(prevValue, format)}</span>
        </div>
      </motion.div>
    </div>
  );
}

KPIStatCard.propTypes = {
  kpi: PropTypes.shape({
    label: PropTypes.string.isRequired,
    icon: PropTypes.node,
    value: PropTypes.number.isRequired,
    prevValue: PropTypes.number.isRequired,
    format: PropTypes.oneOf(['number', 'pkr', 'percent']),
    sparkline: PropTypes.arrayOf(PropTypes.number),
    accent: PropTypes.string,
  }).isRequired,
};
