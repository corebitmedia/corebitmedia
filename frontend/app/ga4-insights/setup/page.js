'use client';

import { Suspense, useEffect, useState } from 'react';
import { useSearchParams } from 'next/navigation';

const API_BASE = process.env.NEXT_PUBLIC_API_BASE_URL;

function SetupCard() {
  const params = useSearchParams();
  const token = params.get('token');

  const [status, setStatus] = useState('loading'); // loading | ready | generating | done | error
  const [properties, setProperties] = useState([]);
  const [propertyId, setPropertyId] = useState('');
  const [leadName, setLeadName] = useState('');
  const [leadEmail, setLeadEmail] = useState('');
  const [shareUrl, setShareUrl] = useState('');
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    if (!token) {
      setStatus('error');
      return;
    }
    fetch(`${API_BASE}/api/ga4/properties?token=${encodeURIComponent(token)}`)
      .then((res) => {
        if (!res.ok) throw new Error('failed');
        return res.json();
      })
      .then((data) => {
        setProperties(data.properties || []);
        if (data.properties?.[0]) setPropertyId(data.properties[0].propertyId);
        setStatus('ready');
      })
      .catch(() => setStatus('error'));
  }, [token]);

  async function handleGenerate(e) {
    e.preventDefault();
    if (!propertyId) return;
    setStatus('generating');
    const property = properties.find((p) => p.propertyId === propertyId);
    try {
      const res = await fetch(`${API_BASE}/api/ga4/reports`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          token,
          propertyId,
          propertyDisplayName: property?.displayName,
          leadName,
          leadEmail
        })
      });
      if (!res.ok) throw new Error('failed');
      const data = await res.json();
      setShareUrl(data.shareUrl);
      setStatus('done');
    } catch {
      setStatus('error');
    }
  }

  function copyLink() {
    navigator.clipboard.writeText(shareUrl).then(() => {
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    });
  }

  if (status === 'loading') {
    return <p className="text-muted" style={{ textAlign: 'center' }}>Loading your Google Analytics properties…</p>;
  }

  if (status === 'error') {
    return (
      <div className="card" style={{ maxWidth: 480, margin: '0 auto', textAlign: 'center' }}>
        <p style={{ color: '#dc2626' }}>This setup link is invalid or has expired.</p>
        <a href="/ga4-insights/" className="btn" style={{ marginTop: 16 }}>Start Over</a>
      </div>
    );
  }

  if (status === 'done') {
    return (
      <div className="card" style={{ maxWidth: 480, margin: '0 auto', textAlign: 'center' }}>
        <h3>Your report is ready!</h3>
        <p className="text-muted" style={{ marginTop: 8 }}>Share this link with anyone — no login required to view it.</p>
        <div style={{ display: 'flex', gap: 8, marginTop: 16 }}>
          <input readOnly value={shareUrl} style={{ flex: 1, padding: 10, border: '1px solid var(--border)', borderRadius: 6, fontSize: 13 }} />
          <button type="button" onClick={copyLink} className="btn btn-sm">{copied ? 'Copied!' : 'Copy'}</button>
        </div>
        <a href={shareUrl} className="btn" style={{ marginTop: 16 }}>View Report</a>
      </div>
    );
  }

  return (
    <form className="card" style={{ maxWidth: 480, margin: '0 auto' }} onSubmit={handleGenerate}>
      <label style={{ display: 'block', fontSize: 13, fontWeight: 600, marginBottom: 6 }}>Which GA4 property?</label>
      <select
        value={propertyId}
        onChange={(e) => setPropertyId(e.target.value)}
        required
        style={{ width: '100%', padding: 10, marginBottom: 16, border: '1px solid var(--border)', borderRadius: 6 }}
      >
        {properties.length === 0 && <option value="">No properties found on this Google account</option>}
        {properties.map((p) => (
          <option key={p.propertyId} value={p.propertyId}>{p.displayName} ({p.accountName})</option>
        ))}
      </select>

      <label style={{ display: 'block', fontSize: 13, fontWeight: 600, marginBottom: 6 }}>Your Name (optional)</label>
      <input
        value={leadName}
        onChange={(e) => setLeadName(e.target.value)}
        style={{ width: '100%', padding: 10, marginBottom: 16, border: '1px solid var(--border)', borderRadius: 6 }}
      />

      <label style={{ display: 'block', fontSize: 13, fontWeight: 600, marginBottom: 6 }}>Email (optional — we'll send you the link too)</label>
      <input
        type="email"
        value={leadEmail}
        onChange={(e) => setLeadEmail(e.target.value)}
        style={{ width: '100%', padding: 10, marginBottom: 16, border: '1px solid var(--border)', borderRadius: 6 }}
      />

      <button type="submit" className="btn" disabled={!propertyId || status === 'generating'} style={{ width: '100%' }}>
        {status === 'generating' ? 'Generating…' : 'Generate My Report'}
      </button>
    </form>
  );
}

export default function Ga4SetupPage() {
  return (
    <section className="section">
      <div className="container" style={{ textAlign: 'center', maxWidth: 640, margin: '0 auto 32px' }}>
        <h1>One More Step</h1>
      </div>
      <div className="container">
        <Suspense fallback={null}>
          <SetupCard />
        </Suspense>
      </div>
    </section>
  );
}
