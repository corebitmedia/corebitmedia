'use client';

import { Suspense, useState } from 'react';
import { useSearchParams } from 'next/navigation';
import { setToken } from '../../../lib/customerApi';

const API_BASE = process.env.NEXT_PUBLIC_API_BASE_URL;

function LoginCard() {
  const params = useSearchParams();
  const googleError = params.get('error');

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e) {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      const res = await fetch(`${API_BASE}/api/customers/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password })
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Login failed');
      setToken(data.token);
      window.location.href = '/dashboard/';
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }

  return (
    <form className="card" style={{ maxWidth: 400, margin: '0 auto' }} onSubmit={handleSubmit}>
      <h2 style={{ textAlign: 'center', marginBottom: 20 }}>Log In</h2>

      <a
        href={`${API_BASE}/api/customers/oauth/google/start`}
        className="btn btn-outline"
        style={{ width: '100%', justifyContent: 'center', marginBottom: 16 }}
      >
        Continue with Google
      </a>
      <div style={{ textAlign: 'center', color: 'var(--muted)', fontSize: 13, margin: '16px 0' }}>or</div>

      {(error || googleError) && (
        <p style={{ color: '#dc2626', fontSize: 13, marginBottom: 16 }}>
          {error || 'Google sign-in failed — please try again.'}
        </p>
      )}

      <label style={{ display: 'block', fontSize: 13, fontWeight: 600, marginBottom: 6 }}>Email</label>
      <input
        type="email"
        required
        value={email}
        onChange={(e) => setEmail(e.target.value)}
        style={{ width: '100%', padding: 10, marginBottom: 16, border: '1px solid var(--border)', borderRadius: 6 }}
      />

      <label style={{ display: 'block', fontSize: 13, fontWeight: 600, marginBottom: 6 }}>Password</label>
      <input
        type="password"
        required
        value={password}
        onChange={(e) => setPassword(e.target.value)}
        style={{ width: '100%', padding: 10, marginBottom: 20, border: '1px solid var(--border)', borderRadius: 6 }}
      />

      <button type="submit" className="btn" disabled={loading} style={{ width: '100%' }}>
        {loading ? 'Logging in…' : 'Log In'}
      </button>

      <p className="text-muted" style={{ textAlign: 'center', fontSize: 13, marginTop: 16 }}>
        No account yet? <a href="/dashboard/signup/" style={{ color: 'var(--teal)' }}>Sign up</a>
      </p>
    </form>
  );
}

export default function DashboardLoginPage() {
  return (
    <section className="section">
      <div className="container">
        <Suspense fallback={null}>
          <LoginCard />
        </Suspense>
      </div>
    </section>
  );
}
