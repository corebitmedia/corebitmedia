'use client';

import { useState } from 'react';

const API_BASE = process.env.NEXT_PUBLIC_API_BASE_URL;

export default function ContactForm() {
  const [form, setForm] = useState({
    firstName: '', lastName: '', email: '', phone: '', company: '', website: '', message: ''
  });
  const [status, setStatus] = useState('idle'); // idle | sending | sent | error

  async function handleSubmit(e) {
    e.preventDefault();
    setStatus('sending');
    try {
      const name = [form.firstName, form.lastName].filter(Boolean).join(' ');
      const extra = [
        form.company && `Company/Organisation: ${form.company}`,
        form.website && `Website: ${form.website}`
      ].filter(Boolean).join('\n');
      const message = [extra, form.message].filter(Boolean).join('\n\n');

      const res = await fetch(`${API_BASE}/api/contact`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name, email: form.email, phone: form.phone, message, source: 'contact-us-page' })
      });
      if (!res.ok) throw new Error('Failed');
      setStatus('sent');
      setForm({ firstName: '', lastName: '', email: '', phone: '', company: '', website: '', message: '' });
    } catch {
      setStatus('error');
    }
  }

  if (status === 'sent') {
    return (
      <div className="card" style={{ textAlign: 'center' }}>
        <h3>Thanks, {form.firstName || 'there'}!</h3>
        <p className="text-muted" style={{ marginTop: 8 }}>We've received your message and will get back to you shortly.</p>
      </div>
    );
  }

  const field = (label, key, opts = {}) => (
    <>
      <label style={{ display: 'block', fontSize: 13, fontWeight: 600, marginBottom: 6 }}>{label}</label>
      <input
        type={opts.type || 'text'}
        required={opts.required}
        value={form[key]}
        onChange={(e) => setForm({ ...form, [key]: e.target.value })}
        style={{ width: '100%', padding: 10, marginBottom: 16, border: '1px solid var(--border)', borderRadius: 6 }}
      />
    </>
  );

  return (
    <form className="card" onSubmit={handleSubmit}>
      <div className="grid" style={{ gridTemplateColumns: '1fr 1fr', gap: 16 }}>
        <div>{field('First Name', 'firstName', { required: true })}</div>
        <div>{field('Last Name', 'lastName', { required: true })}</div>
      </div>
      {field('Your Email', 'email', { type: 'email', required: true })}
      {field('Phone', 'phone', { required: true })}
      {field('Your Company/Organisation', 'company')}
      {field('Website', 'website')}
      <label style={{ display: 'block', fontSize: 13, fontWeight: 600, marginBottom: 6 }}>Your Message</label>
      <textarea
        value={form.message}
        onChange={(e) => setForm({ ...form, message: e.target.value })}
        style={{ width: '100%', padding: 10, marginBottom: 16, border: '1px solid var(--border)', borderRadius: 6, minHeight: 120 }}
      />
      <button type="submit" className="btn" disabled={status === 'sending'} style={{ width: '100%' }}>
        {status === 'sending' ? 'Sending…' : 'Send Message'}
      </button>
      {status === 'error' && <p style={{ color: '#dc2626', marginTop: 10, fontSize: 13 }}>Something went wrong — please try again or email us directly.</p>}
    </form>
  );
}
