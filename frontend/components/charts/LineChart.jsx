// Plain inline SVG — no charting library dependency, consistent with this
// project's lightweight-by-default approach (see the Bootstrap removal).
// Draws up to two series (e.g. sessions + users) over a shared date axis.
export default function LineChart({ data, series }) {
  if (!data || data.length === 0) return null;

  const width = 640;
  const height = 220;
  const padding = { top: 16, right: 16, bottom: 28, left: 40 };
  const innerW = width - padding.left - padding.right;
  const innerH = height - padding.top - padding.bottom;

  const maxY = Math.max(1, ...data.flatMap((d) => series.map((s) => d[s.key] || 0)));
  const x = (i) => padding.left + (data.length === 1 ? 0 : (i / (data.length - 1)) * innerW);
  const y = (v) => padding.top + innerH - (v / maxY) * innerH;

  const pathFor = (key) => data.map((d, i) => `${i === 0 ? 'M' : 'L'} ${x(i)} ${y(d[key] || 0)}`).join(' ');

  return (
    <div style={{ overflowX: 'auto' }}>
      <svg viewBox={`0 0 ${width} ${height}`} style={{ width: '100%', minWidth: 480, height: 'auto' }}>
        <line x1={padding.left} y1={padding.top + innerH} x2={width - padding.right} y2={padding.top + innerH} stroke="var(--border)" />
        <text x={4} y={padding.top + 4} fontSize="11" fill="var(--muted)">{maxY}</text>
        <text x={4} y={padding.top + innerH} fontSize="11" fill="var(--muted)">0</text>
        {series.map((s) => (
          <path key={s.key} d={pathFor(s.key)} fill="none" stroke={s.color} strokeWidth="2.5" />
        ))}
        {data.length <= 15 && data.map((d, i) => (
          <text key={d.date} x={x(i)} y={height - 6} fontSize="9" fill="var(--muted)" textAnchor="middle">
            {(d.date || '').slice(4, 6)}/{(d.date || '').slice(6, 8)}
          </text>
        ))}
      </svg>
      <div style={{ display: 'flex', gap: 16, marginTop: 8, justifyContent: 'center' }}>
        {series.map((s) => (
          <div key={s.key} style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: 13 }}>
            <span style={{ width: 10, height: 10, borderRadius: '50%', background: s.color, display: 'inline-block' }} />
            {s.label}
          </div>
        ))}
      </div>
    </div>
  );
}
