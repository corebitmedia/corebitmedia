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

  // The migration does ~150 sequential DB writes — long enough that Render's
  // own proxy can drop the connection before it finishes even though the
  // job itself completes fine server-side. So the POST just starts it and
  // returns immediately; this polls a status endpoint instead of awaiting
  // the job directly.
  function pollRestructureStatus() {
    api.get('/api/admin/restructure-nav/status').then((state) => {
      setRestructureResult({ stdout: state.log?.join('\n'), error: state.error });
      if (state.status === 'running') {
        setTimeout(pollRestructureStatus, 3000);
      } else {
        setRestructureStatus(state.status);
      }
    }).catch(() => setTimeout(pollRestructureStatus, 5000));
  }

  async function runRestructureNav() {
    if (!window.confirm('This re-runs the nav restructure migration (idempotent upsert by slug) — use it now to fix the duplicated "| Core Bit Media" in metaTitle values. Run it now?')) return;
    setRestructureStatus('running');
    setRestructureResult(null);
    try {
      await api.post('/api/admin/restructure-nav');
      pollRestructureStatus();
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
          <h4 style={{ marginTop: 0 }}>Maintenance — fix duplicated metaTitle suffix</h4>
          <p style={{ color: '#475569', fontSize: 14 }}>
            Re-runs the Analytics/Experimentation/Marketing/Industries content migration
            (backend/src/scripts/restructureNav.js), now with the redundant " | Core Bit Media"
            suffix stripped from metaTitle values (the root layout's title template already
            appends it). Safe to re-run (upserts by slug). Remove this card once you've run it
            successfully.
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
