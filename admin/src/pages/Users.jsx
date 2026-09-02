import { useEffect, useState } from 'react';
import Layout from '../components/Layout.jsx';
import { api } from '../lib/api.js';

const empty = { name: '', email: '', password: '', role: 'author' };

export default function Users() {
  const [items, setItems] = useState([]);
  const [form, setForm] = useState(empty);
  const [error, setError] = useState('');

  function load() {
    api.get('/api/users').then(setItems);
  }
  useEffect(load, []);

  async function handleSubmit(e) {
    e.preventDefault();
    setError('');
    try {
      await api.post('/api/users', form);
      setForm(empty);
      load();
    } catch (err) {
      setError(err.message);
    }
  }

  async function handleDeactivate(id) {
    if (!confirm('Deactivate this user? They will no longer be able to log in.')) return;
    await api.del(`/api/users/${id}`);
    load();
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
              {items.map((u) => (
                <tr key={u.id}>
                  <td>{u.name}</td>
                  <td>{u.email}</td>
                  <td>{u.role}</td>
                  <td>{u.isActive ? 'Active' : 'Deactivated'}</td>
                  <td>
                    {u.isActive && <button className="danger" onClick={() => handleDeactivate(u.id)}>Deactivate</button>}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        <form className="card" onSubmit={handleSubmit}>
          <h4 style={{ marginTop: 0 }}>Add Team Member</h4>
          {error && <div className="error-text">{error}</div>}
          <label>Name</label>
          <input value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} required />
          <label>Email</label>
          <input type="email" value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} required />
          <label>Temporary Password</label>
          <input type="text" value={form.password} onChange={(e) => setForm({ ...form, password: e.target.value })} required />
          <label>Role</label>
          <select value={form.role} onChange={(e) => setForm({ ...form, role: e.target.value })}>
            <option value="author">Author</option>
            <option value="editor">Editor</option>
            <option value="admin">Admin</option>
          </select>
          <button type="submit">Create User</button>
        </form>
      </div>
    </Layout>
  );
}
