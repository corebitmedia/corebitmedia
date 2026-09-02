import { useEffect, useState } from 'react';
import Layout from '../components/Layout.jsx';
import { api } from '../lib/api.js';

export default function Leads() {
  const [items, setItems] = useState([]);
  useEffect(() => { api.get('/api/admin/contact-submissions').then(setItems); }, []);

  return (
    <Layout>
      <h2>Contact Leads</h2>
      <div className="card" style={{ padding: 0 }}>
        <table>
          <thead><tr><th>Name</th><th>Email</th><th>Phone</th><th>Message</th><th>Received</th></tr></thead>
          <tbody>
            {items.map((l) => (
              <tr key={l.id}>
                <td>{l.name}</td>
                <td>{l.email}</td>
                <td>{l.phone || '—'}</td>
                <td style={{ maxWidth: 260 }}>{l.message}</td>
                <td>{new Date(l.createdAt).toLocaleString()}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </Layout>
  );
}
