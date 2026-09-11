import Link from 'next/link';
import { notFound } from 'next/navigation';
import { getIndustries, getIndustry } from '../../../lib/api';
import StructuredData from '../../../components/StructuredData';
import FaqSection from '../../../components/FaqSection';

export async function generateStaticParams() {
  const industries = await getIndustries();
  // output: export fails the whole build on a truly empty
  // generateStaticParams() array — see the same guard on services/case-study.
  if (industries.length === 0) return [{ slug: '_none' }];
  return industries.map((i) => ({ slug: i.slug }));
}

export async function generateMetadata({ params }) {
  const industry = await getIndustry(params.slug);
  if (!industry) return {};
  return {
    title: industry.metaTitle || industry.title,
    description: industry.metaDescription || industry.shortDescription,
    alternates: { canonical: `/industries/${industry.slug}/` },
    openGraph: {
      title: industry.metaTitle || industry.title,
      description: industry.metaDescription || industry.shortDescription,
      url: `/industries/${industry.slug}/`,
      images: industry.heroImageUrl ? [industry.heroImageUrl] : []
    }
  };
}

// Same body-block convention as every other content model (see
// services/[slug]/page.js's parseBody/ServiceBody, duplicated here rather
// than shared — this page and the services detail page are independent
// enough not to warrant coupling them through a shared component).
const CheckIcon = () => (
  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" style={{ flexShrink: 0, marginTop: 3 }}>
    <circle cx="12" cy="12" r="12" fill="var(--teal)" />
    <path d="M7 12.5l3 3 7-7" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
  </svg>
);

function parseListItems(lines) {
  return lines.map((l) => {
    const text = l.replace(/^- /, '');
    const dashIdx = text.indexOf(' — ');
    if (dashIdx > -1 && dashIdx < 60) {
      return { title: text.slice(0, dashIdx), desc: text.slice(dashIdx + 3) };
    }
    return { title: null, desc: text };
  });
}

function isHeadingLine(line) {
  return line.length < 90 && !/\.$/.test(line);
}

function parseBlock(block) {
  const lines = block.split('\n').map((l) => l.trim()).filter(Boolean);
  if (lines.length === 1) {
    return isHeadingLine(lines[0]) && /[:?]$/.test(lines[0])
      ? [{ type: 'heading', text: lines[0].replace(/:$/, '') }]
      : [{ type: 'paragraph', text: lines[0] }];
  }

  const out = [];
  let i = 0;
  if (isHeadingLine(lines[0])) {
    out.push({ type: 'heading', text: lines[0].replace(/:$/, '') });
    i = 1;
  }

  let paraBuf = [];
  let listBuf = [];
  const flushPara = () => {
    if (paraBuf.length) out.push({ type: 'paragraph', text: paraBuf.join(' ') });
    paraBuf = [];
  };
  const flushList = () => {
    if (listBuf.length) out.push({ type: 'list', items: parseListItems(listBuf) });
    listBuf = [];
  };
  for (; i < lines.length; i++) {
    const line = lines[i];
    if (line.startsWith('- ')) {
      flushPara();
      listBuf.push(line);
    } else {
      flushList();
      paraBuf.push(line);
    }
  }
  flushPara();
  flushList();
  return out;
}

function parseBody(body) {
  if (!body) return [];
  return body.split(/\n\s*\n/).map((block) => block.trim()).filter(Boolean).flatMap(parseBlock);
}

function IndustryBody({ body }) {
  const blocks = parseBody(body);
  return (
    <div style={{ marginTop: 20 }}>
      {blocks.map((block, i) => {
        if (block.type === 'heading') {
          return <h2 key={i} style={{ fontSize: 26, marginTop: i === 0 ? 0 : 40, marginBottom: 4, color: 'var(--navy)' }}>{block.text}</h2>;
        }
        if (block.type === 'list') {
          return (
            <ul key={i} style={{ listStyle: 'none', margin: '16px 0', padding: 0, display: 'flex', flexDirection: 'column', gap: 14 }}>
              {block.items.map((item, j) => (
                <li key={j} style={{ display: 'flex', gap: 12, alignItems: 'flex-start' }}>
                  <CheckIcon />
                  <span style={{ lineHeight: 1.7, color: 'var(--text)' }}>
                    {item.title && <strong>{item.title}</strong>}
                    {item.title && ' — '}
                    {item.desc}
                  </span>
                </li>
              ))}
            </ul>
          );
        }
        return <p key={i} className="text-muted" style={{ lineHeight: 1.8, marginTop: i === 0 ? 0 : 16, fontSize: 16 }}>{block.text}</p>;
      })}
    </div>
  );
}

export default async function IndustryDetailPage({ params }) {
  const industry = await getIndustry(params.slug);
  if (!industry) notFound();

  const allIndustries = await getIndustries();
  const moreIndustries = allIndustries.filter((i) => i.slug !== params.slug).slice(0, 3);

  const breadcrumbSchema = {
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    itemListElement: [
      { '@type': 'ListItem', position: 1, name: 'Home', item: 'https://www.corebitmedia.com/' },
      { '@type': 'ListItem', position: 2, name: 'Industries', item: 'https://www.corebitmedia.com/industries/' },
      { '@type': 'ListItem', position: 3, name: industry.title, item: `https://www.corebitmedia.com/industries/${industry.slug}/` }
    ]
  };

  return (
    <>
      <StructuredData data={industry.structuredData} />
      <StructuredData data={breadcrumbSchema} />

      <section
        className="gradient-purple"
        style={{
          color: 'white',
          padding: '64px 0',
          ...(industry.heroImageUrl
            ? {
                backgroundImage: `linear-gradient(135deg, rgba(142,38,128,0.88), rgba(35,35,88,0.92)), url('${industry.heroImageUrl}')`,
                backgroundSize: 'cover',
                backgroundPosition: 'center'
              }
            : {})
        }}
      >
        <div className="container">
          <div className="eyebrow" style={{ color: '#f3c9ff' }}>Industry</div>
          <h1 style={{ color: 'white' }}>{industry.title}</h1>
          {industry.shortDescription && <p style={{ marginTop: 16, fontSize: 18, color: '#e9d6f2', maxWidth: 640 }}>{industry.shortDescription}</p>}
          <div style={{ display: 'flex', gap: 16, marginTop: 32, flexWrap: 'wrap' }}>
            <Link href="/contact-us/" className="btn" style={{ background: 'white', color: 'var(--navy)' }}>Get Free Audit</Link>
            <Link href="/industries/" className="btn btn-outline" style={{ borderColor: 'white', color: 'white' }}>All Industries</Link>
          </div>
        </div>
      </section>

      <section className="section">
        <div className="container" style={{ maxWidth: 860, margin: '0 auto' }}>
          <IndustryBody body={industry.body} />
        </div>
      </section>

      <FaqSection faqs={industry.faqSchema} title={`${industry.title} FAQs`} />

      {moreIndustries.length > 0 && (
        <section className="section section-alt">
          <div className="container" style={{ maxWidth: 720, margin: '0 auto 32px', textAlign: 'center' }}>
            <div className="eyebrow">Other Industries</div>
            <h2>More Industries We Serve</h2>
          </div>
          <div className="container grid grid-3">
            {moreIndustries.map((i) => (
              <Link href={`/industries/${i.slug}/`} key={i.slug} className="card">
                <h3>{i.title}</h3>
                <p className="text-muted" style={{ marginTop: 10, fontSize: 14 }}>{i.shortDescription}</p>
              </Link>
            ))}
          </div>
        </section>
      )}

      <section className="section gradient-purple" style={{ color: 'white', textAlign: 'center' }}>
        <div className="container">
          <h2 style={{ color: 'white' }}>Ready to Grow in {industry.title}?</h2>
          <Link href="/contact-us/" className="btn" style={{ marginTop: 24, display: 'inline-block', background: 'white', color: 'var(--navy)' }}>Talk To Our Team</Link>
        </div>
      </section>
    </>
  );
}
