import PropTypes from 'prop-types';
import FinanceChart from './FinanceChart';

/** Revenue-focused trend chart — platform revenue / total revenue over time. */
export default function RevenueChart({ title = 'Revenue Growth', subtitle, data, series, height, type }) {
  return <FinanceChart title={title} subtitle={subtitle} data={data} series={series} height={height} type={type} />;
}

RevenueChart.propTypes = {
  title: PropTypes.string,
  subtitle: PropTypes.string,
  data: PropTypes.array.isRequired,
  series: PropTypes.array.isRequired,
  height: PropTypes.number,
  type: PropTypes.oneOf(['area', 'line']),
};
