import Link from 'next/link';
import { getCaseStudies } from '../../lib/api';

export const metadata = {
  title: 'Case Study',
  description: 'How Core Bit Media makes businesses boom — real results across SEO, PPC, and analytics.',
  alternates: { canonical: '/case-study/' }
};

// The real site's card excerpt is an auto-generated 15-word trim of the case
// study's own body copy (confirmed via the live Elementor "posts" widget
// settings) — there's no separate excerpt field in our CaseStudy model, so
// we reproduce that same 15-word trim from the challenge text client-side.
function excerptOf(text, wordLimit = 15) {
  if (!text) return '';
  const words = text.trim().split(/\s+/);
  if (words.length <= wordLimit) return text;
  return `${words.slice(0, wordLimit).join(' ')}…`;
}

const CATEGORY_LABELS = {
  analytics: 'Analytics',
  experimentation: 'Experimentation & CRO',
  marketing: 'Marketing'
};

// The shared `.grid-3` class always reserves 3 columns, leaving a visibly
// empty one whenever a category has fewer cards (only 2 each, right now).
// `repeat(auto-fit, minmax(280px, 1fr))` sizes tracks by how many actually
// fit, collapsing any with no content to 0 width so populated cards expand
// to fill the row instead — while still wrapping to fewer columns (and
// eventually 1) as the viewport narrows, so mobile stays responsive too.
const cardGridStyle = { display: 'grid', gap: 24, gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))' };

function CaseStudyCard({ cs }) {
  return (
    <Link href={`/case-study/${cs.slug}/`} className="card" style={{ padding: 15 }}>
      {cs.coverImageUrl && (
        <img
          src={cs.coverImageUrl}
          alt={cs.title}
          loading="lazy"
          style={{ width: '100%', aspectRatio: '1 / 0.42', objectFit: 'cover', borderRadius: 8, marginBottom: 16 }}
        />
      )}
      <h3 style={{ fontSize: 18, color: '#232358' }}>{cs.title}</h3>
      <p style={{ marginTop: 10, fontSize: 15, color: '#23242C' }}>{excerptOf(cs.challenge)}</p>
      <span style={{ marginTop: 10, display: 'inline-block', fontSize: 16, fontWeight: 600, color: '#232358' }}>Read More &raquo;</span>
    </Link>
  );
}

export default async function CaseStudyListPage() {
  const caseStudies = await getCaseStudies();
  const uncategorized = caseStudies.filter((cs) => !cs.category);
  const groups = Object.entries(CATEGORY_LABELS)
    .map(([key, label]) => ({ key, label, items: caseStudies.filter((cs) => cs.category === key) }))
    .filter((g) => g.items.length > 0);

  return (
    <section className="section">
      <div className="container" style={{ textAlign: 'center', maxWidth: 720, margin: '0 auto 48px' }}>
        <div className="eyebrow">How We Make Businesses Boom</div>
        <h1>Core Bit Media Case Studies</h1>
      </div>

      {caseStudies.length === 0 && (
        <div className="container">
          <p className="text-muted">Case studies will appear here once published from the admin panel.</p>
        </div>
      )}

      {groups.map((g) => (
        <div key={g.key} className="container" style={{ marginBottom: 40 }}>
          <h3 style={{ marginBottom: 20 }}>{g.label}</h3>
          <div style={cardGridStyle}>
            {g.items.map((cs) => <CaseStudyCard key={cs.slug} cs={cs} />)}
          </div>
        </div>
      ))}

      {uncategorized.length > 0 && (
        <div className="container">
          {groups.length > 0 && <h3 style={{ marginBottom: 20 }}>More Case Studies</h3>}
          <div style={cardGridStyle}>
            {uncategorized.map((cs) => <CaseStudyCard key={cs.slug} cs={cs} />)}
          </div>
        </div>
      )}
    </section>
  );
}
