'use client';

// Date range + dimension filter controls for the interactive GA4 dashboard.
// Plain inputs/selects, no picker library — matches this project's
// lightweight-by-default approach (see components/charts/LineChart.jsx).

const PRESETS = [
  { label: 'Last 7 days', startDate: '7daysAgo' },
  { label: 'Last 28 days', startDate: '28daysAgo' },
  { label: 'Last 30 days', startDate: '30daysAgo' },
  { label: 'Last 90 days', startDate: '90daysAgo' }
];

const selectStyle = { padding: '8px 10px', border: '1px solid var(--border)', borderRadius: 6, fontSize: 13, background: 'white' };

function optionsFrom(items, labelKey) {
  const names = Array.from(new Set((items || []).map((i) => i[labelKey]).filter(Boolean)));
  return names;
}

export default function FilterBar({ filters, onChange, baseData, loading }) {
  const isCustom = filters.startDate === 'custom';

  function setPreset(startDate) {
    onChange({ ...filters, startDate, endDate: 'today' });
  }

  function setCustomRange(field, value) {
    onChange({ ...filters, startDate: 'custom', [field]: value });
  }

  return (
    <div className="card" style={{ marginBottom: 24, display: 'flex', flexWrap: 'wrap', gap: 12, alignItems: 'center' }}>
      <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap' }}>
        {PRESETS.map((p) => (
          <button
            key={p.label}
            type="button"
            onClick={() => setPreset(p.startDate)}
            className={filters.startDate === p.startDate ? 'btn btn-sm' : 'btn btn-outline btn-sm'}
          >
            {p.label}
          </button>
        ))}
        <button
          type="button"
          onClick={() => onChange({ ...filters, startDate: 'custom', customStart: filters.customStart || '', customEnd: filters.customEnd || '' })}
          className={isCustom ? 'btn btn-sm' : 'btn btn-outline btn-sm'}
        >
          Custom
        </button>
        {isCustom && (
          <>
            <input type="date" value={filters.customStart || ''} onChange={(e) => setCustomRange('customStart', e.target.value)} style={selectStyle} />
            <span className="text-muted" style={{ fontSize: 13 }}>to</span>
            <input type="date" value={filters.customEnd || ''} onChange={(e) => setCustomRange('customEnd', e.target.value)} style={selectStyle} />
          </>
        )}
      </div>

      <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap', marginLeft: 'auto' }}>
        <select style={selectStyle} value={filters.channel || ''} onChange={(e) => onChange({ ...filters, channel: e.target.value })}>
          <option value="">All Channels</option>
          {optionsFrom(baseData?.channels, 'name').map((n) => <option key={n} value={n}>{n}</option>)}
        </select>
        <select style={selectStyle} value={filters.device || ''} onChange={(e) => onChange({ ...filters, device: e.target.value })}>
          <option value="">All Devices</option>
          {optionsFrom(baseData?.devices, 'name').map((n) => <option key={n} value={n}>{n}</option>)}
        </select>
        <select style={selectStyle} value={filters.country || ''} onChange={(e) => onChange({ ...filters, country: e.target.value })}>
          <option value="">All Countries</option>
          {optionsFrom(baseData?.countries, 'name').map((n) => <option key={n} value={n}>{n}</option>)}
        </select>
        {loading && <span className="text-muted" style={{ fontSize: 13, alignSelf: 'center' }}>Updating…</span>}
      </div>
    </div>
  );
}
