'use client';

import { useEffect, useState } from 'react';
import { customerApi, isLoggedIn, getToken } from '../../../lib/customerApi';

const API_BASE = process.env.NEXT_PUBLIC_API_BASE_URL;

function Field({ label, ...props }) {
  return (
    <>
      <label style={{ display: 'block', fontSize: 13, fontWeight: 600, marginBottom: 6 }}>{label}</label>
      <input {...props} style={{ width: '100%', padding: 10, marginBottom: 16, border: '1px solid var(--border)', borderRadius: 6 }} />
    </>
  );
}

export default function AccountPage() {
  const [status, setStatus] = useState('loading');
  const [customer, setCustomer] = useState(null);
  const [connections, setConnections] = useState([]);

  const [profile, setProfile] = useState({ name: '', email: '' });
  const [profileMsg, setProfileMsg] = useState('');
  const [profileSaving, setProfileSaving] = useState(false);

  const [pw, setPw] = useState({ currentPassword: '', newPassword: '', confirm: '' });
  const [pwMsg, setPwMsg] = useState('');
  const [pwSaving, setPwSaving] = useState(false);

  function load() {
    return Promise.all([customerApi.get('/api/customers/me'), customerApi.get('/api/ga4/my/connections')])
      .then(([me, conns]) => {
        setCustomer(me);
        setProfile({ name: me.name, email: me.email });
        setConnections(conns);
        setStatus('ready');
      });
  }

  useEffect(() => {
    if (!isLoggedIn()) {
      window.location.href = '/dashboard/login/';
      return;
    }
    load().catch(() => setStatus('ready'));
  }, []);

  async function saveProfile(e) {
    e.preventDefault();
    setProfileSaving(true);
    setProfileMsg('');
    try {
      const updated = await customerApi.patch('/api/customers/me', profile);
      setCustomer(updated);
      setProfileMsg('Saved.');
    } catch (err) {
      setProfileMsg(err.message);
    } finally {
      setProfileSaving(false);
    }
  }

  async function savePassword(e) {
    e.preventDefault();
    if (pw.newPassword !== pw.confirm) {
      setPwMsg('New passwords do not match.');
      return;
    }
    setPwSaving(true);
    setPwMsg('');
    try {
      await customerApi.post('/api/customers/me/password', pw);
      setPw({ currentPassword: '', newPassword: '', confirm: '' });
      setPwMsg('Password updated.');
      setCustomer((prev) => ({ ...prev, hasPassword: true }));
    } catch (err) {
      setPwMsg(err.message);
    } finally {
      setPwSaving(false);
    }
  }

  async function disconnect(id) {
    if (!window.confirm('Disconnect this property? Its reports and chat history will be deleted.')) return;
    await customerApi.del(`/api/ga4/my/connections/${id}`);
    setConnections((prev) => prev.filter((c) => c.id !== id));
  }

  if (status === 'loading') {
    return <p className="text-muted" style={{ textAlign: 'center' }}>Loading…</p>;
  }

  return (
    <>
      <div className="eyebrow">Account</div>
      <h1 style={{ marginBottom: 24 }}>Account Settings</h1>

      <form onSubmit={saveProfile} className="card" style={{ marginBottom: 24, maxWidth: 480 }}>
        <h3 style={{ marginBottom: 16 }}>Profile</h3>
        <Field label="Name" value={profile.name} onChange={(e) => setProfile({ ...profile, name: e.target.value })} required />
        <Field label="Email" type="email" value={profile.email} onChange={(e) => setProfile({ ...profile, email: e.target.value })} required />
        <button type="submit" className="btn btn-sm" disabled={profileSaving}>{profileSaving ? 'Saving…' : 'Save'}</button>
        {profileMsg && <span className="text-muted" style={{ fontSize: 13, marginLeft: 12 }}>{profileMsg}</span>}
      </form>

      <form onSubmit={savePassword} className="card" style={{ marginBottom: 24, maxWidth: 480 }}>
        <h3 style={{ marginBottom: 16 }}>{customer?.hasPassword ? 'Change Password' : 'Set a Password'}</h3>
        {customer?.hasPassword && (
          <Field label="Current Password" type="password" value={pw.currentPassword} onChange={(e) => setPw({ ...pw, currentPassword: e.target.value })} required />
        )}
        <Field label="New Password" type="password" value={pw.newPassword} onChange={(e) => setPw({ ...pw, newPassword: e.target.value })} required minLength={8} />
        <Field label="Confirm New Password" type="password" value={pw.confirm} onChange={(e) => setPw({ ...pw, confirm: e.target.value })} required minLength={8} />
        <button type="submit" className="btn btn-sm" disabled={pwSaving}>{pwSaving ? 'Saving…' : 'Save'}</button>
        {pwMsg && <span className="text-muted" style={{ fontSize: 13, marginLeft: 12 }}>{pwMsg}</span>}
      </form>

      <div className="card" style={{ maxWidth: 480 }}>
        <h3 style={{ marginBottom: 16 }}>Connected Properties</h3>
        {connections.length === 0 && <p className="text-muted" style={{ fontSize: 13 }}>No properties connected yet.</p>}
        <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
          {connections.map((c) => (
            <div key={c.id} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', paddingBottom: 12, borderBottom: '1px solid var(--border)' }}>
              <div>
                <div style={{ fontSize: 14, fontWeight: 600 }}>{c.propertyDisplayName || c.googleEmail}</div>
                <div className="text-muted" style={{ fontSize: 12 }}>{c.googleEmail}</div>
              </div>
              <button type="button" onClick={() => disconnect(c.id)} className="btn btn-outline btn-sm">Disconnect</button>
            </div>
          ))}
        </div>
        <a href={`${API_BASE}/api/ga4/oauth/start?customerToken=${encodeURIComponent(getToken())}`} className="btn btn-outline btn-sm" style={{ marginTop: 16, display: 'inline-block' }}>
          Connect Another Property
        </a>
      </div>
    </>
  );
}
