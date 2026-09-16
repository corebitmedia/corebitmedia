import { useEffect, useState } from 'react';
import Layout from '../components/Layout.jsx';
import { api, CONTENT_TYPES } from '../lib/api.js';
import { useAuth } from '../lib/AuthContext.jsx';

export default function Dashboard() {
  const { user } = useAuth();
  const [counts, setCounts] = useState({});
  const [webCreativeStatus, setWebCreativeStatus] = useState('idle'); // idle | running | done | error
  const [webCreativeResult, setWebCreativeResult] = useState(null);

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

  async function runWebCreativeAdd() {
    if (!window.confirm('This adds a new "Web & Creative" pillar (Web Development, UI/UX Design, App Development, Content Writing) under the Marketing mega-menu. Run it now?')) return;
    setWebCreativeStatus('running');
    setWebCreativeResult(null);
    try {
      const result = await api.post('/api/admin/add-web-creative-services');
      setWebCreativeResult(result);
      setWebCreativeStatus('done');
    } catch (err) {
      setWebCreativeResult({ error: err.message });
      setWebCreativeStatus('error');
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
          <h4 style={{ marginTop: 0 }}>Maintenance — add Web & Creative services</h4>
          <p style={{ color: '#475569', fontSize: 14 }}>
            Adds a new "Web & Creative" pillar under the Marketing mega-menu with 4 new services:
            Web Development, UI/UX Design, App Development, and Content Writing. Safe to re-run
            (upserts by slug). Remove this card once you've run it successfully.
          </p>
          <button onClick={runWebCreativeAdd} disabled={webCreativeStatus === 'running'}>
            {webCreativeStatus === 'running' ? 'Running…' : 'Run Web & Creative Add'}
          </button>
          {webCreativeStatus === 'done' && (
            <div style={{ marginTop: 12 }}>
              <strong style={{ color: '#15803d' }}>Done.</strong> {webCreativeResult?.summary}
            </div>
          )}
          {webCreativeStatus === 'error' && (
            <div style={{ marginTop: 12 }}>
              <strong style={{ color: '#dc2626' }}>Failed:</strong> {webCreativeResult?.error}
            </div>
          )}
        </div>
      )}
    </Layout>
  );
}
