export default function robots() {
  return {
    rules: [
      {
        userAgent: '*',
        allow: '/',
        // /admin and /api are proxied onto this same domain (see vercel.json)
        // — real content for search engines, not this dashboard/data layer.
        // /dashboard and /ga4-insights are the customer reporting tool —
        // account pages and shareable reports, not content meant to rank.
        disallow: ['/admin/', '/api/', '/dashboard/', '/ga4-insights/']
      }
    ],
    sitemap: 'https://www.corebitmedia.com/sitemap.xml',
    host: 'https://www.corebitmedia.com'
  };
}
