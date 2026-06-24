import PropTypes from 'prop-types';
import FinanceChart from './FinanceChart';

/** Gross Marketplace Volume trend chart. */
export default function GMVChart({ title = 'GMV Trend', subtitle, data, series, height, type }) {
  return <FinanceChart title={title} subtitle={subtitle} data={data} series={series} height={height} type={type} />;
}

GMVChart.propTypes = {
  title: PropTypes.string,
  subtitle: PropTypes.string,
  data: PropTypes.array.isRequired,
  series: PropTypes.array.isRequired,
  height: PropTypes.number,
  type: PropTypes.oneOf(['area', 'line']),
};
