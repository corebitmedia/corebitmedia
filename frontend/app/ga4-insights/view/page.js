'use client';

import { Suspense, useEffect, useState } from 'react';
import { useSearchParams } from 'next/navigation';
import StatCard from '../../../components/charts/StatCard';
import LineChart from '../../../components/charts/LineChart';
import BarList from '../../../components/charts/BarList';

const API_BASE = process.env.NEXT_PUBLIC_API_BASE_URL;

function formatPercent(n) {
  return `${Math.round((n || 0) * 100)}%`;
}

function ReportView() {
  const params = useSearchParams();
  const slug = params.get('r');

  const [status, setStatus] = useState('loading'); // loading | ready | notfound
  const [report, setReport] = useState(null);

  useEffect(() => {
    if (!slug) {
      setStatus('notfound');
      return;
    }
    fetch(`${API_BASE}/api/ga4/reports/${encodeURIComponent(slug)}`)
      .then((res) => {
        if (!res.ok) throw new Error('not found');
        return res.json();
      })
      .then((data) => {
        setReport(data);
        setStatus('ready');
      })
      .catch(() => setStatus('notfound'));
  }, [slug]);

  if (status === 'loading') {
    return <p className="text-muted" style={{ textAlign: 'center' }}>Loading report…</p>;
  }

  if (status === 'notfound') {
    return (
      <div className="card" style={{ maxWidth: 480, margin: '0 auto', textAlign: 'center' }}>
        <p>This report link doesn't exist or has been removed.</p>
      </div>
    );
  }

  const { data } = report;

  return (
    <>
      <div style={{ textAlign: 'center', marginBottom: 32 }}>
        <div className="eyebrow">{report.dateRangeLabel}</div>
        <h1>{report.title}</h1>
        <p className="text-muted" style={{ fontSize: 13, marginTop: 8 }}>
          Last updated {new Date(report.lastRefreshedAt).toLocaleString()}
        </p>
      </div>

      <div className="grid grid-4" style={{ marginBottom: 32 }}>
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

      <div className="grid grid-2">
        <div className="card">
          <h3 style={{ marginBottom: 16 }}>Top Channels</h3>
          <BarList items={data.channels} labelKey="name" valueKey="sessions" />
        </div>
        <div className="card">
          <h3 style={{ marginBottom: 16 }}>Top Pages</h3>
          <BarList items={data.topPages} labelKey="path" valueKey="views" />
        </div>
      </div>

      <div style={{ textAlign: 'center', marginTop: 40 }}>
        <p className="text-muted" style={{ fontSize: 13 }}>Powered by Core Bit Media</p>
        <a href="/contact-us/" className="btn" style={{ marginTop: 12 }}>Get a Full Marketing Audit</a>
      </div>
    </>
  );
}

export default function Ga4ViewPage() {
  return (
    <section className="section">
      <div className="container" style={{ maxWidth: 860 }}>
        <Suspense fallback={null}>
          <ReportView />
        </Suspense>
      </div>
    </section>
  );
}
