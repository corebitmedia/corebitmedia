export default function robots() {
  return {
    rules: [
      {
        userAgent: '*',
        allow: '/',
        // /admin and /api are proxied onto this same domain (see vercel.json)
        // — real content for search engines, not this dashboard/data layer.
        disallow: ['/admin/', '/api/']
      }
    ],
    sitemap: 'https://www.corebitmedia.com/sitemap.xml',
    host: 'https://www.corebitmedia.com'
  };
}
