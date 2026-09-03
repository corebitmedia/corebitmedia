'use client';

import { useState } from 'react';
import Script from 'next/script';

const API_BASE = process.env.NEXT_PUBLIC_API_BASE_URL;
const RECAPTCHA_SITE_KEY = process.env.NEXT_PUBLIC_RECAPTCHA_SITE_KEY;

export default function ContactForm() {
  const [form, setForm] = useState({
    firstName: '', lastName: '', email: '', phone: '', company: '', website: '', message: ''
  });
  const [status, setStatus] = useState('idle'); // idle | sending | sent | error
  const [errorMessage, setErrorMessage] = useState('');
  const [recaptchaError, setRecaptchaError] = useState(false);

  async function handleSubmit(e) {
    e.preventDefault();
    setRecaptchaError(false);

    // grecaptcha only exists once the widget script has loaded and rendered
    // (skipped entirely if no site key is configured, e.g. local dev).
    const recaptchaToken = RECAPTCHA_SITE_KEY && window.grecaptcha
      ? window.grecaptcha.getResponse()
      : null;
    if (RECAPTCHA_SITE_KEY && !recaptchaToken) {
      setRecaptchaError(true);
      return;
    }

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
        body: JSON.stringify({ name, email: form.email, phone: form.phone, message, source: 'contact-us-page', recaptchaToken })
      });
      if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        throw new Error(data.error || 'Failed');
      }
      setStatus('sent');
      setForm({ firstName: '', lastName: '', email: '', phone: '', company: '', website: '', message: '' });
    } catch (err) {
      setErrorMessage(err.message === 'Failed' ? '' : err.message);
      setStatus('error');
    } finally {
      if (RECAPTCHA_SITE_KEY && window.grecaptcha) window.grecaptcha.reset();
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
      {RECAPTCHA_SITE_KEY && (
        <Script src="https://www.google.com/recaptcha/api.js" strategy="lazyOnload" />
      )}
      <div className="grid grid-2" style={{ gap: 16 }}>
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
      {RECAPTCHA_SITE_KEY && (
        <div className="g-recaptcha" data-sitekey={RECAPTCHA_SITE_KEY} style={{ marginBottom: 16 }} />
      )}
      <button type="submit" className="btn" disabled={status === 'sending'} style={{ width: '100%' }}>
        {status === 'sending' ? 'Sending…' : 'Send Message'}
      </button>
      {recaptchaError && <p style={{ color: '#dc2626', marginTop: 10, fontSize: 13 }}>Please complete the reCAPTCHA check.</p>}
      {status === 'error' && (
        <p style={{ color: '#dc2626', marginTop: 10, fontSize: 13 }}>
          {errorMessage || 'Something went wrong — please try again or email us directly.'}
        </p>
      )}
    </form>
  );
}
