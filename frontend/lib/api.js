// Fetches published content from the CMS API. Since the site is statically
// exported, these calls happen at BUILD TIME (next build), not in the browser.
// To pick up new content, the site needs a rebuild — see /README.md for
// the "one command" rebuild+deploy script.

const API_BASE = process.env.NEXT_PUBLIC_API_BASE_URL;

async function safeFetch(path, fallback) {
  try {
    // No cache option here on purpose: `{ cache: 'no-store' }` forces dynamic
    // rendering, which Next.js's `output: 'export'` (static export) does not
    // support and fails the build on. These fetches only ever run once, at
    // `next build` time, so the default (cached-per-build) behavior is what
    // we want anyway.
    const res = await fetch(`${API_BASE}${path}`);
    if (!res.ok) return fallback;
    return await res.json();
  } catch (err) {
    console.warn(`Could not fetch ${path} — using fallback. Is the backend running?`, err.message);
    return fallback;
  }
}

export const getServices = () => safeFetch('/api/services', []);
export const getService = (slug) => safeFetch(`/api/services/${slug}`, null);
export const getBlogPosts = () => safeFetch('/api/blog', []);
export const getBlogPost = (slug) => safeFetch(`/api/blog/${slug}`, null);
export const getCaseStudies = () => safeFetch('/api/case-studies', []);
export const getCaseStudy = (slug) => safeFetch(`/api/case-studies/${slug}`, null);
export const getTestimonials = () => safeFetch('/api/testimonials', []);
export const getFaqs = (scope) => safeFetch(`/api/faqs${scope ? `?scope=${scope}` : ''}`, []);
export const getPage = (slug) => safeFetch(`/api/pages/${slug}`, null);
