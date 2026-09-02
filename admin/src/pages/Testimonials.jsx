import { useEffect, useState } from 'react';
import Layout from '../components/Layout.jsx';
import { api } from '../lib/api.js';

const empty = { clientName: '', clientRole: '', quote: '', rating: 5, isFeatured: true };

export default function Testimonials() {
  const [items, setItems] = useState([]);
  const [form, setForm] = useState(empty);
  const [editingId, setEditingId] = useState(null);

  function load() {
    api.get('/api/testimonials').then(setItems);
  }
  useEffect(load, []);

  async function handleSubmit(e) {
    e.preventDefault();
    if (editingId) {
      await api.put(`/api/admin/testimonials/${editingId}`, form);
    } else {
      await api.post('/api/admin/testimonials', form);
    }
    setForm(empty);
    setEditingId(null);
    load();
  }

  async function handleDelete(id) {
    if (!confirm('Delete this testimonial?')) return;
    await api.del(`/api/admin/testimonials/${id}`);
    load();
  }

  return (
    <Layout>
      <h2>Testimonials</h2>
      <div className="grid-2">
        <div className="card" style={{ padding: 0 }}>
          <table>
            <thead><tr><th>Client</th><th>Quote</th><th></th></tr></thead>
            <tbody>
              {items.map((t) => (
                <tr key={t.id}>
                  <td>{t.clientName}<br /><span style={{ color: '#64748b', fontSize: 12 }}>{t.clientRole}</span></td>
                  <td style={{ maxWidth: 300 }}>{t.quote.slice(0, 80)}…</td>
                  <td style={{ display: 'flex', gap: 8 }}>
                    <button className="secondary" onClick={() => { setForm(t); setEditingId(t.id); }}>Edit</button>
                    <button className="danger" onClick={() => handleDelete(t.id)}>Delete</button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        <form className="card" onSubmit={handleSubmit}>
          <h4 style={{ marginTop: 0 }}>{editingId ? 'Edit' : 'Add'} Testimonial</h4>
          <label>Client Name</label>
          <input value={form.clientName} onChange={(e) => setForm({ ...form, clientName: e.target.value })} required />
          <label>Role / Company</label>
          <input value={form.clientRole || ''} onChange={(e) => setForm({ ...form, clientRole: e.target.value })} />
          <label>Quote</label>
          <textarea value={form.quote} onChange={(e) => setForm({ ...form, quote: e.target.value })} required />
          <button type="submit">{editingId ? 'Update' : 'Add'}</button>
        </form>
      </div>
    </Layout>
  );
}
