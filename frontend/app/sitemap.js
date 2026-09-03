import { getServices, getBlogPosts, getCaseStudies } from '../lib/api';

// changeFrequency/priority are hints, not guarantees, but they cost nothing
// and help crawlers prioritize the pages that actually move the needle —
// home and top-level service pages over static legal boilerplate.
const STATIC_ROUTES = [
  { path: '', changeFrequency: 'weekly', priority: 1.0 },
  { path: 'services', changeFrequency: 'weekly', priority: 0.9 },
  { path: 'about-us', changeFrequency: 'monthly', priority: 0.7 },
  { path: 'case-study', changeFrequency: 'weekly', priority: 0.7 },
  { path: 'blogs', changeFrequency: 'daily', priority: 0.7 },
  { path: 'contact-us', changeFrequency: 'monthly', priority: 0.6 },
  { path: 'privacy-policy', changeFrequency: 'yearly', priority: 0.2 },
  { path: 'terms-of-service', changeFrequency: 'yearly', priority: 0.2 }
];

export default async function sitemap() {
  const base = 'https://www.corebitmedia.com';
  const staticRoutes = STATIC_ROUTES.map(({ path, changeFrequency, priority }) => ({
    url: `${base}/${path}${path ? '/' : ''}`,
    lastModified: new Date(),
    changeFrequency,
    priority
  }));

  const [services, posts, caseStudies] = await Promise.all([getServices(), getBlogPosts(), getCaseStudies()]);

  const dynamicRoutes = [
    ...services.map((s) => ({
      url: `${base}/services/${s.slug}/`,
      lastModified: s.updatedAt,
      changeFrequency: 'monthly',
      priority: s.parentId ? 0.6 : 0.8
    })),
    ...posts.map((p) => ({
      url: `${base}/blogs/${p.slug}/`,
      lastModified: p.updatedAt,
      changeFrequency: 'monthly',
      priority: 0.6
    })),
    ...caseStudies.map((c) => ({
      url: `${base}/case-study/${c.slug}/`,
      lastModified: c.updatedAt,
      changeFrequency: 'monthly',
      priority: 0.6
    }))
  ];

  return [...staticRoutes, ...dynamicRoutes];
}
