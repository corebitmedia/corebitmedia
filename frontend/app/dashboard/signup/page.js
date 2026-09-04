'use client';

import { useState } from 'react';
import { setToken } from '../../../lib/customerApi';

const API_BASE = process.env.NEXT_PUBLIC_API_BASE_URL;

export default function DashboardSignupPage() {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e) {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      const res = await fetch(`${API_BASE}/api/customers/signup`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name, email, password })
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Signup failed');
      setToken(data.token);
      window.location.href = '/dashboard/';
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }

  return (
    <section className="section">
      <div className="container">
        <form className="card" style={{ maxWidth: 400, margin: '0 auto' }} onSubmit={handleSubmit}>
          <h2 style={{ textAlign: 'center', marginBottom: 8 }}>Create Your Free Account</h2>
          <p className="text-muted" style={{ textAlign: 'center', fontSize: 13, marginBottom: 20 }}>
            Connect GA4, get instant dashboards, AI recommendations, and shareable reports.
          </p>

          <a
            href={`${API_BASE}/api/customers/oauth/google/start`}
            className="btn btn-outline"
            style={{ width: '100%', justifyContent: 'center', marginBottom: 16 }}
          >
            Continue with Google
          </a>
          <div style={{ textAlign: 'center', color: 'var(--muted)', fontSize: 13, margin: '16px 0' }}>or</div>

          {error && <p style={{ color: '#dc2626', fontSize: 13, marginBottom: 16 }}>{error}</p>}

          <label style={{ display: 'block', fontSize: 13, fontWeight: 600, marginBottom: 6 }}>Name</label>
          <input
            required
            value={name}
            onChange={(e) => setName(e.target.value)}
            style={{ width: '100%', padding: 10, marginBottom: 16, border: '1px solid var(--border)', borderRadius: 6 }}
          />

          <label style={{ display: 'block', fontSize: 13, fontWeight: 600, marginBottom: 6 }}>Email</label>
          <input
            type="email"
            required
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            style={{ width: '100%', padding: 10, marginBottom: 16, border: '1px solid var(--border)', borderRadius: 6 }}
          />

          <label style={{ display: 'block', fontSize: 13, fontWeight: 600, marginBottom: 6 }}>Password (min. 8 characters)</label>
          <input
            type="password"
            required
            minLength={8}
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            style={{ width: '100%', padding: 10, marginBottom: 20, border: '1px solid var(--border)', borderRadius: 6 }}
          />

          <button type="submit" className="btn" disabled={loading} style={{ width: '100%' }}>
            {loading ? 'Creating account…' : 'Create Account'}
          </button>

          <p className="text-muted" style={{ textAlign: 'center', fontSize: 13, marginTop: 16 }}>
            Already have an account? <a href="/dashboard/login/" style={{ color: 'var(--teal)' }}>Log in</a>
          </p>
        </form>
      </div>
    </section>
  );
}
