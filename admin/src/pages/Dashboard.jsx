import { useEffect, useState } from 'react';
import Layout from '../components/Layout.jsx';
import { api, CONTENT_TYPES } from '../lib/api.js';
import { useAuth } from '../lib/AuthContext.jsx';

export default function Dashboard() {
  const { user } = useAuth();
  const [counts, setCounts] = useState({});
  const [restructureStatus, setRestructureStatus] = useState('idle'); // idle | running | done | error
  const [restructureResult, setRestructureResult] = useState(null);

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

  async function runRestructureNav() {
    if (!window.confirm('This deletes the CRM & Marketing pillar (and a few other superseded pages) and creates ~35 new service/industry pages. Run it now?')) return;
    setRestructureStatus('running');
    setRestructureResult(null);
    try {
      const result = await api.post('/api/admin/restructure-nav');
      setRestructureResult(result);
      setRestructureStatus('done');
    } catch (err) {
      setRestructureResult({ error: err.message });
      setRestructureStatus('error');
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
          <h4 style={{ marginTop: 0 }}>Maintenance — one-time nav restructure</h4>
          <p style={{ color: '#475569', fontSize: 14 }}>
            Runs the Analytics/Experimentation/Marketing/Industries content migration
            (backend/src/scripts/restructureNav.js) against the live database. Safe to
            re-run (upserts by slug), but it does delete a few superseded pages the first
            time. Remove this card once you've run it successfully.
          </p>
          <button onClick={runRestructureNav} disabled={restructureStatus === 'running'}>
            {restructureStatus === 'running' ? 'Running… (can take a minute)' : 'Run Nav Restructure'}
          </button>
          {restructureStatus === 'done' && (
            <div style={{ marginTop: 12 }}>
              <strong style={{ color: '#15803d' }}>Done.</strong>
              <pre style={{ background: '#f1f5f9', padding: 12, borderRadius: 6, marginTop: 8, fontSize: 12, whiteSpace: 'pre-wrap', maxHeight: 240, overflowY: 'auto' }}>
                {restructureResult?.stdout || '(no output)'}
              </pre>
            </div>
          )}
          {restructureStatus === 'error' && (
            <div style={{ marginTop: 12 }}>
              <strong style={{ color: '#dc2626' }}>Failed:</strong> {restructureResult?.error}
              {restructureResult?.stderr && (
                <pre style={{ background: '#f1f5f9', padding: 12, borderRadius: 6, marginTop: 8, fontSize: 12, whiteSpace: 'pre-wrap', maxHeight: 240, overflowY: 'auto' }}>
                  {restructureResult.stderr}
                </pre>
              )}
            </div>
          )}
        </div>
      )}
    </Layout>
  );
}
