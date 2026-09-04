// Simple vertical column chart — plain inline SVG, no dependency.
export default function BarChart({ items, labelKey, valueKey }) {
  if (!items || items.length === 0) return <p className="text-muted" style={{ fontSize: 13 }}>No data yet.</p>;

  const width = 360;
  const height = 180;
  const padding = { top: 8, bottom: 32, left: 8, right: 8 };
  const innerH = height - padding.top - padding.bottom;
  const max = Math.max(1, ...items.map((i) => i[valueKey] || 0));
  const barWidth = (width - padding.left - padding.right) / items.length;

  return (
    <svg viewBox={`0 0 ${width} ${height}`} style={{ width: '100%', maxWidth: width, height: 'auto' }}>
      {items.map((item, i) => {
        const value = item[valueKey] || 0;
        const barH = (value / max) * innerH;
        const x = padding.left + i * barWidth;
        const y = padding.top + innerH - barH;
        return (
          <g key={item[labelKey] || i}>
            <rect x={x + 4} y={y} width={barWidth - 8} height={barH} fill="var(--teal)" rx="3" />
            <text x={x + barWidth / 2} y={height - 18} fontSize="10" fill="var(--muted)" textAnchor="middle">
              {(item[labelKey] || '').slice(0, 10)}
            </text>
            <text x={x + barWidth / 2} y={y - 4} fontSize="10" fill="var(--navy)" textAnchor="middle" fontWeight="600">
              {value}
            </text>
          </g>
        );
      })}
    </svg>
  );
}
