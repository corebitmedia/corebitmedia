import { useEffect, useState } from 'react';
import Layout from '../components/Layout.jsx';
import { api } from '../lib/api.js';

export default function Customers() {
  const [items, setItems] = useState(null);
  const [selected, setSelected] = useState(null);

  function load() {
    api.get('/api/admin/customers').then(setItems);
  }
  useEffect(load, []);

  async function viewDetail(id) {
    const detail = await api.get(`/api/admin/customers/${id}`);
    setSelected(detail);
  }

  async function handleDelete(id, name) {
    if (!confirm(`Delete ${name}'s account? This also removes their connected GA4 properties and reports. This can't be undone.`)) return;
    await api.del(`/api/admin/customers/${id}`);
    setSelected(null);
    load();
  }

  if (!items) return <Layout><p>Loading…</p></Layout>;

  return (
    <Layout>
      <h2>Dashboard Signups</h2>
      <p style={{ color: '#64748b', fontSize: 14 }}>
        Everyone who's created a free dashboard account (<code>/dashboard/signup/</code>) and connected a GA4 property.
      </p>

      <div className="grid-2">
        <div className="card" style={{ padding: 0 }}>
          <table>
            <thead><tr><th>Name</th><th>Email</th><th>Signed Up Via</th><th>Properties</th><th>Joined</th><th></th></tr></thead>
            <tbody>
              {items.length === 0 && (
                <tr><td colSpan={6} style={{ color: '#64748b', textAlign: 'center', padding: 20 }}>No signups yet.</td></tr>
              )}
              {items.map((c) => (
                <tr key={c.id}>
                  <td>{c.name}</td>
                  <td>{c.email}</td>
                  <td>{c.signupMethod}</td>
                  <td>{c.propertyCount}</td>
                  <td>{new Date(c.createdAt).toLocaleDateString()}</td>
                  <td>
                    <button className="secondary" onClick={() => viewDetail(c.id)}>View</button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        <div className="card">
          {!selected && <p style={{ color: '#64748b' }}>Select a signup to see their connected properties.</p>}
          {selected && (
            <>
              <h4 style={{ marginTop: 0 }}>{selected.name}</h4>
              <p style={{ color: '#64748b', fontSize: 14 }}>{selected.email} · {selected.signupMethod || 'Email/Password'}</p>
              <p style={{ fontSize: 13, color: '#64748b' }}>Joined {new Date(selected.createdAt).toLocaleString()}</p>

              <h4 style={{ marginTop: 20, marginBottom: 8, fontSize: 14 }}>Connected Properties</h4>
              {selected.connections.length === 0 && <p style={{ color: '#64748b', fontSize: 14 }}>None connected yet.</p>}
              {selected.connections.map((c) => (
                <div key={c.id} style={{ padding: '10px 0', borderBottom: '1px solid #e2e8f0', fontSize: 14 }}>
                  <strong>{c.propertyDisplayName || '(property not selected)'}</strong>
                  <div style={{ color: '#64748b', fontSize: 13 }}>{c.googleEmail}</div>
                  {c.latestReport && (
                    <a
                      href={`${import.meta.env.VITE_FRONTEND_URL || 'https://www.corebitmedia.com'}/ga4-insights/view/?r=${c.latestReport.shareSlug}`}
                      target="_blank"
                      rel="noreferrer"
                      style={{ fontSize: 13 }}
                    >
                      View their report →
                    </a>
                  )}
                </div>
              ))}

              <button className="danger" style={{ marginTop: 20 }} onClick={() => handleDelete(selected.id, selected.name)}>
                Delete Account
              </button>
            </>
          )}
        </div>
      </div>
    </Layout>
  );
}
