'use client';

import { Suspense, useEffect, useState } from 'react';
import { useSearchParams } from 'next/navigation';
import { customerApi, isLoggedIn } from '../../../../lib/customerApi';
import DateRangePicker from '../../../../components/dashboard/DateRangePicker';

// Mirrors ga4Service.ALLOWED_DIMENSIONS / ALLOWED_METRICS on the backend —
// the backend re-validates regardless, this just keeps the builder's
// choices from offering anything that would be rejected.
const DIMENSIONS = [
  { value: 'date', label: 'Date' },
  { value: 'sessionDefaultChannelGroup', label: 'Channel' },
  { value: 'deviceCategory', label: 'Device' },
  { value: 'country', label: 'Country' },
  { value: 'pagePath', label: 'Page Path' }
];
const METRICS = [
  { value: 'sessions', label: 'Sessions' },
  { value: 'activeUsers', label: 'Active Users' },
  { value: 'engagementRate', label: 'Engagement Rate' },
  { value: 'conversions', label: 'Conversions' },
  { value: 'screenPageViews', label: 'Page Views' }
];
const TYPES = [
  { value: 'line', label: 'Line Chart (trend over time)' },
  { value: 'bar', label: 'Bar Chart' },
  { value: 'pie', label: 'Pie Chart' },
  { value: 'table', label: 'Table (bar list)' }
];

function emptyWidget() {
  return { type: 'bar', dimension: 'sessionDefaultChannelGroup', metrics: ['sessions'], limit: 8 };
}

function ReportBuilder() {
  const params = useSearchParams();
  const connectionId = params.get('id');
  const editReportId = params.get('r');

  const [status, setStatus] = useState('loading');
  const [name, setName] = useState('');
  const [dateRange, setDateRange] = useState({ startDate: '30daysAgo', endDate: 'today' });
  const [widgets, setWidgets] = useState([emptyWidget()]);
  const [ownerConnectionId, setOwnerConnectionId] = useState(connectionId);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    if (!isLoggedIn()) {
      window.location.href = '/dashboard/login/';
      return;
    }
    if (!editReportId) {
      setStatus('ready');
      return;
    }
    customerApi.get(`/api/ga4/custom-reports/${editReportId}`)
      .then((r) => {
        setName(r.name);
        setDateRange({ startDate: r.dateRangeStart, endDate: r.dateRangeEnd });
        setWidgets(r.widgets);
        setOwnerConnectionId(r.connectionId);
        setStatus('ready');
      })
      .catch(() => setStatus('notfound'));
  }, [editReportId]);

  function updateWidget(i, patch) {
    setWidgets((prev) => prev.map((w, idx) => (idx === i ? { ...w, ...patch } : w)));
  }

  function toggleMetric(i, metric) {
    setWidgets((prev) => prev.map((w, idx) => {
      if (idx !== i) return w;
      const has = w.metrics.includes(metric);
      return { ...w, metrics: has ? w.metrics.filter((m) => m !== metric) : [...w.metrics, metric] };
    }));
  }

  async function save(e) {
    e.preventDefault();
    setError('');
    if (!name.trim()) return setError('Report name is required.');
    if (widgets.some((w) => w.metrics.length === 0)) return setError('Every widget needs at least one metric.');

    setSaving(true);
    const payload = { name, widgets, dateRangeStart: dateRange.startDate, dateRangeEnd: dateRange.endDate };
    try {
      let reportId = editReportId;
      if (editReportId) {
        await customerApi.patch(`/api/ga4/custom-reports/${editReportId}`, payload);
      } else {
        const { id } = await customerApi.post(`/api/ga4/my/connections/${ownerConnectionId}/custom-reports`, payload);
        reportId = id;
      }
      window.location.href = `/dashboard/reports/view/?r=${reportId}`;
    } catch (err) {
      setError(err.message);
      setSaving(false);
    }
  }

  if (status === 'loading') return <p className="text-muted" style={{ textAlign: 'center' }}>Loading…</p>;
  if (status === 'notfound' || !ownerConnectionId) {
    return (
      <div className="card" style={{ maxWidth: 480, textAlign: 'center' }}>
        <p>This report isn't available.</p>
        <a href="/dashboard/reports/" className="btn" style={{ marginTop: 16 }}>Back to Reports</a>
      </div>
    );
  }

  return (
    <form onSubmit={save}>
      <div className="eyebrow">Reports</div>
      <h1 style={{ marginBottom: 24 }}>{editReportId ? 'Edit Report' : 'New Report'}</h1>

      <div className="card" style={{ marginBottom: 24, maxWidth: 640 }}>
        <label style={{ display: 'block', fontSize: 13, fontWeight: 600, marginBottom: 6 }}>Report Name</label>
        <input
          value={name}
          onChange={(e) => setName(e.target.value)}
          style={{ width: '100%', padding: 10, marginBottom: 16, border: '1px solid var(--border)', borderRadius: 6 }}
        />
        <label style={{ display: 'block', fontSize: 13, fontWeight: 600, marginBottom: 6 }}>Default Date Range</label>
        <DateRangePicker value={dateRange} onChange={setDateRange} />
      </div>

      {widgets.map((w, i) => (
        <div key={i} className="card" style={{ marginBottom: 16, maxWidth: 640 }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 12 }}>
            <strong style={{ fontSize: 14 }}>Widget {i + 1}</strong>
            {widgets.length > 1 && (
              <button type="button" onClick={() => setWidgets((prev) => prev.filter((_, idx) => idx !== i))} className="text-muted" style={{ background: 'none', border: 'none', cursor: 'pointer', fontSize: 13 }}>
                Remove
              </button>
            )}
          </div>

          <div className="grid grid-2" style={{ gap: 12, marginBottom: 12 }}>
            <div>
              <label style={{ display: 'block', fontSize: 12, fontWeight: 600, marginBottom: 4 }}>Chart Type</label>
              <select
                value={w.type}
                onChange={(e) => {
                  const type = e.target.value;
                  updateWidget(i, { type, dimension: type === 'line' ? 'date' : (w.dimension === 'date' ? 'sessionDefaultChannelGroup' : w.dimension) });
                }}
                style={{ width: '100%', padding: 8, border: '1px solid var(--border)', borderRadius: 6 }}
              >
                {TYPES.map((t) => <option key={t.value} value={t.value}>{t.label}</option>)}
              </select>
            </div>
            <div>
              <label style={{ display: 'block', fontSize: 12, fontWeight: 600, marginBottom: 4 }}>Dimension</label>
              <select
                value={w.dimension}
                onChange={(e) => updateWidget(i, { dimension: e.target.value })}
                disabled={w.type === 'line'}
                style={{ width: '100%', padding: 8, border: '1px solid var(--border)', borderRadius: 6 }}
              >
                {(w.type === 'line' ? DIMENSIONS.filter((d) => d.value === 'date') : DIMENSIONS).map((d) => (
                  <option key={d.value} value={d.value}>{d.label}</option>
                ))}
              </select>
            </div>
          </div>

          <label style={{ display: 'block', fontSize: 12, fontWeight: 600, marginBottom: 4 }}>Metrics</label>
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: 12, marginBottom: 12 }}>
            {METRICS.map((m) => (
              <label key={m.value} style={{ fontSize: 13, display: 'flex', alignItems: 'center', gap: 4 }}>
                <input type="checkbox" checked={w.metrics.includes(m.value)} onChange={() => toggleMetric(i, m.value)} />
                {m.label}
              </label>
            ))}
          </div>

          {w.type !== 'line' && (
            <div style={{ maxWidth: 160 }}>
              <label style={{ display: 'block', fontSize: 12, fontWeight: 600, marginBottom: 4 }}>Max rows</label>
              <input
                type="number"
                min={1}
                max={50}
                value={w.limit || 10}
                onChange={(e) => updateWidget(i, { limit: Number(e.target.value) })}
                style={{ width: '100%', padding: 8, border: '1px solid var(--border)', borderRadius: 6 }}
              />
            </div>
          )}
        </div>
      ))}

      <button type="button" onClick={() => setWidgets((prev) => [...prev, emptyWidget()])} className="btn btn-outline btn-sm" style={{ marginBottom: 24 }}>
        + Add Widget
      </button>

      {error && <p style={{ color: '#dc2626', fontSize: 13, marginBottom: 16 }}>{error}</p>}

      <div>
        <button type="submit" className="btn" disabled={saving}>{saving ? 'Saving…' : 'Save Report'}</button>
      </div>
    </form>
  );
}

export default function NewReportPage() {
  return (
    <Suspense fallback={null}>
      <ReportBuilder />
    </Suspense>
  );
}
