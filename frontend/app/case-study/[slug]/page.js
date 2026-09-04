import Link from 'next/link';
import { notFound } from 'next/navigation';
import { getCaseStudies, getCaseStudy } from '../../../lib/api';
import StructuredData from '../../../components/StructuredData';

export async function generateStaticParams() {
  const items = await getCaseStudies();
  // See the same guard in blogs/[slug]/page.js — output: export fails the
  // entire build on a truly empty generateStaticParams() array.
  if (items.length === 0) return [{ slug: '_none' }];
  return items.map((c) => ({ slug: c.slug }));
}

export async function generateMetadata({ params }) {
  const cs = await getCaseStudy(params.slug);
  if (!cs) return {};
  return {
    title: cs.metaTitle || cs.title,
    description: cs.metaDescription,
    alternates: { canonical: `/case-study/${cs.slug}/` },
    openGraph: {
      title: cs.metaTitle || cs.title,
      description: cs.metaDescription,
      url: `/case-study/${cs.slug}/`,
      images: cs.coverImageUrl ? [cs.coverImageUrl] : []
    }
  };
}

// The backend stores `metrics` as a JSON column, but depending on the MySQL/MariaDB
// version in use it can come back over the API as an already-parsed array OR as a
// raw JSON string — normalize defensively so the page never crashes either way.
function parseMetrics(metrics) {
  if (Array.isArray(metrics)) return metrics;
  if (typeof metrics === 'string') {
    try {
      const parsed = JSON.parse(metrics);
      return Array.isArray(parsed) ? parsed : [];
    } catch {
      return [];
    }
  }
  return [];
}

export default async function CaseStudyDetailPage({ params }) {
  const cs = await getCaseStudy(params.slug);
  if (!cs) notFound();

  const metrics = parseMetrics(cs.metrics);
  const allCaseStudies = await getCaseStudies();
  const moreCaseStudies = allCaseStudies.filter((c) => c.slug !== params.slug).slice(0, 3);

  const breadcrumbSchema = {
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    itemListElement: [
      { '@type': 'ListItem', position: 1, name: 'Home', item: 'https://www.corebitmedia.com/' },
      { '@type': 'ListItem', position: 2, name: 'Case Study', item: 'https://www.corebitmedia.com/case-study/' },
      { '@type': 'ListItem', position: 3, name: cs.title, item: `https://www.corebitmedia.com/case-study/${cs.slug}/` }
    ]
  };

  return (
    <>
      <StructuredData data={cs.structuredData} />
      <StructuredData data={breadcrumbSchema} />
      <section className="section" style={{ background: 'var(--bg-alt)' }}>
        <div className="container" style={{ maxWidth: 780 }}>
          <Link href="/case-study/" className="text-muted" style={{ fontSize: 14, display: 'inline-block', marginBottom: 16 }}>&larr; All Case Studies</Link>
          <div className="eyebrow">{cs.industry || 'Case Study'}</div>
          <h1>{cs.title}</h1>
          {cs.clientName && <p className="text-muted" style={{ marginTop: 8 }}>Client: {cs.clientName}</p>}
        </div>
      </section>

      <section className="section">
        <div className="container" style={{ maxWidth: 780 }}>
          {cs.coverImageUrl && <img src={cs.coverImageUrl} alt={cs.title} style={{ width: '100%', borderRadius: 12, marginBottom: 32 }} />}

          {metrics.length > 0 && (
            <div className="grid grid-3" style={{ marginBottom: 40 }}>
              {metrics.map((m, i) => (
                <div className="card" key={i} style={{ textAlign: 'center' }}>
                  <div style={{ fontSize: 28, fontWeight: 800, color: 'var(--teal)' }}>{m.value}</div>
                  <div className="text-muted" style={{ fontSize: 13 }}>{m.label}</div>
                </div>
              ))}
            </div>
          )}

          {cs.challenge && <><h3>The Challenge</h3><p className="text-muted" style={{ marginTop: 8, marginBottom: 24 }}>{cs.challenge}</p></>}
          {cs.solution && <><h3>Our Solution</h3><p className="text-muted" style={{ marginTop: 8, marginBottom: 24 }}>{cs.solution}</p></>}
          {cs.results && <><h3>The Results</h3><p className="text-muted" style={{ marginTop: 8 }}>{cs.results}</p></>}

          <div style={{ marginTop: 40, paddingTop: 24, borderTop: '1px solid var(--border)' }}>
            <Link href="/contact-us/" className="btn">Get Results Like This</Link>
          </div>
        </div>
      </section>

      {moreCaseStudies.length > 0 && (
        <section className="section section-alt">
          <div className="container" style={{ maxWidth: 720, margin: '0 auto 32px', textAlign: 'center' }}>
            <div className="eyebrow">More Success Stories</div>
            <h2>Other Case Studies</h2>
          </div>
          <div className="container grid grid-3">
            {moreCaseStudies.map((c) => (
              <Link href={`/case-study/${c.slug}/`} key={c.slug} className="card" style={{ padding: 0, overflow: 'hidden' }}>
                {c.coverImageUrl && <img src={c.coverImageUrl} alt={c.title} loading="lazy" style={{ width: '100%', height: 160, objectFit: 'cover' }} />}
                <div style={{ padding: 20 }}>
                  <h3>{c.title}</h3>
                  {c.clientName && <p className="text-muted" style={{ marginTop: 6, fontSize: 13 }}>{c.clientName}</p>}
                </div>
              </Link>
            ))}
          </div>
        </section>
      )}
    </>
  );
}
