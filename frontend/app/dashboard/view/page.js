'use client';

import { Suspense, useEffect, useRef, useState } from 'react';
import { useSearchParams } from 'next/navigation';
import { customerApi, isLoggedIn } from '../../../lib/customerApi';
import StatCard from '../../../components/charts/StatCard';
import LineChart from '../../../components/charts/LineChart';
import BarList from '../../../components/charts/BarList';
import PieChart from '../../../components/charts/PieChart';
import BarChart from '../../../components/charts/BarChart';
import FilterBar from '../../../components/dashboard/FilterBar';
import ChatBox from '../../../components/dashboard/ChatBox';

function formatPercent(n) {
  return `${Math.round((n || 0) * 100)}%`;
}

function DashboardDetail() {
  const params = useSearchParams();
  const id = params.get('id');

  const [status, setStatus] = useState('loading'); // loading | ready | notfound
  const [connection, setConnection] = useState(null);
  const [recStatus, setRecStatus] = useState('idle'); // idle | loading | done
  const [shareCopied, setShareCopied] = useState(false);

  const [liveData, setLiveData] = useState(null);
  const [filters, setFilters] = useState({ startDate: '30daysAgo', endDate: 'today', channel: '', device: '', country: '' });
  const [queryLoading, setQueryLoading] = useState(false);
  const debounceRef = useRef(null);
  const isFirstRun = useRef(true);

  useEffect(() => {
    if (!isLoggedIn()) {
      window.location.href = '/dashboard/login/';
      return;
    }
    if (!id) {
      setStatus('notfound');
      return;
    }
    customerApi.get(`/api/ga4/my/connections/${id}`)
      .then((data) => {
        setConnection(data);
        setLiveData(data.report?.data || null);
        setStatus('ready');
      })
      .catch(() => setStatus('notfound'));
  }, [id]);

  // Resolves the filter bar's preset/custom date-range shape into the
  // GA4-format startDate/endDate the backend expects.
  function resolveDateRange(f) {
    if (f.startDate === 'custom') {
      return { startDate: f.customStart || '30daysAgo', endDate: f.customEnd || 'today' };
    }
    return { startDate: f.startDate, endDate: f.endDate };
  }

  useEffect(() => {
    if (isFirstRun.current) {
      isFirstRun.current = false;
      return;
    }
    if (!id) return;

    clearTimeout(debounceRef.current);
    debounceRef.current = setTimeout(() => {
      setQueryLoading(true);
      const { startDate, endDate } = resolveDateRange(filters);
      customerApi.post(`/api/ga4/my/connections/${id}/query`, {
        startDate,
        endDate,
        channel: filters.channel || undefined,
        device: filters.device || undefined,
        country: filters.country || undefined
      })
        .then(({ data }) => setLiveData(data))
        .finally(() => setQueryLoading(false));
    }, 400);

    return () => clearTimeout(debounceRef.current);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [filters, id]);

  async function generateRecommendations() {
    setRecStatus('loading');
    try {
      const { aiRecommendations } = await customerApi.post(`/api/ga4/my/connections/${id}/recommendations`);
      setConnection((prev) => ({ ...prev, report: { ...prev.report, aiRecommendations } }));
    } finally {
      setRecStatus('done');
    }
  }

  function copyShareLink() {
    const url = `${window.location.origin}/ga4-insights/view/?r=${connection.report.shareSlug}`;
    navigator.clipboard.writeText(url).then(() => {
      setShareCopied(true);
      setTimeout(() => setShareCopied(false), 2000);
    });
  }

  if (status === 'loading') {
    return <p className="text-muted" style={{ textAlign: 'center' }}>Loading dashboard…</p>;
  }
  if (status === 'notfound' || !connection?.report) {
    return (
      <div className="card" style={{ maxWidth: 480, margin: '0 auto', textAlign: 'center' }}>
        <p>This dashboard isn't ready yet.</p>
        <a href="/dashboard/" className="btn" style={{ marginTop: 16 }}>Back to Dashboard</a>
      </div>
    );
  }

  const { data: baseData, aiRecommendations, lastRefreshedAt, shareSlug } = connection.report;
  const data = liveData || baseData;

  return (
    <>
      <a href="/dashboard/" className="text-muted" style={{ fontSize: 14, display: 'inline-block', marginBottom: 16 }}>&larr; All Properties</a>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: 12, marginBottom: 24 }}>
        <div>
          <div className="eyebrow">Interactive Dashboard</div>
          <h1>{connection.propertyDisplayName}</h1>
          <p className="text-muted" style={{ fontSize: 13, marginTop: 4 }}>
            Snapshot last refreshed {new Date(lastRefreshedAt).toLocaleString()}
          </p>
        </div>
        <div style={{ display: 'flex', gap: 8 }}>
          <a href={`/dashboard/mcp-setup/?id=${connection.id}`} className="btn btn-outline btn-sm">Connect to Claude Desktop</a>
          <button type="button" onClick={copyShareLink} className="btn btn-outline btn-sm">
            {shareCopied ? 'Link Copied!' : 'Share Report'}
          </button>
        </div>
      </div>

      <FilterBar filters={filters} onChange={setFilters} baseData={baseData} loading={queryLoading} />

      <div className="grid grid-4" style={{ marginBottom: 24 }}>
        <StatCard label="Sessions" value={data.totals.sessions.toLocaleString()} />
        <StatCard label="Users" value={data.totals.users.toLocaleString()} />
        <StatCard label="Engagement Rate" value={formatPercent(data.totals.engagementRate)} />
        <StatCard label="Conversions" value={data.totals.conversions.toLocaleString()} />
      </div>

      <div className="card" style={{ marginBottom: 24 }}>
        <h3 style={{ marginBottom: 16 }}>Traffic Trend</h3>
        <LineChart
          data={data.trend}
          series={[
            { key: 'sessions', label: 'Sessions', color: 'var(--teal)' },
            { key: 'users', label: 'Users', color: 'var(--gold)' }
          ]}
        />
      </div>

      <div className="grid grid-2" style={{ marginBottom: 24 }}>
        <div className="card">
          <h3 style={{ marginBottom: 16 }}>By Device</h3>
          <PieChart items={data.devices} labelKey="name" valueKey="sessions" />
        </div>
        <div className="card">
          <h3 style={{ marginBottom: 16 }}>Top Countries</h3>
          <BarChart items={data.countries} labelKey="name" valueKey="sessions" />
        </div>
      </div>

      <div className="grid grid-2" style={{ marginBottom: 24 }}>
        <div className="card">
          <h3 style={{ marginBottom: 16 }}>Top Channels</h3>
          <BarList items={data.channels} labelKey="name" valueKey="sessions" />
        </div>
        <div className="card">
          <h3 style={{ marginBottom: 16 }}>Top Pages</h3>
          <BarList items={data.topPages} labelKey="path" valueKey="views" />
        </div>
      </div>

      <div style={{ marginBottom: 24 }}>
        <ChatBox connectionId={connection.id} />
      </div>

      <div className="card">
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 }}>
          <h3>AI Recommendations</h3>
          <button type="button" onClick={generateRecommendations} disabled={recStatus === 'loading'} className="btn btn-sm">
            {recStatus === 'loading' ? 'Thinking…' : aiRecommendations ? 'Regenerate' : 'Generate'}
          </button>
        </div>
        {!aiRecommendations && recStatus !== 'loading' && (
          <p className="text-muted" style={{ fontSize: 13 }}>Get 3-5 specific, AI-generated recommendations based on this data.</p>
        )}
        {aiRecommendations && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
            {aiRecommendations.map((rec, i) => (
              <div key={i} style={{ paddingLeft: 12, borderLeft: `3px solid ${rec.priority === 'high' ? '#dc2626' : rec.priority === 'medium' ? 'var(--gold)' : 'var(--border)'}` }}>
                <strong style={{ fontSize: 14 }}>{rec.title}</strong>
                <p className="text-muted" style={{ fontSize: 13, marginTop: 4 }}>{rec.detail}</p>
              </div>
            ))}
          </div>
        )}
      </div>
    </>
  );
}

export default function DashboardViewPage() {
  return (
    <section className="section">
      <div className="container" style={{ maxWidth: 900 }}>
        <Suspense fallback={null}>
          <DashboardDetail />
        </Suspense>
      </div>
    </section>
  );
}
