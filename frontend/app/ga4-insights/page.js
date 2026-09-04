'use client';

import { Suspense } from 'react';
import { useSearchParams } from 'next/navigation';

const API_BASE = process.env.NEXT_PUBLIC_API_BASE_URL;

const ERROR_MESSAGES = {
  oauth_failed: 'Something went wrong connecting to Google. Please try again.',
  no_refresh_token: "Google didn't grant offline access — please try connecting again and accept all permissions."
};

function ConnectCard() {
  const params = useSearchParams();
  const error = params.get('error');

  return (
    <div className="card" style={{ maxWidth: 520, margin: '0 auto', textAlign: 'center' }}>
      <h2>Connect Your Google Analytics</h2>
      <p className="text-muted" style={{ marginTop: 12 }}>
        Get a free, instant dashboard of your site's traffic — sessions, users, top channels, and top pages
        over the last 30 days. We only ever get read-only access, and you can revoke it anytime from your
        Google Account.
      </p>
      {error && (
        <p style={{ color: '#dc2626', marginTop: 16, fontSize: 14 }}>{ERROR_MESSAGES[error] || 'Something went wrong.'}</p>
      )}
      <a href={`${API_BASE}/api/ga4/oauth/start`} className="btn" style={{ marginTop: 24 }}>
        Connect Google Analytics
      </a>
    </div>
  );
}

export default function Ga4InsightsPage() {
  return (
    <section className="section">
      <div className="container" style={{ textAlign: 'center', maxWidth: 720, margin: '0 auto 40px' }}>
        <div className="eyebrow">Free Tool</div>
        <h1>Your GA4 Data, Instantly Visualized</h1>
        <p className="text-muted" style={{ marginTop: 12 }}>
          Connect your Google Analytics 4 property and get a clean, shareable dashboard in seconds — no
          spreadsheets, no waiting on a report.
        </p>
      </div>
      <div className="container">
        <Suspense fallback={null}>
          <ConnectCard />
        </Suspense>
      </div>
    </section>
  );
}
