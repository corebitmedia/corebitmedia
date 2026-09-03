import { getServices, getBlogPosts, getCaseStudies } from '../../lib/api';

// llms.txt (see llmstxt.org) — a plain-text index of the site written for
// LLMs/AI crawlers (ChatGPT, Perplexity, Claude, etc.) rather than humans:
// short, structured, and link-heavy, so an AI agent can find and cite the
// right page without having to parse full HTML. Generated at build time
// from the same CMS data as sitemap.xml, so it never drifts out of sync.
export async function GET() {
  const base = 'https://www.corebitmedia.com';
  const [services, posts, caseStudies] = await Promise.all([
    getServices(),
    getBlogPosts(),
    getCaseStudies()
  ]);

  const topLevel = services.filter((s) => !s.parentId);

  const lines = [
    '# Core Bit Media',
    '',
    '> Core Bit Media is a digital marketing agency offering SEO, PPC, analytics ' +
      '& tag management, reporting dashboards, and CRM marketing automation — plus ' +
      'AEO/GEO (AI search) optimization to help brands get cited by ChatGPT, ' +
      'Perplexity, and Google AI Overviews. 10+ years delivering measurable, ' +
      'data-driven growth for startups through mid-market businesses.',
    '',
    '## Services'
  ];

  for (const s of topLevel) {
    lines.push(`- [${s.title}](${base}/services/${s.slug}/): ${s.shortDescription || ''}`.trim());
    const children = services.filter((c) => c.parentId === s.id);
    for (const c of children) {
      lines.push(`  - [${c.title}](${base}/services/${c.slug}/): ${c.shortDescription || ''}`.trim());
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
    lines.push('', '## Blog');
    for (const p of posts) {
      lines.push(`- [${p.title}](${base}/blogs/${p.slug}/): ${p.excerpt || p.aiAnswerSummary || ''}`.trim());
    }
  }

  lines.push(
    '',
    '## Company',
    `- [About Us](${base}/about-us/)`,
    `- [Contact Us](${base}/contact-us/)`,
    `- [All Services](${base}/services/)`
  );

  return new Response(lines.join('\n') + '\n', {
    headers: { 'Content-Type': 'text/plain; charset=utf-8' }
  });
}
