import { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import Layout from '../components/Layout.jsx';
import { api, CONTENT_TYPES } from '../lib/api.js';
import { useAuth } from '../lib/AuthContext.jsx';

export default function ContentList() {
  const { type } = useParams();
  const cfg = CONTENT_TYPES[type];
  const { user } = useAuth();
  const navigate = useNavigate();
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);

  function load() {
    setLoading(true);
    api.get(`${cfg.path}/admin/all`).then(setItems).finally(() => setLoading(false));
  }

  useEffect(() => { load(); }, [type]);

  async function handleDelete(id) {
    if (!confirm('Delete this item? This cannot be undone.')) return;
    await api.del(`${cfg.path}/admin/${id}`);
    load();
  }

  async function handlePublish(id) {
    await api.post(`${cfg.path}/admin/${id}/publish`);
    load();
  }

  const canApprove = user?.role === 'admin' || user?.role === 'editor';

  return (
    <Layout>
      <div className="toolbar">
        <h2 style={{ margin: 0 }}>{cfg.label}</h2>
        <button onClick={() => navigate(`/content/${type}/new`)}>+ New</button>
      </div>

      <div className="card" style={{ padding: 0 }}>
        {loading ? (
          <div style={{ padding: 20 }}>Loading…</div>
        ) : items.length === 0 ? (
          <div style={{ padding: 20, color: '#64748b' }}>Nothing here yet.</div>
        ) : (
          <table>
            <thead>
              <tr>
                <th>Title</th>
                <th>Status</th>
                <th>SEO Score</th>
                <th>Updated</th>
                <th></th>
              </tr>
            </thead>
            <tbody>
              {items.map((item) => (
                <tr key={item.id}>
                  <td>{item.title}</td>
                  <td><span className={`status-badge status-${item.status}`}>{item.status.replace('_', ' ')}</span></td>
                  <td>{item.seoScore ?? '—'}</td>
                  <td>{new Date(item.updatedAt).toLocaleDateString()}</td>
                  <td style={{ display: 'flex', gap: 8 }}>
                    <button className="secondary" onClick={() => navigate(`/content/${type}/${item.id}`)}>Edit</button>
                    {canApprove && item.status === 'pending_review' && (
                      <button onClick={() => handlePublish(item.id)}>Publish</button>
                    )}
                    {canApprove && (
                      <button className="danger" onClick={() => handleDelete(item.id)}>Delete</button>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </Layout>
  );
}
