'use client';

// Date-range presets + custom range inputs, shared by the live filter bar
// (FilterBar.jsx) and the custom report builder/viewer. `value` is
// { startDate, endDate, customStart?, customEnd? } — startDate is either a
// GA4 preset string ('7daysAgo' etc.) or the literal 'custom'.

const PRESETS = [
  { label: 'Last 7 days', startDate: '7daysAgo' },
  { label: 'Last 28 days', startDate: '28daysAgo' },
  { label: 'Last 30 days', startDate: '30daysAgo' },
  { label: 'Last 90 days', startDate: '90daysAgo' }
];

const inputStyle = { padding: '8px 10px', border: '1px solid var(--border)', borderRadius: 6, fontSize: 13, background: 'white' };

export function resolveDateRange(value) {
  if (value.startDate === 'custom') {
    return { startDate: value.customStart || '30daysAgo', endDate: value.customEnd || 'today' };
  }
  return { startDate: value.startDate, endDate: value.endDate || 'today' };
}

export default function DateRangePicker({ value, onChange }) {
  const isCustom = value.startDate === 'custom';

  return (
    <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap', alignItems: 'center' }}>
      {PRESETS.map((p) => (
        <button
          key={p.label}
          type="button"
          onClick={() => onChange({ ...value, startDate: p.startDate, endDate: 'today' })}
          className={value.startDate === p.startDate ? 'btn btn-sm' : 'btn btn-outline btn-sm'}
        >
          {p.label}
        </button>
      ))}
      <button
        type="button"
        onClick={() => onChange({ ...value, startDate: 'custom', customStart: value.customStart || '', customEnd: value.customEnd || '' })}
        className={isCustom ? 'btn btn-sm' : 'btn btn-outline btn-sm'}
      >
        Custom
      </button>
      {isCustom && (
        <>
          <input type="date" value={value.customStart || ''} onChange={(e) => onChange({ ...value, customStart: e.target.value })} style={inputStyle} />
          <span className="text-muted" style={{ fontSize: 13 }}>to</span>
          <input type="date" value={value.customEnd || ''} onChange={(e) => onChange({ ...value, customEnd: e.target.value })} style={inputStyle} />
        </>
      )}
    </div>
  );
}
