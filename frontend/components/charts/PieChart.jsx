const COLORS = ['var(--teal)', 'var(--gold)', 'var(--navy)', '#8e2680', '#64748b', '#0a8f89', '#f3c9ff', '#232358'];

export default function PieChart({ items, labelKey, valueKey }) {
  if (!items || items.length === 0) return <p className="text-muted" style={{ fontSize: 13 }}>No data yet.</p>;

  const total = items.reduce((sum, i) => sum + (i[valueKey] || 0), 0) || 1;
  const size = 160;
  const r = 70;
  const cx = size / 2;
  const cy = size / 2;

  let angle = -90;
  const slices = items.map((item, i) => {
    const value = item[valueKey] || 0;
    const sliceAngle = (value / total) * 360;
    const startRad = (angle * Math.PI) / 180;
    angle += sliceAngle;
    const endRad = (angle * Math.PI) / 180;
    const x1 = cx + r * Math.cos(startRad);
    const y1 = cy + r * Math.sin(startRad);
    const x2 = cx + r * Math.cos(endRad);
    const y2 = cy + r * Math.sin(endRad);
    const largeArc = sliceAngle > 180 ? 1 : 0;
    const path = `M ${cx} ${cy} L ${x1} ${y1} A ${r} ${r} 0 ${largeArc} 1 ${x2} ${y2} Z`;
    return { path, color: COLORS[i % COLORS.length], label: item[labelKey], value };
  });

  return (
    <div style={{ display: 'flex', gap: 20, alignItems: 'center', flexWrap: 'wrap' }}>
      <svg viewBox={`0 0 ${size} ${size}`} style={{ width: 160, height: 160, flexShrink: 0 }}>
        {slices.map((s, i) => <path key={i} d={s.path} fill={s.color} />)}
      </svg>
      <div style={{ display: 'flex', flexDirection: 'column', gap: 6, fontSize: 13 }}>
        {slices.map((s, i) => (
          <div key={i} style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
            <span style={{ width: 10, height: 10, borderRadius: '50%', background: s.color, display: 'inline-block', flexShrink: 0 }} />
            <span style={{ overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', maxWidth: 140 }}>{s.label || '(not set)'}</span>
            <span className="text-muted">{s.value}</span>
          </div>
        ))}
      </div>
    </div>
  );
}
