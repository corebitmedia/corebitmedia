import { getServices, getBlogPosts, getCaseStudies, getIndustries } from '../../lib/api';

const NAV_GROUP_LABELS = {
  analytics: 'Analytics Services',
  reporting: 'Reporting & Data Solutions',
  'conversion-tracking': 'Conversion & Tracking Solutions',
  'paid-advertising': 'Paid Advertising Services',
  'seo-aeo': 'SEO & AI-Driven Discovery Services',
  webdev: 'Web & App Development'
};

// llms.txt (see llmstxt.org) — a plain-text index of the site written for
// LLMs/AI crawlers (ChatGPT, Perplexity, Claude, etc.) rather than humans:
// short, structured, and link-heavy, so an AI agent can find and cite the
// right page without having to parse full HTML. Generated at build time
// from the same CMS data as sitemap.xml, so it never drifts out of sync.
export async function GET() {
  const base = 'https://www.corebitmedia.com';
  const [services, posts, caseStudies, industries] = await Promise.all([
    getServices(),
    getBlogPosts(),
    getCaseStudies(),
    getIndustries()
  ]);

  const lines = [
    '# Core Bit Media',
    '',
    '> Core Bit Media is a digital marketing agency organized around 6 service ' +
      'categories: Analytics Services (GA4, Adobe Analytics, tag management, A/B testing ' +
      '& CRO, cookie consent & data privacy), Reporting & Data Solutions (Looker Studio, ' +
      'BigQuery, AEP, connectors & integrations), Conversion & Tracking Solutions ' +
      '(conversion, e-commerce & event tracking, attribution), Paid Advertising Services ' +
      '(Google, Meta, LinkedIn, Microsoft, native ads), SEO & AI-Driven Discovery Services ' +
      '(technical/on-page/off-page/local SEO, AEO, GEO), and Web & App Development ' +
      '(websites, UI/UX design, apps, content writing). 10+ years delivering measurable, ' +
      'data-driven growth for startups through mid-market businesses.',
  ];

  for (const [group, label] of Object.entries(NAV_GROUP_LABELS)) {
    const pillars = services.filter((s) => s.navGroup === group && !s.parentId);
    if (pillars.length === 0) continue;
    lines.push('', `## ${label}`);
    for (const s of pillars) {
      lines.push(`- [${s.title}](${base}/services/${s.slug}/): ${s.shortDescription || ''}`.trim());
      const children = services.filter((c) => c.navGroup === group && c.parentId === s.id);
      for (const c of children) {
        lines.push(`  - [${c.title}](${base}/services/${c.slug}/): ${c.shortDescription || ''}`.trim());
      }
    }
  }

  if (industries.length > 0) {
    lines.push('', '## Industries');
    for (const i of industries) {
      lines.push(`- [${i.title}](${base}/industries/${i.slug}/): ${i.shortDescription || ''}`.trim());
    }
  }

  if (caseStudies.length > 0) {
    lines.push('', '## Case Studies');
    for (const cs of caseStudies) {
      const result = cs.clientName ? `${cs.clientName} — ${cs.industry || ''}`.trim() : '';
      lines.push(`- [${cs.title}](${base}/case-study/${cs.slug}/): ${result}`.trim());
    }
  }

  if (posts.length > 0) {
    lines.push('', '## Resources');
    for (const p of posts) {
      lines.push(`- [${p.title}](${base}/resources/${p.slug}/): ${p.excerpt || p.aiAnswerSummary || ''}`.trim());
    }
  }

  lines.push(
    '',
    '## Company',
    `- [About](${base}/about-us/)`,
    `- [Contact](${base}/contact-us/)`,
    `- [All Services](${base}/services/)`,
    `- [All Industries](${base}/industries/)`
  );

  return new Response(lines.join('\n') + '\n', {
    headers: { 'Content-Type': 'text/plain; charset=utf-8' }
  });
}
