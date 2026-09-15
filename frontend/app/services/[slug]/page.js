import Link from 'next/link';
import { notFound } from 'next/navigation';
import { getServices, getService, getCaseStudies, getBlogPosts } from '../../../lib/api';
import StructuredData from '../../../components/StructuredData';
import HeroAnimation from '../../../components/HeroAnimation';
import FaqSection from '../../../components/FaqSection';
import Carousel from '../../../components/Carousel';

// Required for static export: tells Next.js which service pages to pre-render at build time
export async function generateStaticParams() {
  const services = await getServices();
  // See the same guard in blogs/[slug]/page.js — output: export fails the
  // entire build on a truly empty generateStaticParams() array.
  if (services.length === 0) return [{ slug: '_none' }];
  return services.map((s) => ({ slug: s.slug }));
}

export async function generateMetadata({ params }) {
  const service = await getService(params.slug);
  if (!service) return {};
  return {
    title: service.metaTitle || service.title,
    description: service.metaDescription || service.shortDescription,
    alternates: { canonical: `/services/${service.slug}/` },
    openGraph: {
      title: service.metaTitle || service.title,
      description: service.metaDescription || service.shortDescription,
      url: `/services/${service.slug}/`,
      images: service.heroImageUrl ? [service.heroImageUrl] : []
    }
  };
}

const CheckIcon = () => (
  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" style={{ flexShrink: 0, marginTop: 3 }}>
    <circle cx="12" cy="12" r="12" fill="var(--teal)" />
    <path d="M7 12.5l3 3 7-7" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
  </svg>
);

// Larger icon used on the card-grid sections (offer/benefit cards and the
// related-services cards) — a distinct visual weight from the inline
// checklist's CheckIcon so dense card grids don't feel like plain bullet lists.
function CardIcon() {
  return (
    <div style={{
      width: 44, height: 44, borderRadius: 12, background: 'rgba(15,181,174,0.12)',
      display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: 16
    }}>
      <svg width="22" height="22" viewBox="0 0 24 24" fill="none">
        <path d="M5 13l4 4L19 7" stroke="var(--teal)" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" />
      </svg>
    </div>
  );
}

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

// Groups the flat heading/paragraph/list block stream into one entry per
// heading, with every block up to the next heading as its content — so each
// heading and its list/paragraphs can render as its own full-width section
// (card grid, checklist, or lead text) instead of one long scrolling column.
function groupIntoSections(blocks) {
  const sections = [];
  let current = null;
  for (const block of blocks) {
    if (block.type === 'heading') {
      current = { heading: block.text, content: [] };
      sections.push(current);
    } else {
      if (!current) {
        current = { heading: null, content: [] };
        sections.push(current);
      }
      current.content.push(block);
    }
  }
  return sections;
}

function gridClassFor(count) {
  if (count <= 2) return 'grid-2';
  if (count === 4) return 'grid-4';
  return 'grid-3';
}

function OfferCard({ item }) {
  return (
    <div className="card">
      <CardIcon />
      <h3 style={{ fontSize: 17, marginBottom: 8 }}>{item.title}</h3>
      <p className="text-muted" style={{ fontSize: 14.5, lineHeight: 1.6 }}>{item.desc}</p>
    </div>
  );
}

// A body section is either a heading + list of "Title — desc" bullets (a
// services/benefits grid), a heading + list of plain bullets (a denser
// 2-column checklist reads better than cards when there's no short title to
// put on a card face), a heading + paragraph(s) (lead text), or — for a
// single trailing paragraph with no heading (most bodies close on one) — a
// short centered statement bridging into the FAQ/CTA below, styled lighter
// than a full section so it doesn't look like a real content block.
// Renders each block in the order it actually appears in the source body —
// a section can legitimately be lead paragraph → list → closing paragraph
// (e.g. the Analytics pillar page), and hoisting all paragraphs above the
// list regardless of position would scramble that into a confusing order.
function ContentSection({ section, index }) {
  return (
    <section className={`section${index % 2 === 1 ? ' section-alt' : ''}`}>
      <div className="container">
        {section.heading && (
          <div style={{ textAlign: 'center', maxWidth: 720, margin: '0 auto 36px' }}>
            <h2>{section.heading}</h2>
          </div>
        )}
        {section.content.map((block, i) => {
          if (block.type === 'paragraph') {
            return (
              <p
                key={i}
                className="text-muted"
                style={{ textAlign: 'center', maxWidth: 760, margin: '0 auto 20px', fontSize: 16, lineHeight: 1.8 }}
              >
                {block.text}
              </p>
            );
          }
          const hasTitledList = block.items.every((it) => it.title);
          if (hasTitledList) {
            return (
              <div key={i} className={`grid ${gridClassFor(block.items.length)}`} style={{ margin: '0 0 20px' }}>
                {block.items.map((item, j) => <OfferCard key={j} item={item} />)}
              </div>
            );
          }
          return (
            <div key={i} className="grid grid-2" style={{ maxWidth: 860, margin: '0 auto 20px' }}>
              {block.items.map((item, j) => (
                <div key={j} style={{ display: 'flex', gap: 12, alignItems: 'flex-start' }}>
                  <CheckIcon />
                  <span style={{ lineHeight: 1.7, color: 'var(--text)' }}>{item.desc}</span>
                </div>
              ))}
            </div>
          );
        })}
      </div>
    </section>
  );
}

// Case studies carry a `category` field using the exact same
// analytics/experimentation/marketing enum as a service's `navGroup` (see
// backend/src/models/CaseStudy.js) — a real, pre-existing relation, so a
// service's relevant case studies are simply those sharing its navGroup.
function relatedCaseStudiesFor(service, caseStudies) {
  return caseStudies.filter((cs) => cs.category && cs.category === service.navGroup);
}

// Blog posts have no direct foreign key to a service, only free-text
// `tags` (e.g. "GA4", "Looker Studio", "AEO") authored per post — matched
// here against the service's own title as a whole word, so a tag only
// counts when it names something the title actually says, not an
// incidental substring (e.g. "AI" inside "Paid Media"). A couple of
// tags are common acronyms ("GTM", "LLMO") that don't literally appear
// in the fuller service title they describe ("Google Tag Manager",
// "AIO/LLM Optimization"), so those two get a plain-word alias.
const TAG_ALIASES = { gtm: 'tag manager', llmo: 'llm' };

function hasWordMatch(haystack, needle) {
  const escaped = needle.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
  return new RegExp(`\\b${escaped}\\b`, 'i').test(haystack);
}

function relatedPostsFor(service, posts) {
  return posts.filter((post) =>
    (post.tags || []).some((tag) => hasWordMatch(service.title, TAG_ALIASES[tag.toLowerCase()] || tag))
  );
}

// Same 15-word excerpt convention as the case-study listing page
// (app/case-study/page.js) — the CaseStudy model has no separate excerpt
// field, so this trims the challenge text client-side instead.
function excerptOf(text, wordLimit = 15) {
  if (!text) return '';
  const words = text.trim().split(/\s+/);
  if (words.length <= wordLimit) return text;
  return `${words.slice(0, wordLimit).join(' ')}…`;
}

function RelatedCaseStudyCard({ cs }) {
  return (
    <Link href={`/case-study/${cs.slug}/`} className="card" style={{ padding: 0, overflow: 'hidden' }}>
      {cs.coverImageUrl && (
        <img src={cs.coverImageUrl} alt={cs.title} loading="lazy" style={{ width: '100%', height: 180, objectFit: 'cover' }} />
      )}
      <div style={{ padding: 20 }}>
        <h3 style={{ fontSize: 17 }}>{cs.title}</h3>
        <p className="text-muted" style={{ marginTop: 8, fontSize: 14 }}>{excerptOf(cs.challenge)}</p>
      </div>
    </Link>
  );
}

function RelatedPostCard({ post }) {
  return (
    <Link href={`/resources/${post.slug}/`} className="card" style={{ padding: 15 }}>
      {post.coverImageUrl && (
        <img
          src={post.coverImageUrl}
          alt={post.title}
          loading="lazy"
          style={{ width: '100%', aspectRatio: '1 / 0.48', objectFit: 'cover', borderRadius: 8, marginBottom: 16 }}
        />
      )}
      <h3 style={{ fontSize: 17, color: '#232358' }}>{post.title}</h3>
      {post.excerpt && <p className="text-muted" style={{ marginTop: 8, fontSize: 14 }}>{post.excerpt}</p>}
      <span style={{ marginTop: 10, display: 'inline-block', fontSize: 14.5, fontWeight: 600, color: '#232358' }}>Read More &raquo;</span>
    </Link>
  );
}

function ServiceLinkCard({ item }) {
  return (
    <Link href={`/services/${item.slug}/`} className="card hoverable" style={{ display: 'block' }}>
      <CardIcon />
      <h3 style={{ fontSize: 17, marginBottom: 8 }}>{item.title}</h3>
      <p className="text-muted" style={{ fontSize: 14.5, lineHeight: 1.6, marginBottom: 12 }}>{item.shortDescription}</p>
      <span style={{ fontSize: 13.5, fontWeight: 700, color: 'var(--teal)' }}>Learn More &raquo;</span>
    </Link>
  );
}

export default async function ServiceDetailPage({ params }) {
  const [service, allServices, caseStudies, blogPosts] = await Promise.all([
    getService(params.slug),
    getServices(),
    getCaseStudies(),
    getBlogPosts()
  ]);
  if (!service) notFound();

  const sections = groupIntoSections(parseBody(service.body));
  const relatedCaseStudies = relatedCaseStudiesFor(service, caseStudies);
  const relatedPosts = relatedPostsFor(service, blogPosts);

  // Sub-services nest under a pillar service (e.g. GA4 Implementation under
  // Analytics) — a pillar page shows its own children; a leaf page shows its
  // siblings under the same pillar instead, so every page carries a
  // services-grid section for internal linking and AI-crawler context, not
  // just pillar pages.
  const parentService = service.parentId ? allServices.find((s) => s.id === service.parentId) : null;
  const childServices = allServices.filter((s) => s.parentId === service.id);
  const siblingServices = childServices.length === 0 && service.parentId
    ? allServices.filter((s) => s.parentId === service.parentId && s.id !== service.id)
    : [];
  const relatedGrid = childServices.length > 0 ? childServices : siblingServices;
  const relatedTitle = childServices.length > 0 ? `${service.title} Services` : 'Related Services';

  const breadcrumbItems = [
    { name: 'Home', url: 'https://www.corebitmedia.com/' },
    { name: 'Services', url: 'https://www.corebitmedia.com/services/' },
    ...(parentService
      ? [{ name: parentService.title, url: `https://www.corebitmedia.com/services/${parentService.slug}/` }]
      : []),
    { name: service.title, url: `https://www.corebitmedia.com/services/${service.slug}/` }
  ];
  const breadcrumbSchema = {
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    itemListElement: breadcrumbItems.map((item, i) => ({
      '@type': 'ListItem',
      position: i + 1,
      name: item.name,
      item: item.url
    }))
  };

  return (
    <>
      <StructuredData data={service.structuredData} />
      <StructuredData data={breadcrumbSchema} />

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
              <h1 style={{ color: 'white' }}>{service.title}</h1>
              {service.shortDescription && (
                <p style={{ marginTop: 16, fontSize: 18, color: '#e9d6f2', maxWidth: 560 }}>{service.shortDescription}</p>
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

      {sections.map((section, i) => <ContentSection key={i} section={section} index={i} />)}

      {relatedGrid.length > 0 && (
        <section className={`section${sections.length % 2 === 1 ? ' section-alt' : ''}`}>
          <div className="container">
            <div style={{ textAlign: 'center', maxWidth: 720, margin: '0 auto 36px' }}>
              <h2>{relatedTitle}</h2>
            </div>
            <div className={`grid ${gridClassFor(relatedGrid.length)}`}>
              {relatedGrid.map((item) => <ServiceLinkCard key={item.slug} item={item} />)}
            </div>
          </div>
        </section>
      )}

      {relatedCaseStudies.length > 0 && (
        <section className={`section${(sections.length + (relatedGrid.length > 0 ? 1 : 0)) % 2 === 1 ? ' section-alt' : ''}`}>
          <div className="container" style={{ textAlign: 'center', maxWidth: 720, margin: '0 auto 36px' }}>
            <h2>Related Case Studies</h2>
          </div>
          <div className="container">
            <Carousel>
              {relatedCaseStudies.map((cs) => <RelatedCaseStudyCard key={cs.slug} cs={cs} />)}
            </Carousel>
          </div>
        </section>
      )}

      {relatedPosts.length > 0 && (
        <section className={`section${(sections.length + (relatedGrid.length > 0 ? 1 : 0) + (relatedCaseStudies.length > 0 ? 1 : 0)) % 2 === 1 ? ' section-alt' : ''}`}>
          <div className="container" style={{ textAlign: 'center', maxWidth: 720, margin: '0 auto 36px' }}>
            <h2>Related Resources</h2>
          </div>
          <div className="container">
            <Carousel>
              {relatedPosts.map((post) => <RelatedPostCard key={post.slug} post={post} />)}
            </Carousel>
          </div>
        </section>
      )}

      <FaqSection faqs={service.faqSchema} title={`${service.title} FAQs`} />

      <section className="section gradient-purple" style={{ color: 'white', textAlign: 'center' }}>
        <div className="container">
          <h2 style={{ color: 'white' }}>Ready to Get Started with {service.title}?</h2>
          <p style={{ marginTop: 12, color: '#e9d6f2' }}>Talk to our team about how we can help.</p>
          <Link href="/contact-us/" className="btn" style={{ marginTop: 24, display: 'inline-block', background: 'white', color: 'var(--navy)' }}>Get Free Audit</Link>
        </div>
      </section>
    </>
  );
}
