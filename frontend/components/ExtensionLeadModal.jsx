'use client';

// "Get the extension" lead gate for /web-analytics-auditor. Every
// <GetExtensionButton> on the page opens one shared modal; submitting it saves
// the lead through the existing POST /api/contact endpoint (source:
// 'web-analytics-auditor-extension', so it shows up in the admin panel's
// contact submissions) and then starts the zip download.
//
// Note: the site is a static export, so the zip is a public file. The form
// is a lead-capture step, not access control.

import { createContext, useCallback, useContext, useEffect, useRef, useState } from 'react';
import Script from 'next/script';

const API_BASE = process.env.NEXT_PUBLIC_API_BASE_URL;
const RECAPTCHA_SITE_KEY = process.env.NEXT_PUBLIC_RECAPTCHA_SITE_KEY;
const ZIP_URL = '/downloads/web-analytics-auditor-extension.zip';
const LEAD_SOURCE = 'web-analytics-auditor-extension';
const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const CAPTCHA_TIMEOUT_MS = 15000;

const OpenContext = createContext(() => {});

/** Trims and adds https:// when missing; returns null if it is not a plausible site address. */
function normalizeWebsite(input) {
  const raw = input.trim();
  if (!raw) return null;
  try {
    const url = new URL(/^[a-z][a-z0-9+.-]*:\/\//i.test(raw) ? raw : `https://${raw}`);
    if (!/^https?:$/.test(url.protocol) || !url.hostname.includes('.') || /\s/.test(url.hostname)) return null;
    return url.toString();
  } catch {
    return null;
  }
}

function validate(form) {
  const errors = {};
  if (form.name.trim().length < 2) errors.name = 'Please enter your name.';
  if (!EMAIL_RE.test(form.email.trim())) errors.email = 'Please enter a valid email address.';
  if (!normalizeWebsite(form.website)) errors.website = 'Please enter your website, for example example.com.';
  const digits = form.phone.replace(/\D/g, '');
  if (digits.length < 7 || digits.length > 15) errors.phone = 'Please enter a valid phone number.';
  return errors;
}

function startDownload() {
  const a = document.createElement('a');
  a.href = ZIP_URL;
  a.download = 'web-analytics-auditor-extension.zip';
  document.body.appendChild(a);
  a.click();
  a.remove();
}

function track(event, data) {
  // The site's GTM container (loaded by ThemeLoader) listens on dataLayer.
  if (typeof window !== 'undefined') {
    window.dataLayer = window.dataLayer || [];
    window.dataLayer.push({ event, ...data });
  }
}

export function ExtensionLeadProvider({ children }) {
  const [open, setOpen] = useState(false);
  const [origin, setOrigin] = useState('');
  const [wantCaptcha, setWantCaptcha] = useState(false);

  const openModal = useCallback((where) => {
    setOrigin(where || '');
    setWantCaptcha(true);
    setOpen(true);
    track('extension_download_click', { location: where || 'page' });
  }, []);

  // Stable identity: LeadModal's focus/scroll-lock effect depends on it and must not re-run on re-renders.
  const closeModal = useCallback(() => setOpen(false), []);

  return (
    <OpenContext.Provider value={openModal}>
      {children}
      {RECAPTCHA_SITE_KEY && wantCaptcha && (
        <Script src="https://www.google.com/recaptcha/api.js?render=explicit" strategy="afterInteractive" />
      )}
      {open && (
        <LeadModal origin={origin} onClose={closeModal} />
      )}
    </OpenContext.Provider>
  );
}

export function GetExtensionButton({ children = 'Get the extension', className = 'btn btn-lg', location }) {
  const openModal = useContext(OpenContext);
  return (
    <button type="button" className={className} onClick={() => openModal(location)}>
      {children}
    </button>
  );
}

function LeadModal({ origin, onClose }) {
  const [form, setForm] = useState({ name: '', email: '', website: '', phone: '', trap: '' });
  const [errors, setErrors] = useState({});
  const [status, setStatus] = useState('idle'); // idle | sending | done | error
  const [serverError, setServerError] = useState('');
  const [captchaMissing, setCaptchaMissing] = useState(false);
  const [captchaShown, setCaptchaShown] = useState(false);
  const [captchaFailed, setCaptchaFailed] = useState(false);

  const dialogRef = useRef(null);
  const captchaBoxRef = useRef(null);
  const captchaWidget = useRef(null);
  const returnFocus = useRef(null);

  // Lock page scroll, close on Escape, trap Tab inside the dialog, restore focus on close.
  useEffect(() => {
    returnFocus.current = document.activeElement;
    const prevOverflow = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    dialogRef.current?.querySelector('input')?.focus();

    function onKey(e) {
      if (e.key === 'Escape') { onClose(); return; }
      if (e.key !== 'Tab' || !dialogRef.current) return;
      const items = dialogRef.current.querySelectorAll('a[href], button:not([disabled]), input:not([tabindex="-1"]), iframe');
      if (!items.length) return;
      const first = items[0];
      const last = items[items.length - 1];
      if (e.shiftKey && document.activeElement === first) { e.preventDefault(); last.focus(); }
      else if (!e.shiftKey && document.activeElement === last) { e.preventDefault(); first.focus(); }
    }
    document.addEventListener('keydown', onKey);
    return () => {
      document.removeEventListener('keydown', onKey);
      document.body.style.overflow = prevOverflow;
      returnFocus.current?.focus?.();
    };
  }, [onClose]);

  // Render the reCAPTCHA widget into this modal instance as soon as grecaptcha exists.
  // This deliberately does NOT rely on <Script onLoad>: on corebitmedia.com that callback never fired in
  // production (the script still loaded and worked), so the widget never appeared. Polling for the global
  // is independent of how the script tag was injected. api.js defines grecaptcha.ready() before render(),
  // so the actual render goes through ready().
  useEffect(() => {
    if (!RECAPTCHA_SITE_KEY) return;
    let cancelled = false;
    let requested = false;
    function render() {
      if (cancelled || !captchaBoxRef.current || captchaWidget.current !== null) return;
      captchaWidget.current = window.grecaptcha.render(captchaBoxRef.current, { sitekey: RECAPTCHA_SITE_KEY });
      setCaptchaShown(true);
    }
    const startedAt = Date.now();
    const poll = setInterval(() => {
      if (!requested && window.grecaptcha?.ready) {
        requested = true;
        window.grecaptcha.ready(render);
      }
      if (captchaWidget.current !== null) clearInterval(poll);
      else if (Date.now() - startedAt > CAPTCHA_TIMEOUT_MS) { clearInterval(poll); setCaptchaFailed(true); }
    }, 150);
    return () => { cancelled = true; clearInterval(poll); };
  }, []);

  const set = (key) => (e) => {
    setForm((f) => ({ ...f, [key]: e.target.value }));
    if (errors[key]) setErrors((er) => ({ ...er, [key]: undefined }));
  };

  async function handleSubmit(e) {
    e.preventDefault();
    if (status === 'sending') return;
    setServerError('');
    setCaptchaMissing(false);

    const found = validate(form);
    setErrors(found);
    if (Object.keys(found).length) {
      dialogRef.current?.querySelector('[aria-invalid="true"]')?.focus();
      return;
    }

    // Hidden field only bots fill in: pretend it worked, send nothing, give nothing.
    if (form.trap) { setStatus('done'); return; }

    let recaptchaToken = null;
    if (RECAPTCHA_SITE_KEY) {
      recaptchaToken = captchaWidget.current !== null ? window.grecaptcha.getResponse(captchaWidget.current) : '';
      if (!recaptchaToken) { setCaptchaMissing(true); return; }
    }

    setStatus('sending');
    try {
      const website = normalizeWebsite(form.website);
      const res = await fetch(`${API_BASE}/api/contact`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: form.name.trim(),
          email: form.email.trim(),
          phone: form.phone.trim(),
          message: [
            'Requested: Web Analytics Auditor Chrome extension download',
            `Website: ${website}`,
            origin && `Clicked from: ${origin}`
          ].filter(Boolean).join('\n'),
          source: LEAD_SOURCE,
          recaptchaToken
        })
      });
      if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        throw new Error(data.error || 'Failed');
      }
      track('generate_lead', { form: LEAD_SOURCE });
      track('extension_download', { location: origin || 'page' });
      setStatus('done');
      startDownload();
    } catch (err) {
      setServerError(err.message && err.message !== 'Failed' ? err.message : '');
      setStatus('error');
      if (captchaWidget.current !== null) window.grecaptcha?.reset(captchaWidget.current);
    }
  }

  const field = (key, label, props = {}) => (
    <div className="waa-field">
      <label htmlFor={`waa-${key}`}>{label}</label>
      <input
        id={`waa-${key}`}
        name={key}
        value={form[key]}
        onChange={set(key)}
        aria-invalid={errors[key] ? 'true' : undefined}
        aria-describedby={errors[key] ? `waa-${key}-err` : undefined}
        {...props}
      />
      {errors[key] && <p className="waa-err" id={`waa-${key}-err`} role="alert">{errors[key]}</p>}
    </div>
  );

  return (
    <div className="waa-backdrop" onMouseDown={(e) => { if (e.target === e.currentTarget) onClose(); }}>
      <div className="waa-modal" role="dialog" aria-modal="true" aria-labelledby="waa-title" ref={dialogRef}>
        <button type="button" className="waa-close" onClick={onClose} aria-label="Close">×</button>

        {status === 'done' ? (
          <div className="waa-done">
            <div className="waa-check" aria-hidden="true">✓</div>
            <h2 id="waa-title">Thanks, your download is starting</h2>
            <p className="text-muted">If nothing downloaded, <a href={ZIP_URL} download className="waa-link">download the extension here</a>. Then:</p>
            <ol className="waa-steps">
              <li>Unzip the file to a folder you will keep.</li>
              <li>In Chrome, open <code>chrome://extensions</code> and turn on <strong>Developer mode</strong>.</li>
              <li>Click <strong>Load unpacked</strong> and choose the unzipped folder (the one with <code>manifest.json</code>).</li>
              <li>Pin it, open any website and press <strong>Reload &amp; audit</strong>.</li>
            </ol>
            <p className="text-muted waa-small">Our team may reach out to see how you get on. Want help fixing what it finds? <a href="/contact-us/" className="waa-link">Talk to us</a>.</p>
            <button type="button" className="btn btn-outline" onClick={onClose}>Close</button>
          </div>
        ) : (
          <form onSubmit={handleSubmit} noValidate>
            <h2 id="waa-title">Get the Chrome extension</h2>
            <p className="text-muted" style={{ margin: '6px 0 18px' }}>Tell us where to reach you and the download starts right away.</p>

            {field('name', 'Full name', { type: 'text', autoComplete: 'name', required: true })}
            {field('email', 'Work email', { type: 'email', autoComplete: 'email', required: true })}
            {field('website', 'Website', { type: 'text', inputMode: 'url', autoComplete: 'url', placeholder: 'example.com', required: true })}
            {field('phone', 'Phone number', { type: 'tel', autoComplete: 'tel', required: true })}

            {/* Honeypot: invisible to people, tempting to bots. */}
            <div className="waa-trap" aria-hidden="true">
              <label htmlFor="waa-trap">Leave this empty</label>
              <input id="waa-trap" name="company_url" tabIndex={-1} autoComplete="off" value={form.trap} onChange={set('trap')} />
            </div>

            {RECAPTCHA_SITE_KEY && (
              <div className="waa-captcha-wrap">
                {!captchaShown && (
                  <p className={captchaFailed ? 'waa-err waa-captcha-wait' : 'waa-fine waa-captcha-wait'}>
                    {captchaFailed
                      ? 'The security check could not load. Please refresh the page, or email sales@corebitmedia.com and we will send the extension.'
                      : 'Loading security check…'}
                  </p>
                )}
                <div ref={captchaBoxRef} className="waa-captcha" />
              </div>
            )}
            {captchaMissing && <p className="waa-err" role="alert">Please complete the reCAPTCHA check.</p>}

            <button type="submit" className="btn btn-lg waa-submit" disabled={status === 'sending'}>
              {status === 'sending' ? 'Sending…' : 'Download the extension'}
            </button>
            {status === 'error' && (
              <p className="waa-err" role="alert">
                {serverError || 'Something went wrong. Please try again, or email sales@corebitmedia.com and we will send it over.'}
              </p>
            )}
            <p className="waa-fine">
              We will use these details to send you the extension and follow up about it. See our{' '}
              <a href="/privacy-policy/" className="waa-link">Privacy Policy</a>.
            </p>
          </form>
        )}
      </div>
    </div>
  );
}
