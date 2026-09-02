import Link from 'next/link';
import { notFound } from 'next/navigation';
import { getServices, getService } from '../../../lib/api';
import StructuredData from '../../../components/StructuredData';
import HeroAnimation from '../../../components/HeroAnimation';
import FaqSection from '../../../components/FaqSection';

// Required for static export: tells Next.js which service pages to pre-render at build time
export async function generateStaticParams() {
  const services = await getServices();
  return services.map((s) => ({ slug: s.slug }));
}

export async function generateMetadata({ params }) {
  const service = await getService(params.slug);
  if (!service) return {};
  return {
    title: service.metaTitle || service.title,
    description: service.metaDescription || service.shortDescription,
    openGraph: { images: service.heroImageUrl ? [service.heroImageUrl] : [] }
  };
}

// Real supporting photos pulled directly from each service's own live
// WordPress page (verified via DB query of the page's image widgets, not a
// stock placeholder). Reporting & Dashboards, Analytics & TMS, and CRM &
// Marketing all reference this same analytics photo on the real site itself
// (confirmed — it's not a substitution we're introducing), so reusing it here
// matches the source rather than deviating from it.
const SUPPORTING_IMAGE = {
  'digital-marketing': 'https://www.corebitmedia.com/wp-content/uploads/2025/06/90826.jpg',
  'paid-ads-ppc': 'https://www.corebitmedia.com/wp-content/uploads/2025/06/6402635_3270759-e1751284787491.jpg',
  'reporting-and-dashboards': 'https://www.corebitmedia.com/wp-content/uploads/2025/06/25025577_7038058-scaled.jpg',
  'analytics-tms': 'https://www.corebitmedia.com/wp-content/uploads/2025/06/25025577_7038058-scaled.jpg',
  'crm-marketing': 'https://www.corebitmedia.com/wp-content/uploads/2025/06/25025577_7038058-scaled.jpg'
};

// Real per-page CTA copy from each live service page's own mid-page CTA band
// (WordPress export, Aug 2026). Paid Ads – PPC is the one page whose CTA
// heading is its own custom line ("Let's Launch Your High-Performance PPC
// Campaign") rather than the site-wide default; every other service page
// reuses the exact same "Looking For Digital Marketing?" band verbatim.
const DEFAULT_CTA = {
  heading: 'Looking For Digital Marketing?',
  subtext: 'Get more calls to your business, visits to your website, or customers to your store.',
  buttonLabel: 'Call Us Now'
};
const CTA_CONFIG = {
  'paid-ads-ppc': {
    heading: "Let's Launch Your High-Performance PPC Campaign",
    subtext: null,
    buttonLabel: 'Get Free Audit'
  }
};

// The live site's hero H1/subtext for these 5 pages is hand-written copy that
// differs from the `title`/`shortDescription` fields (which are also reused
// elsewhere — listing cards, meta tags — so they can't just be replaced).
// Verified against each live page's own <h1> and hero paragraph.
const HERO_OVERRIDES = {
  'digital-marketing': {
    heading: 'Grow Your Business with Digital Marketing',
    subtext: "Grow your Business online with 100% results. Let's work together to achieve your Business Goals with our digital marketing services and strategies."
  },
  'paid-ads-ppc': {
    heading: 'Maximize Your ROI with Expert PPC Management'
  },
  'reporting-and-dashboards': {
    heading: 'Unlock Actionable Insights with Our Custom Reporting Dashboards',
    subtext: 'At Core Bit Media, we transform raw data into powerful insights through intuitive and real-time reporting dashboards.'
  },
  'analytics-tms': {
    heading: 'Analytics and Tag Management System',
    subtext: 'Investing in a powerful Analytics and Tag Management System is an investment in the future success of your business.'
  },
  'crm-marketing': {
    heading: 'Connect, Convert, and Retain with Smart CRM & Marketing Solutions',
    subtext: 'At Core Bit Media, we help businesses streamline customer journeys with powerful CRM (Customer Relationship Management) systems and intelligent marketing automation strategies.'
  }
};

const CheckIcon = () => (
  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" style={{ flexShrink: 0, marginTop: 3 }}>
    <circle cx="12" cy="12" r="12" fill="var(--teal)" />
    <path d="M7 12.5l3 3 7-7" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
  </svg>
);

// The seeded `body` copy follows the same convention across every service —
// blank-line separated blocks that are either a short section heading, a
// run of "- Title — description" / "- Item" bullets, or a plain paragraph —
// but unlike a simple markdown parser, a heading and its list often share a
// single block with NO blank line between them (e.g. "What We Offer:\n- Paid
// Ads...\n- Social Ads..."), and some blocks mix a heading, a lead-in
// sentence, AND a list all in one (e.g. Paid Ads – PPC's "Why Choose PPC
// Advertising?" block). parseBlock walks each block's lines as a small state
// machine so those all split into distinct heading/paragraph/list pieces
// instead of collapsing into one paragraph with raw "- " dashes in it.
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
  return body
    .split(/\n\s*\n/)
    .map((block) => block.trim())
    .filter(Boolean)
    .flatMap(parseBlock);
}

function ServiceBody({ body, dropLastIfMatches }) {
  let blocks = parseBody(body);

  // Some services (e.g. Paid Ads – PPC) end their body copy with the exact
  // same closing line the live site renders as the CTA-band heading below —
  // drop that duplicate trailing paragraph rather than showing the line twice.
  if (dropLastIfMatches && blocks.length) {
    const last = blocks[blocks.length - 1];
    if (last.type === 'paragraph' && last.text.replace(/\.$/, '') === dropLastIfMatches) {
      blocks = blocks.slice(0, -1);
    }
  }

  return (
    <div style={{ marginTop: 20 }}>
      {blocks.map((block, i) => {
        if (block.type === 'heading') {
          return (
            <h2 key={i} style={{ fontSize: 26, marginTop: i === 0 ? 0 : 40, marginBottom: 4, color: 'var(--navy)' }}>
              {block.text}
            </h2>
          );
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
        return (
          <p key={i} className="text-muted" style={{ lineHeight: 1.8, marginTop: i === 0 ? 0 : 16, fontSize: 16 }}>
            {block.text}
          </p>
        );
      })}
    </div>
  );
}

export default async function ServiceDetailPage({ params }) {
  const [service, allServices] = await Promise.all([getService(params.slug), getServices()]);
  if (!service) notFound();

  const supportingImage = SUPPORTING_IMAGE[service.slug];
  const cta = CTA_CONFIG[service.slug] || DEFAULT_CTA;
  const hero = HERO_OVERRIDES[service.slug] || {};
  const heroHeading = hero.heading || service.title;
  const heroSubtext = hero.subtext || service.shortDescription;

  // Sub-services nest under a pillar service (e.g. GA4 Implementation under
  // Analytics & TMS) — surface both directions so every page is reachable by
  // a real link, not just the sitemap, and so parent/child pages interlink
  // for SEO and AI-crawler context.
  const parentService = service.parentId ? allServices.find((s) => s.id === service.parentId) : null;
  const childServices = allServices.filter((s) => s.parentId === service.id);

  return (
    <>
      <StructuredData data={service.structuredData} />

      {/* Live detail-page heroes carry no eyebrow line (that's specific to
          the /services/ listing hero) — just a heading, a short intro line,
          and the CTA buttons. */}
      <section
        className="gradient-purple"
        style={{
          color: 'white',
          padding: '64px 0',
          ...(service.heroImageUrl
            ? {
                backgroundImage: `linear-gradient(135deg, rgba(142,38,128,0.88), rgba(35,35,88,0.92)), url('${service.heroImageUrl}')`,
                backgroundSize: 'cover',
                backgroundPosition: 'center'
              }
            : {})
        }}
      >
        <div className="container">
          <div className="row align-items-center">
            <div className="col-lg-7">
              {parentService && (
                <div style={{ marginBottom: 12 }}>
                  <Link href={`/services/${parentService.slug}/`} style={{ color: '#f3c9ff', fontSize: 14, fontWeight: 600 }}>
                    &laquo; {parentService.title}
                  </Link>
                </div>
              )}
              <h1 style={{ color: 'white' }}>{heroHeading}</h1>
              {heroSubtext && (
                <p style={{ marginTop: 16, fontSize: 18, color: '#e9d6f2', maxWidth: 560 }}>{heroSubtext}</p>
              )}
              <div style={{ display: 'flex', gap: 16, marginTop: 32, flexWrap: 'wrap' }}>
                <Link href="/contact-us/" className="btn" style={{ background: 'white', color: 'var(--navy)' }}>Get Free Audit</Link>
                <Link href="/services/" className="btn btn-outline" style={{ borderColor: 'white', color: 'white' }}>Explore More</Link>
              </div>
            </div>
            <div className="col-lg-5 mt-5 mt-lg-0">
              <HeroAnimation maxWidth={300} />
            </div>
          </div>
        </div>
      </section>

      {/* Single flowing column of content, matching the live site's own
          stacked-section layout for every service page — none of the 5 real
          pages use a two-column body + sidebar layout. */}
      <section className="section">
        <div className="container" style={{ maxWidth: 860, margin: '0 auto' }}>
          {supportingImage && (
            <img
              src={supportingImage}
              alt={service.title}
              style={{ width: '100%', maxHeight: 360, objectFit: 'cover', borderRadius: 12, marginBottom: 12, boxShadow: '0px 8px 24px rgba(35,35,88,0.12)' }}
            />
          )}
          <ServiceBody body={service.body} dropLastIfMatches={cta.heading} />
        </div>
      </section>

      {childServices.length > 0 && (
        <section className="section section-alt">
          <div className="container" style={{ maxWidth: 860, margin: '0 auto' }}>
            <h2 style={{ marginBottom: 24 }}>{service.title} Services</h2>
            <div className="grid grid-3" style={{ gap: 20 }}>
              {childServices.map((child) => (
                <Link
                  key={child.slug}
                  href={`/services/${child.slug}/`}
                  className="card"
                  style={{ display: 'block', padding: 20 }}
                >
                  <h3 style={{ fontSize: 17 }}>{child.title}</h3>
                  <p className="text-muted" style={{ fontSize: 14, marginTop: 8 }}>{child.shortDescription}</p>
                </Link>
              ))}
            </div>
          </div>
        </section>
      )}

      <FaqSection faqs={service.faqSchema} title={`${service.title} FAQs`} />

      <section className="section gradient-purple" style={{ color: 'white', textAlign: 'center' }}>
        <div className="container">
          <h2 style={{ color: 'white' }}>{cta.heading}</h2>
          {cta.subtext && <p style={{ marginTop: 12, color: '#e9d6f2' }}>{cta.subtext}</p>}
          <Link href="/contact-us/" className="btn" style={{ marginTop: 24, display: 'inline-block', background: 'white', color: 'var(--navy)' }}>{cta.buttonLabel}</Link>
        </div>
      </section>
    </>
  );
}
