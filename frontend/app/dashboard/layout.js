'use client';

import { Suspense, useEffect, useState } from 'react';
import { useSearchParams, usePathname } from 'next/navigation';
import Link from 'next/link';
import { customerApi, isLoggedIn, clearToken, getToken } from '../../lib/customerApi';
import Sidebar from '../../components/dashboard/Sidebar';
import ChatBox from '../../components/dashboard/ChatBox';

const API_BASE = process.env.NEXT_PUBLIC_API_BASE_URL;

// Reads `?id=` (the connection currently in view, if any) to decide what
// the chat panel talks about — a hook-based read rather than a prop, since
// layout.js has no access to the page's searchParams in the App Router.
// When no page has one in context (e.g. the Reports list or Account page),
// this fetches the customer's own connections and lets them pick one right
// here, or connect a first property if they have none yet.
function ChatPanel() {
  const params = useSearchParams();
  const urlId = params.get('id');

  const [connections, setConnections] = useState(null);
  const [pickedId, setPickedId] = useState('');

  useEffect(() => {
    if (urlId) return;
    customerApi.get('/api/ga4/my/connections').then(setConnections).catch(() => setConnections([]));
  }, [urlId]);

  const activeId = urlId || pickedId;
  if (activeId) return <ChatBox connectionId={activeId} />;

  if (connections === null) {
    return <p className="text-muted" style={{ fontSize: 13, padding: 16 }}>Loading…</p>;
  }

  if (connections.length === 0) {
    return (
      <div style={{ padding: 16 }}>
        <p className="text-muted" style={{ fontSize: 13, marginBottom: 12 }}>
          Connect a Google Analytics property to ask AI about your data.
        </p>
        <a href={`${API_BASE}/api/ga4/oauth/start?customerToken=${encodeURIComponent(getToken())}`} className="btn btn-sm">
          Connect Google Analytics
        </a>
      </div>
    );
  }

  return (
    <div style={{ padding: 16 }}>
      <label style={{ display: 'block', fontSize: 13, fontWeight: 600, marginBottom: 6 }}>Ask AI about which property?</label>
      <select
        defaultValue=""
        onChange={(e) => setPickedId(e.target.value)}
        style={{ width: '100%', padding: 8, border: '1px solid var(--border)', borderRadius: 6 }}
      >
        <option value="" disabled>Choose a property…</option>
        {connections.map((c) => (
          <option key={c.id} value={c.id}>{c.propertyDisplayName || c.googleEmail}</option>
        ))}
      </select>
    </div>
  );
}

const LOGIN_PATHS = ['/dashboard/login/', '/dashboard/signup/', '/dashboard/auth-callback/'];

export default function DashboardLayout({ children }) {
  const pathname = usePathname() || '';
  const isLoginPath = LOGIN_PATHS.some((p) => pathname.startsWith(p));
  const [customerName, setCustomerName] = useState('');
  const [panelOpen, setPanelOpen] = useState(true);

  useEffect(() => {
    if (isLoginPath) return;
    if (!isLoggedIn()) {
      window.location.href = '/dashboard/login/';
      return;
    }
    customerApi.get('/api/customers/me').then((c) => setCustomerName(c.name)).catch(() => {});
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isLoginPath]);

  function logout() {
    clearToken();
    window.location.href = '/dashboard/login/';
  }

  // Login/signup/callback pages render standalone — no sidebar/chat chrome
  // makes sense before a session exists. usePathname() (not
  // window.location) so this branch matches on both the server-rendered
  // and hydrated client output — a window-based check here would diverge
  // between the two and trigger a hydration mismatch.
  if (isLoginPath) {
    return children;
  }

  return (
    <div style={{ display: 'flex', flexDirection: 'column', minHeight: '100vh', background: 'var(--bg-alt)' }}>
      <header style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '0 24px', height: 64, background: 'white', borderBottom: '1px solid var(--border)' }}>
        <Link href="/dashboard/" style={{ fontWeight: 700, color: 'var(--navy)', fontSize: 16 }}>Core Bit Media</Link>
        <div style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
          {customerName && <span className="text-muted" style={{ fontSize: 13 }}>{customerName}</span>}
          <button type="button" onClick={logout} className="btn btn-outline btn-sm">Log Out</button>
        </div>
      </header>

      <div style={{ display: 'flex', flex: 1, minHeight: 0 }}>
        <aside style={{ width: 220, flexShrink: 0, background: 'white', borderRight: '1px solid var(--border)' }}>
          <Sidebar />
        </aside>

        <main style={{ flex: 1, minWidth: 0, padding: 24, overflowY: 'auto' }}>
          {children}
        </main>

        {panelOpen ? (
          <aside style={{ width: 320, flexShrink: 0, background: 'white', borderLeft: '1px solid var(--border)', display: 'flex', flexDirection: 'column' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '12px 16px', borderBottom: '1px solid var(--border)' }}>
              <strong style={{ fontSize: 13 }}>AI Assistant</strong>
              <button type="button" onClick={() => setPanelOpen(false)} className="text-muted" style={{ background: 'none', border: 'none', cursor: 'pointer', fontSize: 13 }}>
                Hide ✕
              </button>
            </div>
            <div style={{ flex: 1, overflowY: 'auto', padding: 12 }}>
              <Suspense fallback={null}>
                <ChatPanel />
              </Suspense>
            </div>
          </aside>
        ) : (
          <button
            type="button"
            onClick={() => setPanelOpen(true)}
            className="btn btn-sm"
            style={{ position: 'fixed', bottom: 24, right: 24 }}
          >
            Ask AI
          </button>
        )}
      </div>
    </div>
  );
}
