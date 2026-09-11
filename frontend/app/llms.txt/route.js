import { getServices, getBlogPosts, getCaseStudies, getIndustries } from '../../lib/api';

const NAV_GROUP_LABELS = {
  analytics: 'Analytics',
  experimentation: 'Experimentation & CRO',
  marketing: 'Marketing'
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
    '> Core Bit Media is a digital marketing agency built around Analytics (GA4, Adobe ' +
      'Analytics, AEP/CJA, tag management) and Experimentation & CRO (Adobe Target, VWO, ' +
      'A/B testing), plus Marketing services spanning paid media, SEO/AEO/GEO organic ' +
      'growth, and measurement & attribution. 10+ years delivering measurable, ' +
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
