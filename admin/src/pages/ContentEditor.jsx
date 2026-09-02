import { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import Layout from '../components/Layout.jsx';
import { api, CONTENT_TYPES } from '../lib/api.js';

const emptyItem = {
  title: '', slug: '', shortDescription: '', excerpt: '', body: '',
  status: 'draft', metaTitle: '', metaDescription: '', focusKeyword: '',
  aiAnswerSummary: '', faqSchema: [], seoScore: null, seoNotes: ''
};

function scoreClass(score) {
  if (score == null) return '';
  if (score >= 75) return 'score-good';
  if (score >= 50) return 'score-mid';
  return 'score-low';
}

export default function ContentEditor() {
  const { type, id } = useParams();
  const cfg = CONTENT_TYPES[type];
  const navigate = useNavigate();
  const isNew = id === 'new';

  const [item, setItem] = useState(emptyItem);
  const [loading, setLoading] = useState(!isNew);
  const [saving, setSaving] = useState(false);
  const [optimizing, setOptimizing] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    if (!isNew) {
      api.get(`${cfg.path}/admin/${id}`).then(setItem).finally(() => setLoading(false));
    }
  }, [id, type]);

  function update(field, value) {
    setItem((prev) => ({ ...prev, [field]: value }));
  }

  async function handleSave(publish = false) {
    setSaving(true);
    setError('');
    try {
      const payload = { ...item };
      if (publish) payload.status = 'published';
      const saved = isNew
        ? await api.post(`${cfg.path}/admin`, payload)
        : await api.put(`${cfg.path}/admin/${id}`, payload);
      navigate(`/content/${type}/${saved.id}`);
      setItem(saved);
    } catch (err) {
      setError(err.message);
    } finally {
      setSaving(false);
    }
  }

  // Calls the backend AI SEO/AEO/GEO service and fills in the metadata fields.
  // This is the "minimum effort" SEO workflow: write your content, click one button.
  async function handleAiOptimize() {
    const bodyText = item.body || item.shortDescription || item.excerpt || '';
    if (!item.title || !bodyText) {
      setError('Add a title and some content before running AI Optimize.');
      return;
    }
    setOptimizing(true);
    setError('');
    try {
      const result = await api.post('/api/ai/optimize', {
        title: item.title,
        bodyText,
        contentType: type,
        url: `https://www.corebitmedia.com/${item.slug || ''}`
      });
      setItem((prev) => ({ ...prev, ...result }));
    } catch (err) {
      setError(err.message);
    } finally {
      setOptimizing(false);
    }
  }

  async function handleImageUpload(e, field) {
    const file = e.target.files[0];
    if (!file) return;
    const { url } = await api.uploadImage(file);
    update(field, url);
  }

  if (loading) return <Layout><p>Loading…</p></Layout>;

  return (
    <Layout>
      <div className="toolbar">
        <h2 style={{ margin: 0 }}>{isNew ? `New ${cfg.label.slice(0, -1)}` : `Edit: ${item.title}`}</h2>
        <div style={{ display: 'flex', gap: 8 }}>
          <button className="secondary" onClick={() => navigate(`/content/${type}`)}>Back</button>
          <button className="secondary" onClick={() => handleSave(false)} disabled={saving}>Save Draft</button>
          <button onClick={() => handleSave(true)} disabled={saving}>
            {item.status === 'published' ? 'Update & Publish' : 'Publish'}
          </button>
        </div>
      </div>

      {error && <div className="error-text">{error}</div>}

      <div className="grid-2">
        <div className="card">
          <label>Title</label>
          <input value={item.title} onChange={(e) => update('title', e.target.value)} />

          <label>Slug (URL)</label>
          <input value={item.slug || ''} onChange={(e) => update('slug', e.target.value)} placeholder="auto-generated from title if left blank" />

          {(type === 'blog' || type === 'services') && (
            <>
              <label>{type === 'blog' ? 'Excerpt' : 'Short Description'}</label>
              <input
                value={item.excerpt || item.shortDescription || ''}
                onChange={(e) => update(type === 'blog' ? 'excerpt' : 'shortDescription', e.target.value)}
              />
            </>
          )}

          <label>Main Content</label>
          <textarea
            style={{ minHeight: 320 }}
            value={item.body || ''}
            onChange={(e) => update('body', e.target.value)}
            placeholder="Write in Markdown or plain text..."
          />

          <label>Cover / Hero Image</label>
          <input type="file" accept="image/*" onChange={(e) => handleImageUpload(e, item.coverImageUrl !== undefined ? 'coverImageUrl' : 'heroImageUrl')} />
          {(item.coverImageUrl || item.heroImageUrl) && (
            <img src={item.coverImageUrl || item.heroImageUrl} alt="" style={{ maxWidth: 200, borderRadius: 8, marginTop: 8 }} />
          )}
        </div>

        <div>
          <div className="card">
            <label>Status</label>
            <select value={item.status} onChange={(e) => update('status', e.target.value)}>
              <option value="draft">Draft</option>
              <option value="pending_review">Pending Review</option>
              <option value="published">Published</option>
            </select>
          </div>

          <div className="card">
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 8 }}>
              <h4 style={{ margin: 0 }}>AI SEO · AEO · GEO</h4>
              {item.seoScore != null && (
                <span className={`score-pill ${scoreClass(item.seoScore)}`}>{item.seoScore}/100</span>
              )}
            </div>
            <button onClick={handleAiOptimize} disabled={optimizing} style={{ width: '100%', marginBottom: 12 }}>
              {optimizing ? 'Analyzing with AI…' : '✨ AI Optimize This Content'}
            </button>

            <label>Meta Title</label>
            <input value={item.metaTitle || ''} onChange={(e) => update('metaTitle', e.target.value)} maxLength={70} />

            <label>Meta Description</label>
            <textarea style={{ minHeight: 70 }} value={item.metaDescription || ''} onChange={(e) => update('metaDescription', e.target.value)} maxLength={160} />

            <label>Focus Keyword</label>
            <input value={item.focusKeyword || ''} onChange={(e) => update('focusKeyword', e.target.value)} />

            <label>AI Answer Summary (AEO)</label>
            <textarea
              style={{ minHeight: 70 }}
              value={item.aiAnswerSummary || ''}
              onChange={(e) => update('aiAnswerSummary', e.target.value)}
              placeholder="Direct answer AI assistants and featured snippets can quote"
            />

            {item.faqSchema && item.faqSchema.length > 0 && (
              <div className="ai-box">
                <h4>Generated FAQ Schema (GEO)</h4>
                {item.faqSchema.map((f, i) => (
                  <div key={i} style={{ marginBottom: 10, fontSize: 13 }}>
                    <strong>{f.question}</strong>
                    <p style={{ margin: '4px 0 0', color: '#475569' }}>{f.answer}</p>
                  </div>
                ))}
              </div>
            )}

            {item.seoNotes && (
              <div className="ai-box">
                <h4>AI Notes</h4>
                <p style={{ margin: 0, fontSize: 13, color: '#475569' }}>{item.seoNotes}</p>
              </div>
            )}
          </div>
        </div>
      </div>
    </Layout>
  );
}
