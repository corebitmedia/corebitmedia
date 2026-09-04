export default function BarList({ items, labelKey, valueKey }) {
  if (!items || items.length === 0) return <p className="text-muted" style={{ fontSize: 13 }}>No data yet.</p>;
  const max = Math.max(1, ...items.map((i) => i[valueKey] || 0));

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
      {items.map((item) => (
        <div key={item[labelKey]}>
          <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 13, marginBottom: 4 }}>
            <span style={{ overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', maxWidth: '75%' }}>{item[labelKey] || '(not set)'}</span>
            <span className="text-muted">{item[valueKey]}</span>
          </div>
          <div style={{ background: 'var(--bg-alt)', borderRadius: 4, height: 6 }}>
            <div style={{ width: `${(item[valueKey] / max) * 100}%`, background: 'var(--teal)', height: '100%', borderRadius: 4 }} />
          </div>
        </div>
      ))}
    </div>
  );
}
