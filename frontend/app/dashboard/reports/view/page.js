'use client';

import { Suspense, useEffect, useState } from 'react';
import { useSearchParams } from 'next/navigation';
import { customerApi, isLoggedIn } from '../../../../lib/customerApi';
import DateRangePicker, { resolveDateRange } from '../../../../components/dashboard/DateRangePicker';
import LineChart from '../../../../components/charts/LineChart';
import BarChart from '../../../../components/charts/BarChart';
import PieChart from '../../../../components/charts/PieChart';
import BarList from '../../../../components/charts/BarList';

const METRIC_LABELS = {
  sessions: 'Sessions',
  activeUsers: 'Active Users',
  engagementRate: 'Engagement Rate',
  conversions: 'Conversions',
  screenPageViews: 'Page Views'
};
const SERIES_COLORS = ['var(--teal)', 'var(--gold)', 'var(--navy)'];

function Widget({ widget }) {
  const title = `${widget.metrics.map((m) => METRIC_LABELS[m] || m).join(' & ')}${widget.dimension && widget.type !== 'line' ? ` by ${widget.dimension}` : ''}`;

  return (
    <div className="card" style={{ marginBottom: 16 }}>
      <h3 style={{ marginBottom: 16 }}>{title}</h3>
      {widget.type === 'line' && (
        <LineChart
          data={widget.rows}
          series={widget.metrics.map((m, i) => ({ key: m, label: METRIC_LABELS[m] || m, color: SERIES_COLORS[i % SERIES_COLORS.length] }))}
        />
      )}
      {widget.type === 'bar' && <BarChart items={widget.rows} labelKey={widget.dimension} valueKey={widget.metrics[0]} />}
      {widget.type === 'pie' && <PieChart items={widget.rows} labelKey={widget.dimension} valueKey={widget.metrics[0]} />}
      {widget.type === 'table' && <BarList items={widget.rows} labelKey={widget.dimension} valueKey={widget.metrics[0]} />}
    </div>
  );
}

function ReportView() {
  const params = useSearchParams();
  const reportId = params.get('r');

  const [status, setStatus] = useState('loading');
  const [meta, setMeta] = useState(null);
  const [dateRange, setDateRange] = useState(null);
  const [result, setResult] = useState(null);
  const [running, setRunning] = useState(false);

  useEffect(() => {
    if (!isLoggedIn()) {
      window.location.href = '/dashboard/login/';
      return;
    }
    if (!reportId) {
      setStatus('notfound');
      return;
    }
    customerApi.get(`/api/ga4/custom-reports/${reportId}`)
      .then((r) => {
        setMeta(r);
        setDateRange({ startDate: r.dateRangeStart, endDate: r.dateRangeEnd });
      })
      .catch(() => setStatus('notfound'));
  }, [reportId]);

  useEffect(() => {
    if (!dateRange) return;
    setRunning(true);
    const { startDate, endDate } = resolveDateRange(dateRange);
    customerApi.post(`/api/ga4/custom-reports/${reportId}/run`, { startDate, endDate })
      .then((data) => {
        setResult(data);
        setStatus('ready');
      })
      .catch(() => setStatus('notfound'))
      .finally(() => setRunning(false));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [dateRange, reportId]);

  async function remove() {
    if (!window.confirm(`Delete "${meta.name}"?`)) return;
    await customerApi.del(`/api/ga4/custom-reports/${reportId}`);
    window.location.href = '/dashboard/reports/';
  }

  if (status === 'loading' && !meta) return <p className="text-muted" style={{ textAlign: 'center' }}>Loading…</p>;
  if (status === 'notfound') {
    return (
      <div className="card" style={{ maxWidth: 480, textAlign: 'center' }}>
        <p>This report isn't available.</p>
        <a href="/dashboard/reports/" className="btn" style={{ marginTop: 16 }}>Back to Reports</a>
      </div>
    );
  }

  return (
    <>
      <a href="/dashboard/reports/" className="text-muted" style={{ fontSize: 14, display: 'inline-block', marginBottom: 16 }}>&larr; All Reports</a>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: 12, marginBottom: 16 }}>
        <h1>{meta?.name}</h1>
        <div style={{ display: 'flex', gap: 8 }}>
          <a href={`/dashboard/reports/new/?r=${reportId}`} className="btn btn-outline btn-sm">Edit</a>
          <button type="button" onClick={remove} className="btn btn-outline btn-sm">Delete</button>
        </div>
      </div>

      <div className="card" style={{ marginBottom: 24 }}>
        {dateRange && <DateRangePicker value={dateRange} onChange={setDateRange} />}
        {running && <span className="text-muted" style={{ fontSize: 13, marginLeft: 12 }}>Updating…</span>}
      </div>

      {result?.widgets.map((w, i) => <Widget key={i} widget={w} />)}
    </>
  );
}

export default function ReportViewPage() {
  return (
    <Suspense fallback={null}>
      <ReportView />
    </Suspense>
  );
}
