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

export default async function CaseStudyListPage() {
  const caseStudies = await getCaseStudies();

  return (
    <section className="section">
      <div className="container" style={{ textAlign: 'center', maxWidth: 720, margin: '0 auto 48px' }}>
        <div className="eyebrow">How We Make Businesses Boom</div>
        <h1>Core Bit Media Case Studies</h1>
      </div>
      <div className="container grid grid-3">
        {caseStudies.map((cs) => (
          <Link href={`/case-study/${cs.slug}/`} key={cs.slug} className="card" style={{ padding: 15 }}>
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
        ))}
        {caseStudies.length === 0 && <p className="text-muted">Case studies will appear here once published from the admin panel.</p>}
      </div>
    </section>
  );
}
