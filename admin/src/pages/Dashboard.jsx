import { useEffect, useState } from 'react';
import Layout from '../components/Layout.jsx';
import { api, CONTENT_TYPES } from '../lib/api.js';
import { useAuth } from '../lib/AuthContext.jsx';

export default function Dashboard() {
  const { user } = useAuth();
  const [counts, setCounts] = useState({});
  const [ga4Status, setGa4Status] = useState('idle'); // idle | running | done | error
  const [ga4Result, setGa4Result] = useState(null);

  useEffect(() => {
    Object.entries(CONTENT_TYPES).forEach(([key, cfg]) => {
      api.get(`${cfg.path}/admin/all`).then((items) => {
        setCounts((prev) => ({
          ...prev,
          [key]: {
            total: items.length,
            pending: items.filter((i) => i.status === 'pending_review').length
          }
        }));
      });
    });
  }, []);

  async function runGa4Update() {
    if (!window.confirm('This renames the "GA4 Implementation & Migration" service to "GA4 Implementation" (dropping Universal Analytics migration copy and its old URL slug). Run it now?')) return;
    setGa4Status('running');
    setGa4Result(null);
    try {
      const result = await api.post('/api/admin/update-ga4-service');
      setGa4Result(result);
      setGa4Status('done');
    } catch (err) {
      setGa4Result({ error: err.message });
      setGa4Status('error');
    }
  }

  return (
    <Layout>
      <h2>Welcome back, {user?.name}</h2>
      <p style={{ color: '#64748b' }}>Here's what's happening on corebitmedia.com</p>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 16, marginTop: 24 }}>
        {Object.entries(CONTENT_TYPES).map(([key, cfg]) => (
          <div className="card" key={key}>
            <div style={{ color: '#64748b', fontSize: 13, marginBottom: 6 }}>{cfg.label}</div>
            <div style={{ fontSize: 28, fontWeight: 700, color: '#0b1f3a' }}>{counts[key]?.total ?? '—'}</div>
            {counts[key]?.pending > 0 && (
              <div style={{ fontSize: 12, color: '#92400e', marginTop: 4 }}>
                {counts[key].pending} pending review
              </div>
            )}
          </div>
        ))}
      </div>

      <div className="card" style={{ marginTop: 24 }}>
        <h4 style={{ marginTop: 0 }}>Quick tips</h4>
        <ul style={{ color: '#475569', fontSize: 14, lineHeight: 1.8 }}>
          <li>Authors: content you publish goes to "Pending Review" until an editor approves it.</li>
          <li>Use the <strong>AI Optimize</strong> button in any editor to auto-generate SEO/AEO/GEO metadata.</li>
          <li>Editors/Admins can approve pending content from its list view.</li>
        </ul>
      </div>

      {user?.role === 'admin' && (
        <div className="card" style={{ marginTop: 24, borderLeft: '3px solid #92400e' }}>
          <h4 style={{ marginTop: 0 }}>Maintenance — remove GA4 migration copy</h4>
          <p style={{ color: '#475569', fontSize: 14 }}>
            Universal Analytics is fully sunset, so this drops the migration-focused copy and FAQs
            from the GA4 service page and renames its URL from
            /services/ga4-implementation-migration/ to /services/ga4-implementation/ (a redirect
            is already in place). Safe to re-run. Remove this card once you've run it successfully.
          </p>
          <button onClick={runGa4Update} disabled={ga4Status === 'running'}>
            {ga4Status === 'running' ? 'Running…' : 'Run GA4 Update'}
          </button>
          {ga4Status === 'done' && (
            <div style={{ marginTop: 12 }}>
              <strong style={{ color: '#15803d' }}>Done.</strong> {ga4Result?.summary}
            </div>
          )}
          {ga4Status === 'error' && (
            <div style={{ marginTop: 12 }}>
              <strong style={{ color: '#dc2626' }}>Failed:</strong> {ga4Result?.error}
            </div>
          )}
        </div>
      )}
    </Layout>
  );
}
