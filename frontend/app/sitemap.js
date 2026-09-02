import { getServices, getBlogPosts, getCaseStudies } from '../lib/api';

export default async function sitemap() {
  const base = 'https://www.corebitmedia.com';
  const staticRoutes = ['', 'about-us', 'services', 'case-study', 'blogs', 'contact-us'].map((p) => ({
    url: `${base}/${p}${p ? '/' : ''}`,
    lastModified: new Date()
  }));

  const [services, posts, caseStudies] = await Promise.all([getServices(), getBlogPosts(), getCaseStudies()]);

  const dynamicRoutes = [
    ...services.map((s) => ({ url: `${base}/services/${s.slug}/`, lastModified: s.updatedAt })),
    ...posts.map((p) => ({ url: `${base}/blogs/${p.slug}/`, lastModified: p.updatedAt })),
    ...caseStudies.map((c) => ({ url: `${base}/case-study/${c.slug}/`, lastModified: c.updatedAt }))
  ];

  return [...staticRoutes, ...dynamicRoutes];
}
