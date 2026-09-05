'use client';

import { useEffect, useState } from 'react';
import { customerApi, isLoggedIn } from '../../../lib/customerApi';

export default function ReportsListPage() {
  const [status, setStatus] = useState('loading');
  const [connections, setConnections] = useState([]);
  const [reportsByConnection, setReportsByConnection] = useState({});

  useEffect(() => {
    if (!isLoggedIn()) {
      window.location.href = '/dashboard/login/';
      return;
    }
    customerApi.get('/api/ga4/my/connections')
      .then(async (conns) => {
        setConnections(conns);
        const entries = await Promise.all(
          conns.map((c) => customerApi.get(`/api/ga4/my/connections/${c.id}/custom-reports`).then((reports) => [c.id, reports]).catch(() => [c.id, []]))
        );
        setReportsByConnection(Object.fromEntries(entries));
        setStatus('ready');
      })
      .catch(() => setStatus('ready'));
  }, []);

  if (status === 'loading') {
    return <p className="text-muted" style={{ textAlign: 'center' }}>Loading…</p>;
  }

  return (
    <>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 24, flexWrap: 'wrap', gap: 12 }}>
        <div>
          <div className="eyebrow">Reports</div>
          <h1>Custom Reports</h1>
        </div>
      </div>

      {connections.length === 0 && (
        <div className="card" style={{ textAlign: 'center', padding: 40 }}>
          <p>Connect a GA4 property first to build a custom report.</p>
          <a href="/dashboard/" className="btn" style={{ marginTop: 16 }}>Go to My Properties</a>
        </div>
      )}

      {connections.map((c) => (
        <div key={c.id} className="card" style={{ marginBottom: 16 }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 }}>
            <h3>{c.propertyDisplayName || c.googleEmail}</h3>
            <a href={`/dashboard/reports/new/?id=${c.id}`} className="btn btn-sm">New Report</a>
          </div>
          {(reportsByConnection[c.id] || []).length === 0 ? (
            <p className="text-muted" style={{ fontSize: 13 }}>No custom reports yet for this property.</p>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
              {reportsByConnection[c.id].map((r) => (
                <a key={r.id} href={`/dashboard/reports/view/?r=${r.id}`} style={{ fontSize: 14, padding: '8px 0', borderBottom: '1px solid var(--border)' }}>
                  {r.name}
                </a>
              ))}
            </div>
          )}
        </div>
      ))}
    </>
  );
}
