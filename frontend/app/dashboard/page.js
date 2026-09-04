'use client';

import { useEffect, useState } from 'react';
import { customerApi, isLoggedIn, getToken, clearToken } from '../../lib/customerApi';

const API_BASE = process.env.NEXT_PUBLIC_API_BASE_URL;

export default function DashboardPage() {
  const [status, setStatus] = useState('loading'); // loading | ready
  const [connections, setConnections] = useState([]);
  const [customer, setCustomer] = useState(null);

  useEffect(() => {
    if (!isLoggedIn()) {
      window.location.href = '/dashboard/login/';
      return;
    }
    Promise.all([customerApi.get('/api/customers/me'), customerApi.get('/api/ga4/my/connections')])
      .then(([me, conns]) => {
        setCustomer(me);
        setConnections(conns);
        setStatus('ready');
      })
      .catch(() => {});
  }, []);

  function logout() {
    clearToken();
    window.location.href = '/dashboard/login/';
  }

  if (status === 'loading') {
    return (
      <section className="section">
        <div className="container">
          <p className="text-muted" style={{ textAlign: 'center' }}>Loading your dashboard…</p>
        </div>
      </section>
    );
  }

  return (
    <section className="section">
      <div className="container" style={{ maxWidth: 860 }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 32, flexWrap: 'wrap', gap: 12 }}>
          <div>
            <div className="eyebrow">Dashboard</div>
            <h1>Welcome, {customer?.name}</h1>
          </div>
          <button type="button" onClick={logout} className="btn btn-outline btn-sm">Log Out</button>
        </div>

        {connections.length === 0 && (
          <div className="card" style={{ textAlign: 'center', padding: 40 }}>
            <h3>No properties connected yet</h3>
            <p className="text-muted" style={{ marginTop: 8 }}>Connect your Google Analytics 4 property to see your first dashboard.</p>
            <a href={`${API_BASE}/api/ga4/oauth/start?customerToken=${encodeURIComponent(getToken())}`} className="btn" style={{ marginTop: 20 }}>
              Connect Google Analytics
            </a>
          </div>
        )}

        {connections.length > 0 && (
          <>
            <div className="grid grid-2">
              {connections.map((c) => (
                <a key={c.id} href={`/dashboard/view/?id=${c.id}`} className="card hoverable" style={{ display: 'block' }}>
                  <h3>{c.propertyDisplayName || c.googleEmail}</h3>
                  <p className="text-muted" style={{ fontSize: 13, marginTop: 6 }}>{c.googleEmail}</p>
                  {c.latestReport ? (
                    <p style={{ fontSize: 13, marginTop: 12, color: 'var(--teal)' }}>View Dashboard →</p>
                  ) : (
                    <p style={{ fontSize: 13, marginTop: 12, color: 'var(--muted)' }}>Setup incomplete</p>
                  )}
                </a>
              ))}
            </div>
            <div style={{ textAlign: 'center', marginTop: 32 }}>
              <a href={`${API_BASE}/api/ga4/oauth/start?customerToken=${encodeURIComponent(getToken())}`} className="btn btn-outline">
                Connect Another Property
              </a>
            </div>
          </>
        )}
      </div>
    </section>
  );
}
