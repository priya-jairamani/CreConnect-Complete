import PropTypes from 'prop-types';

function cellColor(value) {
  if (value >= 80) return 'rgba(22, 179, 100, 0.55)';
  if (value >= 65) return 'rgba(109, 92, 255, 0.5)';
  if (value >= 50) return 'rgba(245, 166, 35, 0.45)';
  return 'rgba(240, 68, 95, 0.35)';
}

export default function AudienceHeatmapSection({ heatmap }) {
  if (!heatmap) return null;
  return (
    <div className="space-y-3">
      <p className="text-fg-muted text-sm">
        How strongly your audience overlaps with this brand&apos;s audience, by age group and platform. Darker cells indicate stronger overlap.
      </p>
      <div className="overflow-x-auto">
        <table className="w-full text-sm border-separate" style={{ borderSpacing: 6 }}>
          <thead>
            <tr>
              <th className="text-left text-fg-muted text-xs font-medium px-2">Age Group</th>
              {heatmap.platforms.map((p) => (
                <th key={p} className="text-fg-muted text-xs font-medium px-2">{p}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {heatmap.rows.map((row) => (
              <tr key={row.age}>
                <td className="text-fg text-xs font-semibold px-2 whitespace-nowrap">{row.age}</td>
                {row.cells.map((cell) => (
                  <td key={cell.platform} className="px-2">
                    <div
                      className="rounded-lg text-center text-xs font-semibold py-2"
                      style={{ background: cellColor(cell.value), color: 'var(--fg)' }}
                    >
                      {cell.value}%
                    </div>
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

AudienceHeatmapSection.propTypes = {
  heatmap: PropTypes.shape({
    platforms: PropTypes.arrayOf(PropTypes.string).isRequired,
    rows: PropTypes.arrayOf(PropTypes.shape({
      age: PropTypes.string.isRequired,
      cells: PropTypes.arrayOf(PropTypes.shape({
        platform: PropTypes.string.isRequired,
        value: PropTypes.number.isRequired,
      })).isRequired,
    })).isRequired,
  }).isRequired,
};
