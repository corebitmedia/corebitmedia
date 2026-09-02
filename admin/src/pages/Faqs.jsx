import { useEffect, useState } from 'react';
import Layout from '../components/Layout.jsx';
import { api } from '../lib/api.js';

const empty = { question: '', answer: '', scope: 'global' };

export default function Faqs() {
  const [items, setItems] = useState([]);
  const [form, setForm] = useState(empty);
  const [editingId, setEditingId] = useState(null);

  function load() {
    api.get('/api/faqs').then(setItems);
  }
  useEffect(load, []);

  async function handleSubmit(e) {
    e.preventDefault();
    if (editingId) {
      await api.put(`/api/admin/faqs/${editingId}`, form);
    } else {
      await api.post('/api/admin/faqs', form);
    }
    setForm(empty);
    setEditingId(null);
    load();
  }

  async function handleDelete(id) {
    if (!confirm('Delete this FAQ?')) return;
    await api.del(`/api/admin/faqs/${id}`);
    load();
  }

  return (
    <Layout>
      <h2>FAQs</h2>
      <p style={{ color: '#64748b', fontSize: 14 }}>
        These power the on-site FAQ section and get rendered as FAQPage schema for AEO/GEO.
        Use "scope" to attach FAQs to a specific service or page slug, or leave as "global".
      </p>
      <div className="grid-2">
        <div className="card" style={{ padding: 0 }}>
          <table>
            <thead><tr><th>Question</th><th>Scope</th><th></th></tr></thead>
            <tbody>
              {items.map((f) => (
                <tr key={f.id}>
                  <td>{f.question}</td>
                  <td>{f.scope}</td>
                  <td style={{ display: 'flex', gap: 8 }}>
                    <button className="secondary" onClick={() => { setForm(f); setEditingId(f.id); }}>Edit</button>
                    <button className="danger" onClick={() => handleDelete(f.id)}>Delete</button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        <form className="card" onSubmit={handleSubmit}>
          <h4 style={{ marginTop: 0 }}>{editingId ? 'Edit' : 'Add'} FAQ</h4>
          <label>Question</label>
          <input value={form.question} onChange={(e) => setForm({ ...form, question: e.target.value })} required />
          <label>Answer</label>
          <textarea value={form.answer} onChange={(e) => setForm({ ...form, answer: e.target.value })} required />
          <label>Scope</label>
          <input value={form.scope} onChange={(e) => setForm({ ...form, scope: e.target.value })} placeholder="global or a slug e.g. digital-marketing" />
          <button type="submit">{editingId ? 'Update' : 'Add'}</button>
        </form>
      </div>
    </Layout>
  );
}
