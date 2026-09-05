'use client';

// Date range + dimension filter controls for the interactive GA4 dashboard.
// Plain inputs/selects, no picker library — matches this project's
// lightweight-by-default approach (see components/charts/LineChart.jsx).

import DateRangePicker from './DateRangePicker';

const selectStyle = { padding: '8px 10px', border: '1px solid var(--border)', borderRadius: 6, fontSize: 13, background: 'white' };

function optionsFrom(items, labelKey) {
  const names = Array.from(new Set((items || []).map((i) => i[labelKey]).filter(Boolean)));
  return names;
}

export default function FilterBar({ filters, onChange, baseData, loading }) {
  return (
    <div className="card" style={{ marginBottom: 24, display: 'flex', flexWrap: 'wrap', gap: 12, alignItems: 'center' }}>
      <DateRangePicker value={filters} onChange={onChange} />

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
