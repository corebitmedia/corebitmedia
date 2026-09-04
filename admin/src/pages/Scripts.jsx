import { useEffect, useState } from 'react';
import Layout from '../components/Layout.jsx';
import { api } from '../lib/api.js';

// Reuses the same /api/settings/theme GET/PUT the Theme page uses — it's
// really just "get/put the one SiteSettings row", theme colors and these
// tracking fields both live on it, so a second route would just duplicate
// the same getOrCreateSettings() logic in settingsRoutes.js.
export default function Scripts() {
  const [settings, setSettings] = useState(null);
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);

  useEffect(() => {
    api.get('/api/settings/theme').then(setSettings);
  }, []);

  function update(key, value) {
    setSettings((prev) => ({ ...prev, [key]: value }));
    setSaved(false);
  }

  async function handleSave() {
    setSaving(true);
    try {
      const updated = await api.put('/api/settings/theme', settings);
      setSettings(updated);
      setSaved(true);
    } finally {
      setSaving(false);
    }
  }

  if (!settings) return <Layout><p>Loading…</p></Layout>;

  return (
    <Layout>
      <div className="toolbar">
        <h2 style={{ margin: 0 }}>Scripts & Tracking</h2>
        <button onClick={handleSave} disabled={saving}>
          {saving ? 'Saving…' : saved ? '✓ Saved' : 'Save'}
        </button>
      </div>
      <p style={{ color: '#64748b', fontSize: 14, marginTop: -12, marginBottom: 20 }}>
        Applies live on the public site within a few seconds — no redeploy needed.
      </p>

      <div className="card" style={{ maxWidth: 640 }}>
        <label>Google Tag Manager Container ID</label>
        <input
          type="text"
          placeholder="GTM-XXXXXXX"
          value={settings.gtmContainerId || ''}
          onChange={(e) => update('gtmContainerId', e.target.value)}
        />

        <label style={{ marginTop: 16 }}>Google Search Console Verification Code</label>
        <input
          type="text"
          placeholder="Paste just the content= value from the meta tag Google gives you"
          value={settings.googleSiteVerification || ''}
          onChange={(e) => update('googleSiteVerification', e.target.value)}
        />

        <label style={{ marginTop: 16 }}>CMP / Cookie Consent Script</label>
        <textarea
          rows={5}
          placeholder="Paste your cookie-consent platform's <script> snippet (e.g. Cookiebot, OneTrust, CookieYes)"
          value={settings.cmpScript || ''}
          onChange={(e) => update('cmpScript', e.target.value)}
          style={{ fontFamily: 'monospace', fontSize: 13 }}
        />

        <label style={{ marginTop: 16 }}>Other Custom Script</label>
        <textarea
          rows={5}
          placeholder="Any other <script> or <meta> tag to load on every page"
          value={settings.customHeadScript || ''}
          onChange={(e) => update('customHeadScript', e.target.value)}
          style={{ fontFamily: 'monospace', fontSize: 13 }}
        />
      </div>
    </Layout>
  );
}
