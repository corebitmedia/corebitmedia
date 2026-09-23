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

  async function runRestructure() {
    if (!window.confirm('This restructures Services into 6 top-level categories (Analytics Services, Reporting & Data Solutions, Conversion & Tracking Solutions, Paid Advertising Services, SEO & AI-Driven Discovery Services, Web & App Development) and adds 11 new services. Nothing existing is deleted. Run it now?')) return;
    setRestructureStatus('running');
    setRestructureResult(null);
    try {
      const result = await api.post('/api/admin/restructure-six-categories');
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
          <h4 style={{ marginTop: 0 }}>Maintenance — restructure into 6 service categories</h4>
          <p style={{ color: '#475569', fontSize: 14 }}>
            Moves Experimentation & CRO under Analytics; promotes Paid Media, SEO & Organic
            Growth, and Measurement & Attribution to their own top-level categories (renamed
            Paid Advertising Services, SEO & AI-Driven Discovery Services, and Conversion &
            Tracking Solutions); adds a new Reporting & Data Solutions category; and creates 11
            new services (Google Tag Gateway, Cookie Consent & Data Privacy, Data Privacy &
            Compliance, Third-Party Connectors, Other Integrations, E-commerce Tracking, User &
            Event Tracking, Native Ads, Off-Page & Authority, Local & Multi-Location SEO, SEO
            Reporting Insights). Nothing existing is deleted. Safe to re-run. Remove this card
            once you've run it successfully.
          </p>
          <button onClick={runRestructure} disabled={restructureStatus === 'running'}>
            {restructureStatus === 'running' ? 'Running… (can take a minute)' : 'Run Restructure Into 6 Categories'}
          </button>
          {restructureStatus === 'done' && (
            <div style={{ marginTop: 12 }}>
              <strong style={{ color: '#15803d' }}>Done.</strong> {restructureResult?.summary}
            </div>
          )}
          {restructureStatus === 'error' && (
            <div style={{ marginTop: 12 }}>
              <strong style={{ color: '#dc2626' }}>Failed:</strong> {restructureResult?.error}
            </div>
          )}
        </div>
      )}
    </Layout>
  );
}
