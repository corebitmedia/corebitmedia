import { useEffect, useState } from 'react';
import Layout from '../components/Layout.jsx';
import { api } from '../lib/api.js';
import { useAuth } from '../lib/AuthContext.jsx';

const empty = { name: '', email: '', password: '', role: 'author' };

export default function Users() {
  const { user: currentUser } = useAuth();
  const [items, setItems] = useState([]);
  const [form, setForm] = useState(empty);
  const [editingId, setEditingId] = useState(null); // null = creating a new user
  const [error, setError] = useState('');

  function load() {
    api.get('/api/users').then(setItems);
  }
  useEffect(load, []);

  function startEdit(u) {
    setEditingId(u.id);
    setForm({ name: u.name, email: u.email, password: '', role: u.role });
    setError('');
  }

  function cancelEdit() {
    setEditingId(null);
    setForm(empty);
    setError('');
  }

  async function handleSubmit(e) {
    e.preventDefault();
    setError('');
    try {
      if (editingId) {
        // Blank password field means "leave it unchanged" on edit — it's
        // required when creating a new account, but re-typing it on every
        // edit just to change someone's role would be annoying.
        const { password, ...rest } = form;
        const payload = password ? { ...rest, password } : rest;
        await api.put(`/api/users/${editingId}`, payload);
      } else {
        await api.post('/api/users', form);
      }
      cancelEdit();
      load();
    } catch (err) {
      setError(err.message);
    }
  }

  async function handleReactivate(id) {
    await api.put(`/api/users/${id}`, { isActive: true });
    load();
  }

  async function handleDeactivate(id) {
    if (!confirm('Deactivate this user? They will no longer be able to log in.')) return;
    try {
      await api.del(`/api/users/${id}`);
      load();
    } catch (err) {
      alert(err.message);
    }
  }

  async function handleDeletePermanently(id, name) {
    if (!confirm(`Permanently delete ${name}'s account? This can't be undone.`)) return;
    try {
      await api.del(`/api/users/${id}/permanent`);
      load();
    } catch (err) {
      // e.g. "This user has authored 3 blog post(s) — deactivate instead..."
      alert(err.message);
    }
  }

  return (
    <Layout>
      <h2>Team / Users</h2>
      <p style={{ color: '#64748b', fontSize: 14 }}>
        <strong>Admin</strong>: full access. <strong>Editor</strong>: create/edit/publish any content, approve authors.
        <strong> Author</strong>: create/edit own content, submitted content needs editor approval before going live.
      </p>
      <div className="grid-2">
        <div className="card" style={{ padding: 0 }}>
          <table>
            <thead><tr><th>Name</th><th>Email</th><th>Role</th><th>Status</th><th></th></tr></thead>
            <tbody>
              {items.map((u) => {
                const isSelf = u.id === currentUser?.id;
                return (
                  <tr key={u.id}>
                    <td>{u.name}</td>
                    <td>{u.email}</td>
                    <td>{u.role}</td>
                    <td>{u.isActive ? 'Active' : 'Deactivated'}</td>
                    <td style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
                      <button className="secondary" onClick={() => startEdit(u)}>Edit</button>
                      {u.isActive && !isSelf && (
                        <button className="danger" onClick={() => handleDeactivate(u.id)}>Deactivate</button>
                      )}
                      {!u.isActive && (
                        <button onClick={() => handleReactivate(u.id)}>Reactivate</button>
                      )}
                      {!isSelf && (
                        <button className="danger" onClick={() => handleDeletePermanently(u.id, u.name)}>Delete</button>
                      )}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
        <form className="card" onSubmit={handleSubmit}>
          <h4 style={{ marginTop: 0 }}>{editingId ? 'Edit Team Member' : 'Add Team Member'}</h4>
          {error && <div className="error-text">{error}</div>}
          <label>Name</label>
          <input value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} required />
          <label>Email</label>
          <input type="email" value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} required />
          <label>{editingId ? 'New Password (leave blank to keep current)' : 'Temporary Password'}</label>
          <input
            type="text"
            value={form.password}
            onChange={(e) => setForm({ ...form, password: e.target.value })}
            required={!editingId}
          />
          <label>Role</label>
          <select
            value={form.role}
            onChange={(e) => setForm({ ...form, role: e.target.value })}
            disabled={editingId === currentUser?.id}
          >
            <option value="author">Author</option>
            <option value="editor">Editor</option>
            <option value="admin">Admin</option>
          </select>
          <div style={{ display: 'flex', gap: 8, marginTop: 12 }}>
            <button type="submit">{editingId ? 'Save Changes' : 'Create User'}</button>
            {editingId && <button type="button" className="secondary" onClick={cancelEdit}>Cancel</button>}
          </div>
        </form>
      </div>
    </Layout>
  );
}
