import { useEffect, useState } from 'react';
import Layout from '../components/Layout.jsx';
import { api } from '../lib/api.js';

const FIELDS = [
  { key: 'siteName', label: 'Site Name', type: 'text' },
  { key: 'primaryColor', label: 'Primary Color (buttons, links)', type: 'color' },
  { key: 'primaryColorDark', label: 'Primary Color — Hover', type: 'color' },
  { key: 'secondaryColor', label: 'Secondary Color (headings, navy)', type: 'color' },
  { key: 'textColor', label: 'Body Text Color', type: 'color' },
  { key: 'mutedColor', label: 'Muted Text Color', type: 'color' },
  { key: 'backgroundColor', label: 'Background Color', type: 'color' },
  { key: 'backgroundAltColor', label: 'Alt Section Background', type: 'color' }
];

// Known-good brand defaults — used by "Reset to Defaults" if saved colors
// end up producing poor contrast (e.g. a primary color too close to white,
// which makes white button text hard to read).
const DEFAULTS = {
  siteName: 'Core Bit Media',
  primaryColor: '#0fb5ae',
  primaryColorDark: '#0a8f89',
  secondaryColor: '#0b1f3a',
  textColor: '#1a2233',
  mutedColor: '#64748b',
  backgroundColor: '#ffffff',
  backgroundAltColor: '#f5f7fa',
  fontFamily: "'Segoe UI', system-ui, -apple-system, sans-serif",
  buttonRadius: '8px'
};

export default function Theme() {
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

  async function handleReset() {
    if (!confirm('Reset all theme colors and fonts to the default brand palette? This saves immediately.')) return;
    setSaving(true);
    try {
      const updated = await api.put('/api/settings/theme', { ...settings, ...DEFAULTS });
      setSettings(updated);
      setSaved(true);
    } finally {
      setSaving(false);
    }
  }

  async function handleLogoUpload(e) {
    const file = e.target.files[0];
    if (!file) return;
    const { url } = await api.uploadImage(file);
    update('logoUrl', url);
  }

  if (!settings) return <Layout><p>Loading…</p></Layout>;

  // Simple luminance check so an editor doesn't accidentally save a primary
  // color too light for the white button text to read against.
  function isTooLight(hex) {
    if (!hex || hex.length < 7) return false;
    const r = parseInt(hex.slice(1, 3), 16);
    const g = parseInt(hex.slice(3, 5), 16);
    const b = parseInt(hex.slice(5, 7), 16);
    const luminance = (0.299 * r + 0.587 * g + 0.114 * b) / 255;
    return luminance > 0.75;
  }
  const primaryTooLight = isTooLight(settings.primaryColor);

  return (
    <Layout>
      <div className="toolbar">
        <h2 style={{ margin: 0 }}>Website Theme</h2>
        <div style={{ display: 'flex', gap: 10 }}>
          <button className="secondary" onClick={handleReset} disabled={saving}>Reset to Defaults</button>
          <button onClick={handleSave} disabled={saving}>
            {saving ? 'Saving…' : saved ? '✓ Saved' : 'Save Theme'}
          </button>
        </div>
      </div>
      <p style={{ color: '#64748b', fontSize: 14, marginTop: -12, marginBottom: 20 }}>
        Changes apply live on the public site within a few seconds — no redeploy needed.
      </p>
      {primaryTooLight && (
        <div style={{ background: '#fef2f2', border: '1px solid #fecaca', color: '#991b1b', padding: '12px 16px', borderRadius: 8, fontSize: 14, marginBottom: 20 }}>
          ⚠️ Your Primary Color is very light. Button text is white, so it may be hard to read against it — pick a darker shade or click "Reset to Defaults".
        </div>
      )}

      <div className="grid-2">
        <div className="card">
          {FIELDS.map((f) => (
            <div key={f.key} style={{ marginBottom: 14 }}>
              <label>{f.label}</label>
              {f.type === 'color' ? (
                <div style={{ display: 'flex', gap: 10, alignItems: 'center' }}>
                  <input
                    type="color"
                    value={settings[f.key] || '#000000'}
                    onChange={(e) => update(f.key, e.target.value)}
                    style={{ width: 48, height: 38, padding: 2, marginBottom: 0 }}
                  />
                  <input
                    type="text"
                    value={settings[f.key] || ''}
                    onChange={(e) => update(f.key, e.target.value)}
                    style={{ marginBottom: 0 }}
                  />
                </div>
              ) : (
                <input
                  type="text"
                  value={settings[f.key] || ''}
                  onChange={(e) => update(f.key, e.target.value)}
                />
              )}
            </div>
          ))}

          <label>Font Family (CSS value)</label>
          <input
            type="text"
            value={settings.fontFamily || ''}
            onChange={(e) => update('fontFamily', e.target.value)}
            placeholder="'Segoe UI', system-ui, sans-serif"
          />

          <label>Button Corner Radius</label>
          <select value={settings.buttonRadius || '6px'} onChange={(e) => update('buttonRadius', e.target.value)}>
            <option value="0px">Sharp (0px)</option>
            <option value="6px">Rounded (6px)</option>
            <option value="12px">Soft (12px)</option>
            <option value="999px">Pill</option>
          </select>

          <label>Logo</label>
          <input type="file" accept="image/*" onChange={handleLogoUpload} />
          {settings.logoUrl && <img src={settings.logoUrl} alt="Logo" style={{ maxWidth: 160, marginTop: 8 }} />}
        </div>

        <div className="card">
          <h4 style={{ marginTop: 0 }}>Live Preview</h4>
          <div
            style={{
              border: '1px solid #e2e8f0',
              borderRadius: 8,
              padding: 24,
              background: settings.backgroundColor,
              color: settings.textColor,
              fontFamily: settings.fontFamily
            }}
          >
            <div style={{ color: settings.secondaryColor, fontWeight: 700, fontSize: 20, marginBottom: 8 }}>
              {settings.siteName}
            </div>
            <p style={{ color: settings.mutedColor, fontSize: 14, marginBottom: 16 }}>
              This is how body and muted text will look on the live site.
            </p>
            <button
              style={{
                background: settings.primaryColor,
                color: 'white',
                border: 'none',
                padding: '10px 20px',
                borderRadius: settings.buttonRadius,
                fontWeight: 600
              }}
            >
              Sample Button
            </button>
            <div
              style={{
                marginTop: 16,
                padding: 16,
                background: settings.backgroundAltColor,
                borderRadius: 8,
                fontSize: 13,
                color: settings.mutedColor
              }}
            >
              Alt section background preview
            </div>
          </div>
        </div>
      </div>
    </Layout>
  );
}
